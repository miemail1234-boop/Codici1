(()=>{'use strict';
const db=window.supabase.createClient('https://kujyowhezihjambhpahe.supabase.co','sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3');
const host=document.getElementById('fiscalHost'),auth=document.getElementById('fiscalAuth');let cleanup=null,uid=null;
async function session(s){const user=s?.user;if(user?.id===uid)return;if(cleanup)cleanup();cleanup=null;uid=user?.id||null;host.replaceChildren();auth.hidden=!!user;if(!user)return;
 const sourceKey=localStorage.getItem('fiscoTrackerWeb.v2')?'fiscoTrackerWeb.v2':'fiscoTrackerWeb.v1';const source=localStorage.getItem(sourceKey);
 if(source){try{const backupKey=sourceKey+'.preLifeOS';if(!localStorage.getItem(backupKey))localStorage.setItem(backupKey,source);
 // Browser-local data have no account owner. Require one explicit account binding before migration.
 const ownerKey='fiscoTrackerWeb.v1.owner';let owner=localStorage.getItem(ownerKey);
 if(!owner&&confirm('Associare i dati fiscali di questo browser a '+user.email+' e sincronizzarli con LifeOS?')){owner=user.id;localStorage.setItem(ownerKey,owner);}
 if(owner===user.id&&!localStorage.getItem('fiscoMigrated.'+user.id)){
 const result=await new LifeOSFiscal.Store(db,user).migrate(JSON.parse(source));
 if(result.conflicts.length){localStorage.setItem('fiscoMigrationConflicts.'+user.id,JSON.stringify(result.conflicts));document.getElementById('migrationStatus').textContent=result.conflicts.length+' dati locali richiedono confronto: originali conservati. Nessuna sovrascrittura automatica.';}
 localStorage.setItem('fiscoMigrated.'+user.id,'1');
 }
 }catch(e){document.getElementById('migrationStatus').textContent='Migrazione incompleta: '+e.message;}}
 if(uid!==user.id)return;
 cleanup=await mountFiscal(host,db,user);
 if(uid!==user.id){cleanup();cleanup=null;host.replaceChildren();return;}
 const conflicts=JSON.parse(localStorage.getItem('fiscoMigrationConflicts.'+user.id)||'[]');
 if(conflicts.length){const panel=document.createElement('section');panel.innerHTML='<h2>Dati locali da riconciliare</h2><p>Le date cloud restano invariate. Confronta le note e i completamenti importati prima di applicarli.</p>';host.prepend(panel);
 for(const conflict of conflicts){const box=document.createElement('article');const pre=document.createElement('pre');pre.textContent=JSON.stringify(conflict.local,null,2);box.appendChild(pre);const button=document.createElement('button');button.textContent='Confronta con LifeOS';button.onclick=async()=>{try{const store=new LifeOSFiscal.Store(db,user);const cloud=(await store.all()).find(r=>r.id===conflict.cloud||r.external_key===conflict.local.external_key);if(!cloud)throw Error('Voce cloud non trovata');const current=document.createElement('pre');current.textContent=JSON.stringify(cloud,null,2);box.appendChild(current);button.disabled=true;const apply=document.createElement('button');apply.textContent='Aggiungi note locali e completa se confermato nel vecchio archivio';box.appendChild(apply);apply.onclick=async()=>{try{await store.update(cloud,{notes:(cloud.notes||'')+'\n[Importazione locale]\n'+conflict.local.notes,...(conflict.local.status==='completed'?{status:'completed'}:{})});const remaining=JSON.parse(localStorage.getItem('fiscoMigrationConflicts.'+user.id)||'[]').filter(c=>c.local.external_key!==conflict.local.external_key);localStorage.setItem('fiscoMigrationConflicts.'+user.id,JSON.stringify(remaining));box.textContent='Conflitto riconciliato.';}catch(e){apply.textContent=e.message;}};}catch(e){button.textContent=e.message;}};box.appendChild(button);panel.appendChild(box);}}

}
document.getElementById('fiscalLogin').onsubmit=async e=>{e.preventDefault();const {error}=await db.auth.signInWithPassword({email:e.target.email.value,password:e.target.password.value});if(error)document.getElementById('loginStatus').textContent=error.message;};
document.getElementById('logout').onclick=()=>db.auth.signOut();
db.auth.onAuthStateChange((_e,s)=>{setTimeout(()=>session(s),0);});db.auth.getSession().then(({data})=>session(data.session));
})();
