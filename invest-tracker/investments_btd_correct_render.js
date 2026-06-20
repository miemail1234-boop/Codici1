(() => {
  'use strict';
  if (window.__BTD_EDGE_RENDERER__) return;
  window.__BTD_EDGE_RENDERER__ = true;

  const SUPABASE_URL = 'https://kujyowhezihjambhpahe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
  const FUNCTION_NAME = 'btd-current-scan';
  const client = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);

  const state = { rows: [], query: '', status: 'all', sort: 'drawdown_asc', generatedAt: '' };
  const $ = id => document.getElementById(id);
  const n = value => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; };
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
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

  function statusLabel(value) {
    return { ok: 'Ok', failed: 'Fallito', outlier: 'Outlier', suspicious: 'Da verificare', pending: 'Da aggiornare' }[value] || value;
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

  function setStatus(message, tone = 'info') {
    let node = $('etfDrawdownUpdateStatus');
    const root = $('etfDrawdownSection');
    if (!node && root) {
      node = document.createElement('p');
      node.className = 'small';
      node.id = 'etfDrawdownUpdateStatus';
      root.querySelector('.etf-head')?.insertAdjacentElement('afterend', node);
    }
    if (!node) return;
    node.textContent = message;
    node.dataset.tone = tone;
  }

  function ensureControls() {
    const root = $('etfDrawdownSection');
    if (!root) return;
    const description = root.querySelector('.etf-head .small');
    if (description) description.textContent = 'Radar buy-the-dip con calcolo diretto: Supabase Edge Function + Yahoo Chart API. Nessuna GitHub Action e nessun JSON cacheato.';
    const head = root.querySelector('.etf-head');
    if (head && !$('etfDrawdownUpdateBtn')) {
      const actions = document.createElement('div');
      actions.className = 'etf-update-actions';
      actions.innerHTML = '<button class="btn primary" type="button" id="etfDrawdownUpdateBtn">Aggiorna BTD Radar</button>';
      head.appendChild(actions);
    }
    root.querySelector('a[href*="all_drawdowns.csv"]')?.remove();
    setStatus('Nuovo metodo attivo: calcolo diretto, senza GitHub Action.', 'ok');
  }

  function normalizedRows() {
    return state.rows.map(row => ({ ...row, _computedStatus: computedStatus(row) }));
  }

  function filteredRows() {
    const q = state.query.toLowerCase().trim();
    let rows = normalizedRows().filter(row => {
      if (state.status !== 'all' && row._computedStatus !== state.status) return false;
      if (!q) return true;
      return [row.asset, row.category, row.note, row.yahoo_ticker, row.tickers_tried, row.isin, row.error].some(value => String(value ?? '').toLowerCase().includes(q));
    });
    rows.sort((a, b) => {
      if (state.sort === 'name') return String(a.asset).localeCompare(String(b.asset), 'it');
      if (state.sort === 'number') return Number(a.n) - Number(b.n);
      if (state.sort === 'drawdown_desc') return (primaryDrawdown(b) ?? -9999) - (primaryDrawdown(a) ?? -9999);
      return (primaryDrawdown(a) ?? 9999) - (primaryDrawdown(b) ?? 9999);
    });
    return rows;
  }

  function renderSummary() {
    const summary = $('etfDrawdownSummary');
    const meta = $('etfDrawdownMeta');
    if (!summary) return;
    const rows = normalizedRows();
    const okRows = rows.filter(row => row._computedStatus === 'ok');
    const pending = rows.filter(row => row._computedStatus === 'pending').length;
    const failed = rows.filter(row => row._computedStatus === 'failed').length;
    const suspicious = rows.filter(row => ['outlier', 'suspicious'].includes(row._computedStatus)).length;
    const nearHigh = okRows.filter(row => (primaryDrawdown(row) ?? -999) >= -1).length;
    const drawdowns = okRows.map(primaryDrawdown).filter(value => value !== null).sort((a, b) => a - b);
    const median = drawdowns.length ? drawdowns[Math.floor(drawdowns.length / 2)] : null;
    summary.innerHTML = `<div class="etf-card"><span>Totale</span><strong>${rows.length}</strong><small>asset BTD</small></div><div class="etf-card"><span>Ok</span><strong>${okRows.length}</strong><small>dati calcolati ora</small></div><div class="etf-card"><span>Vicini ai massimi</span><strong>${nearHigh}</strong><small>entro -1% da ATH 52 sett.</small></div><div class="etf-card"><span>Mediana drawdown</span><strong>${fmtPct(median)}</strong><small>da ATH 52 sett.</small></div><div class="etf-card"><span>Da aggiornare/verificare</span><strong>${pending + suspicious}</strong><small>${pending} senza dati</small></div><div class="etf-card"><span>Falliti</span><strong>${failed}</strong><small>ticker non risolti</small></div>`;
    if (meta) meta.textContent = `Fonte: Supabase Edge Function + Yahoo Chart API. Ultimo calcolo: ${state.generatedAt ? new Date(state.generatedAt).toLocaleString('it-IT') : '—'}.`;
  }

  function renderTable() {
    const table = $('etfDrawdownTable');
    if (!table) return;
    const rows = filteredRows();
    if (!rows.length) {
      table.innerHTML = '<p class="small">Nessun asset BTD corrisponde ai filtri.</p>';
      return;
    }
    table.innerHTML = `<div class="etf-table">${rows.map(row => {
      const status = row._computedStatus;
      const quote = row.yahoo_ticker ? `https://finance.yahoo.com/quote/${encodeURIComponent(row.yahoo_ticker)}` : '';
      return `<div class="etf-row ${status}"><div class="etf-main"><span class="etf-num">${esc(row.n)}</span><span class="etf-name"><strong>${esc(row.asset)}</strong><small>${esc(row.note || row.category || '')}</small></span><label class="etf-edit"><small>Ticker Yahoo</small><input value="${esc(row.yahoo_ticker || '')}" readonly></label><label class="etf-edit"><small>ISIN broker</small><input value="${esc(row.isin || '')}" readonly></label><span class="etf-status badge ${status}">${statusLabel(status)}</span><span class="etf-price">${fmtNum(row.latest_close, 4)}<small>ultimo ${fmtDate(row.latest_date)}</small></span><span class="etf-price">${fmtNum(row.week_52_high, 4)}<small>ATH 52 sett. ${fmtDate(row.week_52_high_date)}</small></span><span class="etf-dd ${ddClass(row.drawdown_from_52w_high_pct, status)}">${fmtPct(row.drawdown_from_52w_high_pct)}<small>da ATH 52 sett.</small></span><span class="etf-dd ${ddClass(row.drawdown_from_high_pct, status)}">${fmtPct(row.drawdown_from_high_pct)}<small>da ATH assoluto</small></span>${quote ? `<a class="btn" target="_blank" rel="noopener" href="${quote}">Yahoo</a>` : ''}</div>${row.error ? `<div class="etf-detail"><b>Errore:</b> <span class="small">${esc(row.error)}</span></div>` : ''}</div>`;
    }).join('')}</div>`;
  }

  function render() {
    renderSummary();
    renderTable();
  }

  async function scan() {
    if (!client) {
      setStatus('Supabase client non disponibile: ricarica la pagina.', 'warn');
      return;
    }
    ensureControls();
    const btn = $('etfDrawdownUpdateBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Calcolo…'; }
    setStatus('Calcolo diretto BTD in corso…', 'info');
    try {
      const { data, error } = await client.functions.invoke(FUNCTION_NAME, { body: { requested_at: new Date().toISOString() } });
      if (error) throw error;
      if (data?.ok === false) throw new Error(data.message || data.error || 'Errore Edge Function');
      state.rows = Array.isArray(data?.results) ? data.results : [];
      state.generatedAt = data?.generated_at_utc || new Date().toISOString();
      render();
      setStatus(`Calcolo diretto completato: ${state.rows.length} asset.`, 'ok');
    } catch (err) {
      setStatus(`Errore calcolo diretto BTD: ${err.message || String(err)}`, 'warn');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Aggiorna BTD Radar'; }
    }
  }

  document.addEventListener('click', event => {
    const btn = event.target.closest?.('#etfDrawdownUpdateBtn');
    if (!btn) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    scan();
  }, true);

  document.addEventListener('click', event => {
    if (event.target.closest?.('#reloadBtn')) setTimeout(scan, 600);
  }, true);

  document.addEventListener('input', event => {
    if (!event.target.matches?.('#etfDrawdownSearch')) return;
    state.query = event.target.value || '';
    renderTable();
  }, true);

  document.addEventListener('change', event => {
    if (event.target.matches?.('#etfDrawdownStatus')) { state.status = event.target.value || 'all'; renderTable(); }
    if (event.target.matches?.('#etfDrawdownSort')) { state.sort = event.target.value || 'drawdown_asc'; renderTable(); }
  }, true);

  function boot() {
    ensureControls();
    setTimeout(scan, 800);
    setTimeout(scan, 3000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
