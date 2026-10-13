(()=>{
'use strict';
const db=supabaseClient,nav=document.getElementById('sectionNav'),main=document.querySelector('main');
if(!db||!nav||!main)return;
const tab=document.createElement('button');tab.id='dailyTab';tab.type='button';tab.className='section-tab';tab.textContent='Check-in';
nav.insertBefore(tab,document.getElementById('monTab'));
const panel=document.createElement('section');panel.id='dailyPanel';panel.className='panel daily-panel';panel.hidden=true;
panel.innerHTML=`<h2>Check-in quotidiano</h2><p>Mattino: dati reali della notte. Sera: bilancio delle attività e pianificazione.</p><div id="dailyStatus" role="status"></div>
<div class="daily-grid">
<form id="morningForm"><h3>Mattino</h3><label>Data del risveglio<input id="morningDate" type="date" required></label>
<label>A che ora sei andato a letto ieri sera?<input id="actualBed" type="time" required></label>
<label>A che ora ti sei svegliato?<input id="actualWake" type="time" required></label>
<label>Energia (1 = molto bassa, 5 = molto alta)<select id="actualEnergy" required><option value="">Seleziona</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></label>
<div id="otherGoals"></div><label>Nota facoltativa<textarea id="morningNote" rows="2"></textarea></label><button class="button primary">Salva check-in mattutino</button></form>
<form id="eveningForm"><h3>Sera</h3><label>Data<input id="eveningDate" type="date" required></label><p>Quali attività di oggi hai completato?</p>
<div id="dailyTasks"></div><label>Altre attività completate<textarea id="moreCompleted" rows="2"></textarea></label>
<label>Cosa è rimasto da fare? Cosa riprogrammare?<textarea id="toCarry" rows="2"></textarea></label>
<label>A che ora prevedi di andare a letto? (non è l'ora effettiva)<input id="bedPlan" type="time" value="23:00"></label>
<label>Nota facoltativa<textarea id="eveningNote" rows="2"></textarea></label><button class="button primary">Salva check-in serale</button></form>
</div><h3>Storico recente</h3><div id="dailyHistory"></div>`;
main.appendChild(panel);
const css=document.createElement('style');css.textContent=`
.daily-panel{margin:18px;padding:22px}.daily-panel>p{color:#697783}.daily-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:18px 0}
.daily-grid form{display:grid;gap:12px;align-content:start;padding:16px;border:1px solid #dbe1e3;border-radius:15px}
.daily-grid h3{margin:0}.daily-grid form>p{margin:0;color:#697783}
.daily-grid label{display:grid;gap:4px;font-size:.9rem;font-weight:650}
.daily-grid input,.daily-grid select,.daily-grid textarea{width:100%;font:inherit;border:1px solid #cad3d7;border-radius:9px;padding:9px;min-width:0}
.daily-grid .button{justify-self:start}
.daily-task{display:flex!important;flex-direction:row!important;align-items:start;gap:8px;font-weight:450!important;padding:4px 0}
.daily-task input{width:auto!important;margin-top:3px}
.daily-record{border-bottom:1px solid #dbe1e3;padding:9px 0;white-space:pre-wrap;overflow-wrap:anywhere}
.daily-record small{display:block;color:#697783}
#dailyStatus{min-height:24px;color:#0f766e;font-weight:700}
@media(max-width:800px){.daily-grid{grid-template-columns:1fr}.daily-panel{margin:10px;padding:15px}}`;
document.head.appendChild(css);
const $=id=>document.getElementById(id);
const html=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>{const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',day:'2-digit',month:'2-digit',year:'numeric'}).formatToParts(new Date());const v=x=>parts.find(p=>p.type===x).value;return v('year')+'-'+v('month')+'-'+v('day')};
let user=null,active=false,goals=[],tasks=[],history=[];
const status=(msg,error=false)=>{$('dailyStatus').textContent=msg||'';$('dailyStatus').style.color=error?'#a33a31':'#0f766e'};
const fail=e=>status(e?.message||String(e),true);
function parseTasks(content){
 let section='',out=[];
 for(const line of String(content||'').split(/\r?\n/)){
  const x=line.trim();
  // Do not accidentally classify an upcoming dated section as OGGI.
  if(!x.startsWith('- ')&&x===x.toLocaleUpperCase('it-IT')&&/^[A-ZÀ-Ü0-9 .–—/-]+$/.test(x)){section=x;continue}
  if((section==='OGGI'||section==='URGENTE'||/^ENTRO\b/.test(section))&&x.startsWith('- ')&&!/^[-]\s*\[[xX]\]/.test(x))out.push(x.slice(2));
 }
 return out.slice(0,25);
}
async function refresh(){
 if(!user)return;
 const [g,t,h]=await Promise.all([
  db.from('journal_monitoring_goals').select('id,title,metric_type').eq('user_id',user.id).eq('status','active'),
  db.from('journal_todo_single').select('content').eq('user_id',user.id).maybeSingle(),
  db.from('journal_daily_checkins').select('*').eq('user_id',user.id).order('checkin_date',{ascending:false}).limit(28)
 ]);
 if(g.error||t.error||h.error)throw(g.error||t.error||h.error);
 goals=g.data||[];tasks=parseTasks(t.data?.content);history=h.data||[];
 $('dailyTasks').innerHTML=tasks.length?tasks.map((s,i)=>`<label class="daily-task"><input type="checkbox" value="${i}"><span>${html(s)}</span></label>`).join(''):'Nessuna attività in OGGI o URGENTE.';
 $('otherGoals').innerHTML=goals.filter(x=>x.metric_type!=='sleep').map(g=>`<label>${html(g.title)} (facoltativo)<input class="otherMetric" type="text" data-goal="${g.id}" maxlength="120" placeholder="Valore osservato"></label>`).join('');
 $('dailyHistory').innerHTML=history.map(h=>`<div class="daily-record"><b>${html(h.checkin_date)} — ${h.phase==='morning'?'Mattino':'Sera'}</b><small>${html(JSON.stringify(h.answers))}</small>${h.note?html(h.note):''}</div>`).join('')||'Nessun check-in registrato.';
}
function activate(){
 if(!user)return;
 $('journalTab').click();
 ['journalLayout','errorsPanel','changePanel','todoPanel','tagsPanel','instructionsPanel','monPanel'].forEach(id=>{if($(id))$(id).hidden=true});
 nav.querySelectorAll('button').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-selected','false')});
 tab.classList.add('active');tab.setAttribute('aria-selected','true');panel.hidden=false;active=true;
 refresh().then(()=>status('Dati aggiornati.')).catch(fail);
}
tab.addEventListener('click',activate);
nav.querySelectorAll('button').forEach(b=>{if(b!==tab)b.addEventListener('click',()=>{active=false;panel.hidden=true;tab.classList.remove('active');tab.setAttribute('aria-selected','false')})});
const validDay=d=>{if(!d||d>today())throw Error('Inserisci una data non futura.')};
async function write(phase,date,answers,note){
 const {error}=await db.from('journal_daily_checkins').upsert({user_id:user.id,checkin_date:date,phase,answers,note,updated_at:new Date().toISOString()},{onConflict:'user_id,checkin_date,phase'});
 if(error)throw error;
}
$('morningForm').addEventListener('submit',async e=>{
 e.preventDefault();if(!user)return;
 const d=$('morningDate').value,bed=$('actualBed').value,wake=$('actualWake').value,energy=Number($('actualEnergy').value);
 const button=e.target.querySelector('button[type="submit"]');button.disabled=true;
 try{
  validDay(d);if(!bed||!wake||!Number.isInteger(energy)||energy<1||energy>5)throw Error('Compila orari ed energia.');
  const extra={};
  for(const x of $('otherGoals').querySelectorAll('.otherMetric'))if(x.value.trim())extra[x.dataset.goal]=x.value.trim();
  await write('morning',d,{bed_time:bed,wake_time:wake,energy_1_5:energy,other_metrics:extra},$('morningNote').value.trim());
  const sleep=goals.find(x=>x.metric_type==='sleep');
  if(sleep){
   const old=await db.from('journal_monitoring_logs').select('metrics').eq('user_id',user.id).eq('goal_id',sleep.id).eq('observed_on',d).maybeSingle();
   if(old.error)throw old.error;
   const {error}=await db.from('journal_monitoring_logs').upsert({user_id:user.id,goal_id:sleep.id,observed_on:d,metrics:{...(old.data?.metrics||{}),bed_time:bed,wake_time:wake,energy_1_5:energy},note:$('morningNote').value.trim(),updated_at:new Date().toISOString()},{onConflict:'user_id,goal_id,observed_on'});
   if(error)throw error;
  }
  for(const [goalId,value] of Object.entries(extra)){
   const {error}=await db.from('journal_monitoring_logs').upsert({user_id:user.id,goal_id:goalId,observed_on:d,metrics:{value},updated_at:new Date().toISOString()},{onConflict:'user_id,goal_id,observed_on'});
   if(error)throw error;
  }
  await refresh();status('Check-in mattutino registrato.'); 
 }catch(err){fail(err)}finally{button.disabled=false}
});
$('eveningForm').addEventListener('submit',async e=>{
 e.preventDefault();if(!user)return;
 const button=e.target.querySelector('button[type="submit"]');button.disabled=true;
 try{
  const d=$('eveningDate').value;validDay(d);
  const done=[...$('dailyTasks').querySelectorAll('input:checked')].map(x=>tasks[Number(x.value)]).filter(Boolean);
  await write('evening',d,{completed_tasks:done,additional_completed:$('moreCompleted').value.trim(),carry_over:$('toCarry').value.trim(),planned_bedtime:$('bedPlan').value},$('eveningNote').value.trim());
  await refresh();status('Check-in serale registrato. Nessuna attività è stata modificata automaticamente.');
 }catch(err){fail(err)}finally{button.disabled=false}
});
$('morningDate').value=today();$('eveningDate').value=today();
db.auth.getSession().then(({data})=>user=data?.session?.user||null).catch(fail);
db.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;if(!user){active=false;panel.hidden=true}else if(active)refresh().catch(fail)});
})();