(() => {
  'use strict';

  const STORE_KEY = 'fiscoTrackerWeb.v1';
  const years = Array.from({ length: 31 }, (_, i) => 2024 + i);

  const baseAssets = [
    { id: 'scalable', name: 'Scalable Capital', type: 'ETF', regime: 'Dichiarativo', icon: '📈', details: 'Report fiscale, quadro RW/RT e imposte su attività estere.' },
    { id: 'trade-republic', name: 'Trade Republic', type: 'Broker', regime: 'Amministrato', icon: '🏦', details: 'Broker in regime amministrato: verifica comunque estratti e documenti.' },
    { id: 'binance', name: 'Binance', type: 'Crypto', regime: 'Dichiarativo', icon: '₿', details: 'Monitoraggio crypto e calcolo eventuali plusvalenze.' },
    { id: 'home', name: 'Affitto', type: 'Casa', regime: 'Detrazione', icon: '🏠', details: 'Contratto e canoni per eventuale detrazione in dichiarazione.' },
    { id: 'enpap', name: 'ENPAP', type: 'Previdenza', regime: 'Cassa professionale', icon: '🛡️', details: 'Acconti, comunicazione redditi e contributi psicologi.' },
  ];

  const templates = [
    { key: 'cu', month: 3, day: 16, title: 'Ricezione CU', desc: 'Verifica Certificazione Unica del datore di lavoro.', assets: [], payment: false, explanation: 'Controlla redditi, ritenute, giorni di lavoro e dati caricati nel 730 precompilato.', paymentInfo: 'Nessun pagamento. Conserva la CU come documento fiscale.' },
    { key: 'enpap-acconto', month: 3, day: 3, title: 'ENPAP: Acconto contributi', desc: 'Verifica importi nell’area riservata ENPAP.', assets: ['enpap'], payment: true, explanation: 'Acconto contributivo collegato alla posizione previdenziale professionale.', paymentInfo: 'Paga con PagoPA, MAV o modalità indicate nell’area riservata ENPAP.' },
    { key: 'saldo-primo-acconto', month: 6, day: 30, title: 'Saldo + I Acconto', desc: 'Saldo imposte anno precedente e primo acconto anno corrente.', assets: ['scalable', 'binance'], payment: true, explanation: 'Include imposte collegate a dichiarazione, investimenti esteri, plusvalenze e monitoraggio fiscale.', paymentInfo: 'Di norma tramite F24 telematico o intermediario. Verifica codici tributo con CAF/commercialista.' },
    { key: 'saldo-maggiorato', month: 7, day: 30, title: 'Saldo + acconto con 0,40%', desc: 'Scadenza alternativa con maggiorazione se non pagato entro giugno.', assets: ['scalable', 'binance'], payment: true, explanation: 'È la finestra successiva alla scadenza ordinaria; comporta maggiorazione dello 0,40%.', paymentInfo: 'Stesso pagamento della scadenza ordinaria, ma importo maggiorato.' },
    { key: '730', month: 9, day: 30, title: 'Presentazione 730', desc: 'Controlla redditi, detrazioni, affitto e quadro dichiarativo.', assets: ['home', 'scalable', 'binance'], payment: false, explanation: 'Il 730 consente di gestire redditi da lavoro dipendente e detrazioni; per investimenti esteri può servire integrazione con Modello Redditi.', paymentInfo: 'Possibili rimborsi o trattenute tramite sostituto d’imposta.' },
    { key: 'secondo-acconto', month: 11, day: 30, title: 'II Acconto + Modello Redditi', desc: 'Secondo acconto e termine per quadri aggiuntivi.', assets: ['scalable', 'binance'], payment: true, explanation: 'Seconda rata degli acconti e scadenza importante per dichiarazioni integrative o quadri RW/RT/RM.', paymentInfo: 'Pagamento tramite F24 e invio tramite Agenzia Entrate/intermediario.' },
    { key: 'enpap-redditi', month: 10, day: 1, title: 'ENPAP: Comunicazione redditi', desc: 'Comunicazione dei redditi professionali all’ENPAP.', assets: ['enpap'], payment: false, explanation: 'Serve per calcolare contributi dovuti e posizione previdenziale.', paymentInfo: 'Di norma tramite area riservata ENPAP.' },
    { key: 'tari', month: 12, day: 16, title: 'TARI', desc: 'Verifica avviso comunale tassa rifiuti.', assets: ['home'], payment: true, explanation: 'Scadenza locale: data e importo possono variare per Comune.', paymentInfo: 'PagoPA/F24 secondo avviso ricevuto.' },
    { key: 'bollo-auto', month: 1, day: 31, title: 'Bollo auto', desc: 'Controlla scadenza regionale del bollo auto.', assets: [], payment: true, explanation: 'Scadenza collegata al veicolo; verifica su portale regionale o ACI.', paymentInfo: 'Pagamento tramite PagoPA, home banking, ACI o canali autorizzati.' },
    { key: 'assicurazione-auto', month: 9, day: 1, title: 'Assicurazione auto', desc: 'Promemoria rinnovo assicurazione auto.', assets: [], payment: true, explanation: 'Promemoria personale utile per evitare scadenze assicurative.', paymentInfo: 'Paga secondo canale indicato dalla compagnia.' },
    { key: 'ordine-psicologi', month: 2, day: 28, title: 'Ordine Psicologi Lombardia', desc: 'Quota annuale iscrizione ordine.', assets: ['enpap'], payment: true, explanation: 'Promemoria per quota di iscrizione professionale.', paymentInfo: 'Pagamento secondo avviso dell’Ordine.' },
  ];

  let state = loadState();

  const $ = id => document.getElementById(id);
  const fmtDate = iso => new Date(`${iso}T12:00:00`).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  const money = value => new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));

  function makeDeadlines() {
    return years.flatMap(year => templates.map(t => ({
      id: `${year}-${t.key}`,
      date: `${year}-${String(t.month).padStart(2, '0')}-${String(t.day).padStart(2, '0')}`,
      year,
      title: t.title,
      description: t.desc,
      relatedAssets: t.assets,
      hasPayment: t.payment,
      explanation: t.explanation,
      paymentInfo: t.paymentInfo,
    }))).sort((a, b) => a.date.localeCompare(b.date));
  }

  function defaultState() {
    return { assets: baseAssets, completedDeadlines: {}, paymentAmounts: {}, deadlineNotes: {}, uploadedFiles: {} };
  }

  function normalizeImported(data) {
    const next = defaultState();
    if (!data || typeof data !== 'object') return next;
    next.completedDeadlines = Array.isArray(data.completedDeadlines)
      ? Object.fromEntries(data.completedDeadlines.map(id => [id, true]))
      : (data.completedDeadlines || {});
    next.paymentAmounts = data.paymentAmounts || {};
    next.deadlineNotes = data.deadlineNotes || {};
    next.uploadedFiles = data.uploadedFiles || {};
    if (Array.isArray(data.assets)) next.assets = data.assets;
    return next;
  }

  function loadState() {
    try { return normalizeImported(JSON.parse(localStorage.getItem(STORE_KEY))); } catch { return defaultState(); }
  }

  function saveState() {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    renderRaw();
  }

  function view(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === name));
    document.querySelectorAll('.nav').forEach(b => b.classList.toggle('active', b.dataset.view === name));
    if (name === 'timeline') renderTimeline();
    if (name === 'assets') renderAssets();
    if (name === 'dashboard') renderDashboard();
    if (name === 'data') renderRaw();
  }

  function renderDashboard() {
    $('todayLabel').textContent = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const today = new Date();
    const list = makeDeadlines();
    const next = list.find(d => new Date(`${d.date}T23:59:59`) >= today && !state.completedDeadlines[d.id]) || list.find(d => !state.completedDeadlines[d.id]);
    if (next) {
      $('nextTitle').textContent = next.title;
      $('nextDate').textContent = fmtDate(next.date);
      $('nextDesc').textContent = next.description;
      const days = Math.ceil((new Date(`${next.date}T23:59:59`) - today) / 86400000);
      $('countdown').textContent = days >= 0 ? `${days} giorni` : 'scaduta';
    }
    const done = list.filter(d => state.completedDeadlines[d.id]).length;
    $('doneCount').textContent = done;
    $('pendingCount').textContent = list.length - done;
    renderPaymentYears();
    renderPayments();
  }

  function renderPaymentYears() {
    const current = String(new Date().getFullYear());
    $('yearPayments').innerHTML = years.map(y => `<option value="${y}" ${String(y) === current ? 'selected' : ''}>${y}</option>`).join('');
  }

  function renderPayments() {
    const year = $('yearPayments').value || new Date().getFullYear();
    const total = Object.entries(state.paymentAmounts).reduce((sum, [id, amount]) => id.startsWith(`${year}-`) ? sum + Number(amount || 0) : sum, 0);
    $('totalPayments').textContent = money(total);
  }

  function renderAssets() {
    $('assetsGrid').innerHTML = state.assets.map(a => `<article class="asset"><div class="icon">${a.icon || '◼️'}</div><h3>${a.name}</h3><p class="muted">${a.type || ''} · ${a.regime || ''}</p><p>${a.details || ''}</p></article>`).join('');
  }

  function renderYearFilter() {
    const current = new Date().getFullYear();
    $('yearFilter').innerHTML = `<option value="current">Anno corrente (${current})</option><option value="all">Tutti gli anni</option>` + years.map(y => `<option value="${y}">${y}</option>`).join('');
  }

  function renderTimeline() {
    const tpl = $('deadlineTpl');
    const filter = $('yearFilter').value || 'current';
    const query = $('search').value.trim().toLowerCase();
    const current = new Date().getFullYear();
    let list = makeDeadlines().filter(d => filter === 'all' || d.year === Number(filter === 'current' ? current : filter));
    if (query) list = list.filter(d => `${d.title} ${d.description} ${d.explanation}`.toLowerCase().includes(query));
    const box = $('timelineList');
    box.innerHTML = '';
    list.forEach(d => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.classList.toggle('done', !!state.completedDeadlines[d.id]);
      node.querySelector('.date').textContent = fmtDate(d.date);
      node.querySelector('h3').textContent = d.title;
      node.querySelector('.desc').textContent = d.description;
      node.querySelector('.explanation').textContent = d.explanation;
      node.querySelector('.payment').textContent = d.paymentInfo || 'Nessuna informazione di pagamento.';
      const checked = node.querySelector('input[type="checkbox"]');
      checked.checked = !!state.completedDeadlines[d.id];
      checked.addEventListener('change', e => { state.completedDeadlines[d.id] = e.target.checked; saveState(); renderTimeline(); renderDashboard(); });
      const amount = node.querySelector('.amount-input');
      amount.value = state.paymentAmounts[d.id] || '';
      amount.disabled = !d.hasPayment;
      amount.addEventListener('input', e => { state.paymentAmounts[d.id] = e.target.value; saveState(); renderDashboard(); });
      const note = node.querySelector('.note-input');
      note.value = state.deadlineNotes[d.id] || '';
      note.addEventListener('input', e => { state.deadlineNotes[d.id] = e.target.value; saveState(); });
      const fileInput = node.querySelector('.file-input');
      const fileBox = node.querySelector('.file-box');
      renderFileBox(d.id, fileBox);
      fileInput.addEventListener('change', e => attachFile(d.id, e.target.files[0], fileBox));
      box.appendChild(node);
    });
    if (!list.length) box.innerHTML = '<p class="muted">Nessuna scadenza trovata.</p>';
  }

  function renderFileBox(id, box) {
    const f = state.uploadedFiles[id];
    if (!f) { box.textContent = 'Nessun documento allegato.'; return; }
    box.innerHTML = `<strong>${f.name}</strong><br><button data-download>Scarica</button> <button class="danger" data-delete>Elimina</button>`;
    box.querySelector('[data-download]').addEventListener('click', () => downloadDataUrl(f.data, f.name));
    box.querySelector('[data-delete]').addEventListener('click', () => { delete state.uploadedFiles[id]; saveState(); renderTimeline(); });
  }

  function attachFile(id, file, box) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { state.uploadedFiles[id] = { name: file.name, type: file.type, data: reader.result, uploadedAt: new Date().toISOString() }; saveState(); renderFileBox(id, box); };
    reader.readAsDataURL(file);
  }

  function downloadDataUrl(data, name) {
    const a = document.createElement('a');
    a.href = data;
    a.download = name || 'documento';
    a.click();
  }

  function renderRaw() {
    $('rawData').value = JSON.stringify(state, null, 2);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    downloadDataUrl(url, `fisco-tracker-backup-${new Date().toISOString().slice(0,10)}.json`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importJson(file) {
    if (!file) return;
    const data = JSON.parse(await file.text());
    state = normalizeImported(data);
    saveState();
    renderAll();
  }

  function renderAll() { renderYearFilter(); renderAssets(); renderTimeline(); renderDashboard(); renderRaw(); }

  document.querySelectorAll('.nav').forEach(btn => btn.addEventListener('click', () => view(btn.dataset.view)));
  $('yearPayments').addEventListener('change', renderPayments);
  $('yearFilter').addEventListener('change', renderTimeline);
  $('search').addEventListener('input', renderTimeline);
  $('seedBtn').addEventListener('click', () => { if (confirm('Ripristinare il modello base? I dati locali resteranno, salvo assets personalizzati.')) { state.assets = baseAssets; saveState(); renderAll(); } });
  $('exportBtn').addEventListener('click', exportJson);
  $('importInput').addEventListener('change', e => importJson(e.target.files[0]));
  $('wipeBtn').addEventListener('click', () => { if (confirm('Cancellare tutti i dati locali di Fisco Tracker?')) { localStorage.removeItem(STORE_KEY); state = defaultState(); renderAll(); } });

  renderAll();
})();
