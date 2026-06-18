(() => {
  'use strict';

  const DATA_URL = 'finance-drawdown/results/all_drawdowns.json';
  const CSV_URL = 'finance-drawdown/results/all_drawdowns.csv';
  const CACHE_KEY = 'lifeTracker.etfDrawdowns.v1';
  const SUPABASE_URL = 'https://kujyowhezihjambhpahe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
  const FUNCTION_NAME = 'trigger-etf-drawdown-update';
  const ACTIONS_URL = 'https://github.com/miemail1234-boop/Codici1/actions/workflows/etf-drawdown.yml';

  const client = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);

  const state = {
    rows: [],
    query: '',
    status: 'all',
    sort: 'drawdown_asc',
    expanded: null,
    source: 'loading',
    refreshing: false,
  };

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function fmtNum(value, digits = 2) {
    const n = num(value);
    if (n === null) return '—';
    return new Intl.NumberFormat('it-IT', { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(n);
  }

  function fmtPct(value) {
    const n = num(value);
    if (n === null) return '—';
    return `${new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(n)}%`;
  }

  function fmtDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('it-IT');
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
    }[ch]));
  }

  function primaryDrawdown(row) {
    return num(row.drawdown_from_52w_high_pct) ?? num(row.drawdown_from_high_pct);
  }

  function computedStatus(row) {
    if (row.status !== 'ok') return 'failed';
    const ddHigh = num(row.drawdown_from_high_pct);
    const ddClose = num(row.drawdown_from_close_high_pct);
    if (ddHigh !== null && ddHigh < -80) return 'outlier';
    if (ddHigh !== null && ddClose !== null && Math.abs(ddHigh - ddClose) > 30) return 'suspicious';
    return 'ok';
  }

  function statusLabel(status) {
    return {
      ok: 'Ok',
      failed: 'Fallito',
      outlier: 'Outlier',
      suspicious: 'Da verificare',
    }[status] || status;
  }

  function ddClass(value, status) {
    if (status !== 'ok') return 'warn';
    const n = num(value);
    if (n === null) return '';
    if (n <= -20) return 'neg strong';
    if (n <= -10) return 'neg mid';
    if (n >= -1) return 'pos';
    return 'neg';
  }

  function normalizeRows(rows) {
    return (Array.isArray(rows) ? rows : []).map((row, index) => ({
      ...row,
      n: Number(row.n ?? index + 1),
      _computedStatus: computedStatus(row),
    })).sort((a, b) => a.n - b.n);
  }

  function latestGeneratedAt(rows = state.rows) {
    return rows.map((row) => row.generated_at_utc).filter(Boolean).sort().at(-1) || '';
  }

  function dataUrl() {
    return `${DATA_URL}?t=${Date.now()}`;
  }

  async function loadRows(options = {}) {
    try {
      const res = await fetch(dataUrl(), { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = normalizeRows(await res.json());
      localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: new Date().toISOString(), rows }));
      state.source = 'online';
      return rows;
    } catch (err) {
      if (options.noCacheFallback) throw err;
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        state.source = `cache ${fmtDate(parsed.savedAt)}`;
        return normalizeRows(parsed.rows);
      }
      state.source = `errore: ${err.message}`;
      return [];
    }
  }

  function setUpdateStatus(message, tone = 'info') {
    const node = els.updateStatus || $('etfDrawdownUpdateStatus');
    if (!node) return;
    node.textContent = message;
    node.dataset.tone = tone;
  }

  function ensureRefreshControls() {
    const root = $('etfDrawdownSection');
    if (!root || $('etfDrawdownUpdateBtn')) return;
    const head = root.querySelector('.etf-head');
    if (!head) return;
    const actions = document.createElement('div');
    actions.className = 'etf-update-actions';
    actions.innerHTML = `
      <button class="btn primary" type="button" id="etfDrawdownUpdateBtn">Aggiorna ETF Drawdown</button>
      <a class="btn" href="${CSV_URL}" target="_blank" rel="noopener">Scarica CSV</a>
      <a class="btn" href="${ACTIONS_URL}" target="_blank" rel="noopener">GitHub Action</a>
    `;
    const oldCsv = head.querySelector(`a[href="${CSV_URL}"]`);
    oldCsv?.remove();
    head.appendChild(actions);
    const status = document.createElement('p');
    status.className = 'small';
    status.id = 'etfDrawdownUpdateStatus';
    status.textContent = 'Premi “Aggiorna ETF Drawdown” per avviare il ricalcolo con yfinance.';
    head.insertAdjacentElement('afterend', status);
    els.updateBtn = $('etfDrawdownUpdateBtn');
    els.updateStatus = status;
  }

  function getFilteredRows() {
    const q = state.query.trim().toLowerCase();
    let rows = state.rows.filter((row) => {
      const status = row._computedStatus;
      if (state.status !== 'all' && status !== state.status) return false;
      if (!q) return true;
      return [row.asset, row.isin, row.yahoo_ticker, row.tickers_tried, row.source]
        .some((value) => String(value ?? '').toLowerCase().includes(q));
    });

    rows = rows.slice().sort((a, b) => {
      if (state.sort === 'name') return String(a.asset).localeCompare(String(b.asset), 'it');
      if (state.sort === 'number') return a.n - b.n;
      if (state.sort === 'drawdown_desc') return (primaryDrawdown(b) ?? -9999) - (primaryDrawdown(a) ?? -9999);
      return (primaryDrawdown(a) ?? 9999) - (primaryDrawdown(b) ?? 9999);
    });

    return rows;
  }

  function renderSummary() {
    const total = state.rows.length;
    const okRows = state.rows.filter((r) => r._computedStatus === 'ok');
    const failed = state.rows.filter((r) => r._computedStatus === 'failed').length;
    const suspicious = state.rows.filter((r) => ['outlier', 'suspicious'].includes(r._computedStatus)).length;
    const nearHigh = okRows.filter((r) => (primaryDrawdown(r) ?? -999) >= -1).length;
    const drawdowns = okRows.map(primaryDrawdown).filter((v) => v !== null).sort((a, b) => a - b);
    const median = drawdowns.length ? drawdowns[Math.floor(drawdowns.length / 2)] : null;
    const updated = latestGeneratedAt();

    els.summary.innerHTML = `
      <div class="etf-card"><span>Totale</span><strong>${total}</strong><small>asset monitorati</small></div>
      <div class="etf-card"><span>Ok</span><strong>${okRows.length}</strong><small>dati validi</small></div>
      <div class="etf-card"><span>Vicini ai massimi</span><strong>${nearHigh}</strong><small>entro -1% da ATH 52 sett.</small></div>
      <div class="etf-card"><span>Mediana drawdown</span><strong>${fmtPct(median)}</strong><small>da ATH 52 sett., se disponibile</small></div>
      <div class="etf-card"><span>Da verificare</span><strong>${suspicious}</strong><small>outlier/sospetti</small></div>
      <div class="etf-card"><span>Falliti</span><strong>${failed}</strong><small>ticker non risolti</small></div>
    `;

    els.meta.textContent = `Fonte: ${state.source}. Ultimo aggiornamento dati: ${updated ? new Date(updated).toLocaleString('it-IT') : '—'}.`;
  }

  function renderTable() {
    const rows = getFilteredRows();
    if (!rows.length) {
      els.table.innerHTML = '<p class="small">Nessun asset corrisponde ai filtri selezionati.</p>';
      return;
    }

    const body = rows.map((row) => {
      const status = row._computedStatus;
      const dd = row.drawdown_from_high_pct;
      const dd52 = row.drawdown_from_52w_high_pct;
      const expanded = state.expanded === row.n;
      const quote = row.yahoo_ticker ? `https://finance.yahoo.com/quote/${encodeURIComponent(row.yahoo_ticker)}` : '';
      return `
        <div class="etf-row ${status}">
          <button class="etf-main" type="button" data-etf-toggle="${row.n}" aria-expanded="${expanded ? 'true' : 'false'}">
            <span class="etf-num">${row.n}</span>
            <span class="etf-name"><strong>${esc(row.asset)}</strong><small>${esc(row.isin || 'ISIN n/d')}</small></span>
            <span class="etf-ticker">${row.yahoo_ticker ? `<code>${esc(row.yahoo_ticker)}</code>` : '—'}</span>
            <span class="etf-status badge ${status}">${statusLabel(status)}</span>
            <span class="etf-price">${fmtNum(row.latest_close, 4)}<small>ultimo ${fmtDate(row.latest_date)}</small></span>
            <span class="etf-price">${fmtNum(row.all_time_high, 4)}<small>ATH assoluto ${fmtDate(row.all_time_high_date)}</small></span>
            <span class="etf-price">${fmtNum(row.week_52_high, 4)}<small>ATH 52 sett. ${fmtDate(row.week_52_high_date)}</small></span>
            <span class="etf-dd ${ddClass(dd52, status)}">${fmtPct(dd52)}<small>da ATH 52 sett.</small></span>
            <span class="etf-dd ${ddClass(dd, status)}">${fmtPct(dd)}<small>da ATH assoluto</small></span>
          </button>
          ${expanded ? `
            <div class="etf-detail">
              <div><b>Ticker provati:</b> ${esc(row.tickers_tried || '—')}</div>
              <div><b>Fonte:</b> ${esc(row.source || '—')}</div>
              <div><b>Ultimo close:</b> ${fmtNum(row.latest_close, 4)} il ${fmtDate(row.latest_date)}</div>
              <div><b>ATH assoluto intraday:</b> ${fmtNum(row.all_time_high, 4)} il ${fmtDate(row.all_time_high_date)} (${fmtPct(row.drawdown_from_high_pct)})</div>
              <div><b>ATH 52 settimane intraday:</b> ${fmtNum(row.week_52_high, 4)} il ${fmtDate(row.week_52_high_date)} (${fmtPct(row.drawdown_from_52w_high_pct)})</div>
              <div><b>ATH close assoluto:</b> ${fmtNum(row.all_time_close_high, 4)} il ${fmtDate(row.all_time_close_high_date)} (${fmtPct(row.drawdown_from_close_high_pct)})</div>
              <div><b>Righe storiche usate:</b> ${fmtNum(row.rows_used, 0)}</div>
              ${row.error ? `<div><b>Errore:</b> <span class="small">${esc(row.error)}</span></div>` : ''}
              ${status !== 'ok' ? `<div class="small"><b>Nota:</b> dato escluso dai riepiloghi aggregati finché non viene verificato il ticker o la serie storica.</div>` : ''}
              ${quote ? `<a class="btn" target="_blank" rel="noopener" href="${quote}">Apri su Yahoo Finance</a>` : ''}
            </div>` : ''}
        </div>
      `;
    }).join('');

    els.table.innerHTML = `<div class="etf-table">${body}</div>`;
  }

  function render() {
    renderSummary();
    renderTable();
  }

  async function refreshDataOnce() {
    state.rows = await loadRows({ noCacheFallback: true });
    state.source = 'online';
    render();
  }

  async function pollForUpdatedData(previousGeneratedAt) {
    for (let attempt = 1; attempt <= 12; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 15000));
      try {
        const rows = await loadRows({ noCacheFallback: true });
        const nextGeneratedAt = latestGeneratedAt(rows);
        if (nextGeneratedAt && nextGeneratedAt !== previousGeneratedAt) {
          state.rows = rows;
          state.source = 'online';
          render();
          setUpdateStatus(`Aggiornamento completato. Dati aggiornati al ${new Date(nextGeneratedAt).toLocaleString('it-IT')}.`, 'ok');
          return true;
        }
        setUpdateStatus(`GitHub Action avviata. Attendo nuovi dati… tentativo ${attempt}/12.`, 'info');
      } catch (err) {
        setUpdateStatus(`GitHub Action avviata. Attendo pubblicazione risultati… tentativo ${attempt}/12.`, 'info');
      }
    }
    setUpdateStatus('Aggiornamento avviato, ma i nuovi risultati non sono ancora pubblicati. Apri “GitHub Action” o riprova tra poco.', 'warn');
    return false;
  }

  async function triggerDrawdownUpdate() {
    if (state.refreshing) return;
    if (!client) {
      setUpdateStatus('Supabase client non disponibile: ricarica la pagina e riprova.', 'warn');
      return;
    }

    state.refreshing = true;
    const button = els.updateBtn || $('etfDrawdownUpdateBtn');
    const previousGeneratedAt = latestGeneratedAt();
    if (button) {
      button.disabled = true;
      button.textContent = 'Aggiornamento…';
    }
    setUpdateStatus('Avvio GitHub Action ETF Drawdown…', 'info');

    try {
      const { data, error } = await client.functions.invoke(FUNCTION_NAME, { body: { requested_at: new Date().toISOString() } });
      if (error) throw error;
      if (data && data.ok === false) throw new Error(data.message || data.error || 'Errore avvio GitHub Action');
      setUpdateStatus('GitHub Action avviata. Attendo la pubblicazione del nuovo JSON…', 'info');
      await pollForUpdatedData(previousGeneratedAt);
    } catch (err) {
      const message = err?.message || String(err);
      setUpdateStatus(`Errore: ${message}`, 'warn');
    } finally {
      state.refreshing = false;
      if (button) {
        button.disabled = false;
        button.textContent = 'Aggiorna ETF Drawdown';
      }
    }
  }

  function bindEvents() {
    els.search.addEventListener('input', (event) => {
      state.query = event.target.value;
      renderTable();
    });
    els.status.addEventListener('change', (event) => {
      state.status = event.target.value;
      renderTable();
    });
    els.sort.addEventListener('change', (event) => {
      state.sort = event.target.value;
      renderTable();
    });
    els.table.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-etf-toggle]');
      if (!btn) return;
      const n = Number(btn.dataset.etfToggle);
      state.expanded = state.expanded === n ? null : n;
      renderTable();
    });
    $('etfDrawdownUpdateBtn')?.addEventListener('click', triggerDrawdownUpdate);
  }

  async function init() {
    const root = $('etfDrawdownSection');
    if (!root) return;
    ensureRefreshControls();
    els.summary = $('etfDrawdownSummary');
    els.meta = $('etfDrawdownMeta');
    els.search = $('etfDrawdownSearch');
    els.status = $('etfDrawdownStatus');
    els.sort = $('etfDrawdownSort');
    els.table = $('etfDrawdownTable');
    els.updateBtn = $('etfDrawdownUpdateBtn');
    els.updateStatus = $('etfDrawdownUpdateStatus');
    bindEvents();
    state.rows = await loadRows();
    render();
  }

  window.refreshEtfDrawdownData = refreshDataOnce;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
