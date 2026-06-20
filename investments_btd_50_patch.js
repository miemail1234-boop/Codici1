(() => {
  'use strict';

  const DATA_URL = 'finance-drawdown/results/all_drawdowns.json';
  const CSV_URL = 'finance-drawdown/results/all_drawdowns.csv';
  const TABLE = 'btd_drawdown_assets';
  const SUPABASE_URL = 'https://kujyowhezihjambhpahe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
  const FUNCTION_NAME = 'trigger-etf-drawdown-update';
  const ACTIONS_URL = 'https://github.com/miemail1234-boop/Codici1/actions/workflows/etf-drawdown.yml';
  const client = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);

  const state = { config: [], rows: [], query: '', status: 'all', sort: 'drawdown_asc', expanded: null, refreshing: false };
  const els = {};

  const $ = (id) => document.getElementById(id);
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
  const cleanTicker = (v) => String(v ?? '').trim().toUpperCase();
  const cleanText = (v) => String(v ?? '').trim();
  const esc = (v) => String(v ?? '').replace(/[&<>'"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  const fmtNum = (v, d = 2) => { const n = num(v); return n === null ? '—' : new Intl.NumberFormat('it-IT', { maximumFractionDigits: d, minimumFractionDigits: 0 }).format(n); };
  const fmtPct = (v) => { const n = num(v); return n === null ? '—' : `${new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(n)}%`; };
  const fmtDate = (v) => { if (!v) return '—'; const d = new Date(v); return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString('it-IT'); };
  const primaryDrawdown = (row) => num(row.drawdown_from_52w_high_pct) ?? num(row.drawdown_from_high_pct);
  const latestGeneratedAt = () => state.rows.map((r) => r.generated_at_utc).filter(Boolean).sort().at(-1) || '';

  function statusOf(row) {
    if (!row.status) return 'pending';
    if (row.status !== 'ok') return 'failed';
    const dd = primaryDrawdown(row);
    const high = num(row.drawdown_from_high_pct);
    const close = num(row.drawdown_from_close_high_pct);
    if (high !== null && high < -80 && (dd ?? high) < -30) return 'outlier';
    if (high !== null && close !== null && Math.abs(high - close) > 30 && (dd ?? 0) < -10) return 'suspicious';
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

  function payload(asset) {
    return {
      id: Number(asset.id),
      asset: cleanText(asset.asset),
      yahoo_ticker: cleanTicker(asset.yahoo_ticker),
      isin: cleanText(asset.isin),
      role: cleanText(asset.role || 'leader'),
      category: cleanText(asset.category),
      note: cleanText(asset.note),
    };
  }

  async function loadConfig() {
    if (!client) throw new Error('Supabase client non disponibile');
    const { data, error } = await client.from(TABLE).select('*').order('id', { ascending: true });
    if (error) throw error;
    return (data || []).map((r) => ({
      id: Number(r.id),
      asset: r.asset,
      yahoo_ticker: r.yahoo_ticker,
      isin: r.isin || '',
      role: r.role || 'leader',
      category: r.category || '',
      note: r.note || '',
    }));
  }

  async function loadRows() {
    const res = await fetch(`${DATA_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    return Array.isArray(rows) ? rows.map((r, i) => ({ ...r, n: Number(r.n ?? i + 1) })) : [];
  }

  async function saveAsset(asset) {
    if (!client) throw new Error('Supabase client non disponibile');
    const { error } = await client.from(TABLE).upsert(payload(asset), { onConflict: 'id' });
    if (error) throw error;
  }

  async function saveAll() {
    if (!client) throw new Error('Supabase client non disponibile');
    const rows = state.config.map(payload).filter((r) => r.yahoo_ticker);
    const { error } = await client.from(TABLE).upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  }

  function mergedRows() {
    const byId = new Map(state.rows.map((r) => [Number(r.n), r]));
    const byTicker = new Map(state.rows.map((r) => [cleanTicker(r.yahoo_ticker || r.tickers_tried), r]));
    return state.config.map((cfg) => {
      const data = byId.get(cfg.id) || byTicker.get(cleanTicker(cfg.yahoo_ticker)) || {};
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
      row._computedStatus = statusOf(row);
      return row;
    });
  }

  function filteredRows() {
    const q = state.query.trim().toLowerCase();
    let rows = mergedRows().filter((r) => {
      if (state.status !== 'all' && r._computedStatus !== state.status) return false;
      if (!q) return true;
      return [r.asset, r.category, r.note, r.yahoo_ticker, r.isin].some((v) => String(v ?? '').toLowerCase().includes(q));
    });
    rows = rows.slice().sort((a, b) => {
      if (state.sort === 'name') return String(a.asset).localeCompare(String(b.asset), 'it');
      if (state.sort === 'number') return a.n - b.n;
      if (state.sort === 'drawdown_desc') return (primaryDrawdown(b) ?? -9999) - (primaryDrawdown(a) ?? -9999);
      return (primaryDrawdown(a) ?? 9999) - (primaryDrawdown(b) ?? 9999);
    });
    return rows;
  }

  function setStatus(message, tone = 'info') {
    if (!els.updateStatus) return;
    els.updateStatus.textContent = message;
    els.updateStatus.dataset.tone = tone;
  }

  function renderSummary() {
    const rows = mergedRows();
    const ok = rows.filter((r) => r._computedStatus === 'ok');
    const pending = rows.filter((r) => r._computedStatus === 'pending').length;
    const failed = rows.filter((r) => r._computedStatus === 'failed').length;
    const suspicious = rows.filter((r) => ['outlier', 'suspicious'].includes(r._computedStatus)).length;
    const nearHigh = ok.filter((r) => (primaryDrawdown(r) ?? -999) >= -1).length;
    const drawdowns = ok.map(primaryDrawdown).filter((v) => v !== null).sort((a, b) => a - b);
    const median = drawdowns.length ? drawdowns[Math.floor(drawdowns.length / 2)] : null;
    const updated = latestGeneratedAt();
    els.summary.innerHTML = `
      <div class="etf-card"><span>Totale</span><strong>${rows.length}</strong><small>asset BTD</small></div>
      <div class="etf-card"><span>Ok</span><strong>${ok.length}</strong><small>dati validi</small></div>
      <div class="etf-card"><span>Vicini ai massimi</span><strong>${nearHigh}</strong><small>entro -1% da ATH 52 sett.</small></div>
      <div class="etf-card"><span>Mediana drawdown</span><strong>${fmtPct(median)}</strong><small>da ATH 52 sett.</small></div>
      <div class="etf-card"><span>Da verificare</span><strong>${suspicious + pending}</strong><small>${pending} da aggiornare</small></div>
      <div class="etf-card"><span>Falliti</span><strong>${failed}</strong><small>ticker non risolti</small></div>`;
    els.meta.textContent = `Fonte: online. Config ticker: Supabase. Ultimo aggiornamento dati: ${updated ? new Date(updated).toLocaleString('it-IT') : '—'}.`;
  }

  function renderTable() {
    const rows = filteredRows();
    if (!rows.length) {
      els.table.innerHTML = '<p class="small">Nessun asset corrisponde ai filtri selezionati.</p>';
      return;
    }
    els.table.innerHTML = `<div class="etf-table">${rows.map((row) => {
      const status = row._computedStatus;
      const expanded = state.expanded === row.n;
      const quote = row.yahoo_ticker ? `https://finance.yahoo.com/quote/${encodeURIComponent(row.yahoo_ticker)}` : '';
      return `<div class="etf-row ${status}">
        <div class="etf-main">
          <span class="etf-num">${row.n}</span>
          <span class="etf-name"><strong>${esc(row.asset)}</strong><small>${esc(row.category || row.note || '')}</small></span>
          <label class="etf-edit"><small>Ticker Yahoo</small><input data-config-field="yahoo_ticker" data-config-id="${row.n}" value="${esc(row.yahoo_ticker || '')}" placeholder="es. SXRV.DE"></label>
          <label class="etf-edit"><small>ISIN broker</small><input data-config-field="isin" data-config-id="${row.n}" value="${esc(row.isin || '')}" placeholder="opzionale"></label>
          <span class="etf-status badge ${status}">${statusLabel(status)}</span>
          <span class="etf-price">${fmtNum(row.latest_close, 4)}<small>ultimo ${fmtDate(row.latest_date)}</small></span>
          <span class="etf-price">${fmtNum(row.week_52_high, 4)}<small>ATH 52 sett. ${fmtDate(row.week_52_high_date)}</small></span>
          <span class="etf-dd ${ddClass(row.drawdown_from_52w_high_pct, status)}">${fmtPct(row.drawdown_from_52w_high_pct)}<small>da ATH 52 sett.</small></span>
          <span class="etf-dd ${ddClass(row.drawdown_from_high_pct, status)}">${fmtPct(row.drawdown_from_high_pct)}<small>da ATH assoluto</small></span>
          <button class="btn" type="button" data-etf-toggle="${row.n}" aria-expanded="${expanded ? 'true' : 'false'}">Dettagli</button>
        </div>
        ${expanded ? `<div class="etf-detail">
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
      </div>`;
    }).join('')}</div>`;
  }

  function render() {
    renderSummary();
    renderTable();
  }

  async function poll(previousGeneratedAt) {
    for (let attempt = 1; attempt <= 12; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 15000));
      try {
        const rows = await loadRows();
        const next = rows.map((r) => r.generated_at_utc).filter(Boolean).sort().at(-1) || '';
        if (next && next !== previousGeneratedAt) {
          state.rows = rows;
          render();
          setStatus(`Aggiornamento completato. Dati aggiornati al ${new Date(next).toLocaleString('it-IT')}.`, 'ok');
          return true;
        }
      } catch (_) {}
      setStatus(`GitHub Action avviata. Attendo nuovi dati… tentativo ${attempt}/12.`, 'info');
    }
    setStatus('Aggiornamento avviato, ma i nuovi risultati non sono ancora pubblicati. Riprova tra poco.', 'warn');
    return false;
  }

  async function triggerUpdate() {
    if (state.refreshing) return;
    state.refreshing = true;
    const previous = latestGeneratedAt();
    els.updateBtn.disabled = true;
    els.updateBtn.textContent = 'Aggiornamento…';
    setStatus('Salvo ticker Yahoo e avvio GitHub Action…', 'info');
    try {
      await saveAll();
      const { data, error } = await client.functions.invoke(FUNCTION_NAME, { body: { requested_at: new Date().toISOString() } });
      if (error) throw error;
      if (data?.ok === false) throw new Error(data.message || data.error || 'Errore avvio GitHub Action');
      setStatus(`GitHub Action avviata con ${data?.assets_sent || state.config.length} asset. Attendo il nuovo JSON…`, 'info');
      await poll(previous);
    } catch (err) {
      setStatus(`Errore: ${err.message || String(err)}`, 'warn');
    } finally {
      state.refreshing = false;
      els.updateBtn.disabled = false;
      els.updateBtn.textContent = 'Aggiorna BTD Radar';
    }
  }

  function bindEvents() {
    els.search.addEventListener('input', (e) => { state.query = e.target.value; renderTable(); });
    els.status.addEventListener('change', (e) => { state.status = e.target.value; renderTable(); });
    els.sort.addEventListener('change', (e) => { state.sort = e.target.value; renderTable(); });
    els.updateBtn.addEventListener('click', triggerUpdate);
    els.table.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-etf-toggle]');
      if (!btn) return;
      const n = Number(btn.dataset.etfToggle);
      state.expanded = state.expanded === n ? null : n;
      renderTable();
    });
    els.table.addEventListener('change', async (e) => {
      const input = e.target.closest('[data-config-field]');
      if (!input) return;
      const asset = state.config.find((a) => Number(a.id) === Number(input.dataset.configId));
      if (!asset) return;
      asset[input.dataset.configField] = input.dataset.configField === 'yahoo_ticker' ? cleanTicker(input.value) : cleanText(input.value);
      input.value = asset[input.dataset.configField] || '';
      setStatus(`Salvo modifica per ${asset.asset}…`, 'info');
      try {
        await saveAsset(asset);
        setStatus(`Salvato. Premi “Aggiorna BTD Radar” per ricalcolare usando ${asset.yahoo_ticker}.`, 'ok');
      } catch (err) {
        setStatus(`Errore salvataggio: ${err.message}`, 'warn');
      }
      render();
    });
  }

  async function init() {
    const root = $('etfDrawdownSection');
    if (!root) return;
    root.querySelector('h2').textContent = 'BTD Radar';
    const desc = root.querySelector('.etf-head .small');
    if (desc) desc.textContent = 'Radar buy-the-dip su 50 asset. Modifica il ticker Yahoo e premi aggiorna per ricalcolare prezzo, ATH 52 settimane, ATH assoluto e drawdown.';
    const nav = document.querySelector('a[href="#etfDrawdownSection"]');
    if (nav) nav.textContent = 'BTD Radar';
    root.querySelector('.etf-update-actions')?.remove();
    $('etfDrawdownUpdateStatus')?.remove();
    const head = root.querySelector('.etf-head');
    head.querySelector(`a[href="${CSV_URL}"]`)?.remove();
    const actions = document.createElement('div');
    actions.className = 'etf-update-actions';
    actions.innerHTML = `<button class="btn primary" type="button" id="etfDrawdownUpdateBtn">Aggiorna BTD Radar</button><a class="btn" href="${CSV_URL}" target="_blank" rel="noopener">Scarica CSV</a><a class="btn" href="${ACTIONS_URL}" target="_blank" rel="noopener">GitHub Action</a>`;
    head.appendChild(actions);
    const p = document.createElement('p');
    p.className = 'small';
    p.id = 'etfDrawdownUpdateStatus';
    p.textContent = 'Carico configurazione BTD Radar a 50 asset…';
    head.insertAdjacentElement('afterend', p);

    els.summary = $('etfDrawdownSummary');
    els.meta = $('etfDrawdownMeta');
    els.search = $('etfDrawdownSearch');
    els.status = $('etfDrawdownStatus');
    els.sort = $('etfDrawdownSort');
    els.table = $('etfDrawdownTable');
    els.updateBtn = $('etfDrawdownUpdateBtn');
    els.updateStatus = $('etfDrawdownUpdateStatus');

    try {
      state.config = await loadConfig();
      state.rows = await loadRows();
      bindEvents();
      setStatus('Configurazione a 50 asset caricata. Premi “Aggiorna BTD Radar” per rigenerare il JSON se vedi ancora dati vecchi.', 'ok');
      render();
    } catch (err) {
      setStatus(`Errore caricamento BTD Radar: ${err.message}`, 'warn');
    }
  }

  window.addEventListener('load', () => setTimeout(init, 200));
})();