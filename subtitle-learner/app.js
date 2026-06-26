(() => {
  'use strict';

  const SUPABASE_URL = 'https://kujyowhezihjambhpahe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
  const targetLang = 'it';

  const els = {
    file: document.getElementById('fileInput'),
    sourceLang: document.getElementById('sourceLang'),
    translateAll: document.getElementById('translateAllBtn'),
    clear: document.getElementById('clearBtn'),
    showAll: document.getElementById('showAllBtn'),
    hideAll: document.getElementById('hideAllBtn'),
    jumpProgress: document.getElementById('jumpProgressBtn'),
    search: document.getElementById('searchInput'),
    status: document.getElementById('status'),
    rows: document.getElementById('rows'),
    tpl: document.getElementById('rowTemplate'),
    authStatus: document.getElementById('authStatus'),
    loginForm: document.getElementById('loginForm'),
    emailInput: document.getElementById('emailInput'),
    logout: document.getElementById('logoutBtn'),
    savedDocs: document.getElementById('savedDocs'),
    refreshDocs: document.getElementById('refreshDocsBtn'),
  };

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  let session = null;
  let user = null;
  let entries = [];
  let currentDoc = null;
  let savedDocs = [];
  const cacheKey = 'subtitleLearner.translationCache.v5.en-it';
  let cache = loadCache();
  let saveTimer = null;

  function loadCache() {
    try { return JSON.parse(localStorage.getItem(cacheKey)) || {}; } catch { return {}; }
  }

  function saveCache() {
    try { localStorage.setItem(cacheKey, JSON.stringify(cache)); } catch {}
  }

  function setStatus(message, tone = '') {
    els.status.textContent = message;
    els.status.className = `status ${tone}`.trim();
  }

  function setAuthStatus(message, tone = '') {
    els.authStatus.textContent = message;
    els.authStatus.className = `status ${tone}`.trim();
  }

  function normalizeText(text) {
    return String(text || '')
      .replace(/\r/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\{[^}]+\}/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  function parseSrt(raw) {
    const blocks = String(raw || '')
      .replace(/\r/g, '')
      .split(/\n\s*\n+/)
      .map(block => block.trim())
      .filter(Boolean);

    return blocks.map((block, fallbackIndex) => {
      const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
      let idx = fallbackIndex + 1;
      if (/^\d+$/.test(lines[0])) idx = Number(lines.shift());
      const timeLine = lines.find(line => line.includes('-->')) || '';
      const textLines = lines.filter(line => line !== timeLine);
      return {
        id: idx,
        time: timeLine,
        text: normalizeText(textLines.join('\n')),
        translation: '',
        visible: false,
        loading: false,
        error: ''
      };
    }).filter(entry => entry.text);
  }

  function detectSourceLang(text) {
    const words = String(text || '').toLowerCase().match(/[a-zà-ÿ']+/g) || [];
    if (!words.length) return 'en';
    const score = list => words.filter(word => list.includes(word)).length;
    const scores = {
      en: score(['the', 'and', 'you', 'that', 'this', 'what', 'with', 'for', 'are', 'not', 'have', 'just', 'like', 'okay', 'yeah', 'well', 'right', 'can', 'will', 'we', 'i', 'me', 'my', 'your', 'is', 'it', 'to', 'of', 'in', 'on']),
      it: score(['che', 'non', 'sono', 'sei', 'con', 'per', 'una', 'uno', 'gli', 'del', 'della', 'questo', 'questa', 'cosa', 'bene', 'allora', 'io', 'tu', 'mio', 'mia', 'sì', 'si']),
      es: score(['que', 'no', 'con', 'para', 'una', 'uno', 'los', 'las', 'del', 'esta', 'esto', 'bien', 'soy', 'eres', 'pero']),
      fr: score(['que', 'pas', 'avec', 'pour', 'une', 'les', 'des', 'est', 'suis', 'vous', 'mais', 'bien']),
      de: score(['ich', 'du', 'nicht', 'und', 'mit', 'für', 'der', 'die', 'das', 'ist', 'aber', 'gut']),
      pt: score(['que', 'não', 'com', 'para', 'uma', 'você', 'está', 'bem', 'mas', 'sou'])
    };
    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return best && best[1] > 0 ? best[0] : 'en';
  }

  function sourceLangFor(text) {
    const selected = els.sourceLang.value || 'en';
    return selected === 'auto' ? detectSourceLang(text) : selected;
  }

  function langPairFor(text) {
    return `${sourceLangFor(text)}|${targetLang}`;
  }

  function cacheId(text) {
    return `${langPairFor(text)}::${text}`;
  }

  function slugId(name) {
    const clean = String(name || 'srt')
      .toLowerCase()
      .replace(/\.srt$/i, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 70) || 'srt';
    return `${Date.now()}-${clean}`;
  }

  function canUseDb() {
    return !!user;
  }

  function setEnabled(enabled) {
    const hasEntries = enabled && entries.length > 0;
    els.file.disabled = !enabled;
    els.refreshDocs.disabled = !enabled;
    els.translateAll.disabled = !hasEntries;
    els.clear.disabled = !hasEntries;
    els.showAll.disabled = !hasEntries;
    els.hideAll.disabled = !hasEntries;
    els.jumpProgress.disabled = !hasEntries || !currentDoc;
    els.search.disabled = !hasEntries;
  }

  async function initAuth() {
    const { data } = await supabase.auth.getSession();
    session = data.session;
    user = session?.user || null;
    updateAuthUi();
    if (user) await loadSavedDocs();
    supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      session = nextSession;
      user = session?.user || null;
      updateAuthUi();
      if (user) await loadSavedDocs();
      else {
        savedDocs = [];
        renderSavedDocs();
      }
    });
  }

  function updateAuthUi() {
    if (user) {
      setAuthStatus(`Accesso effettuato: ${user.email}`);
      els.loginForm.hidden = true;
      els.logout.hidden = false;
      setEnabled(true);
      if (!entries.length) setStatus('Carica un file .srt oppure aprine uno dalla libreria.');
    } else {
      setAuthStatus('Accedi per salvare SRT, traduzioni e progresso.');
      els.loginForm.hidden = false;
      els.logout.hidden = true;
      setEnabled(false);
      setStatus('Accedi e carica un file .srt per iniziare.');
    }
  }

  async function login(event) {
    event.preventDefault();
    const email = els.emailInput.value.trim();
    if (!email) return;
    setAuthStatus('Invio magic link...');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href.split('#')[0] }
    });
    if (error) setAuthStatus(`Errore login: ${error.message}`, 'error');
    else setAuthStatus('Magic link inviato. Apri la mail e poi torna qui.');
  }

  async function logout() {
    await supabase.auth.signOut();
    entries = [];
    currentDoc = null;
    render();
  }

  async function loadSavedDocs() {
    if (!canUseDb()) return;
    const { data, error } = await supabase
      .from('subtitle_documents')
      .select('id,title,original_filename,source_lang,target_lang,entry_count,last_entry_id,last_entry_index,updated_at')
      .order('updated_at', { ascending: false });
    if (error) {
      els.savedDocs.className = 'saved-docs empty error';
      els.savedDocs.textContent = `Errore libreria: ${error.message}`;
      return;
    }
    savedDocs = data || [];
    renderSavedDocs();
  }

  function renderSavedDocs() {
    if (!user) {
      els.savedDocs.className = 'saved-docs empty';
      els.savedDocs.textContent = 'Accedi per vedere i file salvati.';
      return;
    }
    if (!savedDocs.length) {
      els.savedDocs.className = 'saved-docs empty';
      els.savedDocs.textContent = 'Nessun SRT salvato. Carica un file per aggiungerlo alla libreria.';
      return;
    }
    els.savedDocs.className = 'saved-docs';
    els.savedDocs.innerHTML = '';
    savedDocs.forEach(doc => {
      const card = document.createElement('article');
      card.className = 'doc-card';
      const updated = doc.updated_at ? new Date(doc.updated_at).toLocaleString('it-IT') : '';
      card.innerHTML = '<div><strong></strong><p></p></div><button type="button">Apri</button>';
      card.querySelector('strong').textContent = doc.title || doc.original_filename || 'SRT senza titolo';
      card.querySelector('p').textContent = `${doc.entry_count || 0} righe · punto salvato: #${doc.last_entry_id || 1} · ${updated}`;
      card.querySelector('button').addEventListener('click', () => openSavedDoc(doc.id));
      els.savedDocs.appendChild(card);
    });
  }

  async function openSavedDoc(id) {
    if (!canUseDb()) return;
    setStatus('Apro SRT salvato...');
    const { data: doc, error } = await supabase
      .from('subtitle_documents')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      setStatus(`Errore apertura SRT: ${error.message}`, 'error');
      return;
    }
    const { data: translations, error: translationsError } = await supabase
      .from('subtitle_translations')
      .select('entry_id,translated_text')
      .eq('document_id', id);
    if (translationsError) {
      setStatus(`Errore traduzioni salvate: ${translationsError.message}`, 'error');
      return;
    }
    const translationMap = new Map((translations || []).map(item => [Number(item.entry_id), item.translated_text]));
    entries = parseSrt(doc.raw_srt).map((entry, index) => ({
      ...entry,
      translation: translationMap.get(Number(entry.id)) || '',
      visible: index === Number(doc.last_entry_index || 0),
    }));
    currentDoc = doc;
    els.sourceLang.value = doc.source_lang || 'en';
    els.search.value = '';
    render();
    setStatus(`Aperto ${doc.title || doc.original_filename}. Punto salvato: #${doc.last_entry_id || 1}.`);
    setTimeout(jumpToProgress, 150);
  }

  async function saveCurrentDocument(raw, file) {
    if (!canUseDb()) return null;
    const id = slugId(file.name);
    const doc = {
      user_id: user.id,
      id,
      title: file.name.replace(/\.srt$/i, ''),
      original_filename: file.name,
      source_lang: els.sourceLang.value || 'en',
      target_lang: targetLang,
      raw_srt: raw,
      entry_count: entries.length,
      last_entry_id: entries[0]?.id || 1,
      last_entry_index: 0,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('subtitle_documents').upsert(doc, { onConflict: 'user_id,id' });
    if (error) throw error;
    currentDoc = doc;
    await loadSavedDocs();
    return doc;
  }

  function queueProgressSave(index) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveProgress(index), 400);
  }

  async function saveProgress(index) {
    if (!canUseDb() || !currentDoc || !entries[index]) return;
    const entry = entries[index];
    const patch = {
      last_entry_id: Number(entry.id),
      last_entry_index: index,
      source_lang: els.sourceLang.value || 'en',
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('subtitle_documents')
      .update(patch)
      .eq('id', currentDoc.id);
    if (!error) currentDoc = { ...currentDoc, ...patch };
  }

  async function saveTranslation(entry) {
    if (!canUseDb() || !currentDoc || !entry?.translation) return;
    await supabase.from('subtitle_translations').upsert({
      user_id: user.id,
      document_id: currentDoc.id,
      entry_id: Number(entry.id),
      original_text: entry.text,
      translated_text: entry.translation,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,document_id,entry_id' });
  }

  async function translateText(text) {
    const source = sourceLangFor(text);
    if (source === targetLang) return text;
    const key = cacheId(text);
    if (cache[key]) return cache[key];
    const langPair = `${source}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const translated = data?.responseData?.translatedText || '';
    if (!translated) throw new Error('Traduzione non disponibile');
    cache[key] = translated;
    saveCache();
    return translated;
  }

  function render() {
    if (!entries.length) {
      els.rows.className = 'rows empty';
      els.rows.textContent = 'Nessun sottotitolo caricato.';
      setEnabled(!!user);
      return;
    }
    const query = els.search.value.trim().toLowerCase();
    els.rows.className = 'rows';
    els.rows.innerHTML = '';
    entries.forEach((entry, index) => {
      const row = els.tpl.content.firstElementChild.cloneNode(true);
      row.id = `entry-${index}`;
      const haystack = `${entry.text} ${entry.translation}`.toLowerCase();
      if (query && !haystack.includes(query)) row.classList.add('hidden-row');
      if (currentDoc && index === Number(currentDoc.last_entry_index || 0)) row.classList.add('progress-row');
      row.querySelector('.meta').textContent = `#${entry.id}`;
      row.querySelector('.original-text').textContent = entry.text;
      const btn = row.querySelector('.translate-btn');
      const out = row.querySelector('.translation-text');
      btn.textContent = entry.loading ? 'Traduzione...' : entry.visible ? 'Nascondi traduzione' : 'Mostra traduzione';
      btn.disabled = entry.loading;
      out.classList.toggle('hidden', !entry.visible);
      out.classList.toggle('error', !!entry.error);
      out.textContent = entry.error || entry.translation || 'Traduzione non ancora caricata.';
      btn.addEventListener('click', () => toggleTranslation(index));
      els.rows.appendChild(row);
    });
    setEnabled(!!user);
  }

  async function toggleTranslation(index) {
    const entry = entries[index];
    if (!entry) return;
    if (entry.visible) {
      entry.visible = false;
      queueProgressSave(index);
      render();
      return;
    }
    entry.visible = true;
    queueProgressSave(index);
    if (!entry.translation) await translateEntry(index);
    render();
  }

  async function translateEntry(index) {
    const entry = entries[index];
    if (!entry || entry.loading || entry.translation) return;
    try {
      entry.loading = true;
      entry.error = '';
      render();
      entry.translation = await translateText(entry.text);
      await saveTranslation(entry);
    } catch (error) {
      entry.error = `Errore traduzione: ${error.message}`;
    } finally {
      entry.loading = false;
    }
  }

  async function translateAll() {
    if (!entries.length) return;
    setStatus('Traduzione in corso...');
    for (let i = 0; i < entries.length; i += 1) {
      entries[i].visible = true;
      await translateEntry(i);
      queueProgressSave(i);
      setStatus(`Tradotte ${i + 1}/${entries.length} righe.`);
      await new Promise(resolve => setTimeout(resolve, 180));
    }
    setStatus(`Traduzione completata: ${entries.length} righe.`);
    render();
  }

  async function loadFile(file) {
    if (!file) return;
    if (!user) {
      setStatus('Accedi prima di caricare: così posso salvare il file nel database.', 'error');
      return;
    }
    const text = await file.text();
    entries = parseSrt(text);
    currentDoc = null;
    els.search.value = '';
    if (!entries.length) {
      setStatus('File caricato, ma non ho trovato righe SRT valide.', 'error');
      render();
      return;
    }
    try {
      await saveCurrentDocument(text, file);
      setStatus(`Salvate ${entries.length} righe da ${file.name}.`);
    } catch (error) {
      setStatus(`File letto, ma non salvato: ${error.message}`, 'error');
    }
    render();
  }

  function jumpToProgress() {
    if (!currentDoc) return;
    const index = Number(currentDoc.last_entry_index || 0);
    document.getElementById(`entry-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  els.loginForm.addEventListener('submit', login);
  els.logout.addEventListener('click', logout);
  els.refreshDocs.addEventListener('click', loadSavedDocs);
  els.jumpProgress.addEventListener('click', jumpToProgress);
  els.file.addEventListener('change', event => loadFile(event.target.files?.[0]));
  els.translateAll.addEventListener('click', translateAll);
  els.clear.addEventListener('click', () => {
    entries = [];
    currentDoc = null;
    els.file.value = '';
    els.search.value = '';
    setStatus(user ? 'Carica un file .srt oppure aprine uno dalla libreria.' : 'Accedi e carica un file .srt per iniziare.');
    render();
  });
  els.showAll.addEventListener('click', () => { entries.forEach(entry => { entry.visible = true; }); render(); });
  els.hideAll.addEventListener('click', () => { entries.forEach(entry => { entry.visible = false; }); render(); });
  els.search.addEventListener('input', render);
  els.sourceLang.addEventListener('change', () => {
    entries.forEach(entry => { entry.translation = ''; entry.error = ''; entry.visible = false; });
    if (currentDoc) saveProgress(Number(currentDoc.last_entry_index || 0));
    setStatus('Lingua originale cambiata: le traduzioni verranno ricalcolate.');
    render();
  });

  initAuth().catch(error => setAuthStatus(`Errore Supabase: ${error.message}`, 'error'));
  render();
})();