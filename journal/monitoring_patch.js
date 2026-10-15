(()=>{
const nav=document.getElementById('sectionNav'),main=document.querySelector('main'),db=supabaseClient;
if(!nav||!main)return;
const tab=document.createElement('button');tab.textContent='Monitoraggi';tab.className='section-tab';tab.id='monTab';
nav.insertBefore(tab,document.getElementById('instructionsTab'));
const panel=document.createElement('section');panel.className='panel';panel.id='monPanel';panel.hidden=true;panel.style.cssText='margin:18px;padding:20px';
panel.innerHTML=`<h2>Monitoraggi</h2><p>Obiettivi e revisioni persistenti su Supabase. I giorni senza dati restano mancanti.</p><p id="mStatus"></p>
<div id="mGoals"></div><section id="mDetail" hidden><h3 id="mTitle"></h3><p id="mDue"></p>
<form id="mLog"><h4>Rilevazione giornaliera</h4><label>Giorno <input type="date" id="mDate" required></label>
<div id="mSleep"><label>A letto (sera precedente) <input type="time" id="mBed"></label><label>Sveglia <input type="time" id="mWake"></label></div>
<label id="mOther" hidden>Valore <input id="mValue"></label><label>Nota <input id="mNote"></label>
<button class="button primary">Salva rilevazione</button></form><div id="mStats"></div><div id="mLogs"></div>
<form id="mReview"><h4>Revisione settimanale</h4><label>Data <input id="mReviewDay" type="date" required></label>
<button type="button" class="button secondary" id="mDraft">Prepara sintesi</button><label>Valutazione <textarea id="mSummary" rows="3" required></textarea></label>
<button class="button primary">Salva revisione</button></form><div id="mReviews"></div></section>
<details><summary>Aggiungi obiettivo</summary><form id="mNew"><label>Nome <input id="mName" required></label><label>Tipo <select id="mType"><option value="sleep">Sonno: a letto entro le 23; sveglia 7, giovedì 6</option><option value="generic">Generico</option></select></label><label>Descrizione <input id="mDesc"></label>
<button class="button primary">Crea obiettivo</button></form></details>`;
main.appendChild(panel);
const css=document.createElement('style');css.textContent='#monPanel form{display:grid;gap:10px;padding:14px;margin:12px 0;border:1px solid #ddd;border-radius:12px}#monPanel label{display:grid;gap:5px}#monPanel input,#monPanel textarea,#monPanel select{font:inherit;padding:8px;border:1px solid #bbb;border-radius:8px;max-width:450px}#monPanel button{margin:4px}#mGoals button{border:1px solid #ccc;border-radius:9px;background:#f7faf9;padding:12px;text-align:left}#mLogs div,#mReviews div{padding:7px;border-bottom:1px solid #ddd}';document.head.appendChild(css);
const $=id=>document.getElementById(id),safe=s=>String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const add=(date,n)=>{const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};

function validDate(d){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d||''))return false;
  const x=new Date(d+'T12:00:00Z');
  return !Number.isNaN(x.getTime())&&x.toISOString().slice(0,10)===d;
}
function minutes(t){
  if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(t||''))return null;
  const [h,m]=t.split(':').map(Number);
  return h*60+m;
}
function weekSummary(end,items,g){
  const from=add(end,-6),start=g.start_date&&g.start_date>from?g.start_date:from;
  const days=start>end?0:Math.round((Date.parse(end)-Date.parse(start))/86400000)+1;
  const relevant=new Map((items||[]).filter(x=>x.observed_on>=start&&x.observed_on<=end).map(x=>[x.observed_on,x]));
  const found=relevant.size;
  let s='Periodo '+start+'–'+end+': '+found+'/'+days+' giorni registrati ('+(days?Math.round(found/days*100)+'%':'n.d.')+' del periodo), '+(days-found)+' mancanti.';
  if(g.metric_type!=='sleep')return s;
  const target=g.target||{},bedTarget=minutes(target.bed_by),wakeTarget=minutes(target.wake_by),thuTarget=minutes(target.thursday_wake_by);
  let beds=0,bedsOk=0,wakes=0,wakesOk=0,pairs=0,pairsOk=0;
  for(const row of relevant.values()){
    const metrics=row.metrics||{},bed=minutes(metrics.bed_time),wake=minutes(metrics.wake_time);
    const isThursday=new Date(row.observed_on+'T12:00:00Z').getUTCDay()===4;
    const wakeLimit=isThursday&&thuTarget!==null?thuTarget:wakeTarget;
    const bedEvaluable=bed!==null&&bedTarget!==null;
    const wakeEvaluable=wake!==null&&wakeLimit!==null;
    // 00:00-11:59 as a bedtime belongs to the next civil day, not an "early" bedtime.
    const bedOk=bedEvaluable&&(bed<12*60?bed+24*60:bed)<=bedTarget;
    const wakeOk=wakeEvaluable&&wake<=wakeLimit;
    if(bedEvaluable){beds++;if(bedOk)bedsOk++;}
    if(wakeEvaluable){wakes++;if(wakeOk)wakesOk++;}
    if(bedEvaluable&&wakeEvaluable){pairs++;if(bedOk&&wakeOk)pairsOk++;}
  }
  const ratio=(n,d)=>n+'/'+d+' ('+(d?Math.round(n/d*100)+'%':'n.d.')+' dei giorni valutabili)';
  if(bedTarget!==null)s+=' A letto entro '+target.bed_by+': '+ratio(bedsOk,beds)+'.';
  if(wakeTarget!==null)s+=' Risveglio entro '+target.wake_by+(thuTarget!==null?' (giovedì '+target.thursday_wake_by+')':'')+': '+ratio(wakesOk,wakes)+'.';
  if(bedTarget!==null&&wakeTarget!==null)s+=' Entrambi gli obiettivi: '+ratio(pairsOk,pairs)+'.';
  return s+' Orari dichiarati; nessuna stima delle ore di sonno effettivo.';
}

let user=null,goals=[],goal=null,logs=[],reviews=[];

async function withCheckins(items,from,to){
 if(goal?.metric_type!=='sleep')return items;
 const q=await db.from('journal_daily_checkins').select('checkin_date,phase,answers,note,updated_at').eq('user_id',user.id).gte('checkin_date',from).lte('checkin_date',to).order('updated_at');
 if(q.error)throw q.error;
 const merged=new Map(items.map(x=>[x.observed_on,{...x,metrics:{...x.metrics}}]));
 for(const c of q.data||[]){
  const a=c.answers||{},keys=['bed_time','wake_time','wake_energy_1_10','energy_1_5','actual_sleep_hours'];
  if(!keys.some(k=>a[k]!=null&&a[k]!==''))continue;
  const row=merged.get(c.checkin_date)||{observed_on:c.checkin_date,metrics:{},note:'Fonte: check-in'};
  for(const k of keys)if(a[k]!=null&&a[k]!==''){
   // A conflicting manual log is not silently replaced by a check-in.
   if(row.metrics[k]==null||row.metrics[k]==='')row.metrics[k]=a[k];
   else if(row.metrics[k]!==a[k])row.note=(row.note||'')+' [Conflitto '+k+' con check-in: '+a[k]+']';
  }
  merged.set(c.checkin_date,row);
 }
 return [...merged.values()].sort((a,b)=>b.observed_on.localeCompare(a.observed_on));
}

const error=e=>$('mStatus').textContent=e?.message||String(e);
async function load(){if(!user)return;
const q=await db.from('journal_monitoring_goals').select('*').eq('user_id',user.id).order('created_at');if(q.error)throw q.error;
goals=q.data||[];goal=goals.find(g=>g.id===goal?.id)||goals.find(g=>g.status==='active')||goals[0]||null;
$('mGoals').innerHTML=goals.map(g=>`<button data-id="${g.id}">${safe(g.title)} · ${safe(g.status)} · revisione ${g.next_review_on||'–'}</button>`).join('')||'Nessun obiettivo ancora creato.';
$('mGoals').querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>select(b.dataset.id).catch(error));
await select(goal?.id);
}
async function select(id){
goal=goals.find(g=>g.id===id)||null;$('mDetail').hidden=!goal;if(!goal)return;
const [l,r]=await Promise.all([db.from('journal_monitoring_logs').select('*').eq('user_id',user.id).eq('goal_id',id).order('observed_on',{ascending:false}).limit(100),db.from('journal_monitoring_reviews').select('*').eq('user_id',user.id).eq('goal_id',id).order('review_on',{ascending:false}).limit(30)]);
if(l.error||r.error)throw l.error||r.error;logs=await withCheckins(l.data||[],goal.start_date||add(today(),-99),today());reviews=r.data||[];
$('mTitle').textContent=goal.title;$('mDue').textContent='Prossima revisione: '+(goal.next_review_on||'non pianificata')+(goal.status==='active'&&goal.next_review_on&&goal.next_review_on<=today()?' (da effettuare)':'');
$('mSleep').hidden=goal.metric_type!=='sleep';$('mOther').hidden=goal.metric_type==='sleep';
$('mBed').required=$('mWake').required=goal.metric_type==='sleep';$('mValue').required=goal.metric_type!=='sleep';
$('mStats').textContent=weekSummary(today(),logs,goal);
$('mLogs').innerHTML=logs.slice(0,14).map(x=>'<div>'+safe(x.observed_on)+' · '+safe(JSON.stringify(x.metrics))+' · '+safe(x.note)+'</div>').join('');
$('mReviews').innerHTML=reviews.slice(0,5).map(x=>'<div>'+safe(x.review_on)+' · '+safe(x.summary)+'</div>').join('');
}
tab.addEventListener('click',()=>{if(!user)return;$('journalTab').click();['journalLayout','errorsPanel','changePanel','todoPanel','tagsPanel','instructionsPanel'].forEach(id=>$(id).hidden=true);
nav.querySelectorAll('button').forEach(b=>b.classList.remove('active'));tab.classList.add('active');panel.hidden=false;load().catch(error)});
nav.querySelectorAll('button:not(#monTab)').forEach(b=>b.addEventListener('click',()=>{panel.hidden=true;tab.classList.remove('active')}));
$('mLog').addEventListener('submit',async e=>{e.preventDefault();if(!goal)return;
const metrics=goal.metric_type==='sleep'?{bed_time:$('mBed').value,wake_time:$('mWake').value}:{value:$('mValue').value};
if(Object.values(metrics).some(x=>!x)||!validDate($('mDate').value)||$('mDate').value>today()||$('mDate').value<goal.start_date)return error('Controlla orari e data (tra l’inizio del monitoraggio e oggi).');
const r=await db.from('journal_monitoring_logs').upsert({user_id:user.id,goal_id:goal.id,observed_on:$('mDate').value,metrics,note:$('mNote').value},{onConflict:'user_id,goal_id,observed_on'});
if(r.error)return error(r.error);e.target.reset();$('mDate').value=today();await select(goal.id);$('mStatus').textContent='Rilevazione salvata.';});
$('mDraft').onclick=async()=>{
  if(!goal)return;
  const day=$('mReviewDay').value;
  if(!validDate(day)||day>today()||day<goal.start_date)return error('Seleziona una data valida compresa nel monitoraggio.');
  const start=add(day,-6);
  const q=await db.from('journal_monitoring_logs').select('observed_on,metrics').eq('user_id',user.id).eq('goal_id',goal.id).gte('observed_on',start).lte('observed_on',day);
  if(q.error)return error(q.error);
  $('mSummary').value=weekSummary(day,await withCheckins(q.data||[],start,day),goal)+' Valutazione e modifiche da considerare: ';
};
$('mReview').addEventListener('submit',async e=>{e.preventDefault();if(!goal)return;const d=$('mReviewDay').value;if(!validDate(d)||d>today()||d<goal.start_date)return error('Seleziona una data di revisione valida.');
const x=await db.from('journal_monitoring_reviews').upsert({user_id:user.id,goal_id:goal.id,review_on:d,period_from:add(d,-6),period_to:d,summary:$('mSummary').value.trim()},{onConflict:'user_id,goal_id,review_on'});if(x.error)return error(x.error);
if(!goal.last_review_on||d>=goal.last_review_on){
  const y=await db.from('journal_monitoring_goals').update({last_review_on:d,next_review_on:add(d,goal.review_every_days),updated_at:new Date().toISOString()}).eq('user_id',user.id).eq('id',goal.id).select('id').single();
  if(y.error)return error(y.error);
}$('mSummary').value='';await load();$('mStatus').textContent='Revisione salvata.';});
$('mNew').addEventListener('submit',async e=>{e.preventDefault();if(!user)return;const d=today(),type=$('mType').value,day=new Date(d+'T12:00:00Z').getUTCDay();
const name=$('mName').value.trim();if(!name)return error('Inserisci un nome non vuoto.');
const x=await db.from('journal_monitoring_goals').insert({user_id:user.id,title:name,description:$('mDesc').value,category:type==='sleep'?'salute':'benessere',metric_type:type,status:'active',start_date:d,review_every_days:7,next_review_on:add(d,type==='sleep'?7-day:7),timezone:'Europe/Rome',target:type==='sleep'?{bed_by:'23:00',wake_by:'07:00',thursday_wake_by:'06:00'}:{}}).select('id').single();
if(x.error)return error(x.error);e.target.reset();goal={id:x.data.id};await load();$('mStatus').textContent='Obiettivo creato.';});
$('mDate').value=today();$('mReviewDay').value=today();
db.auth.getSession().then(({data})=>user=data?.session?.user||null);
db.auth.onAuthStateChange((_e,session)=>{user=session?.user||null;if(!user)panel.hidden=true});
})();
