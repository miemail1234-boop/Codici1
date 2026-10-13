(()=>{
 const db=supabaseClient;
 async function ensureSleepMonitor(session){
  const user=session?.user;if(!user)return;
  const {data:existing,error:readError}=await db.from('journal_monitoring_goals')
    .select('id').eq('user_id',user.id).eq('metric_type','sleep').limit(1);
  if(readError||existing?.length)return;
  const {data:source,error:sourceError}=await db.from('journal_note_metadata')
    .select('note_id').eq('user_id',user.id)
    .eq('title','Regolarità del sonno: obiettivo e monitoraggio')
    .limit(1).maybeSingle();
  if(sourceError||!source?.note_id)return;
  const {error}=await db.from('journal_monitoring_goals').insert({
   user_id:user.id,title:'Regolarità del sonno',
   description:'A letto entro le 23:00; sveglia entro le 07:00, giovedì entro le 06:00.',
   category:'salute',metric_type:'sleep',status:'active',start_date:'2026-10-13',
   review_every_days:7,next_review_on:'2026-10-18',timezone:'Europe/Rome',
   target:{bed_by:'23:00',wake_by:'07:00',thursday_wake_by:'06:00'},source_note_id:source.note_id
  });
  if(error){document.getElementById('mStatus').textContent='Attivazione monitoraggio: '+error.message;return;}
  if(!document.getElementById('monPanel').hidden)document.getElementById('monTab').click();
 }
 db.auth.getSession().then(({data})=>ensureSleepMonitor(data?.session)).catch(()=>{});
 db.auth.onAuthStateChange((_e,session)=>{ensureSleepMonitor(session).catch(()=>{})});
})();