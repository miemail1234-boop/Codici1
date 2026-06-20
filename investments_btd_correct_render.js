(() => {
  'use strict';
  if (window.__INVESTMENTS_BTD_CORRECT_RENDER_V2__) return;
  window.__INVESTMENTS_BTD_CORRECT_RENDER_V2__ = true;

  const SUPABASE_URL = 'https://kujyowhezihjambhpahe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
  const TABLE = 'btd_drawdown_assets';
  const JSON_URLS = [
    'https://raw.githubusercontent.com/miemail1234-boop/Codici1/main/finance-drawdown/results/all_drawdowns.json',
    'finance-drawdown/results/all_drawdowns.json'
  ];
  const client = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);
  let expandedId = null;
  let cachedRows = [];

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  const num = value => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; };
  const cleanTicker = value => String(value ?? '').trim().toUpperCase();
  const fmtNum = (value, digits = 2) => num(value) === null ? '—' : new Intl.NumberFormat('it-IT', { maximumFractionDigits: digits }).format(num(value));
  const fmtPct = value => num(value) === null ? '—' : `${new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num(value))}%`;
  const fmtDate = value => value ? new Date(value).toLocaleDateString('it-IT') : '—';

  function primaryDrawdown(row) { return num(row.drawdown_from_52w_high_pct) ?? num(row.drawdown_from_high_pct); }
  function computedStatus(row) {
    if (!row.status) return 'pending';
    if (row.status !== 'ok') return 'failed';
    const ddHigh = num(row.drawdown_from_high_pct);
    const ddClose = num(row.drawdown_from_close_high_pct);
    if (ddHigh !== null && ddHigh < -80 && (num(row.drawdown_from_52w_high_pct) ?? ddHigh) < -30) return 'outlier';
    if (ddHigh !== null && ddClose !== null && Math.abs(ddHigh - ddClose) > 30 && (num(row.drawdown_from_52w_high_pct) ?? 0) < -10) return 'suspicious';
    return 'ok';
  }
  function statusLabel(status) { return { ok: 'Ok', failed: 'Fallito', outlier: 'Outlier', suspicious: 'Da verificare', pending: 'Da aggiornare' }[status] || status; }
  function ddClass(value, status) {
    if (['failed', 'outlier', 'suspicious'].includes(status)) return 'warn';
    const parsed = num(value);
    if (parsed === null) return '';
    if (parsed <= -20) return 'neg strong';
    if (parsed <= -10) return 'neg mid';
    if (parsed >= -1) return 'pos';
    return 'neg';
  }

  async function loadConfig() {
    if (!client) return [];
    const { data, error } = await client.from(TABLE).select('*').order('id', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function loadJson() {
    let lastError = null;
    for (const base of JSON_URLS) {
      try {
        const res = await fetch(`${base}?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`${base} HTTP ${res.status}`);
        const rows = await res.json();
        if (Array.isArray(rows)) return rows;
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error('JSON risultati BTD non disponibile');
  }

  function mergeRows(config, data) {
    const byId = new Map((data || []).map(row => [Number(row.n), row]));
    const byYahoo = new Map();
    (data || []).forEach(row => {
      [row.yahoo_ticker, row.tickers_tried].forEach(value => {
        String(value || '').split(',').map(cleanTicker).filter(Boolean).forEach(ticker => byYahoo.set(ticker, row));
      });
    });
    return (config || []).map(cfg => {
      const dataRow = byYahoo.get(cleanTicker(cfg.yahoo_ticker)) || byId.get(Number(cfg.id)) || {};
      const matched = Boolean(dataRow.status);
      const row = {
        ...dataRow,
        id: Number(cfg.id),
        n: Number(cfg.id),
        asset: cfg.asset,
        yahoo_ticker: cfg.yahoo_ticker || dataRow.yahoo_ticker || '',
        tickers_tried: dataRow.tickers_tried || cfg.yahoo_ticker || '',
        isin: cfg.isin || dataRow.isin || '',
        role: cfg.role || dataRow.role || 'leader',
        category: cfg.category || dataRow.category || '',
        note: cfg.note || dataRow.note || '',
        _matched: matched,
      };
      row._computedStatus = matched ? computedStatus(row) : 'pending';
      return row;
    });
  }

  function filteredRows(rows) {
    const q = document.getElementById('etfDrawdownSearch')?.value?.trim().toLowerCase() || '';
    const status = document.getElementById('etfDrawdownStatus')?.value || 'all';
    const sort = document.getElementById('etfDrawdownSort')?.value || 'drawdown_asc';
    let out = rows.filter(row => {
      if (status !== 'all' && row._computedStatus !== status) return false;
      if (!q) return true;
      return [row.asset, row.isin, row.yahoo_ticker, row.tickers_tried, row.category, row.note].some(value => String(value ?? '').toLowerCase().includes(q));
    });
    out = out.slice().sort((a, b) => {
      if (sort === 'name') return String(a.asset).localeCompare(String(b.asset), 'it');
      if (sort === 'number') return a.n - b.n;
      if (sort === 'drawdown_desc') return (primaryDrawdown(b) ?? -9999) - (primaryDrawdown(a) ?? -9999);
      return (primaryDrawdown(a) ?? 9999) - (primaryDrawdown(b) ?? 9999);
    });
    return out;
  }

  function renderSummary(rows, generatedAt) {
    const summary = document.getElementById('etfDrawdownSummary');
    const meta = document.getElementById('etfDrawdownMeta');
    if (!summary) return;
    const okRows = rows.filter(row => row._computedStatus === 'ok');
    const failed = rows.filter(row => row._computedStatus === 'failed').length;
    const pending = rows.filter(row => row._computedStatus === 'pending').length;
    const suspicious = rows.filter(row => ['outlier', 'suspicious'].includes(row._computedStatus)).length;
    const nearHigh = okRows.filter(row => (primaryDrawdown(row) ?? -999) >= -1).length;
    const drawdowns = okRows.map(primaryDrawdown).filter(value => value !== null).sort((a, b) => a - b);
    const median = drawdowns.length ? drawdowns[Math.floor(drawdowns.length / 2)] : null;
    summary.innerHTML = `
      <div class="etf-card"><span>Totale</span><strong>${rows.length}</strong><small>asset BTD</small></div>
      <div class="etf-card"><span>Ok</span><strong>${okRows.length}</strong><small>dati validi per ticker configurato</small></div>
      <div class="etf-card"><span>Vicini ai massimi</span><strong>${nearHigh}</strong><small>entro -1% da ATH 52 sett.</small></div>
      <div class="etf-card"><span>Mediana drawdown</span><strong>${fmtPct(median)}</strong><small>da ATH 52 sett.</small></div>
      <div class="etf-card"><span>Da aggiornare/verificare</span><strong>${pending + suspicious}</strong><small>${pending} senza dati nuovi</small></div>
      <div class="etf-card"><span>Falliti</span><strong>${failed}</strong><small>ticker non risolti</small></div>`;
    if (meta) meta.textContent = `Fonte: Supabase ticker + JSON raw GitHub per ticker corrispondente. Ultimo JSON: ${generatedAt ? new Date(generatedAt).toLocaleString('it-IT') : '—'}.`;
  }

  function renderTable(rows) {
    const holder = document.getElementById('etfDrawdownTable');
    if (!holder) return;
    const shown = filteredRows(rows);
    if (!shown.length) {
      holder.innerHTML = '<p class="small">Nessun asset corrisponde ai filtri selezionati.</p>';
      return;
    }
    holder.innerHTML = `<div class="etf-table">${shown.map(row => {
      const status = row._computedStatus;
      const expanded = expandedId === row.n;
      const quote = row.yahoo_ticker ? `https://finance.yahoo.com/quote/${encodeURIComponent(row.yahoo_ticker)}` : '';
      return `<div class="etf-row ${status}">
        <div class="etf-main">
          <span class="etf-num">${row.n}</span>
          <span class="etf-name"><strong>${esc(row.asset)}</strong><small>${esc(row.note || row.category || '')}</small></span>
          <label class="etf-edit"><small>Ticker Yahoo</small><input data-btd-field="yahoo_ticker" data-btd-id="${row.n}" value="${esc(row.yahoo_ticker || '')}" placeholder="es. VMIG.L"></label>
          <label class="etf-edit"><small>ISIN broker</small><input data-btd-field="isin" data-btd-id="${row.n}" value="${esc(row.isin || '')}" placeholder="opzionale"></label>
          <span class="etf-status badge ${status}">${statusLabel(status)}</span>
          <span class="etf-price">${fmtNum(row.latest_close, 4)}<small>ultimo ${fmtDate(row.latest_date)}</small></span>
          <span class="etf-price">${fmtNum(row.week_52_high, 4)}<small>ATH 52 sett. ${fmtDate(row.week_52_high_date)}</small></span>
          <span class="etf-dd ${ddClass(row.drawdown_from_52w_high_pct, status)}">${fmtPct(row.drawdown_from_52w_high_pct)}<small>da ATH 52 sett.</small></span>
          <span class="etf-dd ${ddClass(row.drawdown_from_high_pct, status)}">${fmtPct(row.drawdown_from_high_pct)}<small>da ATH assoluto</small></span>
          <button class="btn" type="button" data-btd-toggle="${row.n}" aria-expanded="${expanded ? 'true' : 'false'}">Dettagli</button>
        </div>
        ${expanded ? `<div class="etf-detail"><div><b>Ticker configurato:</b> ${esc(row.yahoo_ticker || '—')}</div><div><b>Ticker nel JSON:</b> ${esc(row.tickers_tried || '—')}</div><div><b>Match:</b> ${row._matched ? 'sì' : 'no'}</div><div><b>Fonte:</b> ${esc(row.source || '—')}</div><div><b>Ultimo close:</b> ${fmtNum(row.latest_close, 4)} il ${fmtDate(row.latest_date)}</div><div><b>ATH 52 settimane:</b> ${fmtNum(row.week_52_high, 4)} il ${fmtDate(row.week_52_high_date)} (${fmtPct(row.drawdown_from_52w_high_pct)})</div>${quote ? `<a class="btn" target="_blank" rel="noopener" href="${quote}">Apri su Yahoo Finance</a>` : ''}</div>` : ''}
      </div>`;
    }).join('')}</div>`;
  }

  async function render() {
    const section = document.getElementById('etfDrawdownSection');
    if (!section) return;
    const descr = section.querySelector('.etf-head .small');
    if (descr) descr.textContent = 'Radar buy-the-dip. I dati vengono mostrati solo quando il ticker nel JSON corrisponde al ticker Yahoo configurato.';
    const [config, jsonRows] = await Promise.all([loadConfig(), loadJson()]);
    const generatedAt = jsonRows.map(row => row.generated_at_utc).filter(Boolean).sort().at(-1) || '';
    cachedRows = mergeRows(config, jsonRows);
    renderSummary(cachedRows, generatedAt);
    renderTable(cachedRows);
  }

  document.addEventListener('click', event => {
    const toggle = event.target.closest?.('[data-btd-toggle]');
    if (toggle) {
      expandedId = expandedId === Number(toggle.dataset.btdToggle) ? null : Number(toggle.dataset.btdToggle);
      renderTable(cachedRows);
    }
    if (event.target.closest?.('#reloadBtn,#etfDrawdownUpdateBtn')) setTimeout(() => render().catch(console.error), 2500);
  }, true);

  document.addEventListener('input', async event => {
    if (event.target.matches?.('#etfDrawdownSearch')) renderTable(cachedRows);
    const input = event.target.closest?.('[data-btd-field]');
    if (!input || !client) return;
    const id = Number(input.dataset.btdId);
    const field = input.dataset.btdField;
    const value = field === 'yahoo_ticker' ? cleanTicker(input.value) : String(input.value || '').trim();
    await client.from(TABLE).update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', id);
    setTimeout(() => render().catch(console.error), 500);
  }, true);

  document.addEventListener('change', event => {
    if (event.target.matches?.('#etfDrawdownStatus,#etfDrawdownSort')) renderTable(cachedRows);
  }, true);

  setTimeout(() => render().catch(console.error), 900);
  setTimeout(() => render().catch(console.error), 2500);
  setInterval(() => render().catch(console.error), 15000);
})();
