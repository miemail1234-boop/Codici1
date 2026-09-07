(()=>{
  const nav=document.getElementById('sectionNav');
  const journalTab=document.getElementById('journalTab');
  const errorsTab=document.getElementById('errorsTab');
  const changeTab=document.getElementById('changeTab');
  const todoTab=document.getElementById('todoTab');
  const tagTab=document.getElementById('tagTab');
  const instructionsTab=document.getElementById('instructionsTab');
  const journalLayout=document.getElementById('journalLayout');
  const errorsPanel=document.getElementById('errorsPanel');
  const changePanel=document.getElementById('changePanel');
  const todoPanel=document.getElementById('todoPanel');
  const tagsPanel=document.getElementById('tagsPanel');
  const instructionsPanel=document.getElementById('instructionsPanel');
  const instructionsForm=document.getElementById('instructionsForm');
  const instructionsInput=document.getElementById('instructionsInput');
  const instructionsSaveBtn=document.getElementById('instructionsSaveBtn');
  const instructionsHistoryBtn=document.getElementById('instructionsHistoryBtn');
  const instructionsStatus=document.getElementById('instructionsStatus');
  const instructionsVersion=document.getElementById('instructionsVersion');
  const instructionsUpdated=document.getElementById('instructionsUpdated');
  const instructionsHistory=document.getElementById('instructionsHistory');
  const instructionHistoryList=document.getElementById('instructionHistoryList');
  const instructionPreview=document.getElementById('instructionPreview');
  const instructionPreviewTitle=document.getElementById('instructionPreviewTitle');
  const instructionPreviewContent=document.getElementById('instructionPreviewContent');
  const instructionPreviewRestore=document.getElementById('instructionPreviewRestore');
  const instructionPreviewClose=document.getElementById('instructionPreviewClose');

  if(!nav||!instructionsTab||!instructionsPanel)return;

  const DEFAULT_INSTRUCTIONS=`Sei il motore di salvataggio e classificazione del Journal.

Quando l’utente ti chiede di salvare una nota nel Journal, devi salvare sempre il testo originale della nota senza modificarlo e, nello stesso flusso, creare o aggiornare i relativi metadati strutturati su Supabase.

Il testo scritto dall’utente è la fonte primaria e non deve essere riscritto, sintetizzato o corretto dentro journal_notes.text.

SALVATAGGIO DELLA NOTA

Salva la nota in journal_notes usando:

- user_id: utente autenticato
- note_date: giorno indicato dall’utente, oppure la data corrente se non specificata
- text: testo originale completo

Se stai modificando una nota esistente, aggiorna la stessa riga invece di crearne una nuova.

METADATI

Dopo il salvataggio, analizza la nota e crea o aggiorna una riga in journal_note_metadata collegata tramite note_id.

Compila solo i campi realmente supportati dal contenuto:

- title: titolo breve e descrittivo
- summary: sintesi breve e fedele
- note_kind: natura principale del contenuto
- area: area principale
- time_horizon: breve_termine, medio_termine, lungo_termine o continuo, solo quando pertinente

Non forzare valori incerti.

Le note del Diario contengono soprattutto riflessioni, idee, intenzioni generali, conoscenze da conservare e riutilizzare, considerazioni su obiettivi e cambiamenti personali.

Non trasformare una riflessione su un obiettivo o su un risultato raggiunto in uno stato operativo o in un task.

TAG

Genera pochi tag realmente utili alla ricerca futura, normalmente da 2 a 6 quando il contenuto lo giustifica.

Prima di creare un nuovo tag:

1. controlla journal_tags dell’utente
2. riutilizza un tag canonico esistente se semanticamente equivalente
3. crea un nuovo tag solo se rappresenta un concetto realmente distinto e utile nel tempo

Evita sinonimi, varianti ortografiche, plurali inutili, traduzioni equivalenti e duplicati.

Usa normalized_name come valore canonico.

Collega i tag attraverso journal_note_tags.

Evita tag generici come nota, importante, interessante, varie, pensiero o giorno.

ENTITÀ

Individua entità concrete importanti, come persone, progetti, aziende, organizzazioni, applicazioni, software, libri, paper, università, strumenti, prodotti, luoghi o altre entità chiaramente identificabili.

Prima di crearne una nuova controlla journal_entities e riutilizza quella esistente se equivalente.

Collegala tramite journal_note_entities.

Non trasformare concetti generici in entità: quelli appartengono ai tag.

REGOLE DI QUALITÀ

- mantieni coerenza nel tempo
- riutilizza la tassonomia esistente prima di crearne una nuova
- non inventare fatti
- non dedurre informazioni che non emergono dal contenuto
- non aggiungere metadati solo per riempire campi
- usa una sola area principale
- usa un solo note_kind principale
- usa tag per rappresentare temi secondari
- crea nuovi valori solo quando realmente necessari
- lascia null i campi non pertinenti o non sufficientemente affidabili

La tassonomia è dinamica ma controllata. Può crescere quando emergono concetti realmente nuovi, ma deve evitare duplicazioni inutili.

Se una classificazione è incerta, conserva comunque la nota originale e lasciala parzialmente o completamente non classificata.

TODO

Questa struttura non serve per attività operative.

Non creare:

- task
- checklist
- reminder
- scadenze
- priorità operative
- stato da fare, in corso o completato

Le attività operative appartengono alla sezione Da fare.

Se una nota parla di obiettivi, progresso, intenzioni o risultati, trattala come memoria, conoscenza o riflessione, non come task.

AGGIORNAMENTO DI NOTE GIÀ CLASSIFICATE

Quando il testo di una nota viene modificato:

- rivaluta title
- rivaluta summary
- rivaluta note_kind
- rivaluta area
- rivaluta time_horizon
- aggiorna journal_note_metadata
- aggiorna le associazioni della sola nota interessata in journal_note_tags
- aggiorna le associazioni della sola nota interessata in journal_note_entities
- riutilizza tag ed entità canonici esistenti
- non modificare classificazioni appartenenti ad altre note

RICERCA

Quando devi recuperare informazioni dal Journal, non limitarti alla corrispondenza esatta dei tag.

Combina quando utile:

- data o intervallo temporale
- area
- note_kind
- tag
- entità
- title
- summary
- testo originale

I metadati servono a restringere la ricerca, ma il testo originale rimane la fonte primaria.

SICUREZZA

Opera esclusivamente sui dati dell’utente autenticato.

Non bypassare RLS.

Non modificare o eliminare contenuti delle altre sezioni Journal senza richiesta esplicita.

Non modificare journal_errors, journal_changes o journal_todo_single durante la classificazione delle note del Diario.

Se il salvataggio dei metadati fallisce dopo il salvataggio della nota originale, mantieni la nota originale e lasciala non classificata. Segnala l’errore senza dichiarare che l’intera operazione è riuscita.

DATA

Usa la data locale dell’utente salvo indicazione esplicita diversa.

RISPOSTA

Dopo un salvataggio riuscito, rispondi sinteticamente indicando, quando disponibili:

- giorno
- area
- tipo
- tag

Non dichiarare mai che una nota è stata salvata se la scrittura su Supabase non è realmente riuscita.`;

  let sectionUser=null;
  let instructionsActive=false;
  let currentInstruction=null;
  let historyRows=[];
  let selectedHistory=null;

  function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function toastMessage(message){const node=document.getElementById('toast');if(!node)return;node.textContent=message;node.classList.add('show');clearTimeout(toastMessage.timer);toastMessage.timer=setTimeout(()=>node.classList.remove('show'),2600)}
  function setStatus(message,error=false){instructionsStatus.textContent=message||'';instructionsStatus.classList.toggle('error',Boolean(error))}
  function formatDateTime(value){if(!value)return '—';const date=new Date(value);if(Number.isNaN(date.getTime()))return String(value);return new Intl.DateTimeFormat('it-IT',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(date)}
  function previewText(value){const clean=String(value||'').replace(/\s+/g,' ').trim();return clean.length>230?`${clean.slice(0,230)}…`:clean}

  function activateInstructions(){
    instructionsActive=true;
    journalLayout.hidden=true;
    errorsPanel.hidden=true;
    changePanel.hidden=true;
    todoPanel.hidden=true;
    tagsPanel.hidden=true;
    instructionsPanel.hidden=false;
    [journalTab,errorsTab,changeTab,todoTab,tagTab].forEach(tab=>{tab.classList.remove('active');tab.setAttribute('aria-selected','false')});
    instructionsTab.classList.add('active');
    instructionsTab.setAttribute('aria-selected','true');
    loadInstructions().catch(error=>{setStatus(error.message||'Errore Supabase',true);toastMessage(error.message||'Errore Supabase')});
  }

  function deactivateInstructions(){
    instructionsActive=false;
    instructionsPanel.hidden=true;
    instructionsTab.classList.remove('active');
    instructionsTab.setAttribute('aria-selected','false');
  }

  function renderCurrent(){
    if(currentInstruction){
      instructionsVersion.textContent=`Versione ${currentInstruction.version}`;
      instructionsUpdated.textContent=`Aggiornata ${formatDateTime(currentInstruction.updated_at)}`;
    }else{
      instructionsVersion.textContent='Versione non salvata';
      instructionsUpdated.textContent='Mai salvata';
    }
  }

  function renderHistory(){
    if(!historyRows.length){
      instructionHistoryList.innerHTML='<div class="instructions-empty">Nessuna versione precedente.</div>';
      return;
    }
    instructionHistoryList.innerHTML=historyRows.map(row=>`<article class="instruction-history-item"><div class="instruction-history-top"><span class="instruction-history-title">Versione ${Number(row.version)}</span><span class="instruction-history-date">Archiviata ${esc(formatDateTime(row.created_at))}</span></div><p class="instruction-history-preview">${esc(previewText(row.content))}</p><div class="instruction-history-actions"><button type="button" data-instruction-open="${Number(row.version)}">Apri</button><button type="button" class="restore" data-instruction-restore="${Number(row.version)}">Ripristina questa versione</button></div></article>`).join('');
  }

  function closePreview(){selectedHistory=null;instructionPreview.hidden=true;instructionPreviewTitle.textContent='';instructionPreviewContent.textContent=''}

  function openHistoryVersion(version){
    const row=historyRows.find(item=>Number(item.version)===Number(version));
    if(!row)return;
    selectedHistory=row;
    instructionPreviewTitle.textContent=`Versione ${row.version}`;
    instructionPreviewContent.textContent=row.content;
    instructionPreview.hidden=false;
    instructionPreview.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  async function fetchHistory(){
    if(!sectionUser)return [];
    const {data,error}=await supabaseClient.from('journal_instruction_history').select('id,content,version,created_at').eq('user_id',sectionUser.id).order('version',{ascending:false}).limit(200);
    if(error)throw error;
    return data||[];
  }

  async function loadInstructions(){
    if(!sectionUser)return;
    setStatus('Caricamento istruzioni...');
    const [currentResult,historyResult]=await Promise.all([
      supabaseClient.from('journal_instructions').select('content,version,updated_at').eq('user_id',sectionUser.id).maybeSingle(),
      supabaseClient.from('journal_instruction_history').select('id,content,version,created_at').eq('user_id',sectionUser.id).order('version',{ascending:false}).limit(200)
    ]);
    if(currentResult.error)throw currentResult.error;
    if(historyResult.error)throw historyResult.error;
    currentInstruction=currentResult.data||null;
    historyRows=historyResult.data||[];
    instructionsInput.value=currentInstruction?.content||DEFAULT_INSTRUCTIONS;
    renderCurrent();
    renderHistory();
    closePreview();
    setStatus(currentInstruction?'':'Testo iniziale pronto. Premi “Salva istruzioni” per creare la versione 1.');
  }

  async function saveInstructions(content,message='Istruzioni salvate'){
    if(!sectionUser)return;
    if(!String(content||'').trim())throw new Error('Le istruzioni non possono essere vuote');
    const {data,error}=await supabaseClient.rpc('update_journal_instructions',{new_content:content});
    if(error)throw error;
    const row=Array.isArray(data)?data[0]:data;
    if(!row)throw new Error('Supabase non ha restituito la versione salvata');
    currentInstruction={content:row.content,version:Number(row.version),updated_at:row.updated_at};
    instructionsInput.value=row.content;
    historyRows=await fetchHistory();
    renderCurrent();
    renderHistory();
    closePreview();
    setStatus('');
    toastMessage(`${message} · versione ${currentInstruction.version}`);
  }

  async function restoreVersion(version){
    const row=historyRows.find(item=>Number(item.version)===Number(version));
    if(!row)return;
    if(!confirm(`Ripristinare il contenuto della versione ${row.version}? Verrà creata una nuova versione corrente.`))return;
    instructionsSaveBtn.disabled=true;
    instructionPreviewRestore.disabled=true;
    setStatus(`Ripristino versione ${row.version}...`);
    try{await saveInstructions(row.content,`Versione ${row.version} ripristinata`)}
    catch(error){setStatus(error.message||'Errore durante il ripristino',true);toastMessage(error.message||'Errore Supabase')}
    finally{instructionsSaveBtn.disabled=false;instructionPreviewRestore.disabled=false}
  }

  instructionsTab.addEventListener('click',activateInstructions);
  [journalTab,errorsTab,changeTab,todoTab,tagTab].forEach(tab=>tab.addEventListener('click',deactivateInstructions));

  instructionsForm.addEventListener('submit',async event=>{
    event.preventDefault();
    const content=instructionsInput.value;
    if(!content.trim()){setStatus('Le istruzioni non possono essere vuote.',true);return}
    instructionsSaveBtn.disabled=true;
    setStatus('Salvataggio...');
    try{await saveInstructions(content)}
    catch(error){setStatus(error.message||'Errore durante il salvataggio',true);toastMessage(error.message||'Errore Supabase')}
    finally{instructionsSaveBtn.disabled=false}
  });

  instructionsHistoryBtn.addEventListener('click',()=>{
    const willOpen=instructionsHistory.hidden;
    instructionsHistory.hidden=!willOpen;
    instructionsHistoryBtn.setAttribute('aria-expanded',String(willOpen));
    instructionsHistoryBtn.textContent=willOpen?'Nascondi cronologia':'Cronologia versioni';
  });

  instructionHistoryList.addEventListener('click',event=>{
    const openButton=event.target.closest('[data-instruction-open]');
    if(openButton)return openHistoryVersion(openButton.dataset.instructionOpen);
    const restoreButton=event.target.closest('[data-instruction-restore]');
    if(restoreButton)return restoreVersion(restoreButton.dataset.instructionRestore);
  });

  instructionPreviewRestore.addEventListener('click',()=>{if(selectedHistory)restoreVersion(selectedHistory.version)});
  instructionPreviewClose.addEventListener('click',closePreview);

  function syncSession(session){
    sectionUser=session?.user||null;
    if(!sectionUser){
      instructionsActive=false;
      currentInstruction=null;
      historyRows=[];
      closePreview();
      instructionsPanel.hidden=true;
      instructionsInput.value='';
      setStatus('');
      renderCurrent();
      instructionHistoryList.innerHTML='';
      return;
    }
    if(instructionsActive)loadInstructions().catch(error=>{setStatus(error.message||'Errore Supabase',true);toastMessage(error.message||'Errore Supabase')});
  }

  supabaseClient.auth.getSession().then(({data})=>syncSession(data?.session||null));
  supabaseClient.auth.onAuthStateChange((_event,session)=>syncSession(session));
})();