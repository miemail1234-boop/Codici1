(()=>{
  const ERRORS_TABLE='journal_errors';
  const CHANGE_TABLE='journal_changes';
  const nav=document.getElementById('sectionNav');
  const journalTab=document.getElementById('journalTab');
  const errorsTab=document.getElementById('errorsTab');
  const changeTab=document.getElementById('changeTab');
  const journalLayout=document.getElementById('journalLayout');
  const errorsPanel=document.getElementById('errorsPanel');
  const changePanel=document.getElementById('changePanel');

  const errorsForm=document.getElementById('errorsForm');
  const errorsInput=document.getElementById('errorsInput');
  const errorsList=document.getElementById('errorsList');
  const errorsCount=document.getElementById('errorsCount');
  const errorsSaveBtn=document.getElementById('errorsSaveBtn');
  const errorsCancelBtn=document.getElementById('errorsCancelBtn');

  const changeForm=document.getElementById('changeForm');
  const changeInput=document.getElementById('changeInput');
  const changeList=document.getElementById('changeList');
  const changeCount=document.getElementById('changeCount');
  const changeSaveBtn=document.getElementById('changeSaveBtn');
  const changeCancelBtn=document.getElementById('changeCancelBtn');

  let sectionUser=null;
  let errorRows=[];
  let changeRows=[];
  let editingErrorId=null;
  let editingChangeId=null;
  let activeSection='journal';

  function esc(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function toastMessage(message){
    const node=document.getElementById('toast');
    if(!node)return;
    node.textContent=message;
    node.classList.add('show');
    clearTimeout(toastMessage.timer);
    toastMessage.timer=setTimeout(()=>node.classList.remove('show'),2400);
  }
  function formatDate(value){
    return new Intl.DateTimeFormat('it-IT',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
  }

  function cancelErrorEdit(){
    editingErrorId=null;
    errorsInput.value='';
    errorsSaveBtn.textContent='Aggiungi errore';
    errorsCancelBtn.hidden=true;
  }
  function cancelChangeEdit(){
    editingChangeId=null;
    changeInput.value='';
    changeSaveBtn.textContent='Aggiungi nota';
    changeCancelBtn.hidden=true;
  }

  function renderErrors(){
    errorsCount.textContent=`${errorRows.length} ${errorRows.length===1?'nota':'note'}`;
    if(!errorRows.length){errorsList.innerHTML='<div class="errors-empty">Nessun errore registrato.</div>';return}
    errorsList.innerHTML=errorRows.map(row=>`<article class="error-card"><p>${esc(row.text)}</p><div class="error-meta"><span>${formatDate(row.updated_at||row.created_at)}</span><span class="error-actions"><button type="button" class="mini-button" data-edit-error="${row.id}">Modifica</button><button type="button" class="mini-button delete" data-delete-error="${row.id}">Elimina</button></span></div></article>`).join('');
    errorsList.querySelectorAll('[data-edit-error]').forEach(button=>button.addEventListener('click',()=>{
      const row=errorRows.find(item=>item.id===button.dataset.editError);if(!row)return;
      editingErrorId=row.id;errorsInput.value=row.text;errorsSaveBtn.textContent='Salva modifica';errorsCancelBtn.hidden=false;errorsInput.focus();
    }));
    errorsList.querySelectorAll('[data-delete-error]').forEach(button=>button.addEventListener('click',()=>deleteError(button.dataset.deleteError)));
  }

  function renderChanges(){
    changeCount.textContent=`${changeRows.length} ${changeRows.length===1?'nota':'note'}`;
    if(!changeRows.length){changeList.innerHTML='<div class="change-empty">Nessuna nota su obiettivi o progressi.</div>';return}
    changeList.innerHTML=changeRows.map(row=>`<article class="change-card"><p>${esc(row.text)}</p><div class="change-meta"><span>${formatDate(row.updated_at||row.created_at)}</span><span class="change-actions"><button type="button" class="mini-button" data-edit-change="${row.id}">Modifica</button><button type="button" class="mini-button delete" data-delete-change="${row.id}">Elimina</button></span></div></article>`).join('');
    changeList.querySelectorAll('[data-edit-change]').forEach(button=>button.addEventListener('click',()=>{
      const row=changeRows.find(item=>item.id===button.dataset.editChange);if(!row)return;
      editingChangeId=row.id;changeInput.value=row.text;changeSaveBtn.textContent='Salva modifica';changeCancelBtn.hidden=false;changeInput.focus();
    }));
    changeList.querySelectorAll('[data-delete-change]').forEach(button=>button.addEventListener('click',()=>deleteChange(button.dataset.deleteChange)));
  }

  async function loadErrors(){
    if(!sectionUser)return;
    errorsList.innerHTML='<div class="errors-empty">Caricamento...</div>';
    const {data,error}=await supabaseClient.from(ERRORS_TABLE).select('id,text,created_at,updated_at').eq('user_id',sectionUser.id).order('created_at',{ascending:false});
    if(error)return toastMessage(error.message||'Errore Supabase');
    errorRows=data||[];renderErrors();
  }

  async function loadChanges(){
    if(!sectionUser)return;
    changeList.innerHTML='<div class="change-empty">Caricamento...</div>';
    const {data,error}=await supabaseClient.from(CHANGE_TABLE).select('id,text,created_at,updated_at').eq('user_id',sectionUser.id).order('created_at',{ascending:false});
    if(error)return toastMessage(error.message||'Errore Supabase');
    changeRows=data||[];renderChanges();
  }

  function setSection(section){
    activeSection=section;
    const showJournal=section==='journal';
    const showErrors=section==='errors';
    const showChange=section==='change';
    journalLayout.hidden=!showJournal;
    errorsPanel.hidden=!showErrors;
    changePanel.hidden=!showChange;
    journalTab.classList.toggle('active',showJournal);
    errorsTab.classList.toggle('active',showErrors);
    changeTab.classList.toggle('active',showChange);
    journalTab.setAttribute('aria-selected',String(showJournal));
    errorsTab.setAttribute('aria-selected',String(showErrors));
    changeTab.setAttribute('aria-selected',String(showChange));
    if(showErrors)loadErrors();
    if(showChange)loadChanges();
  }

  async function syncSession(session){
    sectionUser=session?.user||null;
    const signedIn=Boolean(sectionUser);
    nav.hidden=!signedIn;
    if(!signedIn){
      errorsPanel.hidden=true;
      changePanel.hidden=true;
      activeSection='journal';
      return;
    }
    setSection(activeSection);
  }

  async function deleteError(id){
    if(!sectionUser||!confirm('Eliminare questa nota dagli errori da non ripetere?'))return;
    const {error}=await supabaseClient.from(ERRORS_TABLE).delete().eq('id',id).eq('user_id',sectionUser.id);
    if(error)return toastMessage(error.message||'Errore Supabase');
    errorRows=errorRows.filter(row=>row.id!==id);if(editingErrorId===id)cancelErrorEdit();renderErrors();toastMessage('Nota eliminata');
  }

  async function deleteChange(id){
    if(!sectionUser||!confirm('Eliminare questa nota da Change?'))return;
    const {error}=await supabaseClient.from(CHANGE_TABLE).delete().eq('id',id).eq('user_id',sectionUser.id);
    if(error)return toastMessage(error.message||'Errore Supabase');
    changeRows=changeRows.filter(row=>row.id!==id);if(editingChangeId===id)cancelChangeEdit();renderChanges();toastMessage('Nota eliminata');
  }

  journalTab.addEventListener('click',()=>setSection('journal'));
  errorsTab.addEventListener('click',()=>setSection('errors'));
  changeTab.addEventListener('click',()=>setSection('change'));
  errorsCancelBtn.addEventListener('click',cancelErrorEdit);
  changeCancelBtn.addEventListener('click',cancelChangeEdit);

  errorsForm.addEventListener('submit',async event=>{
    event.preventDefault();if(!sectionUser)return;
    const text=errorsInput.value.trim();if(!text)return;
    errorsSaveBtn.disabled=true;
    try{
      if(editingErrorId){
        const {data,error}=await supabaseClient.from(ERRORS_TABLE).update({text,updated_at:new Date().toISOString()}).eq('id',editingErrorId).eq('user_id',sectionUser.id).select('id,text,created_at,updated_at').single();
        if(error)throw error;errorRows=errorRows.map(row=>row.id===editingErrorId?data:row);
      }else{
        const {data,error}=await supabaseClient.from(ERRORS_TABLE).insert({user_id:sectionUser.id,text}).select('id,text,created_at,updated_at').single();
        if(error)throw error;errorRows.unshift(data);
      }
      cancelErrorEdit();renderErrors();toastMessage('Salvato su Supabase');
    }catch(error){toastMessage(error.message||'Errore Supabase')}
    finally{errorsSaveBtn.disabled=false}
  });

  changeForm.addEventListener('submit',async event=>{
    event.preventDefault();if(!sectionUser)return;
    const text=changeInput.value.trim();if(!text)return;
    changeSaveBtn.disabled=true;
    try{
      if(editingChangeId){
        const {data,error}=await supabaseClient.from(CHANGE_TABLE).update({text,updated_at:new Date().toISOString()}).eq('id',editingChangeId).eq('user_id',sectionUser.id).select('id,text,created_at,updated_at').single();
        if(error)throw error;changeRows=changeRows.map(row=>row.id===editingChangeId?data:row);
      }else{
        const {data,error}=await supabaseClient.from(CHANGE_TABLE).insert({user_id:sectionUser.id,text}).select('id,text,created_at,updated_at').single();
        if(error)throw error;changeRows.unshift(data);
      }
      cancelChangeEdit();renderChanges();toastMessage('Salvato su Supabase');
    }catch(error){toastMessage(error.message||'Errore Supabase')}
    finally{changeSaveBtn.disabled=false}
  });

  supabaseClient.auth.getSession().then(({data})=>syncSession(data?.session||null));
  supabaseClient.auth.onAuthStateChange((_event,session)=>syncSession(session));
})();