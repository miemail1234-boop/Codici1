(()=>{
'use strict';
const db=window.supabase.createClient('https://kujyowhezihjambhpahe.supabase.co','sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3');
const key='fiscoTrackerWeb.v1',status=document.getElementById('fiscoCloudStatus');
const msg=s=>status.textContent=s;
const local=()=>JSON.parse(localStorage.getItem(key)||'{}');
let user=null;
const wrap=fn=>async()=>{try{await fn()}catch(e){msg('Errore: '+e.message)}};
document.getElementById('fiscoLogin').onclick=wrap(async()=>{
 const email=document.getElementById('fiscoEmail').value.trim();
 if(!email)throw Error('Inserisci email');
 const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:location.href}});
 if(error)throw error;msg('Apri il link ricevuto via email.');
});
document.getElementById('fiscoSave').onclick=wrap(async()=>{
 if(!user)throw Error('Accedi prima.');
 const s=local(),data={assets:s.assets||[],completedDeadlines:s.completedDeadlines||{},paymentAmounts:s.paymentAmounts||{},deadlineNotes:s.deadlineNotes||{}};
 const {error}=await db.from('fisco_tracker_profiles').upsert({user_id:user.id,data,updated_at:new Date().toISOString()},{onConflict:'user_id'});
 if(error)throw error;msg('Dati testuali salvati. Allegati esclusi.');
});
document.getElementById('fiscoLoad').onclick=wrap(async()=>{
 if(!user)throw Error('Accedi prima.');
 const {data,error}=await db.from('fisco_tracker_profiles').select('data').eq('user_id',user.id).maybeSingle();
 if(error)throw error;if(!data)return msg('Nessun backup cloud.');
 if(!confirm('Sostituire testi, importi e stati locali con quelli cloud? Gli allegati locali restano invariati.'))return;
 const s=local();localStorage.setItem(key,JSON.stringify({...s,...data.data,uploadedFiles:s.uploadedFiles||{}}));location.reload();
});
document.getElementById('fiscoLogout').onclick=wrap(async()=>{await db.auth.signOut();user=null;msg('Disconnesso.')});
document.getElementById('fiscoPush').onclick=wrap(async()=>{
 if(!user)throw Error('Accedi prima.');
 const state=local(),ids=new Set([...Object.keys(state.completedDeadlines||{}),...Object.keys(state.paymentAmounts||{}),...Object.keys(state.deadlineNotes||{})]);
 let count=0;
 for(const id of ids){
  if(!/^20\\d{2}-[a-z0-9-]+$/.test(id))continue;
  const title=id.slice(5).replaceAll('-',' ')+' ('+id.slice(0,4)+')';
  const done=!!state.completedDeadlines?.[id];
  const notes=String(state.deadlineNotes?.[id]||'')+' | Importo: '+String(state.paymentAmounts?.[id]||'');
  const {data:existing,error:readErr}=await db.from('journal_deadlines').select('id,status').eq('user_id',user.id).eq('external_source','fisco-tracker').eq('external_key',id).maybeSingle();
  if(readErr)throw readErr;
  const payload={title,category:'fiscale',notes,updated_at:new Date().toISOString()};
  if(existing){
    if(done&&existing.status==='pending'){payload.status='completed';payload.completed_at=new Date().toISOString()}
    const {error}=await db.from('journal_deadlines').update(payload).eq('id',existing.id).eq('user_id',user.id);if(error)throw error;
  }else{
    const {error}=await db.from('journal_deadlines').insert({...payload,user_id:user.id,external_source:'fisco-tracker',external_key:id,due_on:null,status:done?'completed':'pending',completed_at:done?new Date().toISOString():null});if(error)throw error;
  }
  count++;
 }
 msg(count+' adempimenti personalizzati trasferiti a LifeOS senza date non verificate.');
});
document.getElementById('fiscoPull').onclick=wrap(async()=>{
 if(!user)throw Error('Accedi prima.');
 const {data,error}=await db.from('journal_deadlines').select('external_key,status').eq('user_id',user.id).eq('external_source','fisco-tracker');
 if(error)throw error;
 const state=local();state.completedDeadlines=state.completedDeadlines||{};
 for(const row of data||[]){if(row.status==='completed')state.completedDeadlines[row.external_key]=true;else delete state.completedDeadlines[row.external_key]}
 localStorage.setItem(key,JSON.stringify(state));location.reload();
});
db.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;msg(user?'Accesso Supabase attivo.':'Accedi con lo stesso account LifeOS.')});
db.auth.getSession().then(({data})=>{user=data?.session?.user||null;msg(user?'Accesso Supabase attivo.':'Accedi con lo stesso account LifeOS.')});
})();