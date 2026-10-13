(()=>{
'use strict';
const db=supabaseClient,nav=document.getElementById('sectionNav'),main=document.querySelector('main');
if(!db||!nav||!main)return;
const tab=document.createElement('button');tab.id='holidayTab';tab.type='button';tab.className='section-tab';tab.textContent='Festività';
nav.insertBefore(tab,document.getElementById('instructionsTab'));
const panel=document.createElement('section');panel.id='holidayPanel';panel.className='panel holiday-panel';panel.hidden=true;
panel.innerHTML=[
'<h2>Festività italiane e milanesi</h2>',
'<p>Calendario permanente 2026–2045. Gli impegni lavorativi non devono coincidere con festività applicabili. Controlla anche tutte le domeniche.</p>',
'<p>Il 7 dicembre è la festività di Sant’Ambrogio, patrono di Milano: è locale e non vale automaticamente per altri comuni. Ponti e vacanze scolastiche richiedono i calendari dei singoli enti.</p>',
'<div class="holiday-controls"><label>Anno <select id="holidayYear"></select></label><label><input id="holidayMilan" type="checkbox" checked> Includi Sant’Ambrogio (Milano)</label><button id="holidayRefresh" type="button" class="button secondary">Aggiorna</button></div>',
'<p id="holidayStatus" role="status"></p>',
'<h3>Controlla una data prima di fissare un impegno lavorativo</h3>',
'<form id="holidayCheck"><label>Data proposta <input id="holidayCheckDay" type="date" required></label><button type="submit" class="button primary">Verifica</button></form>',
'<p id="holidayCheckResult" aria-live="polite"></p>',
'<h3>Elenco delle festività</h3><div id="holidayList"></div>'
].join('');
main.appendChild(panel);
const style=document.createElement('style');
style.textContent='.holiday-panel{margin:18px;padding:22px}.holiday-panel>p{color:#68747c;line-height:1.5}.holiday-controls{display:flex;flex-wrap:wrap;align-items:center;gap:15px;margin:17px 0}.holiday-controls label{display:flex;gap:7px;align-items:center}.holiday-controls select,.holiday-panel input[type=date]{padding:8px;border:1px solid #c4cdd2;border-radius:8px;font:inherit}.holiday-panel form{display:flex;align-items:center;flex-wrap:wrap;gap:12px}.holiday-panel form label{display:grid;gap:4px}.holiday-item{border-bottom:1px solid #e1e4e5;padding:9px 5px;display:flex;gap:16px;justify-content:space-between}.holiday-item small{color:#6b757e}.holiday-local{background:#f3f9f7;border-left:4px solid #0f766e;padding-left:9px}.holiday-block{padding:12px;border-radius:10px;background:#fdf0ef;color:#a22e2e;font-weight:750}.holiday-ok{padding:12px;border-radius:10px;background:#edf8f5;color:#076c5d;font-weight:750}#holidayStatus{color:#0f766e}@media(max-width:700px){.holiday-panel{margin:10px;padding:14px}.holiday-item{display:block}}';
document.head.appendChild(style);
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
function today(){const p=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),v=k=>p.find(x=>x.type===k).value;return v('year')+'-'+v('month')+'-'+v('day')}
const fmt=d=>new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(d+'T12:00:00Z'));
let user=null,active=false,rows=[];
const error=e=>{$('holidayStatus').textContent=e?.message||String(e);$('holidayStatus').style.color='#a33a31'};
function render(){
 const selected=$('holidayMilan').checked?rows:rows.filter(x=>x.scope==='italia');
 $('holidayList').innerHTML=selected.map(r=>'<div class="holiday-item '+(r.scope==='milano'?'holiday-local':'')+'"><span><strong>'+esc(fmt(r.holiday_date))+'</strong> · '+esc(r.name)+'</span><small>'+esc(r.scope==='milano'?'Milano':'Italia')+'</small></div>').join('')||'Nessuna festività trovata per questo anno.';
 $('holidayStatus').textContent=selected.length+' festività elencate; anche tutte le domeniche sono festive.';$('holidayStatus').style.color='#0f766e';
}
async function load(){
 if(!user)return;const year=Number($('holidayYear').value);
 const {data,error:e}=await db.from('journal_holiday_dates').select('holiday_date,name,scope').eq('user_id',user.id)
 .gte('holiday_date',year+'-01-01').lte('holiday_date',year+'-12-31').order('holiday_date');
 if(e)throw e;rows=data||[];render();
}
async function checkDate(date){
 if(!date||!user)return;
 const year=Number(date.slice(0,4));
 if(year<2026||year>2045){$('holidayCheckResult').className='holiday-block';$('holidayCheckResult').textContent='Verifica non disponibile fuori dall’intervallo 2026–2045; controlla prima le fonti ufficiali.';return}
 const {data,error:e}=await db.from('journal_holiday_dates').select('name,scope').eq('user_id',user.id).eq('holiday_date',date);
 if(e)throw e;
 const applicable=(data||[]).filter(x=>x.scope==='italia'||$('holidayMilan').checked);
 const sunday=new Date(date+'T12:00:00Z').getUTCDay()===0;
 const blocked=applicable.length>0||sunday;
 $('holidayCheckResult').className=blocked?'holiday-block':'holiday-ok';
 $('holidayCheckResult').textContent=blocked?
 'NON pianificare impegni lavorativi: '+[...applicable.map(x=>x.name),...(sunday?['Domenica']:[])].join('; ')+'.':
 'Non risultano festività nazionali o milanesi per questa data. Verifica comunque eventuali chiusure specifiche della tua organizzazione.';
}
function activate(){
 if(!user)return;document.getElementById('journalTab').click();
 ['journalLayout','errorsPanel','changePanel','todoPanel','tagsPanel','instructionsPanel','monPanel','dailyPanel','checkinPanel','deadlinePanel','planningPanel'].forEach(id=>{const node=$(id);if(node)node.hidden=true});
 nav.querySelectorAll('button').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-selected','false')});
 tab.classList.add('active');tab.setAttribute('aria-selected','true');panel.hidden=false;active=true;load().catch(error);
}
for(let year=2026;year<=2045;year++)$('holidayYear').insertAdjacentHTML('beforeend','<option value="'+year+'">'+year+'</option>');
$('holidayYear').value=today().slice(0,4);$('holidayCheckDay').value=today();
tab.addEventListener('click',activate);
nav.querySelectorAll('button').filter(b=>b!==tab).forEach(b=>b.addEventListener('click',()=>{active=false;panel.hidden=true;tab.classList.remove('active')}));
$('holidayYear').addEventListener('change',()=>load().catch(error));
$('holidayMilan').addEventListener('change',()=>{render();if($('holidayCheckResult').textContent)checkDate($('holidayCheckDay').value).catch(error)});
$('holidayRefresh').addEventListener('click',()=>load().catch(error));
$('holidayCheck').addEventListener('submit',e=>{e.preventDefault();checkDate($('holidayCheckDay').value).catch(error)});
db.auth.getSession().then(({data})=>{user=data?.session?.user||null}).catch(error);
db.auth.onAuthStateChange((_e,s)=>{user=s?.user||null;if(!user){active=false;panel.hidden=true}else if(active)load().catch(error)});
})();