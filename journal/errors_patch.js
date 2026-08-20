(()=>{
  const ERRORS_TABLE='journal_errors';
  const nav=document.getElementById('sectionNav');
  const journalTab=document.getElementById('journalTab');
  const errorsTab=document.getElementById('errorsTab');
  const journalLayout=document.getElementById('journalLayout');
  const errorsPanel=document.getElementById('errorsPanel');
  const errorsForm=document.getElementById('errorsForm');
  const errorsInput=document.getElementById('errorsInput');
  const errorsList=document.getElementById('errorsList');
  const errorsCount=document.getElementById('errorsCount');
  const errorsSaveBtn=document.getElementById('errorsSaveBtn');
  const errorsCancelBtn=document.getElementById('errorsCancelBtn');
  let errorUser=null;
  let errorRows=[];
  let editingErrorId=null;
  let activeSection='journal';

  function esc(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function toastError(message){
    const node=document.getElementById('toast');
    if(!node)return;
    node.textContent=message;
    node.classList.add('show');
    setTimeout(()=>node.classList.remove('show'),2400);
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
  function renderErrors(){
    errorsCount.textContent=`${errorRows.length} ${errorRows.length===1?'nota':'note'}`;
    if(!errorRows.length){
      errorsList.innerHTML='<div class="errors-empty">Nessun errore registrato.</div>';
      return;
    }
    errorsList.innerHTML=errorRows.map(row=>`<article class="error-card"><p>${esc(row.text)}</p><div class="error-meta"><span>${formatDate(row.updated_at||row.created_at)}</span><span class="error-actions"><button type="button" class="mini-button" data-edit-error="${row.id}">Modifica</button><button type="button" class="mini-button delete" data-delete-error="${row.id}">Elimina</button></span></div></article>`).join('');
    errorsList.querySelectorAll('[data-edit-error]').forEach(button=>button.addEventListener('click',()=>{
      const row=errorRows.find(item=>item.id===button.dataset.editError);
      if(!row)return;
      editingErrorId=row.id;
      errorsInput.value=row.text;
      errorsSaveBtn.textContent='Salva modifica';
      errorsCancelBtn.hidden=false;
      errorsInput.focus();
    }));
    errorsList.querySelectorAll('[data-delete-error]').forEach(button=>button.addEventListener('click',()=>deleteError(button.dataset.deleteError)));
  }
  async function loadErrors(){
    if(!errorUser)return;
    errorsList.innerHTML='<div class="errors-empty">Caricamento...</div>';
    const {data,error}=await supabaseClient.from(ERRORS_TABLE).select('id,text,created_at,updated_at').eq('user_id',errorUser.id).order('created_at',{ascending:false});
    if(error){toastError(error.message||'Errore Supabase');return}
    errorRows=data||[];
    renderErrors();
  }
  function setSection(section){
    activeSection=section;
    const showErrors=section==='errors';
    journalLayout.hidden=showErrors;
    errorsPanel.hidden=!showErrors;
    journalTab.classList.toggle('active',!showErrors);
    errorsTab.classList.toggle('active',showErrors);
    journalTab.setAttribute('aria-selected',String(!showErrors));
    errorsTab.setAttribute('aria-selected',String(showErrors));
    if(showErrors)loadErrors();
  }
  async function syncSession(session){
    errorUser=session?.user||null;
    const signedIn=Boolean(errorUser);
    nav.hidden=!signedIn;
    if(!signedIn){
      errorsPanel.hidden=true;
      activeSection='journal';
      return;
    }
    setSection(activeSection);
  }
  async function deleteError(id){
    if(!errorUser||!confirm('Eliminare questa nota dagli errori da non ripetere?'))return;
    const {error}=await supabaseClient.from(ERRORS_TABLE).delete().eq('id',id).eq('user_id',errorUser.id);
    if(error)return toastError(error.message||'Errore Supabase');
    errorRows=errorRows.filter(row=>row.id!==id);
    if(editingErrorId===id)cancelErrorEdit();
    renderErrors();
    toastError('Nota eliminata');
  }

  journalTab.addEventListener('click',()=>setSection('journal'));
  errorsTab.addEventListener('click',()=>setSection('errors'));
  errorsCancelBtn.addEventListener('click',cancelErrorEdit);
  errorsForm.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!errorUser)return;
    const text=errorsInput.value.trim();
    if(!text)return;
    errorsSaveBtn.disabled=true;
    try{
      if(editingErrorId){
        const {data,error}=await supabaseClient.from(ERRORS_TABLE).update({text,updated_at:new Date().toISOString()}).eq('id',editingErrorId).eq('user_id',errorUser.id).select('id,text,created_at,updated_at').single();
        if(error)throw error;
        errorRows=errorRows.map(row=>row.id===editingErrorId?data:row);
      }else{
        const {data,error}=await supabaseClient.from(ERRORS_TABLE).insert({user_id:errorUser.id,text}).select('id,text,created_at,updated_at').single();
        if(error)throw error;
        errorRows.unshift(data);
      }
      cancelErrorEdit();
      renderErrors();
      toastError('Salvato su Supabase');
    }catch(error){toastError(error.message||'Errore Supabase')}
    finally{errorsSaveBtn.disabled=false}
  });

  supabaseClient.auth.getSession().then(({data})=>syncSession(data?.session||null));
  supabaseClient.auth.onAuthStateChange((_event,session)=>syncSession(session));
})();