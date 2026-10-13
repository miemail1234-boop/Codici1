(()=>{
  const ERRORS_TABLE='journal_errors';
  const CHANGE_TABLE='journal_changes';
  const TODO_TABLE='journal_todo_single';
  const nav=document.getElementById('sectionNav');
  const journalTab=document.getElementById('journalTab');
  const errorsTab=document.getElementById('errorsTab');
  const changeTab=document.getElementById('changeTab');
  const todoTab=document.getElementById('todoTab');
  const journalLayout=document.getElementById('journalLayout');
  const errorsPanel=document.getElementById('errorsPanel');
  const changePanel=document.getElementById('changePanel');
  const todoPanel=document.getElementById('todoPanel');

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

  const todoForm=document.getElementById('todoForm');
  const todoInput=document.getElementById('todoInput');
  const todoSaveBtn=document.getElementById('todoSaveBtn');
  const todoStatus=document.getElementById('todoStatus');

  let sectionUser=null;
  let errorRows=[];
  let changeRows=[];
  let editingErrorId=null;
  let editingChangeId=null;
  let activeSection='journal';
  let todoLoaded=false;

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


  // LifeOS: verifica non bloccante delle nuove date nella sezione Da fare.
  // Le festività sono lette dal registro RLS dell'utente, non codificate nel client.
  const todoHolidayNotice=document.createElement('div');
  todoHolidayNotice.id='todoHolidayNotice';
  todoHolidayNotice.className='todo-holiday-notice';
  todoHolidayNotice.setAttribute('role','status');
  todoHolidayNotice.setAttribute('aria-live','polite');
  todoHolidayNotice.hidden=true;
  todoForm.appendChild(todoHolidayNotice);
  const todoHolidayStyle=document.createElement('style');
  todoHolidayStyle.textContent='.todo-holiday-notice{margin:14px 0 4px;padding:13px 15px;border:1px solid #ddb86e;border-radius:10px;background:#fff7e7;color:#593b10;line-height:1.5}.todo-holiday-notice.ok{border-color:#a3d9ca;background:#f1faf5;color:#145c46}.todo-holiday-notice ul{padding-left:20px;margin:8px 0 0}.todo-holiday-notice li{margin:5px 0}.todo-holiday-notice strong{font-weight:750}';
  document.head.appendChild(todoHolidayStyle);

  let savedTodoContent='';
  let todoHolidayTimer=null;
  let todoHolidayRequest=0;
  const todoMonths={gennaio:1,febbraio:2,marzo:3,aprile:4,maggio:5,giugno:6,luglio:7,agosto:8,settembre:9,ottobre:10,novembre:11,dicembre:12};
  const todoDateRe=/\b(\d{4})-(\d{1,2})-(\d{1,2})\b|\b(\d{1,2})[\/.\-](\d{1,2})(?:[\/.\-](\d{2,4}))?\b|\b(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)(?:\s+(\d{4}))?\b/gi;
  function todoTodayRome(){
    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const val=key=>parts.find(p=>p.type===key).value;
    return val('year')+'-'+val('month')+'-'+val('day');
  }
  function todoISO(y,m,d){
    if(!Number.isInteger(y)||!Number.isInteger(m)||!Number.isInteger(d)||y<1||m<1||m>12||d<1||d>31)return null;
    const date=new Date(Date.UTC(y,m-1,d));
    if(date.getUTCFullYear()!==y||date.getUTCMonth()!==m-1||date.getUTCDate()!==d)return null;
    return String(y).padStart(4,'0')+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');
  }
  function todoChangedLines(content){
    const counts=new Map();
    for(const line of savedTodoContent.split(/\r?\n/))counts.set(line,(counts.get(line)||0)+1);
    return content.split(/\r?\n/).filter(line=>{
      const remaining=counts.get(line)||0;
      if(remaining){counts.set(line,remaining-1);return false}
      return Boolean(line.trim());
    });
  }
  function todoExtractDates(line,today){
    const found=new Set();
    todoDateRe.lastIndex=0;
    for(const match of line.matchAll(todoDateRe)){
      let y,m,d,hasYear=true;
      if(match[1]){y=Number(match[1]);m=Number(match[2]);d=Number(match[3])}
      else if(match[4]){
        d=Number(match[4]);m=Number(match[5]);
        hasYear=Boolean(match[6]);
        y=hasYear?Number(match[6]):Number(today.slice(0,4));
        if(y<100)y+=2000;
      }else{
        d=Number(match[7]);m=todoMonths[match[8].toLowerCase()];
        hasYear=Boolean(match[9]);y=hasYear?Number(match[9]):Number(today.slice(0,4));
      }
      let iso=todoISO(y,m,d);
      if(!hasYear&&iso&&iso<today)iso=todoISO(y+1,m,d);
      if(iso)found.add(iso);
    }
    return [...found];
  }
  function todoClearHolidayNotice(){
    todoHolidayRequest++;
    if(todoHolidayTimer){clearTimeout(todoHolidayTimer);todoHolidayTimer=null}
    todoHolidayNotice.hidden=true;
    todoHolidayNotice.textContent='';
    todoHolidayNotice.classList.remove('ok');
  }
  function todoShowHolidayNotice(heading,items,ok=false){
    todoHolidayNotice.hidden=false;
    todoHolidayNotice.classList.toggle('ok',ok);
    todoHolidayNotice.innerHTML='<strong>'+esc(heading)+'</strong>'+
      (items.length?'<ul>'+items.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ul>':'');
  }
  async function todoCheckHolidays(content){
    if(!sectionUser)return;
    const request=++todoHolidayRequest;
    const today=todoTodayRome();
    const entries=[];
    for(const line of todoChangedLines(content)){
      const dates=todoExtractDates(line,today);
      for(const date of dates)entries.push({date,line});
    }
    if(!entries.length){
      if(request===todoHolidayRequest)todoClearHolidayNotice();
      return;
    }
    const unique=[...new Set(entries.map(e=>e.date))];
    const checkedDates=unique.filter(date=>Number(date.slice(0,4))>=2026&&Number(date.slice(0,4))<=2045).slice(0,40);
    const unverified=unique.filter(date=>!checkedDates.includes(date));
    const notices=[];
    let rows=[];
    let lookupFailed=false;
    if(checkedDates.length){
      try{
        const {data,error}=await supabaseClient.from('journal_holiday_dates').select('holiday_date,name,scope')
          .eq('user_id',sectionUser.id).in('holiday_date',checkedDates);
        if(error)throw error;
        rows=data||[];
      }catch(e){lookupFailed=true}
    }
    if(request!==todoHolidayRequest)return;
    const byDate=new Map();
    for(const r of rows){
      if(!byDate.has(r.holiday_date))byDate.set(r.holiday_date,[]);
      byDate.get(r.holiday_date).push(r);
    }
    const reported=new Set();
    for(const e of entries){
      const reasons=[];
      if(new Date(e.date+'T12:00:00Z').getUTCDay()===0)reasons.push('domenica');
      const inMilan=/\bmilano\b|\bmilanes[ei]\b/i.test(e.line);
      const inMonza=/\bmonza\b|\bmonzes[ei]\b/i.test(e.line);
      for(const r of byDate.get(e.date)||[]){
        if(r.scope==='italia')reasons.push(r.name+' (Italia)');
        else if(r.scope==='milano'){
          if(inMilan)reasons.push(r.name+' (Milano)');
          else if(!inMonza)reasons.push('possibile '+r.name+': se l’attività è a Milano, il giorno è festivo; verifica la sede');
        }
      }
      for(const reason of reasons){
        const key=e.date+'|'+reason;
        if(!reported.has(key)){reported.add(key);notices.push(e.date+' — '+reason)}
      }
    }
    if(unverified.length)notices.push('Copertura non disponibile per: '+unverified.join(', ')+'. Verifica la data con fonti ufficiali.');
    if(lookupFailed)notices.push('Non è stato possibile consultare le festività su Supabase: controllo incompleto (le domeniche sono comunque verificate).');
    if(notices.length){
      todoShowHolidayNotice('Attenzione alle date aggiunte o modificate. Il salvataggio resta consentito.',notices);
    }else{
      todoShowHolidayNotice('Date riconosciute: nessuna festività nazionale o domenica rilevata.',[
        'Sono verificate le festività di Milano solo quando pertinenti; le festività locali di altri comuni e le chiusure specifiche non sono censite.'
      ],true);
    }
  }
  function todoQueueHolidayCheck(){
    if(todoHolidayTimer)clearTimeout(todoHolidayTimer);
    const content=todoInput.value;
    todoHolidayTimer=setTimeout(()=>{todoHolidayTimer=null;todoCheckHolidays(content).catch(()=>todoShowHolidayNotice('Verifica festività non disponibile; salvataggio comunque consentito.',[]))},500);
  }
  todoInput.addEventListener('input',todoQueueHolidayCheck);

  async function loadTodo(){
    if(!sectionUser)return;
    todoStatus.textContent='Caricamento...';
    const {data,error}=await supabaseClient.from(TODO_TABLE).select('content').eq('user_id',sectionUser.id).maybeSingle();
    if(error){todoStatus.textContent='Errore';return toastMessage(error.message||'Errore Supabase')}
    todoInput.value=data?.content||'';
    savedTodoContent=todoInput.value;
    todoClearHolidayNotice();
    todoLoaded=true;
    todoStatus.textContent='';
  }

  function setSection(section){
    activeSection=section;
    const showJournal=section==='journal';
    const showErrors=section==='errors';
    const showChange=section==='change';
    const showTodo=section==='todo';
    journalLayout.hidden=!showJournal;
    errorsPanel.hidden=!showErrors;
    changePanel.hidden=!showChange;
    todoPanel.hidden=!showTodo;
    journalTab.classList.toggle('active',showJournal);
    errorsTab.classList.toggle('active',showErrors);
    changeTab.classList.toggle('active',showChange);
    todoTab.classList.toggle('active',showTodo);
    journalTab.setAttribute('aria-selected',String(showJournal));
    errorsTab.setAttribute('aria-selected',String(showErrors));
    changeTab.setAttribute('aria-selected',String(showChange));
    todoTab.setAttribute('aria-selected',String(showTodo));
    if(showErrors)loadErrors();
    if(showChange)loadChanges();
    if(showTodo&&!todoLoaded)loadTodo();
  }

  async function syncSession(session){
    sectionUser=session?.user||null;
    const signedIn=Boolean(sectionUser);
    nav.hidden=!signedIn;
    if(!signedIn){
      errorsPanel.hidden=true;
      changePanel.hidden=true;
      todoPanel.hidden=true;
      todoInput.value='';
      savedTodoContent='';
      todoClearHolidayNotice();
      todoStatus.textContent='';
      todoLoaded=false;
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
  todoTab.addEventListener('click',()=>setSection('todo'));
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

  todoForm.addEventListener('submit',async event=>{
    event.preventDefault();if(!sectionUser)return;
    todoSaveBtn.disabled=true;
    todoStatus.textContent='Salvataggio...';
    const content=todoInput.value;
    if(todoHolidayTimer){clearTimeout(todoHolidayTimer);todoHolidayTimer=null}
    void todoCheckHolidays(content);
    const {error}=await supabaseClient.from(TODO_TABLE).upsert({user_id:sectionUser.id,content,updated_at:new Date().toISOString()},{onConflict:'user_id'});
    if(error){
      todoStatus.textContent='Errore';
      toastMessage(error.message||'Errore Supabase');
    }else{
      savedTodoContent=content;
      todoLoaded=true;
      todoStatus.textContent='Salvato';
      toastMessage('Da fare salvato su Supabase');
      setTimeout(()=>{if(todoStatus.textContent==='Salvato')todoStatus.textContent=''},1800);
    }
    todoSaveBtn.disabled=false;
  });

  supabaseClient.auth.getSession().then(({data})=>syncSession(data?.session||null));
  supabaseClient.auth.onAuthStateChange((_event,session)=>syncSession(session));
})();