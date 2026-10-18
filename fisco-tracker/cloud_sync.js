(()=>{
'use strict';
const db=window.supabase.createClient('https://kujyowhezihjambhpahe.supabase.co','sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3');
const key='fiscoTrackerWeb.v1',status=document.getElementById('cloudStatus');
const msg=s=>status.textContent=s;
const local=()=>JSON.parse(localStorage.getItem(key)||'{}');
let user=null;
const wrap=fn=>async()=>{try{await fn()}catch(e){msg('Errore: '+e.message)}};
document.getElementById('cloudLogin').onclick=wrap(async()=>{
 const email=document.getElementById('cloudEmail').value.trim();
 if(!email)throw Error('Inserisci email');
 const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:location.href}});
 if(error)throw error;msg('Apri il link ricevuto via email.');
});
document.getElementById('cloudSave').onclick=wrap(async()=>{
 if(!user)throw Error('Accedi prima.');
 const s=local(),data={assets:s.assets||[],completedDeadlines:s.completedDeadlines||{},paymentAmounts:s.paymentAmounts||{},deadlineNotes:s.deadlineNotes||{}};
 const {error}=await db.from('fisco_tracker_profiles').upsert({user_id:user.id,data,updated_at:new Date().toISOString()},{onConflict:'user_id'});
 if(error)throw error;msg('Dati testuali salvati. Allegati esclusi.');
});
document.getElementById('cloudLoad').onclick=wrap(async()=>{
 if(!user)throw Error('Accedi prima.');
 const {data,error}=await db.from('fisco_tracker_profiles').select('data').eq('user_id',user.id).maybeSingle();
 if(error)throw error;if(!data)return msg('Nessun backup cloud.');
 if(!confirm('Sostituire testi, importi e stati locali con quelli cloud? Gli allegati locali restano invariati.'))return;
 const s=local();localStorage.setItem(key,JSON.stringify({...s,...data.data,uploadedFiles:s.uploadedFiles||{}}));location.reload();
});
db.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;msg(user?'Accesso Supabase attivo.':'Accedi con lo stesso account LifeOS.')});
db.auth.getSession().then(({data})=>{user=data?.session?.user||null;msg(user?'Accesso Supabase attivo.':'Accedi con lo stesso account LifeOS.')});
})();