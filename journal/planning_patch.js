(()=>{
'use strict';
const db=supabaseClient,nav=document.getElementById('sectionNav'),main=document.querySelector('main');
if(!db||!nav||!main)return;
const tab=document.createElement('button');tab.className='section-tab';tab.id='planningTab';tab.type='button';tab.textContent='Pianificazione';
nav.insertBefore(tab,document.getElementById('instructionsTab'));
const panel=document.createElement('section');panel.className='panel planning-panel';panel.id='planningPanel';panel.hidden=true;
panel.innerHTML=[
'<h2>Analisi della pianificazione</h2>',
'<p>Journal conserva gli esiti dei controlli del calendario e delle revisioni.</p>',
'<p id="planStatus" role="status"></p>',
'<h3>Ultimo controllo del calendario</h3><div id="planAudit"></div>',
'<h3>Scadenze operative</h3><p>Cerca l’evento «Cose da fare» in <a href="https://calendar.google.com/" target="_blank" rel="noopener noreferrer">Google Calendar</a>.</p>',
'<h3>Revisioni settimanali e mensili</h3><div id="planReviews"></div>',
'<button type="button" class="button secondary" id="planRefresh">Aggiorna dati salvati</button>'
].join('');
main.appendChild(panel);
const css=document.createElement('style');css.textContent='.planning-panel{margin:18px;padding:22px}.planning-panel>p{color:#69747d;line-height:1.5}.planning-card{padding:13px 15px;margin:9px 0;border-radius:12px;border:1px solid #dae1e3;background:#f9fbfa}.planning-card strong{display:block}.planning-card small{color:#6b747a}.planning-warning{border-left:4px solid #c17714}.planning-important{border-left:4px solid #b43631}.planning-muted{color:#6b747a}#planStatus{color:#0f766e}@media(max-width:720px){.planning-panel{margin:10px;padding:14px}}';document.head.appendChild(css);
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
let user=null,active=false;
function setStatus(s,bad=false){$('planStatus').textContent=s||'';$('planStatus').style.color=bad?'#b33':'#08766e'}
function fail(e){setStatus(e?.message||String(e),true)}
function finding(x){
 const sev=String(x.severity||'').toLowerCase();
 const css=sev==='high'||sev==='critical'?'planning-important':'planning-warning';
 const label=x.title||x.summary||x.description||x.message||'Elemento da verificare';
 return '<article class="planning-card '+css+'"><strong>'+esc(label)+'</strong>'+
 (x.date?'<small>Data: '+esc(x.date)+'</small>':'')+
 (x.description&&x.title?'<p>'+esc(x.description)+'</p>':'')+
 (x.suggestion?'<p>Possibile azione: '+esc(x.suggestion)+'</p>':'')+'</article>';
}
async function refresh(){
 if(!user)return;
 const [a,r]=await Promise.all([
  db.from('journal_planning_audits').select('*').eq('user_id',user.id).order('audit_on',{ascending:false}).limit(7),
  db.from('journal_periodic_reviews').select('cadence,period_start,period_end,summary').eq('user_id',user.id).order('period_end',{ascending:false}).limit(8)
 ]);
 if(a.error||r.error)throw a.error||r.error;
 const audits=a.data||[],reviews=r.data||[];
 if(audits.length){
  const last=audits[0],findings=Array.isArray(last.findings)?last.findings:[];
  $('planAudit').innerHTML='<p><strong>Verifica: '+esc(last.audit_on)+'</strong> · Orizzonte '+esc(last.horizon_start)+'–'+esc(last.horizon_end)+'</p>'+
   '<p>'+esc(last.summary||'')+'</p>'+
   (findings.length?findings.map(finding).join(''):'<p>Nessuna criticità documentata in questa verifica.</p>')+
   (last.sources?'<p class="planning-muted">Fonti registrate: '+esc(JSON.stringify(last.sources))+'</p>':'');
 }else $('planAudit').innerHTML='<p class="planning-muted">Non è ancora disponibile una verifica del calendario archiviata. Il briefing mattutino effettuerà i controlli quando le fonti sono accessibili.</p>';
 $('planReviews').innerHTML=reviews.map(x=>'<article class="planning-card"><strong>'+esc(x.cadence==='weekly'?'Settimanale':'Mensile')+' · '+esc(x.period_start)+'–'+esc(x.period_end)+'</strong><p>'+esc(x.summary)+'</p></article>').join('')||'<p class="planning-muted">Nessuna revisione registrata.</p>';
 setStatus('Dati persistenti aggiornati.');
}
function activate(){
 if(!user)return;document.getElementById('journalTab').click();
 ['journalLayout','errorsPanel','changePanel','todoPanel','tagsPanel','instructionsPanel','monPanel','dailyPanel','checkinPanel','deadlinePanel'].forEach(id=>{if($(id))$(id).hidden=true});
 nav.querySelectorAll('button').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-selected','false')});
 tab.classList.add('active');tab.setAttribute('aria-selected','true');panel.hidden=false;active=true;refresh().catch(fail);
}
tab.addEventListener('click',activate);
nav.querySelectorAll('button').filter(b=>b!==tab).forEach(b=>b.addEventListener('click',()=>{active=false;panel.hidden=true;tab.classList.remove('active');tab.setAttribute('aria-selected','false')}));
$('planRefresh').addEventListener('click',()=>refresh().catch(fail));
db.auth.getSession().then(({data})=>user=data?.session?.user||null).catch(fail);
db.auth.onAuthStateChange((_e,s)=>{user=s?.user||null;if(!user){active=false;panel.hidden=true}else if(active)refresh().catch(fail)});
})();