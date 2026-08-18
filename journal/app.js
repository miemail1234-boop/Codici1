const SUPABASE_URL='https://kujyowhezihjambhpahe.supabase.co';
const SUPABASE_KEY='sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
const TABLE='journal_notes';
const LEGACY_STORAGE_KEY='journal_notes_v1';
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id);
const grid=$('calendarGrid'),monthLabel=$('monthLabel'),selectedDateLabel=$('selectedDateLabel'),noteCount=$('noteCount'),notesList=$('notesList'),form=$('noteForm'),input=$('noteInput'),saveBtn=$('saveNoteBtn'),cancelEditBtn=$('cancelEditBtn'),exportBtn=$('exportBtn'),authPanel=$('authPanel'),journalLayout=$('journalLayout'),signOutBtn=$('signOutBtn'),userLabel=$('userLabel'),syncStatus=$('syncStatus');
let notes=[],viewDate=startOfMonth(new Date()),selectedDate=toKey(new Date()),editingId=null,cloudUser=null,activeUserId=null;

function pad(n){return String(n).padStart(2,'0')}
function toKey(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function fromKey(k){const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)}
function startOfMonth(d){return new Date(d.getFullYear(),d.getMonth(),1)}
function fmtDay(k){return new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(fromKey(k))}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function notesFor(k){return notes.filter(n=>n.date===k).sort((a,b)=>a.createdAt.localeCompare(b.createdAt))}
function mapRow(row){return{id:row.id,date:row.note_date,text:row.text,createdAt:row.created_at,updatedAt:row.updated_at}}
function setAuthStatus(message){$('authStatus').textContent=message}
function setSyncStatus(message){syncStatus.textContent=message||''}
function toast(message){const node=$('toast');node.textContent=message;node.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove('show'),2400)}

function renderCalendar(){
  monthLabel.textContent=new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric'}).format(viewDate);
  grid.innerHTML='';
  const first=viewDate,mondayIndex=(first.getDay()+6)%7,start=new Date(first);start.setDate(first.getDate()-mondayIndex);
  const today=toKey(new Date());
  for(let i=0;i<42;i++){
    const d=new Date(start);d.setDate(start.getDate()+i);
    const key=toKey(d),count=notesFor(key).length,b=document.createElement('button');
    b.type='button';
    b.className='calendar-day'+(d.getMonth()!==viewDate.getMonth()?' outside':'')+(key===selectedDate?' selected':'')+(key===today?' today':'');
    b.dataset.date=key;
    b.innerHTML=`<span class="day-number">${d.getDate()}</span>${count?`<span class="note-dot">${count}</span>`:''}`;
    b.addEventListener('click',()=>{selectedDate=key;viewDate=startOfMonth(d);cancelEdit();renderAll()});
    grid.appendChild(b);
  }
}

function renderNotes(){
  selectedDateLabel.textContent=fmtDay(selectedDate);
  const dayNotes=notesFor(selectedDate);
  noteCount.textContent=`${dayNotes.length} ${dayNotes.length===1?'nota':'note'}`;
  if(!dayNotes.length){notesList.innerHTML='<div class="empty-notes">Nessuna nota per questo giorno.</div>';return}
  notesList.innerHTML=dayNotes.map(n=>`<article class="note-card"><p>${escapeHtml(n.text)}</p><div class="note-meta"><span>${new Intl.DateTimeFormat('it-IT',{hour:'2-digit',minute:'2-digit'}).format(new Date(n.updatedAt||n.createdAt))}</span><span class="note-actions"><button class="mini-button" data-edit="${n.id}">Modifica</button><button class="mini-button delete" data-delete="${n.id}">Elimina</button></span></div></article>`).join('');
  notesList.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>beginEdit(b.dataset.edit)));
  notesList.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>deleteNote(b.dataset.delete)));
}
function renderAll(){renderCalendar();renderNotes()}
function beginEdit(id){const n=notes.find(x=>x.id===id);if(!n)return;editingId=id;input.value=n.text;saveBtn.textContent='Salva modifica';cancelEditBtn.hidden=false;input.focus()}
function cancelEdit(){editingId=null;input.value='';saveBtn.textContent='Aggiungi nota';cancelEditBtn.hidden=true}

async function migrateLegacyNotes(){
  let legacy=[];
  try{legacy=JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY)||'[]')}catch{legacy=[]}
  if(!Array.isArray(legacy)||!legacy.length)return;
  const rows=legacy.filter(n=>n&&/^\d{4}-\d{2}-\d{2}$/.test(n.date||'')&&String(n.text||'').trim()).map(n=>({
    user_id:cloudUser.id,
    note_date:n.date,
    text:String(n.text).trim(),
    created_at:n.createdAt||new Date().toISOString(),
    updated_at:n.updatedAt||n.createdAt||new Date().toISOString()
  }));
  if(!rows.length){localStorage.removeItem(LEGACY_STORAGE_KEY);return}
  setSyncStatus('Migrazione note locali...');
  const {error}=await supabaseClient.from(TABLE).insert(rows);
  if(error)throw error;
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  toast(`${rows.length} note locali migrate su Supabase`);
}

async function loadNotesFromCloud(){
  if(!cloudUser)return;
  setSyncStatus('Sincronizzazione...');
  const {data,error}=await supabaseClient.from(TABLE).select('id,note_date,text,created_at,updated_at').eq('user_id',cloudUser.id).order('note_date',{ascending:true}).order('created_at',{ascending:true});
  if(error)throw error;
  notes=(data||[]).map(mapRow);
  renderAll();
  setSyncStatus('Supabase sincronizzato');
}

async function showSession(session){
  cloudUser=session?.user||null;
  const signedIn=Boolean(cloudUser);
  authPanel.hidden=signedIn;
  journalLayout.hidden=!signedIn;
  signOutBtn.hidden=!signedIn;
  exportBtn.hidden=!signedIn;
  userLabel.textContent=signedIn?(cloudUser.email||'Account attivo'):'';
  if(!signedIn){notes=[];activeUserId=null;setSyncStatus('');return}
  if(activeUserId===cloudUser.id)return;
  activeUserId=cloudUser.id;
  try{
    await migrateLegacyNotes();
    await loadNotesFromCloud();
  }catch(error){activeUserId=null;setSyncStatus('Errore sincronizzazione');toast(error.message||'Errore Supabase')}
}

async function initializeAuth(){
  const {data,error}=await supabaseClient.auth.getSession();
  if(error)setAuthStatus(error.message);
  await showSession(data?.session||null);
  if(!data?.session)setAuthStatus('Inserisci le credenziali oppure richiedi un link magico.');
  supabaseClient.auth.onAuthStateChange((_event,session)=>showSession(session));
}

$('loginBtn').addEventListener('click',async()=>{
  const email=$('emailInput').value.trim(),password=$('passwordInput').value;
  if(!email||!password)return setAuthStatus('Inserisci email e password.');
  setAuthStatus('Accesso in corso...');
  const {error}=await supabaseClient.auth.signInWithPassword({email,password});
  if(error)setAuthStatus(error.message);
});

$('magicBtn').addEventListener('click',async()=>{
  const email=$('emailInput').value.trim();
  if(!email)return setAuthStatus('Inserisci la tua email.');
  setAuthStatus('Invio del link...');
  const {error}=await supabaseClient.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+window.location.pathname}});
  setAuthStatus(error?error.message:'Link inviato. Controlla la posta elettronica.');
});

signOutBtn.addEventListener('click',async()=>{await supabaseClient.auth.signOut();location.reload()});

form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!cloudUser)return;
  const text=input.value.trim();if(!text)return;
  saveBtn.disabled=true;setSyncStatus('Salvataggio...');
  try{
    if(editingId){
      const {data,error}=await supabaseClient.from(TABLE).update({text,updated_at:new Date().toISOString()}).eq('id',editingId).eq('user_id',cloudUser.id).select('id,note_date,text,created_at,updated_at').single();
      if(error)throw error;
      notes=notes.map(n=>n.id===editingId?mapRow(data):n);
    }else{
      const {data,error}=await supabaseClient.from(TABLE).insert({user_id:cloudUser.id,note_date:selectedDate,text}).select('id,note_date,text,created_at,updated_at').single();
      if(error)throw error;
      notes.push(mapRow(data));
    }
    cancelEdit();renderAll();setSyncStatus('Supabase sincronizzato');toast('Nota salvata su Supabase');
  }catch(error){setSyncStatus('Errore salvataggio');toast(error.message||'Errore Supabase')}
  finally{saveBtn.disabled=false}
});

async function deleteNote(id){
  if(!cloudUser||!confirm('Eliminare questa nota?'))return;
  setSyncStatus('Eliminazione...');
  const {error}=await supabaseClient.from(TABLE).delete().eq('id',id).eq('user_id',cloudUser.id);
  if(error){setSyncStatus('Errore eliminazione');return toast(error.message||'Errore Supabase')}
  notes=notes.filter(n=>n.id!==id);if(editingId===id)cancelEdit();renderAll();setSyncStatus('Supabase sincronizzato');toast('Nota eliminata');
}

cancelEditBtn.addEventListener('click',cancelEdit);
$('prevMonth').addEventListener('click',()=>{viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()-1,1);renderCalendar()});
$('nextMonth').addEventListener('click',()=>{viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()+1,1);renderCalendar()});
$('todayBtn').addEventListener('click',()=>{const t=new Date();selectedDate=toKey(t);viewDate=startOfMonth(t);cancelEdit();renderAll()});

exportBtn.addEventListener('click',async()=>{
  if(!cloudUser)return;
  try{await loadNotesFromCloud()}catch(error){return toast(error.message||'Errore durante la sincronizzazione')}
  const rows=[['Data','Nota']];
  [...notes].sort((a,b)=>a.date.localeCompare(b.date)||a.createdAt.localeCompare(b.createdAt)).forEach(n=>rows.push([n.date,n.text]));
  const csv='\uFEFF'+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`journal-${toKey(new Date())}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});

renderAll();
initializeAuth().catch(error=>{setAuthStatus(error.message);setSyncStatus('Errore Supabase')});
