(() => {
  'use strict';

  const DATA_URL = 'finance-drawdown/results/all_drawdowns.json';
  const CSV_URL = 'finance-drawdown/results/all_drawdowns.csv';
  const CACHE_KEY = 'lifeTracker.etfDrawdowns.v2';
  const CONFIG_KEY = 'lifeTracker.btdDrawdownAssets.v1';
  const TABLE = 'btd_drawdown_assets';
  const SUPABASE_URL = 'https://kujyowhezihjambhpahe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
  const FUNCTION_NAME = 'trigger-etf-drawdown-update';
  const ACTIONS_URL = 'https://github.com/miemail1234-boop/Codici1/actions/workflows/etf-drawdown.yml';

  const DEFAULT_BTD_ASSETS = [
    { id: 1, asset: 'FTSE All-World / MSCI ACWI', yahoo_ticker: 'VWCE.DE', isin: '', role: 'leader', category: 'Globale core', note: 'Mercato globale' },
    { id: 2, asset: 'S&P 500', yahoo_ticker: 'VUAA.DE', isin: '', role: 'leader', category: 'USA core', note: 'Large cap USA' },
    { id: 3, asset: 'Nasdaq 100', yahoo_ticker: 'SXRV.DE', isin: '', role: 'leader', category: 'USA growth', note: 'Growth/tech' },
    { id: 4, asset: 'Russell 2000', yahoo_ticker: 'IUS3.DE', isin: '', role: 'leader', category: 'USA small cap', note: 'Small cap USA' },
    { id: 5, asset: 'MSCI World Value', yahoo_ticker: 'IWVL.L', isin: '', role: 'leader', category: 'World factor', note: 'Value globale' },
    { id: 6, asset: 'MSCI World Quality', yahoo_ticker: 'IWQU.L', isin: '', role: 'leader', category: 'World factor', note: 'Quality globale' },
    { id: 7, asset: 'MSCI World Minimum Volatility', yahoo_ticker: 'MVOL.L', isin: '', role: 'leader', category: 'World factor', note: 'Difensivo globale' },
    { id: 8, asset: 'STOXX Europe 600', yahoo_ticker: 'EXSA.DE', isin: '', role: 'leader', category: 'Europa core', note: 'Europa ampia' },
    { id: 9, asset: 'STOXX Europe 600 Value', yahoo_ticker: 'EXV1.DE', isin: '', role: 'leader', category: 'Europa value', note: 'Value europeo' },
    { id: 10, asset: 'FTSE 100', yahoo_ticker: 'ISF.L', isin: '', role: 'leader', category: 'UK', note: 'UK large cap' },
    { id: 11, asset: 'FTSE 250', yahoo_ticker: 'MIDD.L', isin: '', role: 'leader', category: 'UK', note: 'UK mid cap' },
    { id: 12, asset: 'DAX', yahoo_ticker: 'EXS1.DE', isin: '', role: 'leader', category: 'Europa paese', note: 'Germania' },
    { id: 13, asset: 'FTSE MIB', yahoo_ticker: 'CSMIB.MI', isin: '', role: 'leader', category: 'Europa paese', note: 'Italia' },
    { id: 14, asset: 'SMI', yahoo_ticker: 'CSSMI.SW', isin: '', role: 'leader', category: 'Europa difensivo', note: 'Svizzera' },
    { id: 15, asset: 'TOPIX / MSCI Japan', yahoo_ticker: 'XTPX.DE', isin: '', role: 'leader', category: 'Giappone', note: 'Giappone ampio' },
    { id: 16, asset: 'MSCI Emerging Markets', yahoo_ticker: 'EIMI.L', isin: '', role: 'leader', category: 'Emergenti', note: 'EM globale' },
    { id: 17, asset: 'Emerging Markets ex China', yahoo_ticker: 'EMXC.L', isin: '', role: 'leader', category: 'Emergenti', note: 'EM senza Cina' },
    { id: 18, asset: 'MSCI India', yahoo_ticker: 'NDIA.L', isin: '', role: 'leader', category: 'Emergenti paese', note: 'India' },
    { id: 19, asset: 'MSCI China', yahoo_ticker: 'ICHN.L', isin: '', role: 'leader', category: 'Emergenti paese', note: 'Cina' },
    { id: 20, asset: 'MSCI Taiwan', yahoo_ticker: 'ITWN.L', isin: '', role: 'leader', category: 'Asia tech', note: 'Semiconduttori Asia' },
    { id: 21, asset: 'MSCI Korea', yahoo_ticker: 'IKOR.L', isin: '', role: 'leader', category: 'Asia tech', note: 'Corea' },
    { id: 22, asset: 'World Health Care', yahoo_ticker: 'WHEA.L', isin: '', role: 'leader', category: 'Settore difensivo', note: 'Healthcare globale' },
    { id: 23, asset: 'World Energy', yahoo_ticker: 'WENS.L', isin: '', role: 'leader', category: 'Settore ciclico', note: 'Energia' },
    { id: 24, asset: 'Rio Tinto / Materials', yahoo_ticker: 'RIO.PA', isin: '', role: 'leader', category: 'Materials', note: 'Mining/materiali' },
    { id: 25, asset: 'Oro', yahoo_ticker: 'SGLN.L', isin: '', role: 'leader', category: 'Real asset', note: 'Gold ETC' },
    { id: 26, asset: 'Bitcoin', yahoo_ticker: 'BTC-EUR', isin: '', role: 'leader', category: 'Crypto', note: 'Proxy Bitcoin' },
    { id: 27, asset: 'Ethereum', yahoo_ticker: 'ETH-EUR', isin: '', role: 'leader', category: 'Crypto', note: 'Proxy Ethereum' },
  ];

  const client = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);

  const state = {
    rows: [],
    config: [],
    query: '',
    status: 'all',
    sort: 'drawdown_asc',
    expanded: null,
    source: 'loading',
    configSource: 'default',
    refreshing: false,
    saving: false,
  };

  const els = {};

  function $(id) { return document.getElementById(id); }
  function num(value) { const n = Number(value); return Number.isFinite(n) ? n : null; }
  function cleanTicker(value) { return String(value ?? '').trim().toUpperCase(); }
  function cleanText(value) { return String(value ?? '').trim(); }

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

  function rowId(row) { return Number(row.id ?? row.n); }
  function primaryDrawdown(row) { return num(row.drawdown_from_52w_high_pct) ?? num(row.drawdown_from_high_pct); }

  function configPayload(asset) {
    return {
      id: rowId(asset),
      asset: cleanText(asset.asset),
      yahoo_ticker: cleanTicker(asset.yahoo_ticker),
      isin: cleanText(asset.isin),
      role: cleanText(asset.role || 'leader'),
      category: cleanText(asset.category),
      note: cleanText(asset.note),
    };
  }

  function defaultConfig() {
    return DEFAULT_BTD_ASSETS.map((a) => ({ ...a }));
  }

  function mergeConfigRows(savedRows = []) {
    const byId = new Map(savedRows.map((r) => [Number(r.id), r]));
    return defaultConfig().map((base) => {
      const saved = byId.get(base.id);
      if (!saved) return base;
      return {
        ...base,
        yahoo_ticker: saved.yahoo_ticker || base.yahoo_ticker,
        isin: saved.isin || '',
        role: saved.role || base.role,
        category: saved.category || base.category,
        note: saved.note || base.note,
      };
    });
  }

  async function loadConfig() {
    const cached = localStorage.getItem(CONFIG_KEY);
    let fallback = defaultConfig();
    if (cached) {
      try { fallback = mergeConfigRows(JSON.parse(cached)); } catch (_) {}
    }
    if (!client) {
      state.configSource = 'default locale';
      return fallback;
    }
    try {
      const { data, error } = await client.from(TABLE).select('*').order('id', { ascending: true });
      if (error) throw error;
      const config = mergeConfigRows(data || []);
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      state.configSource = data?.length ? 'Supabase' : 'default';
      return config;
    } catch (err) {
      state.configSource = `cache/default: ${err.message}`;
      return fallback;
    }
  }

  async function saveAssetConfig(asset) {
    const payload = configPayload(asset);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(state.config));
    if (!client) return false;
    const { error } = await client.from(TABLE).upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    return true;
  }

  async function saveAllConfig() {
    const rows = state.config.map(configPayload).filter((r) => r.yahoo_ticker);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(state.config));
    if (!client || !rows.length) return false;
    const { error } = await client.from(TABLE).upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    return true;
  }

  function computedStatus(row) {
    if (!row.status) return 'pending';
    if (row.status !== 'ok') return 'failed';
    const ddHigh = num(row.drawdown_from_high_pct);
    const ddClose = num(row.drawdown_from_close_high_pct);
    if (ddHigh !== null && ddHigh < -80 && (num(row.drawdown_from_52w_high_pct) ?? ddHigh) < -30) return 'outlier';
    if (ddHigh !== null && ddClose !== null && Math.abs(ddHigh - ddClose) > 30 && (num(row.drawdown_from_52w_high_pct) ?? 0) < -10) return 'suspicious';
    return 'ok';
  }

  function statusLabel(status) {
    return { ok: 'Ok', failed: 'Fallito', outlier: 'Outlier', suspicious: 'Da verificare', pending: 'Da aggiornare' }[status] || status;
  }

  function ddClass(value, status) {
    if (['failed', 'outlier', 'suspicious'].includes(status)) return 'warn';
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
    }));
  }

  function mergedRows() {
    const dataByN = new Map(state.rows.map((row) => [Number(row.n), row]));
    const dataByTicker = new Map(state.rows.map((row) => [cleanTicker(row.yahoo_ticker || row.tickers_tried), row]));
    return state.config.map((cfg) => {
      const data = dataByN.get(cfg.id) || dataByTicker.get(cleanTicker(cfg.yahoo_ticker)) || {};
      const row = {
        ...data,
        n: cfg.id,
        id: cfg.id,
        asset: cfg.asset,
        yahoo_ticker: data.yahoo_ticker || cfg.yahoo_ticker,
        tickers_tried: data.tickers_tried || cfg.yahoo_ticker,
        isin: cfg.isin || data.isin || '',
        role: cfg.role || data.role || 'leader',
        category: cfg.category || data.category || '',
        note: cfg.note || data.note || '',
      };
      row._computedStatus = computedStatus(row);
      return row;
    });
  }

  function latestGeneratedAt(rows = state.rows) {
    return rows.map((row) => row.generated_at_utc).filter(Boolean).sort().at(-1) || '';
  }

  function dataUrl() { return `${DATA_URL}?t=${Date.now()}`; }

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
    const title = root.querySelector('h2');
    if (title) title.textContent = 'BTD Radar';
    const descr = root.querySelector('.etf-head .small');
    if (descr) descr.textContent = 'Radar buy-the-dip su 27 asset leader. Modifica il ticker Yahoo e premi aggiorna per ricalcolare prezzo, ATH 52 settimane, ATH assoluto e drawdown.';
    const head = root.querySelector('.etf-head');
    if (!head) return;
    const actions = document.createElement('div');
    actions.className = 'etf-update-actions';
    actions.innerHTML = `
      <button class="btn primary" type="button" id="etfDrawdownUpdateBtn">Aggiorna BTD Radar</button>
      <a class="btn" href="${CSV_URL}" target="_blank" rel="noopener">Scarica CSV</a>
      <a class="btn" href="${ACTIONS_URL}" target="_blank" rel="noopener">GitHub Action</a>
    `;
    const oldCsv = head.querySelector(`a[href="${CSV_URL}"]`);
    oldCsv?.remove();
    head.appendChild(actions);
    const status = document.createElement('p');
    status.className = 'small';
    status.id = 'etfDrawdownUpdateStatus';
    status.textContent = 'Modifica i ticker Yahoo se necessario, poi premi “Aggiorna BTD Radar”.';
    head.insertAdjacentElement('afterend', status);
    els.updateBtn = $('etfDrawdownUpdateBtn');
    els.updateStatus = status;
  }

  function getFilteredRows() {
    const q = state.query.trim().toLowerCase();
    let rows = mergedRows().filter((row) => {
      const status = row._computedStatus;
      if (state.status !== 'all' && status !== state.status) return false;
      if (!q) return true;
      return [row.asset, row.isin, row.yahoo_ticker, row.tickers_tried, row.source, row.category, row.note]
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
    const rows = mergedRows();
    const total = rows.length;
    const okRows = rows.filter((r) => r._computedStatus === 'ok');
    const failed = rows.filter((r) => r._computedStatus === 'failed').length;
    const pending = rows.filter((r) => r._computedStatus === 'pending').length;
    const suspicious = rows.filter((r) => ['outlier', 'suspicious'].includes(r._computedStatus)).length;
    const nearHigh = okRows.filter((r) => (primaryDrawdown(r) ?? -999) >= -1).length;
    const drawdowns = okRows.map(primaryDrawdown).filter((v) => v !== null).sort((a, b) => a - b);
    const median = drawdowns.length ? drawdowns[Math.floor(drawdowns.length / 2)] : null;
    const updated = latestGeneratedAt();

    els.summary.innerHTML = `
      <div class="etf-card"><span>Totale</span><strong>${total}</strong><small>asset leader BTD</small></div>
      <div class="etf-card"><span>Ok</span><strong>${okRows.length}</strong><small>dati validi</small></div>
      <div class="etf-card"><span>Vicini ai massimi</span><strong>${nearHigh}</strong><small>entro -1% da ATH 52 sett.</small></div>
      <div class="etf-card"><span>Mediana drawdown</span><strong>${fmtPct(median)}</strong><small>da ATH 52 sett.</small></div>
      <div class="etf-card"><span>Da verificare</span><strong>${suspicious + pending}</strong><small>${pending} da aggiornare</small></div>
      <div class="etf-card"><span>Falliti</span><strong>${failed}</strong><small>ticker non risolti</small></div>
    `;

    els.meta.textContent = `Fonte: ${state.source}. Config ticker: ${state.configSource}. Ultimo aggiornamento dati: ${updated ? new Date(updated).toLocaleString('it-IT') : '—'}.`;
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
          <div class="etf-main">
            <span class="etf-num">${row.n}</span>
            <span class="etf-name"><strong>${esc(row.asset)}</strong><small>${esc(row.category || row.note || '')}</small></span>
            <label class="etf-edit"><small>Ticker Yahoo</small><input data-config-field="yahoo_ticker" data-config-id="${row.n}" value="${esc(row.yahoo_ticker || '')}" placeholder="es. SXRV.DE"></label>
            <label class="etf-edit"><small>ISIN broker</small><input data-config-field="isin" data-config-id="${row.n}" value="${esc(row.isin || '')}" placeholder="opzionale"></label>
            <span class="etf-status badge ${status}">${statusLabel(status)}</span>
            <span class="etf-price">${fmtNum(row.latest_close, 4)}<small>ultimo ${fmtDate(row.latest_date)}</small></span>
            <span class="etf-price">${fmtNum(row.week_52_high, 4)}<small>ATH 52 sett. ${fmtDate(row.week_52_high_date)}</small></span>
            <span class="etf-dd ${ddClass(dd52, status)}">${fmtPct(dd52)}<small>da ATH 52 sett.</small></span>
            <span class="etf-dd ${ddClass(dd, status)}">${fmtPct(dd)}<small>da ATH assoluto</small></span>
            <button class="btn" type="button" data-etf-toggle="${row.n}" aria-expanded="${expanded ? 'true' : 'false'}">Dettagli</button>
          </div>
          ${expanded ? `
            <div class="etf-detail">
              <div><b>Ticker usato:</b> ${esc(row.yahoo_ticker || '—')}</div>
              <div><b>ISIN broker:</b> ${esc(row.isin || '—')}</div>
              <div><b>Fonte:</b> ${esc(row.source || '—')}</div>
              <div><b>Ultimo close:</b> ${fmtNum(row.latest_close, 4)} il ${fmtDate(row.latest_date)}</div>
              <div><b>ATH 52 settimane intraday:</b> ${fmtNum(row.week_52_high, 4)} il ${fmtDate(row.week_52_high_date)} (${fmtPct(row.drawdown_from_52w_high_pct)})</div>
              <div><b>ATH assoluto intraday:</b> ${fmtNum(row.all_time_high, 4)} il ${fmtDate(row.all_time_high_date)} (${fmtPct(row.drawdown_from_high_pct)})</div>
              <div><b>ATH close assoluto:</b> ${fmtNum(row.all_time_close_high, 4)} il ${fmtDate(row.all_time_close_high_date)} (${fmtPct(row.drawdown_from_close_high_pct)})</div>
              <div><b>Righe storiche usate:</b> ${fmtNum(row.rows_used, 0)}</div>
              ${row.error ? `<div><b>Errore:</b> <span class="small">${esc(row.error)}</span></div>` : ''}
              ${quote ? `<a class="btn" target="_blank" rel="noopener" href="${quote}">Apri su Yahoo Finance</a>` : ''}
            </div>` : ''}
        </div>
      `;
    }).join('');

    els.table.innerHTML = `<div class="etf-table">${body}</div>`;
  }

  function render() { renderSummary(); renderTable(); }

  async function refreshDataOnce() {
    state.config = await loadConfig();
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
    if (button) { button.disabled = true; button.textContent = 'Aggiornamento…'; }
    setUpdateStatus('Salvo ticker Yahoo e avvio GitHub Action…', 'info');

    try {
      await saveAllConfig();
      const { data, error } = await client.functions.invoke(FUNCTION_NAME, { body: { requested_at: new Date().toISOString() } });
      if (error) throw error;
      if (data && data.ok === false) throw new Error(data.message || data.error || 'Errore avvio GitHub Action');
      setUpdateStatus(`GitHub Action avviata con ${data?.assets_sent || state.config.length} asset. Attendo il nuovo JSON…`, 'info');
      await pollForUpdatedData(previousGeneratedAt);
    } catch (err) {
      const message = err?.message || String(err);
      setUpdateStatus(`Errore: ${message}`, 'warn');
    } finally {
      state.refreshing = false;
      if (button) { button.disabled = false; button.textContent = 'Aggiorna BTD Radar'; }
    }
  }

  function updateLocalConfig(id, field, value) {
    const asset = state.config.find((row) => row.id === id);
    if (!asset) return null;
    asset[field] = field === 'yahoo_ticker' ? cleanTicker(value) : cleanText(value);
    return asset;
  }

  function bindEvents() {
    els.search.addEventListener('input', (event) => { state.query = event.target.value; renderTable(); });
    els.status.addEventListener('change', (event) => { state.status = event.target.value; renderTable(); });
    els.sort.addEventListener('change', (event) => { state.sort = event.target.value; renderTable(); });

    els.table.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-etf-toggle]');
      if (!btn) return;
      const n = Number(btn.dataset.etfToggle);
      state.expanded = state.expanded === n ? null : n;
      renderTable();
    });

    els.table.addEventListener('change', async (event) => {
      const input = event.target.closest('[data-config-field]');
      if (!input) return;
      const id = Number(input.dataset.configId);
      const field = input.dataset.configField;
      const asset = updateLocalConfig(id, field, input.value);
      if (!asset) return;
      input.value = asset[field] || '';
      setUpdateStatus(`Salvo ${field === 'yahoo_ticker' ? 'ticker Yahoo' : 'ISIN'} per ${asset.asset}…`, 'info');
      try {
        await saveAssetConfig(asset);
        setUpdateStatus(`Salvato. Premi “Aggiorna BTD Radar” per ricalcolare usando ${asset.yahoo_ticker}.`, 'ok');
      } catch (err) {
        setUpdateStatus(`Errore salvataggio: ${err.message}`, 'warn');
      }
      render();
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
    state.config = await loadConfig();
    state.rows = await loadRows();
    render();
  }

  window.refreshEtfDrawdownData = refreshDataOnce;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
