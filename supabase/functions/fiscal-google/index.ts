// Deploy with verify_jwt=false: callback and cron use their own checks; every other route verifies a Supabase user.
// Secrets: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FISCAL_TOKEN_KEY (base64 32 random bytes), FISCAL_CRON_SECRET.
const env=(n:string)=>Deno.env.get(n)||'';
const SUPA=env('SUPABASE_URL'),SERVICE=env('SUPABASE_SERVICE_ROLE_KEY');
const ORIGIN='https://miemail1234-boop.github.io';
const CALLBACK=SUPA+'/functions/v1/fiscal-google/callback';
const CORS={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Vary':'Origin'};
const response=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{...CORS,'Content-Type':'application/json'}});
const encode=(v:string)=>encodeURIComponent(v);
async function sb(path:string,method='GET',body?:unknown){const r=await fetch(SUPA+'/rest/v1/'+path,{method,headers:{apikey:SERVICE,Authorization:'Bearer '+SERVICE,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});if(!r.ok)throw Error('Database operation failed ('+r.status+')');return r.status===204?[]:r.json();}
async function auth(req:Request){const bearer=req.headers.get('Authorization');if(!bearer)throw Error('Authentication required');const r=await fetch(SUPA+'/auth/v1/user',{headers:{apikey:SERVICE,Authorization:bearer}});if(!r.ok)throw Error('Authentication required');return r.json();}
const b64=(a:Uint8Array)=>btoa(String.fromCharCode(...a));const bytes=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function cryptKey(){const raw=bytes(env('FISCAL_TOKEN_KEY'));if(raw.length!==32)throw Error('Token encryption not configured');return crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);}
async function seal(text:string){const iv=crypto.getRandomValues(new Uint8Array(12));return b64(iv)+'.'+b64(new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await cryptKey(),new TextEncoder().encode(text))));}
async function unseal(s:string){const [iv,cipher]=s.split('.');return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(iv)},await cryptKey(),bytes(cipher)));}
async function hash(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('');}
async function googleToken(params:Record<string,string>){const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({...params,client_id:env('GOOGLE_CLIENT_ID'),client_secret:env('GOOGLE_CLIENT_SECRET')})});if(!r.ok)throw Error('Google authorization failed; reconnect account');return r.json();}
async function google(token:string,path:string,method='GET',body?:unknown,etag?:string){const r=await fetch('https://www.googleapis.com/'+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',...(etag?{'If-Match':etag}:{})},body:body===undefined?undefined:JSON.stringify(body)});if(!r.ok){const e=new Error('Google operation failed ('+r.status+')') as Error&{status:number};e.status=r.status;throw e;}return r.status===204?null:r.json();}
async function connection(uid:string){const [c]=await sb('fiscal_google_connections?user_id=eq.'+uid);if(!c)throw Error('Google account not connected');const t=await googleToken({grant_type:'refresh_token',refresh_token:await unseal(c.refresh_cipher)});return {...c,token:t.access_token};}
async function syncJob(job:any){
 const uid=job.user_id,c=await connection(uid);const [d]=await sb('journal_deadlines?id=eq.'+job.deadline_id+'&user_id=eq.'+uid);if(!d)throw Error('Deadline missing');
 const base='calendar/v3/calendars/'+encode(c.calendar_id)+'/events';
 let id=d.calendar_event_id||('lifeos'+d.id.replaceAll('-','')),event:any=null,gone=false;
 try{event=await google(c.token,base+'/'+id);}catch(e){if(![404,410].includes((e as any).status))throw e;gone=(e as any).status===410;}
 const marker='LifeOS fiscal deadline: '+d.id;
 if(event&&event.extendedProperties?.private?.lifeosDeadline!==d.id&&!event.description?.includes(marker))throw Error('Calendar identity mismatch');
 const inactive=!d.date_verified||!d.due_on||d.deleted_at||d.status==='archived'||d.applicability==='non_applicabile'||d.applicability==='da_verificare';
 if(inactive){if(event&&event.status!=='cancelled')await google(c.token,base+'/'+id,'DELETE',undefined,event.etag);return;}
 // A cancelled ID cannot safely be reused; versioned identity on restoration is deterministic.
 if(event?.status==='cancelled'||gone){id='lifeos'+d.id.replaceAll('-','')+'r'+d.revision;try{event=await google(c.token,base+'/'+id);}catch(e){if(![404,410].includes((e as any).status))throw e;event=null;}}
 const [payments,docs]=await Promise.all([sb('fiscal_payments?deadline_id=eq.'+d.id+'&user_id=eq.'+uid),sb('fiscal_documents?deadline_id=eq.'+d.id+'&user_id=eq.'+uid)]);
 const end=new Date(d.due_on+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+1);
 const payload={summary:(d.status==='completed'?'✓ ':'')+d.title,start:{date:d.due_on},end:{date:end.toISOString().slice(0,10)},visibility:'private',transparency:'transparent',extendedProperties:{private:{lifeosDeadline:d.id}},description:marker+'\nStato: '+d.status+'\nDovuto: '+(d.amount_due??'da verificare')+' EUR\nPagato: '+payments.reduce((n:number,p:any)=>n+Number(p.amount),0)+' EUR\nFonte: '+(d.date_source||'')+'\n'+(d.notes||'')+'\n'+docs.map((f:any)=>f.file_name+': https://drive.google.com/file/d/'+encode(f.drive_file_id)+'/view').join('\n'),reminders:{useDefault:false,overrides:(d.reminder_days||[7,1]).filter((n:number)=>n>=0&&n<=28).slice(0,5).map((n:number)=>({method:'popup',minutes:n*1440}))}};
 try{event=await google(c.token,event?base+'/'+id:base,event?'PATCH':'POST',event?payload:{...payload,id},event?.etag);}catch(e){if((e as any).status!==409)throw e;throw Error('Calendar create race; retry queued');}
 if(d.calendar_event_id!==id||d.calendar_event_url!==event.htmlLink){const changed=await sb('journal_deadlines?id=eq.'+d.id+'&user_id=eq.'+uid+'&revision=eq.'+d.revision,'PATCH',{calendar_id:c.calendar_id,calendar_event_id:id,calendar_event_url:event.htmlLink});if(!changed.length)throw Error('Deadline changed during Google sync');}
}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:CORS});
 const url=new URL(req.url),route=url.pathname.split('/').pop();
 try{
  const configured=!!env('GOOGLE_CLIENT_ID')&&!!env('GOOGLE_CLIENT_SECRET')&&!!env('FISCAL_TOKEN_KEY');
  if(route==='callback'){
   if(!configured)return response({error:'Google not configured'},503);
   const state=url.searchParams.get('state')||'',code=url.searchParams.get('code');if(!state||!code)return response({error:'Invalid callback'},400);
   const [record]=await sb('rpc/lifeos_consume_google_state','POST',{p_hash:await hash(state)});if(!record)return response({error:'Expired or invalid state'},400);
   const t=await googleToken({grant_type:'authorization_code',code,redirect_uri:CALLBACK});
   if(!t.refresh_token)throw Error('Offline consent required');
   const [registry]=await sb('lifeos_system_registry?user_id=eq.'+record.user_id+'&select=components');const config=registry?.components?.fiscotracker;
   if(!config?.calendar_id||!config?.receipts_folder_id)throw Error('Calendar or receipt folder not configured');
   const cal=await google(t.access_token,'calendar/v3/users/me/calendarList/'+encode(config.calendar_id));if(cal.accessRole!=='owner'||(cal.summaryOverride||cal.summary)!=='Lavoro')throw Error('Wrong Google calendar/account');
   // Folder may require Google Picker selection for drive.file scope; no broad Drive scope or public sharing.
   const folder=await google(t.access_token,'drive/v3/files/'+encode(config.receipts_folder_id)+'?fields=id,ownedByMe,mimeType,permissions(type,role)');if(!folder.ownedByMe||folder.mimeType!=='application/vnd.google-apps.folder'||folder.permissions?.some((p:any)=>p.role!=='owner'))throw Error('Private receipt folder must be authorized with Google Picker');
   const body={user_id:record.user_id,refresh_cipher:await seal(t.refresh_token),calendar_id:config.calendar_id,receipts_folder_id:config.receipts_folder_id,updated_at:new Date().toISOString()};
   const existing=await sb('fiscal_google_connections?user_id=eq.'+record.user_id);await sb('fiscal_google_connections'+(existing.length?'?user_id=eq.'+record.user_id:''),existing.length?'PATCH':'POST',body);
   // Queue existing canonical fiscal rows after first authorization; no template records are generated.
   for(let offset=0;;offset+=500){const deadlines=await sb('journal_deadlines?user_id=eq.'+record.user_id+'&or=(category.eq.fiscale,category.eq.amministrativa,obligation_key.not.is.null)&select=id&order=id&limit=500&offset='+offset);for(const deadline of deadlines){const [job]=await sb('fiscal_google_jobs?deadline_id=eq.'+deadline.id+'&user_id=eq.'+record.user_id);if(job)await sb('fiscal_google_jobs?deadline_id=eq.'+deadline.id+'&generation=eq.'+job.generation,'PATCH',{generation:job.generation+1,available_at:new Date().toISOString()});else{try{await sb('fiscal_google_jobs','POST',{deadline_id:deadline.id,user_id:record.user_id});}catch{/* Concurrent change already queued it. */}}}if(deadlines.length<500)break;}
   return new Response(null,{status:303,headers:{Location:ORIGIN+'/Codici1/journal/#scadenze'}});
  }
  if(route==='worker'){
   if(!env('FISCAL_CRON_SECRET')||req.headers.get('Authorization')!=='Bearer '+env('FISCAL_CRON_SECRET'))return response({error:'Unauthorized'},401);
   if(!configured)return response({error:'Google not configured'},503);
   const jobs=await sb('rpc/lifeos_claim_fiscal_jobs','POST',{});let completed=0;
   for(const job of jobs){try{await syncJob(job);await sb('fiscal_google_jobs?deadline_id=eq.'+job.deadline_id+'&generation=eq.'+job.generation,'DELETE');completed++;}catch(e){await sb('fiscal_google_jobs?deadline_id=eq.'+job.deadline_id+'&generation=eq.'+job.generation,'PATCH',{locked_until:null,available_at:new Date(Date.now()+Math.min(86400000,60000*2**Math.min(job.attempts,10))).toISOString(),last_error:String((e as Error).message).slice(0,300)});}}
   return response({processed:jobs.length,completed});
  }
  const user=await auth(req);
  if(route==='status'){const rows=await sb('fiscal_google_connections?user_id=eq.'+user.id+'&select=user_id,calendar_id');return response({configured,connected:rows.length===1,calendar_id:rows[0]?.calendar_id||null});}
  if(!configured)return response({error:'Google OAuth server configuration required'},503);
  if(route==='connect'&&req.method==='POST'){
   const state=crypto.randomUUID()+crypto.randomUUID();await sb('fiscal_google_oauth_states','POST',{state_hash:await hash(state),user_id:user.id,expires_at:new Date(Date.now()+600000).toISOString()});
   const params=new URLSearchParams({client_id:env('GOOGLE_CLIENT_ID'),redirect_uri:CALLBACK,response_type:'code',access_type:'offline',prompt:'consent',state,scope:'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/calendar.events.owned https://www.googleapis.com/auth/calendar.calendarlist.readonly'});
   return response({url:'https://accounts.google.com/o/oauth2/v2/auth?'+params});
  }
  if(route==='upload'&&req.method==='POST'){
   const form=await req.formData(),file=form.get('file'),deadline=String(form.get('deadline_id')||''),operation=String(form.get('operation_id')||'');
   if(!(file instanceof File)||file.size>10*1024*1024||!/^[-a-f0-9]{36}$/.test(deadline)||!/^[-a-f0-9]{36}$/.test(operation))return response({error:'Invalid upload (maximum 10 MB)'},400);
   const [d]=await sb('journal_deadlines?id=eq.'+deadline+'&user_id=eq.'+user.id);if(!d)throw Error('Deadline not found');const c=await connection(user.id);
   const root=await google(c.token,'drive/v3/files/'+encode(c.receipts_folder_id)+'?fields=id,ownedByMe,mimeType,permissions(type,role)');if(!root.ownedByMe||root.permissions?.some((p:any)=>p.role!=='owner'))throw Error('Receipt folder is not private');
   const year=String(d.fiscal_year||d.due_on?.slice(0,4)||new Date().getFullYear());
   const q="trashed=false and mimeType='application/vnd.google-apps.folder' and name='"+year+"' and '"+c.receipts_folder_id+"' in parents";
   const result=await google(c.token,'drive/v3/files?q='+encode(q)+'&fields=files(id),nextPageToken');if(result.nextPageToken||result.files.length>1)throw Error('Ambiguous annual receipt folder');
   const folder=result.files[0]||await google(c.token,'drive/v3/files?fields=id','POST',{name:year,mimeType:'application/vnd.google-apps.folder',parents:[c.receipts_folder_id]});
   let [reservation]=await sb('fiscal_google_uploads?user_id=eq.'+user.id+'&operation_id=eq.'+operation);
   if(!reservation){const ids=await google(c.token,'drive/v3/files/generateIds?count=1&space=drive');try{[reservation]=await sb('fiscal_google_uploads','POST',{user_id:user.id,operation_id:operation,deadline_id:deadline,drive_file_id:ids.ids[0],file_name:file.name,file_size:file.size});}catch{[reservation]=await sb('fiscal_google_uploads?user_id=eq.'+user.id+'&operation_id=eq.'+operation);}}
   if(!reservation||reservation.deadline_id!==deadline||reservation.file_name!==file.name||Number(reservation.file_size)!==file.size)throw Error('Upload idempotency conflict');
   const id=reservation.drive_file_id,boundary='lifeos_'+crypto.randomUUID();
   const metadata={id,name:file.name,parents:[folder.id],appProperties:{lifeosDeadline:deadline}};
   const body=new Blob(['--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(metadata)+'\r\n--'+boundary+'\r\nContent-Type: '+(file.type||'application/octet-stream')+'\r\n\r\n',file,'\r\n--'+boundary+'--'],{type:'multipart/related; boundary='+boundary});
   const uploaded=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{Authorization:'Bearer '+c.token},body});if(!uploaded.ok&&uploaded.status!==409)throw Error('Drive upload failed ('+uploaded.status+')');
   const stored=await google(c.token,'drive/v3/files/'+encode(id)+'?fields=id,ownedByMe,permissions(type,role),appProperties');if(!stored.ownedByMe||stored.permissions?.some((p:any)=>p.role!=='owner')||stored.appProperties?.lifeosDeadline!==deadline)throw Error('Receipt privacy/identity check failed');
   const linked=await sb('fiscal_documents?user_id=eq.'+user.id+'&drive_file_id=eq.'+encode(id));if(!linked.length)await sb('fiscal_documents','POST',{user_id:user.id,deadline_id:deadline,drive_file_id:id,file_name:file.name});
   return response({drive_file_id:id});
  }
  return response({error:'Not found'},404);
 }catch(e){const message=(e as Error).message;return response({error:message},message==='Authentication required'?401:400);}
});
