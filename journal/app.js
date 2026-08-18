const SUPABASE_URL='https://kujyowhezihjambhpahe.supabase.co';
const SUPABASE_KEY='sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
const TABLE='journal_notes';
const ATTACHMENTS_TABLE='journal_attachments';
const ATTACHMENTS_BUCKET='journal-attachments';
const MAX_FILE_SIZE=25*1024*1024;
const LEGACY_STORAGE_KEY='journal_notes_v1';
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id);
const grid=$('calendarGrid'),monthLabel=$('monthLabel'),selectedDateLabel=$('selectedDateLabel'),noteCount=$('noteCount'),notesList=$('notesList'),form=$('noteForm'),input=$('noteInput'),saveBtn=$('saveNoteBtn'),cancelEditBtn=$('cancelEditBtn'),exportBtn=$('exportBtn'),authPanel=$('authPanel'),journalLayout=$('journalLayout'),signOutBtn=$('signOutBtn'),userLabel=$('userLabel'),syncStatus=$('syncStatus'),attachmentInput=$('attachmentInput'),pendingFilesNode=$('pendingFiles'),selectedFilesLabel=$('selectedFilesLabel');
let notes=[],attachments=[],pendingFiles=[],viewDate=startOfMonth(new Date()),selectedDate=toKey(new Date()),editingId=null,cloudUser=null,activeUserId=null;

function pad(n){return String(n).padStart(2,'0')}
function toKey(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function fromKey(k){const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)}
function startOfMonth(d){return new Date(d.getFullYear(),d.getMonth(),1)}
function fmtDay(k){return new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(fromKey(k))}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function notesFor(k){return notes.filter(n=>n.date===k).sort((a,b)=>a.createdAt.localeCompare(b.createdAt))}
function attachmentsFor(noteId){return attachments.filter(a=>a.noteId===noteId).sort((a,b)=>a.createdAt.localeCompare(b.createdAt))}
function mapRow(row){return{id:row.id,date:row.note_date,text:row.text,createdAt:row.created_at,updatedAt:row.updated_at}}
function mapAttachment(row){return{id:row.id,noteId:row.note_id,fileName:row.file_name,storagePath:row.storage_path,mimeType:row.mime_type||'',fileSize:Number(row.file_size||0),createdAt:row.created_at}}
function setAuthStatus(message){$('authStatus').textContent=message}
function setSyncStatus(message){syncStatus.textContent=message||''}
function toast(message){const node=$('toast');node.textContent=message;node.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove('show'),2600)}
function formatBytes(bytes){if(!bytes)return '0 B';const units=['B','KB','MB','GB'];const i=Math.min(Math.floor(Math.log(bytes)/Math.log(1024)),units.length-1);return `${(bytes/1024**i).toFixed(i?1:0)} ${units[i]}`}
function safeName(name){return String(name||'file').replace(/[\\/\u0000-\u001f\u007f]+/g,'-').slice(0,180)||'file'}

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

function attachmentHtml(a){return `<div class="attachment-row"><button type="button" class="attachment-download" data-download-attachment="${a.id}" title="Scarica ${escapeHtml(a.fileName)}"><span class="attachment-name">${escapeHtml(a.fileName)}</span><span class="attachment-size">${formatBytes(a.fileSize)}</span></button><button type="button" class="attachment-remove" data-delete-attachment="${a.id}" aria-label="Rimuovi ${escapeHtml(a.fileName)}">×</button></div>`}

function renderNotes(){
  selectedDateLabel.textContent=fmtDay(selectedDate);
  const dayNotes=notesFor(selectedDate);
  noteCount.textContent=`${dayNotes.length} ${dayNotes.length===1?'nota':'note'}`;
  if(!dayNotes.length){notesList.innerHTML='<div class="empty-notes">Nessuna nota per questo giorno.</div>';return}
  notesList.innerHTML=dayNotes.map(n=>{
    const files=attachmentsFor(n.id);
    return `<article class="note-card"><p>${escapeHtml(n.text)}</p>${files.length?`<div class="attachments"><div class="attachments-title">Allegati · ${files.length}</div>${files.map(attachmentHtml).join('')}</div>`:''}<div class="note-meta"><span>${new Intl.DateTimeFormat('it-IT',{hour:'2-digit',minute:'2-digit'}).format(new Date(n.updatedAt||n.createdAt))}</span><span class="note-actions"><button class="mini-button" data-edit="${n.id}">Modifica</button><button class="mini-button delete" data-delete="${n.id}">Elimina</button></span></div></article>`;
  }).join('');
  notesList.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>beginEdit(b.dataset.edit)));
  notesList.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>deleteNote(b.dataset.delete)));
  notesList.querySelectorAll('[data-download-attachment]').forEach(b=>b.addEventListener('click',()=>downloadAttachment(b.dataset.downloadAttachment)));
  notesList.querySelectorAll('[data-delete-attachment]').forEach(b=>b.addEventListener('click',()=>deleteAttachment(b.dataset.deleteAttachment)));
}
function renderAll(){renderCalendar();renderNotes()}

function renderPendingFiles(){
  selectedFilesLabel.textContent=pendingFiles.length?`${pendingFiles.length} ${pendingFiles.length===1?'file selezionato':'file selezionati'}`:'Nessun file selezionato';
  pendingFilesNode.innerHTML=pendingFiles.map((file,index)=>`<div class="pending-file"><span><strong>${escapeHtml(file.name)}</strong><small>${formatBytes(file.size)}</small></span><button type="button" data-remove-pending="${index}" aria-label="Rimuovi file">×</button></div>`).join('');
  pendingFilesNode.querySelectorAll('[data-remove-pending]').forEach(b=>b.addEventListener('click',()=>{pendingFiles.splice(Number(b.dataset.removePending),1);renderPendingFiles()}));
}
function clearPendingFiles(){pendingFiles=[];attachmentInput.value='';renderPendingFiles()}
function beginEdit(id){const n=notes.find(x=>x.id===id);if(!n)return;editingId=id;input.value=n.text;clearPendingFiles();saveBtn.textContent='Salva modifica';cancelEditBtn.hidden=false;input.focus()}
function cancelEdit(){editingId=null;input.value='';clearPendingFiles();saveBtn.textContent='Aggiungi nota';cancelEditBtn.hidden=true}

async function migrateLegacyNotes(){
  let legacy=[];
  try{legacy=JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY)||'[]')}catch{legacy=[]}
  if(!Array.isArray(legacy)||!legacy.length)return;
  const rows=legacy.filter(n=>n&&/^\d{4}-\d{2}-\d{2}$/.test(n.date||'')&&String(n.text||'').trim()).map(n=>({user_id:cloudUser.id,note_date:n.date,text:String(n.text).trim(),created_at:n.createdAt||new Date().toISOString(),updated_at:n.updatedAt||n.createdAt||new Date().toISOString()}));
  if(!rows.length){localStorage.removeItem(LEGACY_STORAGE_KEY);return}
  setSyncStatus('Migrazione note locali...');
  const {error}=await supabaseClient.from(TABLE).insert(rows);if(error)throw error;
  localStorage.removeItem(LEGACY_STORAGE_KEY);toast(`${rows.length} note locali migrate su Supabase`);
}

async function loadNotesFromCloud(){
  if(!cloudUser)return;
  setSyncStatus('Sincronizzazione...');
  const [notesResult,attachmentsResult]=await Promise.all([
    supabaseClient.from(TABLE).select('id,note_date,text,created_at,updated_at').eq('user_id',cloudUser.id).order('note_date',{ascending:true}).order('created_at',{ascending:true}),
    supabaseClient.from(ATTACHMENTS_TABLE).select('id,note_id,file_name,storage_path,mime_type,file_size,created_at').eq('user_id',cloudUser.id).order('created_at',{ascending:true})
  ]);
  if(notesResult.error)throw notesResult.error;
  if(attachmentsResult.error)throw attachmentsResult.error;
  notes=(notesResult.data||[]).map(mapRow);
  attachments=(attachmentsResult.data||[]).map(mapAttachment);
  renderAll();setSyncStatus('Supabase sincronizzato');
}

async function uploadFiles(noteId,files){
  if(!files.length)return;
  for(const file of files){
    if(file.size>MAX_FILE_SIZE)throw new Error(`${file.name}: supera il limite di 25 MB`);
    const unique=(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const path=`${cloudUser.id}/${noteId}/${unique}-${safeName(file.name)}`;
    const {error:uploadError}=await supabaseClient.storage.from(ATTACHMENTS_BUCKET).upload(path,file,{upsert:false,contentType:file.type||'application/octet-stream'});
    if(uploadError)throw uploadError;
    const {data,error:metaError}=await supabaseClient.from(ATTACHMENTS_TABLE).insert({user_id:cloudUser.id,note_id:noteId,file_name:file.name,storage_path:path,mime_type:file.type||null,file_size:file.size}).select('id,note_id,file_name,storage_path,mime_type,file_size,created_at').single();
    if(metaError){await supabaseClient.storage.from(ATTACHMENTS_BUCKET).remove([path]);throw metaError}
    attachments.push(mapAttachment(data));
  }
}

async function showSession(session){
  cloudUser=session?.user||null;
  const signedIn=Boolean(cloudUser);
  authPanel.hidden=signedIn;journalLayout.hidden=!signedIn;signOutBtn.hidden=!signedIn;exportBtn.hidden=!signedIn;
  userLabel.textContent=signedIn?(cloudUser.email||'Account attivo'):'';
  if(!signedIn){notes=[];attachments=[];activeUserId=null;setSyncStatus('');return}
  if(activeUserId===cloudUser.id)return;
  activeUserId=cloudUser.id;
  try{await migrateLegacyNotes();await loadNotesFromCloud()}catch(error){activeUserId=null;setSyncStatus('Errore sincronizzazione');toast(error.message||'Errore Supabase')}
}

async function initializeAuth(){
  const {data,error}=await supabaseClient.auth.getSession();if(error)setAuthStatus(error.message);
  await showSession(data?.session||null);
  if(!data?.session)setAuthStatus('Inserisci le credenziali oppure richiedi un link magico.');
  supabaseClient.auth.onAuthStateChange((_event,session)=>showSession(session));
}

$('loginBtn').addEventListener('click',async()=>{const email=$('emailInput').value.trim(),password=$('passwordInput').value;if(!email||!password)return setAuthStatus('Inserisci email e password.');setAuthStatus('Accesso in corso...');const {error}=await supabaseClient.auth.signInWithPassword({email,password});if(error)setAuthStatus(error.message)});
$('magicBtn').addEventListener('click',async()=>{const email=$('emailInput').value.trim();if(!email)return setAuthStatus('Inserisci la tua email.');setAuthStatus('Invio del link...');const {error}=await supabaseClient.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+window.location.pathname}});setAuthStatus(error?error.message:'Link inviato. Controlla la posta elettronica.')});
signOutBtn.addEventListener('click',async()=>{await supabaseClient.auth.signOut();location.reload()});

attachmentInput.addEventListener('change',()=>{
  const selected=[...attachmentInput.files];
  const oversized=selected.find(f=>f.size>MAX_FILE_SIZE);
  if(oversized){attachmentInput.value='';return toast(`${oversized.name} supera il limite di 25 MB`)}
  pendingFiles=selected;renderPendingFiles();
});

form.addEventListener('submit',async e=>{
  e.preventDefault();if(!cloudUser)return;
  const text=input.value.trim();if(!text)return;
  saveBtn.disabled=true;attachmentInput.disabled=true;setSyncStatus(pendingFiles.length?'Salvataggio nota e allegati...':'Salvataggio...');
  try{
    let savedNote;
    if(editingId){
      const {data,error}=await supabaseClient.from(TABLE).update({text,updated_at:new Date().toISOString()}).eq('id',editingId).eq('user_id',cloudUser.id).select('id,note_date,text,created_at,updated_at').single();if(error)throw error;
      savedNote=mapRow(data);notes=notes.map(n=>n.id===editingId?savedNote:n);
    }else{
      const {data,error}=await supabaseClient.from(TABLE).insert({user_id:cloudUser.id,note_date:selectedDate,text}).select('id,note_date,text,created_at,updated_at').single();if(error)throw error;
      savedNote=mapRow(data);notes.push(savedNote);
    }
    const files=[...pendingFiles];
    if(files.length)await uploadFiles(savedNote.id,files);
    cancelEdit();renderAll();setSyncStatus('Supabase sincronizzato');toast(files.length?`Nota salvata con ${files.length} ${files.length===1?'allegato':'allegati'}`:'Nota salvata su Supabase');
  }catch(error){setSyncStatus('Errore salvataggio');toast(error.message||'Errore Supabase');await loadNotesFromCloud().catch(()=>{})}
  finally{saveBtn.disabled=false;attachmentInput.disabled=false}
});

async function downloadAttachment(id){
  const item=attachments.find(a=>a.id===id);if(!item)return;
  setSyncStatus('Download allegato...');
  const {data,error}=await supabaseClient.storage.from(ATTACHMENTS_BUCKET).download(item.storagePath);
  if(error){setSyncStatus('Errore download');return toast(error.message||'Impossibile scaricare il file')}
  const url=URL.createObjectURL(data),a=document.createElement('a');a.href=url;a.download=item.fileName;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);setSyncStatus('Supabase sincronizzato');
}

async function deleteAttachment(id){
  const item=attachments.find(a=>a.id===id);if(!item||!cloudUser||!confirm(`Rimuovere l'allegato "${item.fileName}"?`))return;
  setSyncStatus('Rimozione allegato...');
  const {error:storageError}=await supabaseClient.storage.from(ATTACHMENTS_BUCKET).remove([item.storagePath]);
  if(storageError){setSyncStatus('Errore rimozione');return toast(storageError.message||'Errore Storage')}
  const {error}=await supabaseClient.from(ATTACHMENTS_TABLE).delete().eq('id',id).eq('user_id',cloudUser.id);
  if(error){setSyncStatus('Errore rimozione');return toast(error.message||'Errore Supabase')}
  attachments=attachments.filter(a=>a.id!==id);renderNotes();setSyncStatus('Supabase sincronizzato');toast('Allegato rimosso');
}

async function deleteNote(id){
  if(!cloudUser||!confirm('Eliminare questa nota e tutti i suoi allegati?'))return;
  setSyncStatus('Eliminazione...');
  const files=attachmentsFor(id);
  if(files.length){const {error:storageError}=await supabaseClient.storage.from(ATTACHMENTS_BUCKET).remove(files.map(f=>f.storagePath));if(storageError){setSyncStatus('Errore eliminazione');return toast(storageError.message||'Errore Storage')}}
  const {error}=await supabaseClient.from(TABLE).delete().eq('id',id).eq('user_id',cloudUser.id);
  if(error){setSyncStatus('Errore eliminazione');return toast(error.message||'Errore Supabase')}
  notes=notes.filter(n=>n.id!==id);attachments=attachments.filter(a=>a.noteId!==id);if(editingId===id)cancelEdit();renderAll();setSyncStatus('Supabase sincronizzato');toast('Nota e allegati eliminati');
}

cancelEditBtn.addEventListener('click',cancelEdit);
$('prevMonth').addEventListener('click',()=>{viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()-1,1);renderCalendar()});
$('nextMonth').addEventListener('click',()=>{viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()+1,1);renderCalendar()});
$('todayBtn').addEventListener('click',()=>{const t=new Date();selectedDate=toKey(t);viewDate=startOfMonth(t);cancelEdit();renderAll()});

exportBtn.addEventListener('click',async()=>{
  if(!cloudUser)return;
  try{await loadNotesFromCloud()}catch(error){return toast(error.message||'Errore durante la sincronizzazione')}
  const rows=[['Data','Nota','Allegati']];
  [...notes].sort((a,b)=>a.date.localeCompare(b.date)||a.createdAt.localeCompare(b.createdAt)).forEach(n=>rows.push([n.date,n.text,attachmentsFor(n.id).map(a=>a.fileName).join(' | ')]));
  const csv='\uFEFF'+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`journal-${toKey(new Date())}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});

renderPendingFiles();renderAll();initializeAuth().catch(error=>{setAuthStatus(error.message);setSyncStatus('Errore Supabase')});