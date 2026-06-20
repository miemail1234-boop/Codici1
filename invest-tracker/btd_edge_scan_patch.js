(() => {
  'use strict';
  if (window.__BTD_EDGE_SCAN_PATCH__) return;
  window.__BTD_EDGE_SCAN_PATCH__ = true;

  const SUPABASE_URL = 'https://kujyowhezihjambhpahe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
  const FUNCTION_NAME = 'btd-current-scan';
  const client = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);

  const n = value => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; };
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  const fmtNum = (value, digits = 2) => n(value) === null ? '—' : new Intl.NumberFormat('it-IT', { maximumFractionDigits: digits }).format(n(value));
  const fmtPct = value => n(value) === null ? '—' : `${new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n(value))}%`;
  const fmtDate = value => value ? new Date(value).toLocaleDateString('it-IT') : '—';
  const primaryDrawdown = row => n(row.drawdown_from_52w_high_pct) ?? n(row.drawdown_from_high_pct);

  function status(row) {
    if (!row.status) return 'pending';
    if (row.status !== 'ok') return 'failed';
    const ddHigh = n(row.drawdown_from_high_pct);
    const ddClose = n(row.drawdown_from_close_high_pct);
    if (ddHigh !== null && ddHigh < -80 && (n(row.drawdown_from_52w_high_pct) ?? ddHigh) < -30) return 'outlier';
    if (ddHigh !== null && ddClose !== null && Math.abs(ddHigh - ddClose) > 30 && (n(row.drawdown_from_52w_high_pct) ?? 0) < -10) return 'suspicious';
    return 'ok';
  }
  function statusLabel(value) { return { ok: 'Ok', failed: 'Fallito', outlier: 'Outlier', suspicious: 'Da verificare', pending: 'Da aggiornare' }[value] || value; }
  function ddClass(value, st) {
    if (['failed', 'outlier', 'suspicious'].includes(st)) return 'warn';
    const x = n(value);
    if (x === null) return '';
    if (x <= -20) return 'neg strong';
    if (x <= -10) return 'neg mid';
    if (x >= -1) return 'pos';
    return 'neg';
  }

  function stopOldPolling() {
    const btn = document.getElementById('etfDrawdownUpdateBtn');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Aggiorna BTD Radar';
    }
    const statusNode = document.getElementById('etfDrawdownUpdateStatus');
    if (statusNode) statusNode.textContent = 'Nuovo metodo attivo: calcolo diretto via Supabase Edge Function, senza GitHub Action/JSON.';
  }

  function renderSummary(rows, generatedAt) {
    const summary = document.getElementById('etfDrawdownSummary');
    const meta = document.getElementById('etfDrawdownMeta');
    if (!summary) return;
    const normalized = rows.map(row => ({ ...row, _computedStatus: status(row) }));
    const okRows = normalized.filter(row => row._computedStatus === 'ok');
    const pending = normalized.filter(row => row._computedStatus === 'pending').length;
    const failed = normalized.filter(row => row._computedStatus === 'failed').length;
    const suspicious = normalized.filter(row => ['outlier', 'suspicious'].includes(row._computedStatus)).length;
    const nearHigh = okRows.filter(row => (primaryDrawdown(row) ?? -999) >= -1).length;
    const dd = okRows.map(primaryDrawdown).filter(v => v !== null).sort((a, b) => a - b);
    const median = dd.length ? dd[Math.floor(dd.length / 2)] : null;
    summary.innerHTML = `<div class="etf-card"><span>Totale</span><strong>${normalized.length}</strong><small>asset BTD</small></div><div class="etf-card"><span>Ok</span><strong>${okRows.length}</strong><small>dati calcolati ora</small></div><div class="etf-card"><span>Vicini ai massimi</span><strong>${nearHigh}</strong><small>entro -1% da ATH 52 sett.</small></div><div class="etf-card"><span>Mediana drawdown</span><strong>${fmtPct(median)}</strong><small>da ATH 52 sett.</small></div><div class="etf-card"><span>Da aggiornare/verificare</span><strong>${suspicious + pending}</strong><small>${pending} senza dati</small></div><div class="etf-card"><span>Falliti</span><strong>${failed}</strong><small>ticker non risolti</small></div>`;
    if (meta) meta.textContent = `Fonte: Supabase Edge Function + Yahoo Chart API. Ultimo calcolo: ${generatedAt ? new Date(generatedAt).toLocaleString('it-IT') : '—'}.`;
  }

  function currentRows(rows) {
    const q = document.getElementById('etfDrawdownSearch')?.value?.trim().toLowerCase() || '';
    const filter = document.getElementById('etfDrawdownStatus')?.value || 'all';
    const sort = document.getElementById('etfDrawdownSort')?.value || 'drawdown_asc';
    let out = rows.map(row => ({ ...row, _computedStatus: status(row) })).filter(row => {
      if (filter !== 'all' && row._computedStatus !== filter) return false;
      if (!q) return true;
      return [row.asset, row.isin, row.yahoo_ticker, row.tickers_tried, row.source, row.category, row.note].some(value => String(value ?? '').toLowerCase().includes(q));
    });
    out = out.slice().sort((a, b) => {
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
    const list = currentRows(rows);
    if (!list.length) {
      table.innerHTML = '<p class="small">Nessun asset BTD corrisponde ai filtri.</p>';
      return;
    }
    table.innerHTML = `<div class="etf-table">${list.map(row => {
      const st = row._computedStatus;
      const quote = row.yahoo_ticker ? `https://finance.yahoo.com/quote/${encodeURIComponent(row.yahoo_ticker)}` : '';
      return `<div class="etf-row ${st}"><div class="etf-main"><span class="etf-num">${row.n}</span><span class="etf-name"><strong>${esc(row.asset)}</strong><small>${esc(row.note || row.category || '')}</small></span><label class="etf-edit"><small>Ticker Yahoo</small><input value="${esc(row.yahoo_ticker || '')}" readonly></label><label class="etf-edit"><small>ISIN broker</small><input value="${esc(row.isin || '')}" readonly></label><span class="etf-status badge ${st}">${statusLabel(st)}</span><span class="etf-price">${fmtNum(row.latest_close, 4)}<small>ultimo ${fmtDate(row.latest_date)}</small></span><span class="etf-price">${fmtNum(row.week_52_high, 4)}<small>ATH 52 sett. ${fmtDate(row.week_52_high_date)}</small></span><span class="etf-dd ${ddClass(row.drawdown_from_52w_high_pct, st)}">${fmtPct(row.drawdown_from_52w_high_pct)}<small>da ATH 52 sett.</small></span><span class="etf-dd ${ddClass(row.drawdown_from_high_pct, st)}">${fmtPct(row.drawdown_from_high_pct)}<small>da ATH assoluto</small></span>${quote ? `<a class="btn" target="_blank" rel="noopener" href="${quote}">Yahoo</a>` : ''}</div>${row.error ? `<div class="etf-detail"><b>Errore:</b> ${esc(row.error)}</div>` : ''}</div>`;
    }).join('')}</div>`;
  }

  let latestRows = [];
  async function scanAndRender() {
    const root = document.getElementById('etfDrawdownSection');
    if (!root || !client) return;
    stopOldPolling();
    const statusNode = document.getElementById('etfDrawdownUpdateStatus');
    if (statusNode) statusNode.textContent = 'Calcolo diretto BTD in corso…';
    const { data, error } = await client.functions.invoke(FUNCTION_NAME, { body: { requested_at: new Date().toISOString() } });
    if (error || data?.ok === false) {
      if (statusNode) statusNode.textContent = `Errore nuovo calcolo BTD: ${error?.message || data?.message || data?.error || 'errore sconosciuto'}`;
      return;
    }
    latestRows = data.results || [];
    renderSummary(latestRows, data.generated_at_utc);
    renderTable(latestRows);
    if (statusNode) statusNode.textContent = `Calcolo diretto completato: ${latestRows.length} asset.`;
  }

  document.addEventListener('input', event => {
    if (event.target.matches?.('#etfDrawdownSearch')) renderTable(latestRows);
  }, true);
  document.addEventListener('change', event => {
    if (event.target.matches?.('#etfDrawdownStatus,#etfDrawdownSort')) renderTable(latestRows);
  }, true);
  document.addEventListener('click', event => {
    if (event.target.closest?.('#etfDrawdownUpdateBtn,#reloadBtn')) setTimeout(scanAndRender, 500);
  }, true);

  function boot() {
    setTimeout(scanAndRender, 900);
    setTimeout(scanAndRender, 3200);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
