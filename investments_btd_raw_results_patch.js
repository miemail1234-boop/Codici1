(() => {
  'use strict';
  if (window.__INVESTMENTS_BTD_RAW_RESULTS_PATCH__) return;
  window.__INVESTMENTS_BTD_RAW_RESULTS_PATCH__ = true;

  const RAW_JSON = 'https://raw.githubusercontent.com/miemail1234-boop/Codici1/main/finance-drawdown/results/all_drawdowns.json';
  const SUPABASE_URL = 'https://kujyowhezihjambhpahe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
  const TABLE = 'btd_drawdown_assets';
  const client = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);

  const n = value => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  const cleanTicker = value => String(value ?? '').trim().toUpperCase();
  const fmtNum = (value, digits = 2) => n(value) === null ? '—' : new Intl.NumberFormat('it-IT', { maximumFractionDigits: digits }).format(n(value));
  const fmtPct = value => n(value) === null ? '—' : `${new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n(value))}%`;
  const fmtDate = value => value ? new Date(value).toLocaleDateString('it-IT') : '—';
  const primaryDrawdown = row => n(row.drawdown_from_52w_high_pct) ?? n(row.drawdown_from_high_pct);

  function computedStatus(row) {
    if (!row.status) return 'pending';
    if (row.status !== 'ok') return 'failed';
    const ddHigh = n(row.drawdown_from_high_pct);
    const ddClose = n(row.drawdown_from_close_high_pct);
    if (ddHigh !== null && ddHigh < -80 && (n(row.drawdown_from_52w_high_pct) ?? ddHigh) < -30) return 'outlier';
    if (ddHigh !== null && ddClose !== null && Math.abs(ddHigh - ddClose) > 30 && (n(row.drawdown_from_52w_high_pct) ?? 0) < -10) return 'suspicious';
    return 'ok';
  }
  function statusLabel(status) {
    return { ok: 'Ok', failed: 'Fallito', outlier: 'Outlier', suspicious: 'Da verificare', pending: 'Da aggiornare' }[status] || status;
  }
  function ddClass(value, status) {
    if (['failed', 'outlier', 'suspicious'].includes(status)) return 'warn';
    const x = n(value);
    if (x === null) return '';
    if (x <= -20) return 'neg strong';
    if (x <= -10) return 'neg mid';
    if (x >= -1) return 'pos';
    return 'neg';
  }

  async function loadConfig() {
    if (!client) return [];
    const { data, error } = await client.from(TABLE).select('*').order('id', { ascending: true });
    if (error) throw error;
    return data || [];
  }
  async function loadResults() {
    const res = await fetch(`${RAW_JSON}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`raw JSON HTTP ${res.status}`);
    return await res.json();
  }

  function mergeRows(config, results) {
    const byId = new Map((results || []).map(row => [Number(row.n), row]));
    const byTicker = new Map((results || []).map(row => [cleanTicker(row.yahoo_ticker || row.tickers_tried), row]));
    return (config || []).map(cfg => {
      const data = byId.get(Number(cfg.id)) || byTicker.get(cleanTicker(cfg.yahoo_ticker)) || {};
      const row = {
        ...data,
        id: Number(cfg.id),
        n: Number(cfg.id),
        asset: cfg.asset,
        yahoo_ticker: data.yahoo_ticker || cfg.yahoo_ticker,
        tickers_tried: data.tickers_tried || cfg.yahoo_ticker,
        isin: cfg.isin || data.isin || '',
        role: cfg.role || data.role || 'leader',
        category: cfg.category || data.category || '',
        note: cfg.note || data.note || ''
      };
      row._computedStatus = computedStatus(row);
      return row;
    });
  }

  function renderSummary(rows) {
    const summary = document.getElementById('etfDrawdownSummary');
    const meta = document.getElementById('etfDrawdownMeta');
    if (!summary) return;
    const okRows = rows.filter(row => row._computedStatus === 'ok');
    const pending = rows.filter(row => row._computedStatus === 'pending').length;
    const suspicious = rows.filter(row => ['outlier', 'suspicious'].includes(row._computedStatus)).length;
    const failed = rows.filter(row => row._computedStatus === 'failed').length;
    const nearHigh = okRows.filter(row => (primaryDrawdown(row) ?? -999) >= -1).length;
    const drawdowns = okRows.map(primaryDrawdown).filter(value => value !== null).sort((a, b) => a - b);
    const median = drawdowns.length ? drawdowns[Math.floor(drawdowns.length / 2)] : null;
    const updated = rows.map(row => row.generated_at_utc).filter(Boolean).sort().at(-1);
    summary.innerHTML = `<div class="etf-card"><span>Totale</span><strong>${rows.length}</strong><small>asset BTD</small></div><div class="etf-card"><span>Ok</span><strong>${okRows.length}</strong><small>dati validi dal JSON raw</small></div><div class="etf-card"><span>Vicini ai massimi</span><strong>${nearHigh}</strong><small>entro -1% da ATH 52 sett.</small></div><div class="etf-card"><span>Mediana drawdown</span><strong>${fmtPct(median)}</strong><small>da ATH 52 sett.</small></div><div class="etf-card"><span>Da aggiornare/verificare</span><strong>${suspicious + pending}</strong><small>${pending} senza dati nuovi</small></div><div class="etf-card"><span>Falliti</span><strong>${failed}</strong><small>ticker non risolti</small></div>`;
    if (meta) meta.textContent = `Fonte: Supabase ticker + JSON raw GitHub. Ultimo JSON: ${updated ? new Date(updated).toLocaleString('it-IT') : '—'}.`;
  }

  function filteredRows(rows) {
    const q = document.getElementById('etfDrawdownSearch')?.value?.trim().toLowerCase() || '';
    const filter = document.getElementById('etfDrawdownStatus')?.value || 'all';
    const sort = document.getElementById('etfDrawdownSort')?.value || 'drawdown_asc';
    let out = rows.filter(row => {
      if (filter !== 'all' && row._computedStatus !== filter) return false;
      if (!q) return true;
      return [row.asset, row.isin, row.yahoo_ticker, row.tickers_tried, row.source, row.category, row.note].some(value => String(value ?? '').toLowerCase().includes(q));
    });
    out = out.sort((a, b) => {
      if (sort === 'name') return String(a.asset).localeCompare(String(b.asset), 'it');
      if (sort === 'number') return a.n - b.n;
      if (sort === 'drawdown_desc') return (primaryDrawdown(b) ?? -9999) - (primaryDrawdown(a) ?? -9999);
      return (primaryDrawdown(a) ?? 9999) - (primaryDrawdown(b) ?? 9999);
    });
    return out;
  }

  function renderTable(rows) {
    const table = document.getElementById('etfDrawdownTable');
    if (!table) return;
    const list = filteredRows(rows);
    table.innerHTML = `<div class="etf-table">${list.map(row => {
      const st = row._computedStatus;
      const dd52 = row.drawdown_from_52w_high_pct;
      const dd = row.drawdown_from_high_pct;
      const quote = row.yahoo_ticker ? `https://finance.yahoo.com/quote/${encodeURIComponent(row.yahoo_ticker)}` : '';
      return `<div class="etf-row ${st}"><div class="etf-main"><span class="etf-num">${row.n}</span><span class="etf-name"><strong>${esc(row.asset)}</strong><small>${esc(row.note || row.category || '')}</small></span><label class="etf-edit"><small>Ticker Yahoo</small><input value="${esc(row.yahoo_ticker || '')}" readonly></label><label class="etf-edit"><small>ISIN broker</small><input value="${esc(row.isin || '')}" readonly></label><span class="etf-status badge ${st}">${statusLabel(st)}</span><span class="etf-price">${fmtNum(row.latest_close, 4)}<small>ultimo ${fmtDate(row.latest_date)}</small></span><span class="etf-price">${fmtNum(row.week_52_high, 4)}<small>ATH 52 sett. ${fmtDate(row.week_52_high_date)}</small></span><span class="etf-dd ${ddClass(dd52, st)}">${fmtPct(dd52)}<small>da ATH 52 sett.</small></span><span class="etf-dd ${ddClass(dd, st)}">${fmtPct(dd)}<small>da ATH assoluto</small></span>${quote ? `<a class="btn" target="_blank" rel="noopener" href="${quote}">Yahoo</a>` : ''}</div></div>`;
    }).join('')}</div>`;
  }

  let current = [];
  async function render() {
    const root = document.getElementById('etfDrawdownSection');
    if (!root) return;
    const [config, results] = await Promise.all([loadConfig(), loadResults()]);
    current = mergeRows(config, results);
    renderSummary(current);
    renderTable(current);
  }

  document.addEventListener('input', event => {
    if (event.target.matches?.('#etfDrawdownSearch')) renderTable(current);
  }, true);
  document.addEventListener('change', event => {
    if (event.target.matches?.('#etfDrawdownStatus,#etfDrawdownSort')) renderTable(current);
  }, true);
  document.addEventListener('click', event => {
    if (event.target.closest?.('#reloadBtn,#etfDrawdownUpdateBtn')) setTimeout(() => render().catch(console.error), 2500);
  }, true);

  function boot() {
    setTimeout(() => render().catch(console.error), 600);
    setTimeout(() => render().catch(console.error), 1800);
    setTimeout(() => render().catch(console.error), 4200);
    setInterval(() => render().catch(console.error), 15000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
