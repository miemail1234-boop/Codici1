/* Google tokens are short-lived and kept only in memory. Requires an app OAuth client ID. */
(()=>{'use strict';
const scopes=['https://www.googleapis.com/auth/drive.file','https://www.googleapis.com/auth/calendar.events.owned','https://www.googleapis.com/auth/calendar.calendarlist.readonly'];
class GoogleFiscal{
 constructor(store){this.store=store;this.token=null;this.expires=0;this.calendar=null;this.folder=null;}
 async connect(clientId){
  if(!clientId||!clientId.endsWith('.apps.googleusercontent.com'))throw Error('Configurare il client OAuth Google dell’app prima di collegare Drive e Calendar.');
  if(!window.google?.accounts?.oauth2){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.onload=resolve;s.onerror=()=>reject(Error('Google OAuth non disponibile'));document.head.appendChild(s);});}
  const response=await new Promise((resolve,reject)=>{const c=google.accounts.oauth2.initTokenClient({client_id:clientId,scope:scopes.join(' '),callback:r=>r.error?reject(Error(r.error)):resolve(r),error_callback:e=>reject(Error(e.type))});c.requestAccessToken();});
  if(!google.accounts.oauth2.hasGrantedAllScopes(response,...scopes))throw Error('Autorizzazioni Google incomplete.');
  this.token=response.access_token;this.expires=Date.now()+Number(response.expires_in)*1000;
  const calendars=await this.pages('https://www.googleapis.com/calendar/v3/users/me/calendarList','items');
  const matches=calendars.filter(c=>(c.summaryOverride||c.summary)==='Lavoro'&&c.accessRole==='owner');
  if(matches.length!==1)throw Error('Calendario Lavoro non identificato univocamente nell’account Google selezionato.');
  this.calendar=matches[0].id;
 }
 async authorizeFolders(config){
  const ids=[...new Set([config.receipts_folder_id,...(config.receipts_authorization_folder_ids||[])].filter(Boolean))];
  if(!ids.length)throw Error('Cartella ricevute non configurata.');
  if(config.calendar_id&&this.calendar!==config.calendar_id)throw Error('Seleziona l’account Google del calendario configurato.');
  const missing=[];
  for(const id of ids){try{await this.privateFolder(id);}catch(e){if(e.status===404)missing.push(id);else throw e;}}
  if(!missing.length)return;
  if(!config.google_picker_api_key||!config.google_project_number)throw Error('Configurare Google Picker per autorizzare le cartelle ricevute esistenti.');
  if(!window.gapi){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://apis.google.com/js/api.js';s.onload=resolve;s.onerror=()=>reject(Error('Google Picker non disponibile'));document.head.appendChild(s);});}
  if(!window.google?.picker)await new Promise((resolve,reject)=>gapi.load('picker',{callback:resolve,onerror:()=>reject(Error('Google Picker non disponibile')),timeout:15000,ontimeout:()=>reject(Error('Google Picker non risponde'))}));
  await new Promise((resolve,reject)=>{
   const view=new google.picker.DocsView(google.picker.ViewId.FOLDERS).setIncludeFolders(true).setSelectFolderEnabled(true).setOwnedByMe(true);
   const picker=new google.picker.PickerBuilder().addView(view).setOAuthToken(this.token).setDeveloperKey(config.google_picker_api_key).setAppId(String(config.google_project_number)).setOrigin(location.origin).setTitle('Seleziona Ricevute e le cartelle annuali esistenti').enableFeature(google.picker.Feature.MULTISELECT_ENABLED).setCallback(data=>{
    if(data.action===google.picker.Action.CANCEL){picker.dispose();reject(Error('Autorizzazione cartelle annullata.'));}
    if(data.action===google.picker.Action.PICKED){picker.dispose();const selected=new Set((data.docs||[]).map(d=>d.id));if(missing.some(id=>!selected.has(id)))reject(Error('Seleziona tutte le cartelle ricevute configurate, incluse quelle annuali.'));else resolve();}
   }).build();picker.setVisible(true);
  });
  // A selection is not evidence of privacy: inspect every folder after the grant.
  for(const id of ids)await this.privateFolder(id);
 }
 async request(url,options={}){if(!this.token||Date.now()>=this.expires)throw Error('Ricollega Google: autorizzazione di sessione scaduta.');const r=await fetch(url,{...options,headers:{Authorization:'Bearer '+this.token,...options.headers}});if(!r.ok){const e=Error('Google '+r.status+': '+await r.text());e.status=r.status;throw e;}return r.status===204?null:r.json();}
 async pages(url,field){let data=[],token;do{const u=new URL(url);if(token)u.searchParams.set('pageToken',token);const r=await this.request(u);data.push(...(r[field]||[]));token=r.nextPageToken;}while(token);return data;}
 async privateFolder(id){const f=await this.request('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(id)+'?fields=id,mimeType,trashed,ownedByMe,permissions(type,role)');if(f.trashed||!f.ownedByMe||f.mimeType!=='application/vnd.google-apps.folder'||f.permissions?.some(p=>p.role!=='owner'))throw Error('La cartella deve essere privata e di tua proprietà.');return f;}
 async folderNamed(name,parent='root'){
  const q="trashed=false and mimeType='application/vnd.google-apps.folder' and name='"+name.replaceAll("'","\\'")+"' and '"+parent+"' in parents";
  const files=await this.pages('https://www.googleapis.com/drive/v3/files?q='+encodeURIComponent(q)+'&fields=nextPageToken,files(id)','files');
  if(files.length>1)throw Error('Più cartelle '+name+': selezionare la cartella corretta.');
  const f=files[0]||await this.request('https://www.googleapis.com/drive/v3/files?fields=id',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,mimeType:'application/vnd.google-apps.folder',parents:[parent]})});await this.privateFolder(f.id);return f.id;
 }
 async upload(row,file,folderId){
  await this.privateFolder(folderId);const year=String(row.fiscal_year||row.due_on?.slice(0,4)||new Date().getFullYear());const parent=await this.folderNamed(year,folderId);
  // Persist generated Drive ID before upload: retry uses the same ID instead of duplicating a receipt.
  const retryKey='lifeos.receipt.'+this.store.user.id+'.'+row.id+'.'+file.name+'.'+file.size+'.'+file.lastModified;
  let id=localStorage.getItem(retryKey);if(!id){id=(await this.request('https://www.googleapis.com/drive/v3/files/generateIds?count=1&space=drive')).ids[0];localStorage.setItem(retryKey,id);}
  const metadata={id,name:file.name,parents:[parent],appProperties:{lifeosDeadline:row.id}};
  const boundary='lifeos_'+crypto.randomUUID();const body=new Blob(['--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(metadata)+'\r\n--'+boundary+'\r\nContent-Type: '+(file.type||'application/octet-stream')+'\r\n\r\n',file,'\r\n--'+boundary+'--'],{type:'multipart/related; boundary='+boundary});
  try{await this.request('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',body});}catch(e){if(e.status!==409)throw e;}
  const stored=await this.request('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(id)+'?fields=id,ownedByMe,permissions(type,role),appProperties');
  if(!stored.ownedByMe||stored.permissions?.some(p=>p.role!=='owner')||stored.appProperties?.lifeosDeadline!==row.id)throw Error('Verifica privacy o associazione documento fallita. File conservato, non collegato.');
  const {error}=await this.store.db.from('fiscal_documents').insert({user_id:this.store.user.id,deadline_id:row.id,drive_file_id:id,file_name:file.name});if(error&&error.code!=='23505')throw error;
  localStorage.removeItem(retryKey);return id;
 }
 async sync(row,payments,documents){
  if(!this.calendar)throw Error('Collega Google prima di sincronizzare.');
  if(row.calendar_id&&row.calendar_id!==this.calendar)throw Error('Account Google diverso da quello associato alla scadenza.');
  if(!row.date_verified||!row.due_on||row.deleted_at||row.status==='archived'||['non_applicabile','da_verificare'].includes(row.applicability))return {skipped:true};
  const marker='LifeOS fiscal deadline: '+row.id;const url='https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(this.calendar)+'/events';
  let id=row.calendar_event_id||('lifeos'+row.id.replaceAll('-','')),existing=null;
  try{existing=await this.request(url+'/'+id);}catch(e){if(e.status!==404)throw e;}
  if(existing&&!existing.description?.includes(marker)&&existing.extendedProperties?.private?.lifeosDeadline!==row.id)throw Error('Evento non appartenente a questa scadenza: modifica bloccata.');
  const end=new Date(row.due_on+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+1);
  const paid=payments.filter(p=>p.deadline_id===row.id).reduce((n,p)=>n+Number(p.amount),0);
  const payload={summary:(row.status==='completed'?'✓ ':'')+row.title,start:{date:row.due_on},end:{date:end.toISOString().slice(0,10)},visibility:'private',transparency:'transparent',description:marker+'\nStato: '+row.status+'\nDovuto: '+(row.amount_due??'da verificare')+' EUR\nPagato: '+paid.toFixed(2)+' EUR\nFonte: '+(row.date_source||'')+'\n'+(row.notes||'')+'\n'+documents.filter(d=>d.deadline_id===row.id).map(d=>d.file_name+': https://drive.google.com/file/d/'+encodeURIComponent(d.drive_file_id)+'/view').join('\n'),extendedProperties:{private:{lifeosDeadline:row.id}},reminders:{useDefault:false,overrides:(row.reminder_days||[7,1]).filter(n=>n>=0&&n<=28).slice(0,5).map(n=>({method:'popup',minutes:n*1440}))}};
  const same=existing&&Object.keys(payload).every(k=>JSON.stringify(existing[k])===JSON.stringify(payload[k]));
  if(!same){existing=await this.request(existing?url+'/'+id:url,{method:existing?'PATCH':'POST',headers:{'Content-Type':'application/json',...(existing?{'If-Match':existing.etag}:{})},body:JSON.stringify(existing?payload:{...payload,id})});}
  if(row.calendar_event_id!==id||row.calendar_event_url!==existing.htmlLink)await this.store.update(row,{calendar_id:this.calendar,calendar_event_id:id,calendar_event_url:existing.htmlLink});
  return {id};
 }
 disconnect(){this.token=null;this.expires=0;this.calendar=null;}
}
window.GoogleFiscal=GoogleFiscal;
})();
