(()=>{
'use strict';
const db=supabaseClient,nav=document.getElementById('sectionNav'),main=document.querySelector('main');
if(!db||!nav||!main)return;
const tab=document.createElement('button');tab.id='deadlineTab';tab.className='section-tab';tab.type='button';tab.textContent='Scadenze';nav.insertBefore(tab,document.getElementById('instructionsTab'));
const panel=document.createElement('section');panel.id='deadlinePanel';panel.className='panel deadline-panel';panel.hidden=true;
panel.innerHTML=[
'<h2>Scadenze fiscali e amministrative</h2>',
'<p>Registra soltanto date verificate. Le scadenze senza data restano in evidenza come “da verificare”; un controllo programmato può ricordare le altre.</p>',
'<p id="dlStatus" role="status"></p>',
'<form id="dlForm"><h3>Aggiungi scadenza</h3><label>Descrizione<input id="dlTitle" required maxlength="200" placeholder="Es. seconda rata TARI"></label>',
'<label>Categoria<select id="dlCategory"><option value="fiscale">Fiscale</option><option value="amministrativa">Amministrativa</option><option value="personale">Personale</option><option value="lavoro">Lavoro</option><option value="altro">Altro</option></select></label>',
'<label>Data verificata (lascia vuota se sconosciuta)<input id="dlDate" type="date"></label>',
'<label>Nota / fonte della scadenza<textarea id="dlNotes" rows="2" maxlength="4000"></textarea></label>',
'<label>Avvisi anticipati in giorni, separati da virgole<input id="dlDays" value="30,14,7,1,0"></label>',
'<button class="button primary" type="submit">Registra scadenza</button></form>',
'<h3>Da gestire</h3><div id="dlPending"></div>',
'<details><summary>Completate e archiviate</summary><div id="dlDone"></div></details>'
].join('');
main.appendChild(panel);
const style=document.createElement('style');
style.textContent='.deadline-panel{margin:18px;padding:22px}.deadline-panel>p{color:#68737d;line-height:1.45}.deadline-panel form{display:grid;gap:12px;border:1px solid #d8e1e0;border-radius:15px;padding:16px;margin:14px 0}.deadline-panel label{display:grid;gap:4px;font-weight:600}.deadline-panel input,.deadline-panel textarea,.deadline-panel select{font:inherit;padding:9px;border-radius:8px;border:1px solid #c4cbcd}.deadline-panel form button{justify-self:start}.deadline-row{display:flex;justify-content:space-between;gap:14px;align-items:center;padding:12px 0;border-bottom:1px solid #e0e4e6}.deadline-row small{display:block;color:#68737d;margin-top:5px}.deadline-row button{margin-left:5px}.deadline-overdue{color:#ad322f;font-weight:700}.deadline-soon{color:#a66300;font-weight:700}.deadline-unspecified{color:#68737d}.deadline-panel #dlStatus{color:#08766e}@media(max-width:680px){.deadline-panel{margin:10px;padding:14px}.deadline-row{align-items:start;flex-direction:column}}';
document.head.appendChild(style);
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
function today(){const p=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',day:'2-digit',month:'2-digit',year:'numeric'}).formatToParts(new Date());const v=k=>p.find(x=>x.type===k).value;return v('year')+'-'+v('month')+'-'+v('day')}
const dayDiff=(from,to)=>Math.round((Date.parse(to+'T12:00:00Z')-Date.parse(from+'T12:00:00Z'))/86400000);
let user=null,active=false,rows=[];
function status(s,bad=false){$('dlStatus').textContent=s||'';$('dlStatus').style.color=bad?'#a33a31':'#08766e'}
const err=e=>status(e?.message||String(e),true);
function dueText(r){
 if(!r.due_on)return '<span class="deadline-unspecified">Data da verificare</span>';
 const days=dayDiff(today(),r.due_on);
 const label=days<0?'SCADUTA DA '+(-days)+' giorni':days===0?'Scade oggi':days===1?'Scade domani':'Tra '+days+' giorni';
 const cls=days<0?'deadline-overdue':days<=7?'deadline-soon':'';
 return esc(r.due_on)+' · <span class="'+cls+'">'+label+'</span>';
}
function item(r){
 return '<article class="deadline-row"><div><strong>'+esc(r.title)+'</strong><small>'+esc(r.category)+' · '+dueText(r)+'</small>'+
  (r.notes?'<small>'+esc(r.notes)+'</small>':'')+'</div><div>'+
  (r.status==='pending'?'<button type="button" class="mini-button" data-done="'+r.id+'">Completata</button>':'<button type="button" class="mini-button" data-reopen="'+r.id+'">Riapri</button>')+
  '<button type="button" class="mini-button" data-edit="'+r.id+'">Modifica</button>'+
  '<button type="button" class="mini-button" data-archive="'+r.id+'">Archivia</button></div></article>';
}
function render(){
 const pending=rows.filter(x=>x.status==='pending').sort((a,b)=>!a.due_on?1:!b.due_on?-1:a.due_on.localeCompare(b.due_on));
 $('dlPending').innerHTML=pending.map(item).join('')||'Nessuna scadenza aperta.';
 $('dlDone').innerHTML=rows.filter(x=>x.status!=='pending').map(item).join('')||'Nessuna.';
 panel.querySelectorAll('[data-done],[data-reopen],[data-archive]').forEach(b=>b.addEventListener('click',()=>change(b.dataset.done||b.dataset.reopen||b.dataset.archive,b.dataset.done?'completed':b.dataset.reopen?'pending':'archived')));
 panel.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>edit(b.dataset.edit)));
}
async function load(){
 if(!user)return;const {data,error}=await db.from('journal_deadlines').select('*').eq('user_id',user.id).order('created_at',{ascending:false});
 if(error)throw error;rows=data||[];render();status(rows.filter(x=>x.status==='pending').length+' scadenze aperte.');
}
async function change(id,newStatus){
 if(!user)return;
 try{const {error}=await db.from('journal_deadlines').update({status:newStatus,completed_at:newStatus==='completed'?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq('user_id',user.id).eq('id',id);if(error)throw error;await load();status('Stato aggiornato.');}
 catch(e){err(e)}
}
let editing=null;
function edit(id){
 const r=rows.find(x=>x.id===id);if(!r)return;
 editing=id;$('dlTitle').value=r.title;$('dlCategory').value=r.category;$('dlDate').value=r.due_on||'';$('dlNotes').value=r.notes||'';$('dlDays').value=(r.reminder_days||[]).join(',');
 $('dlForm').querySelector('button[type="submit"]').textContent='Salva modifiche';$('dlTitle').focus();
}
function openPanel(){
 if(!user)return;document.getElementById('journalTab').click();
 ['journalLayout','errorsPanel','changePanel','todoPanel','tagsPanel','instructionsPanel','monPanel','dailyPanel','checkinPanel'].forEach(id=>{if($(id))$(id).hidden=true});
 nav.querySelectorAll('button').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-selected','false')});
 tab.classList.add('active');tab.setAttribute('aria-selected','true');panel.hidden=false;active=true;load().catch(err);
}
tab.addEventListener('click',openPanel);
nav.querySelectorAll('button').filter(b=>b!==tab).forEach(b=>b.addEventListener('click',()=>{active=false;panel.hidden=true;tab.classList.remove('active');tab.setAttribute('aria-selected','false')}));
$('dlForm').addEventListener('submit',async e=>{
 e.preventDefault();if(!user)return;
 const nums=$('dlDays').value.split(',').map(s=>Number(s.trim()));
 if(!nums.length||nums.some(n=>!Number.isInteger(n)||n<0||n>365))return err('Gli avvisi devono essere numeri tra 0 e 365.');
 const payload={title:$('dlTitle').value.trim(),category:$('dlCategory').value,due_on:$('dlDate').value||null,notes:$('dlNotes').value.trim(),reminder_days:[...new Set(nums)].sort((a,b)=>b-a),updated_at:new Date().toISOString()};
 if(!payload.title)return err('Inserisci una descrizione.');
 const btn=e.target.querySelector('button[type="submit"]');btn.disabled=true;
 try{
  const q=editing?db.from('journal_deadlines').update(payload).eq('user_id',user.id).eq('id',editing):db.from('journal_deadlines').insert({...payload,user_id:user.id});
  const {error}=await q;if(error)throw error;
  editing=null;e.target.reset();$('dlDays').value='30,14,7,1,0';btn.textContent='Registra scadenza';await load();status('Scadenza salvata.');
 }catch(e){err(e)}finally{btn.disabled=false}
});
db.auth.getSession().then(({data})=>user=data?.session?.user||null).catch(err);
db.auth.onAuthStateChange((_e,s)=>{user=s?.user||null;if(!user){active=false;panel.hidden=true}else if(active)load().catch(err)});
})();