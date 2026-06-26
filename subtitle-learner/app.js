(() => {
  'use strict';

  const els = {
    file: document.getElementById('fileInput'),
    sourceLang: document.getElementById('sourceLang'),
    translateAll: document.getElementById('translateAllBtn'),
    clear: document.getElementById('clearBtn'),
    showAll: document.getElementById('showAllBtn'),
    hideAll: document.getElementById('hideAllBtn'),
    search: document.getElementById('searchInput'),
    status: document.getElementById('status'),
    rows: document.getElementById('rows'),
    tpl: document.getElementById('rowTemplate'),
  };

  const targetLang = 'it';
  let entries = [];
  const cacheKey = 'subtitleLearner.translationCache.v3.en-it';
  let cache = loadCache();

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
      return { id: idx, time: timeLine, text: normalizeText(textLines.join('\n')), translation: '', visible: false, loading: false, error: '' };
    }).filter(entry => entry.text);
  }

  function detectSourceLang(text) {
    const sample = String(text || '').toLowerCase();
    const words = sample.match(/[a-zà-ÿ']+/g) || [];
    if (!words.length) return 'en';

    const englishHits = words.filter(word => [
      'the', 'and', 'you', 'that', 'this', 'what', 'with', 'for', 'are', 'not', 'have', 'just', 'like', 'okay', 'yeah', 'well', 'right', 'can', 'don', "don't", 'will', 'we', 'i', 'me', 'my', 'your', 'is', 'it', 'to', 'of', 'in', 'on'
    ].includes(word)).length;

    const italianHits = words.filter(word => [
      'che', 'non', 'sono', 'sei', 'con', 'per', 'una', 'uno', 'gli', 'del', 'della', 'questo', 'questa', 'cosa', 'bene', 'allora', 'io', 'tu', 'mio', 'mia', 'sì', 'si'
    ].includes(word)).length;

    const spanishHits = words.filter(word => [
      'que', 'no', 'con', 'para', 'una', 'uno', 'los', 'las', 'del', 'esta', 'esto', 'bien', 'soy', 'eres', 'pero'
    ].includes(word)).length;

    const frenchHits = words.filter(word => [
      'que', 'pas', 'avec', 'pour', 'une', 'les', 'des', 'est', 'suis', 'vous', 'mais', 'bien'
    ].includes(word)).length;

    const germanHits = words.filter(word => [
      'ich', 'du', 'nicht', 'und', 'mit', 'für', 'der', 'die', 'das', 'ist', 'aber', 'gut'
    ].includes(word)).length;

    const portugueseHits = words.filter(word => [
      'que', 'não', 'com', 'para', 'uma', 'você', 'está', 'bem', 'mas', 'sou'
    ].includes(word)).length;

    const scores = { en: englishHits, it: italianHits, es: spanishHits, fr: frenchHits, de: germanHits, pt: portugueseHits };
    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return best && best[1] > 0 ? best[0] : 'en';
  }

  function sourceLangFor(text) {
    const selected = els.sourceLang.value || 'auto';
    return selected === 'auto' ? detectSourceLang(text) : selected;
  }

  function langPairFor(text) {
    return `${sourceLangFor(text)}|${targetLang}`;
  }

  function cacheId(text) {
    return `${langPairFor(text)}::${text}`;
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

  function setEnabled(enabled) {
    els.translateAll.disabled = !enabled;
    els.clear.disabled = !enabled;
    els.showAll.disabled = !enabled;
    els.hideAll.disabled = !enabled;
    els.search.disabled = !enabled;
  }

  function render() {
    if (!entries.length) {
      els.rows.className = 'rows empty';
      els.rows.textContent = 'Nessun sottotitolo caricato.';
      setEnabled(false);
      return;
    }

    const query = els.search.value.trim().toLowerCase();
    els.rows.className = 'rows';
    els.rows.innerHTML = '';
    entries.forEach((entry, index) => {
      const row = els.tpl.content.firstElementChild.cloneNode(true);
      const haystack = `${entry.text} ${entry.translation}`.toLowerCase();
      if (query && !haystack.includes(query)) row.classList.add('hidden-row');

      row.querySelector('.meta').textContent = `#${entry.id}${entry.time ? ` · ${entry.time}` : ''}`;
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
    setEnabled(true);
  }

  async function toggleTranslation(index) {
    const entry = entries[index];
    if (!entry) return;
    if (entry.visible) {
      entry.visible = false;
      render();
      return;
    }
    entry.visible = true;
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
      setStatus(`Tradotte ${i + 1}/${entries.length} righe.`);
      await new Promise(resolve => setTimeout(resolve, 180));
    }
    setStatus(`Traduzione completata: ${entries.length} righe.`);
    render();
  }

  async function loadFile(file) {
    if (!file) return;
    const text = await file.text();
    entries = parseSrt(text);
    els.search.value = '';
    if (!entries.length) {
      setStatus('File caricato, ma non ho trovato righe SRT valide.', 'error');
    } else {
      setStatus(`Caricate ${entries.length} righe da ${file.name}.`);
    }
    render();
  }

  els.file.addEventListener('change', event => loadFile(event.target.files?.[0]));
  els.translateAll.addEventListener('click', translateAll);
  els.clear.addEventListener('click', () => { entries = []; els.file.value = ''; els.search.value = ''; setStatus('Carica un file .srt per iniziare.'); render(); });
  els.showAll.addEventListener('click', () => { entries.forEach(entry => { entry.visible = true; }); render(); });
  els.hideAll.addEventListener('click', () => { entries.forEach(entry => { entry.visible = false; }); render(); });
  els.search.addEventListener('input', render);
  els.sourceLang.addEventListener('change', () => { entries.forEach(entry => { entry.translation = ''; entry.error = ''; entry.visible = false; }); setStatus('Lingua originale cambiata: le traduzioni verranno ricalcolate.'); render(); });

  render();
})();