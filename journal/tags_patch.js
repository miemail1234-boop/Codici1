(()=>{
  const RESULT_LIMIT=100;
  const nav=document.getElementById('sectionNav');
  const journalTab=document.getElementById('journalTab');
  const errorsTab=document.getElementById('errorsTab');
  const changeTab=document.getElementById('changeTab');
  const todoTab=document.getElementById('todoTab');
  const tagTab=document.getElementById('tagTab');
  const journalLayout=document.getElementById('journalLayout');
  const errorsPanel=document.getElementById('errorsPanel');
  const changePanel=document.getElementById('changePanel');
  const todoPanel=document.getElementById('todoPanel');
  const tagsPanel=document.getElementById('tagsPanel');
  const tagsSearch=document.getElementById('tagsSearch');
  const tagsRefreshBtn=document.getElementById('tagsRefreshBtn');
  const tagsStatus=document.getElementById('tagsStatus');
  const tagsOverview=document.getElementById('tagsOverview');
  const areaList=document.getElementById('areaList');
  const kindList=document.getElementById('kindList');
  const tagList=document.getElementById('tagList');
  const entityList=document.getElementById('entityList');
  const unclassifiedCard=document.getElementById('unclassifiedCard');
  const resultsTitle=document.getElementById('memoryResultsTitle');
  const resultsCount=document.getElementById('memoryResultsCount');
  const resultsList=document.getElementById('memoryResultsList');

  if(!nav||!tagTab||!tagsPanel)return;

  let sectionUser=null;
  let tagsActive=false;
  let taxonomyLoaded=false;
  let searchTimer=null;
  let searchSerial=0;
  let taxonomy={areas:[],kinds:[],tags:[],entities:[],unclassified:null};

  function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function canonical(value){return String(value??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}
  function searchKey(value){return String(value??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function formatDate(value){if(!value)return 'Mai';const date=new Date(`${value}T12:00:00`);return Number.isNaN(date.getTime())?String(value):new Intl.DateTimeFormat('it-IT',{day:'2-digit',month:'short',year:'numeric'}).format(date)}
  function setStatus(message,error=false){tagsStatus.textContent=message||'';tagsStatus.classList.toggle('error',Boolean(error))}
  function toastMessage(message){const node=document.getElementById('toast');if(!node)return;node.textContent=message;node.classList.add('show');clearTimeout(toastMessage.timer);toastMessage.timer=setTimeout(()=>node.classList.remove('show'),2500)}
  function sortStats(rows){return [...(rows||[])].sort((a,b)=>Number(b.note_count||0)-Number(a.note_count||0)||String(b.last_used||'').localeCompare(String(a.last_used||''))||String(a.name||a.value||'').localeCompare(String(b.name||b.value||''),'it'))}

  function activateTags(){
    tagsActive=true;
    journalLayout.hidden=true;
    errorsPanel.hidden=true;
    changePanel.hidden=true;
    todoPanel.hidden=true;
    tagsPanel.hidden=false;
    [journalTab,errorsTab,changeTab,todoTab].forEach(tab=>{tab.classList.remove('active');tab.setAttribute('aria-selected','false')});
    tagTab.classList.add('active');tagTab.setAttribute('aria-selected','true');
    loadTaxonomy().catch(error=>{setStatus(error.message||'Errore Supabase',true);toastMessage(error.message||'Errore Supabase')});
  }

  function deactivateTags(){
    tagsActive=false;
    tagsPanel.hidden=true;
    tagTab.classList.remove('active');
    tagTab.setAttribute('aria-selected','false');
  }

  function renderSimpleFacet(rows,type,target){
    const sorted=sortStats(rows);
    if(!sorted.length){target.innerHTML='<div class="taxonomy-empty">Nessun valore ancora utilizzato.</div>';return}
    target.innerHTML=sorted.map(row=>{
      const label=row.value||'';
      return `<div class="facet-item" data-search="${esc(searchKey(label))}"><button type="button" class="facet-main" data-facet-type="${type}" data-facet-value="${esc(label)}" data-facet-label="${esc(label)}"><span class="facet-line"><span class="facet-name">${esc(label)}</span><span class="facet-count">${Number(row.note_count||0)}</span></span><span class="facet-meta">Ultimo uso: ${esc(formatDate(row.last_used))}</span></button></div>`;
    }).join('');
  }

  function renderTags(){
    const sorted=sortStats(taxonomy.tags);
    if(!sorted.length){tagList.innerHTML='<div class="taxonomy-empty">Nessun tag ancora utilizzato.</div>';return}
    tagList.innerHTML=sorted.map(row=>{
      const count=Number(row.note_count||0);
      return `<div class="facet-item" data-search="${esc(searchKey(`${row.name} ${row.normalized_name}`))}"><button type="button" class="facet-main" data-facet-type="tag" data-facet-id="${row.tag_id}" data-facet-label="${esc(row.name)}"><span class="facet-line"><span class="facet-name">${esc(row.name)}</span><span class="facet-count">${count}</span></span><span class="facet-meta">Ultimo uso: ${esc(formatDate(row.last_used))}</span></button><div class="tag-tools"><button type="button" class="tag-tool" data-tag-rename="${row.tag_id}">Rinomina</button><button type="button" class="tag-tool" data-tag-merge="${row.tag_id}">Unisci</button><button type="button" class="tag-tool delete" data-tag-delete="${row.tag_id}" ${count?'disabled':''}>Elimina</button></div></div>`;
    }).join('');
  }

  function renderEntities(){
    const sorted=sortStats(taxonomy.entities);
    if(!sorted.length){entityList.innerHTML='<div class="taxonomy-empty">Nessuna entità ancora utilizzata.</div>';return}
    entityList.innerHTML=sorted.map(row=>{
      const extra=row.entity_type?` · ${row.entity_type}`:'';
      return `<div class="facet-item" data-search="${esc(searchKey(`${row.name} ${row.entity_type||''}`))}"><button type="button" class="facet-main" data-facet-type="entity" data-facet-id="${row.entity_id}" data-facet-label="${esc(row.name)}"><span class="facet-line"><span class="facet-name">${esc(row.name)}</span><span class="facet-count">${Number(row.note_count||0)}</span></span><span class="facet-meta">Ultimo uso: ${esc(formatDate(row.last_used))}${esc(extra)}</span></button></div>`;
    }).join('');
  }

  function renderTaxonomy(){
    renderSimpleFacet(taxonomy.areas,'area',areaList);
    renderSimpleFacet(taxonomy.kinds,'kind',kindList);
    renderTags();
    renderEntities();
    const unclassified=taxonomy.unclassified||{note_count:0,last_used:null};
    const count=Number(unclassified.note_count||0);
    unclassifiedCard.innerHTML=`<button type="button" data-facet-type="unclassified" data-facet-label="Note non classificate">Note non classificate <strong>${count}</strong></button><span>${count?`Ultima: ${esc(formatDate(unclassified.last_used))}`:'Nessuna'}</span>`;
    tagsOverview.innerHTML=`<span class="taxonomy-badge">${taxonomy.areas.length} aree</span><span class="taxonomy-badge">${taxonomy.kinds.length} tipi</span><span class="taxonomy-badge">${taxonomy.tags.length} tag</span><span class="taxonomy-badge">${taxonomy.entities.length} entità</span>`;
    applyFacetFilter(tagsSearch.value);
  }

  async function loadTaxonomy(force=false){
    if(!sectionUser)return;
    if(taxonomyLoaded&&!force)return;
    setStatus('Aggiornamento tassonomia...');
    const userId=sectionUser.id;
    const [areas,kinds,tags,entities,unclassified]=await Promise.all([
      supabaseClient.from('journal_area_stats').select('value,note_count,last_used').eq('user_id',userId),
      supabaseClient.from('journal_kind_stats').select('value,note_count,last_used').eq('user_id',userId),
      supabaseClient.from('journal_tag_stats').select('tag_id,name,normalized_name,note_count,last_used').eq('user_id',userId),
      supabaseClient.from('journal_entity_stats').select('entity_id,name,normalized_name,entity_type,note_count,last_used').eq('user_id',userId),
      supabaseClient.from('journal_unclassified_stats').select('note_count,last_used').eq('user_id',userId).maybeSingle()
    ]);
    const failed=[areas,kinds,tags,entities,unclassified].find(result=>result.error);
    if(failed)throw failed.error;
    taxonomy={areas:areas.data||[],kinds:kinds.data||[],tags:tags.data||[],entities:entities.data||[],unclassified:unclassified.data||null};
    taxonomyLoaded=true;
    renderTaxonomy();
    setStatus('');
  }

  function applyFacetFilter(query){
    const key=searchKey(query).trim();
    tagsPanel.querySelectorAll('.facet-item').forEach(item=>{item.hidden=Boolean(key&&!String(item.dataset.search||'').includes(key))});
  }

  function renderResults(rows,title,totalLabel=''){
    const data=rows||[];
    resultsTitle.textContent=title;
    resultsCount.textContent=totalLabel||`${data.length} ${data.length===1?'risultato':'risultati'}`;
    if(!data.length){resultsList.innerHTML='<div class="taxonomy-empty">Nessuna nota trovata.</div>';return}
    resultsList.innerHTML=data.map(row=>{
      const titleText=String(row.title||'').trim()||'Non classificata';
      const summary=String(row.summary||'').trim();
      const original=String(row.text||'');
      const excerpt=original.length>260?`${original.slice(0,260)}…`:original;
      const chips=[row.area,row.note_kind,row.time_horizon].filter(Boolean);
      return `<article class="memory-result"><div class="memory-result-top"><div><div class="memory-result-date">${esc(formatDate(row.note_date))}</div><h4 class="memory-result-title">${esc(titleText)}</h4></div><button type="button" class="memory-open" data-open-date="${esc(row.note_date)}">Apri nel Diario</button></div>${summary?`<p class="memory-result-summary">${esc(summary)}</p>`:''}<p class="memory-result-excerpt">${esc(excerpt)}</p>${chips.length?`<div class="memory-result-chips">${chips.map(value=>`<span class="memory-chip">${esc(value)}</span>`).join('')}</div>`:''}</article>`;
    }).join('');
  }

  async function getMappedNoteIds(table,column,id){
    const {data,error}=await supabaseClient.from(table).select('note_id').eq('user_id',sectionUser.id).eq(column,id).order('created_at',{ascending:false}).limit(RESULT_LIMIT);
    if(error)throw error;
    return (data||[]).map(row=>row.note_id);
  }

  async function loadFacetNotes(type,value,label){
    if(!sectionUser)return;
    resultsTitle.textContent=label;
    resultsCount.textContent='Caricamento...';
    resultsList.innerHTML='';
    const select='note_id,note_date,text,title,summary,note_kind,area,time_horizon,created_at';
    let result;
    if(type==='tag'||type==='entity'){
      const ids=await getMappedNoteIds(type==='tag'?'journal_note_tags':'journal_note_entities',type==='tag'?'tag_id':'entity_id',value);
      if(!ids.length)return renderResults([],label);
      result=await supabaseClient.from('journal_memory_notes').select(select).eq('user_id',sectionUser.id).in('note_id',ids).order('note_date',{ascending:false}).order('created_at',{ascending:false}).limit(RESULT_LIMIT);
    }else{
      let query=supabaseClient.from('journal_memory_notes').select(select).eq('user_id',sectionUser.id);
      if(type==='area')query=query.eq('area',value);
      else if(type==='kind')query=query.eq('note_kind',value);
      else if(type==='unclassified')query=query.is('title',null);
      result=await query.order('note_date',{ascending:false}).order('created_at',{ascending:false}).limit(RESULT_LIMIT);
    }
    if(result.error)throw result.error;
    renderResults(result.data||[],label,`${(result.data||[]).length} risultati mostrati · max ${RESULT_LIMIT}`);
    resultsList.scrollIntoView({behavior:'smooth',block:'start'});
  }

  async function searchNotes(query){
    const serial=++searchSerial;
    if(!query.trim()){
      resultsTitle.textContent='Esplora la memoria';
      resultsCount.textContent='';
      resultsList.innerHTML='<div class="taxonomy-empty">Seleziona un’area, un tipo, un tag o un’entità, oppure usa la ricerca.</div>';
      return;
    }
    resultsTitle.textContent=`Ricerca: ${query}`;
    resultsCount.textContent='Ricerca...';
    const {data,error}=await supabaseClient.rpc('journal_search_notes',{search_term:query,max_results:RESULT_LIMIT});
    if(serial!==searchSerial)return;
    if(error)throw error;
    renderResults(data||[],`Ricerca: ${query}`,`${(data||[]).length} risultati mostrati · max ${RESULT_LIMIT}`);
  }

  function openInDiary(date){
    journalTab.click();
    try{
      selectedDate=date;
      viewDate=startOfMonth(fromKey(date));
      cancelEdit();
      renderAll();
      setTimeout(()=>journalLayout.scrollIntoView({behavior:'smooth',block:'start'}),0);
    }catch(error){
      toastMessage('Giorno aperto nel Diario');
    }
  }

  async function renameTag(id){
    const tag=taxonomy.tags.find(item=>item.tag_id===id);if(!tag)return;
    const name=prompt('Nuovo nome canonico del tag:',tag.name);if(name===null)return;
    const trimmed=name.trim(),normalized=canonical(trimmed);
    if(!trimmed||!normalized)return toastMessage('Nome del tag non valido');
    const {error}=await supabaseClient.from('journal_tags').update({name:trimmed,normalized_name:normalized,updated_at:new Date().toISOString()}).eq('id',id).eq('user_id',sectionUser.id);
    if(error)return toastMessage(error.code==='23505'?'Esiste già un tag equivalente: usa “Unisci”.':error.message||'Errore Supabase');
    taxonomyLoaded=false;await loadTaxonomy(true);toastMessage('Tag rinominato');
  }

  async function fetchAllTagNoteIds(tagId){
    const ids=[];let from=0;
    while(true){
      const {data,error}=await supabaseClient.from('journal_note_tags').select('note_id').eq('user_id',sectionUser.id).eq('tag_id',tagId).range(from,from+999);
      if(error)throw error;
      const page=data||[];ids.push(...page.map(row=>row.note_id));
      if(page.length<1000)break;
      from+=1000;
    }
    return ids;
  }

  async function mergeTag(id){
    const source=taxonomy.tags.find(item=>item.tag_id===id);if(!source)return;
    const requested=prompt(`Unisci “${source.name}” in quale tag esistente?\nScrivi il nome del tag canonico.`);if(requested===null)return;
    const normalized=canonical(requested);
    const target=taxonomy.tags.find(item=>item.tag_id!==id&&(item.normalized_name===normalized||canonical(item.name)===normalized));
    if(!target)return toastMessage('Tag canonico di destinazione non trovato');
    if(!confirm(`Unire “${source.name}” in “${target.name}”? Le associazioni alle note saranno trasferite.`))return;
    setStatus('Unione tag...');
    try{
      const ids=await fetchAllTagNoteIds(source.tag_id);
      for(let i=0;i<ids.length;i+=500){
        const rows=ids.slice(i,i+500).map(noteId=>({user_id:sectionUser.id,note_id:noteId,tag_id:target.tag_id}));
        if(rows.length){
          const {error}=await supabaseClient.from('journal_note_tags').upsert(rows,{onConflict:'note_id,tag_id',ignoreDuplicates:true});
          if(error)throw error;
        }
      }
      const {error:deleteError}=await supabaseClient.from('journal_tags').delete().eq('id',source.tag_id).eq('user_id',sectionUser.id);
      if(deleteError)throw deleteError;
      taxonomyLoaded=false;await loadTaxonomy(true);toastMessage(`Tag unito in “${target.name}”`);
    }catch(error){toastMessage(error.message||'Errore durante l’unione')}
    finally{setStatus('')}
  }

  async function deleteUnusedTag(id){
    const tag=taxonomy.tags.find(item=>item.tag_id===id);if(!tag)return;
    if(Number(tag.note_count||0)>0)return toastMessage('Il tag è ancora associato a delle note');
    if(!confirm(`Eliminare il tag inutilizzato “${tag.name}”?`))return;
    const {error}=await supabaseClient.from('journal_tags').delete().eq('id',id).eq('user_id',sectionUser.id);
    if(error)return toastMessage(error.message||'Errore Supabase');
    taxonomyLoaded=false;await loadTaxonomy(true);toastMessage('Tag eliminato');
  }

  tagTab.addEventListener('click',activateTags);
  [journalTab,errorsTab,changeTab,todoTab].forEach(tab=>tab.addEventListener('click',deactivateTags));
  tagsRefreshBtn.addEventListener('click',()=>{taxonomyLoaded=false;loadTaxonomy(true).catch(error=>{setStatus(error.message||'Errore Supabase',true);toastMessage(error.message||'Errore Supabase')})});
  tagsSearch.addEventListener('input',()=>{
    applyFacetFilter(tagsSearch.value);
    clearTimeout(searchTimer);
    searchTimer=setTimeout(()=>searchNotes(tagsSearch.value).catch(error=>{resultsCount.textContent='Errore';toastMessage(error.message||'Errore ricerca')}),320);
  });

  tagsPanel.addEventListener('click',event=>{
    const openButton=event.target.closest('[data-open-date]');if(openButton)return openInDiary(openButton.dataset.openDate);
    const renameButton=event.target.closest('[data-tag-rename]');if(renameButton){event.stopPropagation();return renameTag(renameButton.dataset.tagRename)}
    const mergeButton=event.target.closest('[data-tag-merge]');if(mergeButton){event.stopPropagation();return mergeTag(mergeButton.dataset.tagMerge)}
    const deleteButton=event.target.closest('[data-tag-delete]');if(deleteButton){event.stopPropagation();return deleteUnusedTag(deleteButton.dataset.tagDelete)}
    const facet=event.target.closest('[data-facet-type]');if(!facet)return;
    const type=facet.dataset.facetType;
    const value=facet.dataset.facetId||facet.dataset.facetValue||'';
    const label=facet.dataset.facetLabel||'Risultati';
    loadFacetNotes(type,value,label).catch(error=>{resultsCount.textContent='Errore';toastMessage(error.message||'Errore Supabase')});
  });

  function syncSession(session){
    sectionUser=session?.user||null;
    if(!sectionUser){tagsActive=false;taxonomyLoaded=false;taxonomy={areas:[],kinds:[],tags:[],entities:[],unclassified:null};tagsPanel.hidden=true;tagsSearch.value='';resultsList.innerHTML='';return}
    if(tagsActive)activateTags();
  }

  supabaseClient.auth.getSession().then(({data})=>syncSession(data?.session||null));
  supabaseClient.auth.onAuthStateChange((_event,session)=>syncSession(session));
})();