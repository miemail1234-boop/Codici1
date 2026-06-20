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
  const state = { config: [], data: [], query: '', status: 'all', sort: 'drawdown_asc', expanded: null, busy: false };

  const $ = (id) => document.getElementById(id);
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
  const ticker = (v) => String(v ?? '').trim().toUpperCase();
  const text = (v) => String(v ?? '').trim();
  const esc = (v) => String(v ?? '').replace(/[&<>'"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  const fmtNum = (v, d = 2) => { const n = num(v); return n === null ? '—' : new Intl.NumberFormat('it-IT', { maximumFractionDigits: d }).format(n); };
  const fmtPct = (v) => { const n = num(v); return n === null ? '—' : `${new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}%`; };
  const fmtDate = (v) => { if (!v) return '—'; const d = new Date(v); return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString('it-IT'); };
  const primaryDd = (r) => num(r.drawdown_from_52w_high_pct) ?? num(r.drawdown_from_high_pct);
  const latest = () => state.data.map((r) => r.generated_at_utc).filter(Boolean).sort().at(-1) || '';

  function setStatus(message, tone = 'info') {
    const node = $('etfDrawdownUpdateStatus');
    if (!node) return;
    node.textContent = message;
    node.dataset.tone = tone;
  }

  function statusOf(row) {
    if (!row.status) return 'pending';
    if (row.status !== 'ok') return 'failed';
    const dd = primaryDd(row);
    const high = num(row.drawdown_from_high_pct);
    const close = num(row.drawdown_from_close_high_pct);
    if (high !== null && high < -80 && (dd ?? high) < -30) return 'outlier';
    if (high !== null && close !== null && Math.abs(high - close) > 30 && (dd ?? 0) < -10) return 'suspicious';
    return 'ok';
  }

  function label(status) {
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

  async function loadConfig() {
    if (!client) throw new Error('Supabase client non disponibile');
    const { data, error } = await client.from(TABLE).select('*').order('id', { ascending: true });
    if (error) throw error;
    state.config = (data || []).map((r) => ({
      id: Number(r.id),
      asset: text(r.asset),
      yahoo_ticker: ticker(r.yahoo_ticker),
      isin: text(r.isin),
      role: text(r.role || 'leader'),
      category: text(r.category),
      note: text(r.note),
    })).filter((r) => r.id && r.asset);
  }

  async function loadData() {
    const res = await fetch(`${DATA_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    state.data = Array.isArray(rows) ? rows : [];
  }

  function mergedRows() {
    const dataByTicker = new Map(state.data.map((r) => [ticker(r.yahoo_ticker || r.tickers_tried), r]));
    return state.config.map((cfg) => {
      const data = dataByTicker.get(cfg.yahoo_ticker) || {};
      const row = {
        ...data,
        id: cfg.id,
        n: cfg.id,
        asset: cfg.asset,
        yahoo_ticker: cfg.yahoo_ticker,
        tickers_tried: cfg.yahoo_ticker,
        isin: cfg.isin,
        role: cfg.role,
        category: cfg.category,
        note: cfg.note,
      };
      row._computedStatus = data.yahoo_ticker ? statusOf(row) : 'pending';
      return row;
    });
  }

  function filteredRows() {
    const q = state.query.toLowerCase().trim();
    let rows = mergedRows().filter((r) => {
      if (state.status !== 'all' && r._computedStatus !== state.status) return false;
      if (!q) return true;
      return [r.asset, r.category, r.note, r.yahoo_ticker, r.isin].some((v) => String(v ?? '').toLowerCase().includes(q));
    });
    rows.sort((a, b) => {
      if (state.sort === 'name') return String(a.asset).localeCompare(String(b.asset), 'it');
      if (state.sort === 'number') return a.n - b.n;
      if (state.sort === 'drawdown_desc') return (primaryDd(b) ?? -9999) - (primaryDd(a) ?? -9999);
      return (primaryDd(a) ?? 9999) - (primaryDd(b) ?? 9999);
    });
    return rows;
  }

  function renderSummary() {
    const rows = mergedRows();
    const ok = rows.filter((r) => r._computedStatus === 'ok');
    const pending = rows.filter((r) => r._computedStatus === 'pending').length;
    const failed = rows.filter((r) => r._computedStatus === 'failed').length;
    const suspicious = rows.filter((r) => ['suspicious', 'outlier'].includes(r._computedStatus)).length;
    const nearHigh = ok.filter((r) => (primaryDd(r) ?? -999) >= -1).length;
    const dds = ok.map(primaryDd).filter((v) => v !== null).sort((a, b) => a - b);
    const median = dds.length ? dds[Math.floor(dds.length / 2)] : null;
    const updated = latest();
    $('etfDrawdownSummary').innerHTML = `
      <div class="etf-card"><span>Totale</span><strong>${rows.length}</strong><small>asset BTD</small></div>
      <div class="etf-card"><span>Ok</span><strong>${ok.length}</strong><small>dati validi sul ticker configurato</small></div>
      <div class="etf-card"><span>Vicini ai massimi</span><strong>${nearHigh}</strong><small>entro -1% da ATH 52 sett.</small></div>
      <div class="etf-card"><span>Mediana drawdown</span><strong>${fmtPct(median)}</strong><small>da ATH 52 sett.</small></div>
      <div class="etf-card"><span>Da aggiornare/verificare</span><strong>${pending + suspicious}</strong><small>${pending} senza dati nuovi</small></div>
      <div class="etf-card"><span>Falliti</span><strong>${failed}</strong><small>ticker non risolti</small></div>`;
    $('etfDrawdownMeta').textContent = `Fonte: Supabase ticker + JSON per ticker corrispondente. Ultimo JSON: ${updated ? new Date(updated).toLocaleString('it-IT') : '—'}.`;
  }

  function renderTable() {
    const rows = filteredRows();
    $('etfDrawdownTable').innerHTML = `<div class="etf-table">${rows.map((row) => {
      const status = row._computedStatus;
      const expanded = state.expanded === row.n;
      const quote = row.yahoo_ticker ? `https://finance.yahoo.com/quote/${encodeURIComponent(row.yahoo_ticker)}` : '';
      return `<div class="etf-row ${status}">
        <div class="etf-main">
          <span class="etf-num">${row.n}</span>
          <span class="etf-name"><strong>${esc(row.asset)}</strong><small>${esc(row.category || row.note || '')}</small></span>
          <label class="etf-edit"><small>Ticker Yahoo</small><input data-config-field="yahoo_ticker" data-config-id="${row.n}" value="${esc(row.yahoo_ticker || '')}" placeholder="es. SPY"></label>
          <label class="etf-edit"><small>ISIN broker</small><input data-config-field="isin" data-config-id="${row.n}" value="${esc(row.isin || '')}" placeholder="opzionale"></label>
          <span class="etf-status badge ${status}">${label(status)}</span>
          <span class="etf-price">${fmtNum(row.latest_close, 4)}<small>ultimo ${fmtDate(row.latest_date)}</small></span>
          <span class="etf-price">${fmtNum(row.week_52_high, 4)}<small>ATH 52 sett. ${fmtDate(row.week_52_high_date)}</small></span>
          <span class="etf-dd ${ddClass(row.drawdown_from_52w_high_pct, status)}">${fmtPct(row.drawdown_from_52w_high_pct)}<small>da ATH 52 sett.</small></span>
          <span class="etf-dd ${ddClass(row.drawdown_from_high_pct, status)}">${fmtPct(row.drawdown_from_high_pct)}<small>da ATH assoluto</small></span>
          <button class="btn" type="button" data-etf-toggle="${row.n}">Dettagli</button>
        </div>
        ${expanded ? `<div class="etf-detail">
          <div><b>Ticker configurato:</b> ${esc(row.yahoo_ticker || '—')}</div>
          <div><b>ISIN broker:</b> ${esc(row.isin || '—')}</div>
          <div><b>Fonte dati:</b> ${esc(row.source || '—')}</div>
          <div><b>Ultimo close:</b> ${fmtNum(row.latest_close, 4)} il ${fmtDate(row.latest_date)}</div>
          <div><b>ATH 52 settimane:</b> ${fmtNum(row.week_52_high, 4)} il ${fmtDate(row.week_52_high_date)} (${fmtPct(row.drawdown_from_52w_high_pct)})</div>
          <div><b>ATH assoluto:</b> ${fmtNum(row.all_time_high, 4)} il ${fmtDate(row.all_time_high_date)} (${fmtPct(row.drawdown_from_high_pct)})</div>
          <div><b>Righe storiche usate:</b> ${fmtNum(row.rows_used, 0)}</div>
          ${row.error ? `<div><b>Errore:</b> <span class="small">${esc(row.error)}</span></div>` : ''}
          ${quote ? `<a class="btn" target="_blank" rel="noopener" href="${quote}">Apri su Yahoo Finance</a>` : ''}
        </div>` : ''}
      </div>`;
    }).join('')}</div>`;
  }

  function render() { renderSummary(); renderTable(); }

  async function saveAsset(id, field, value) {
    const cfg = state.config.find((r) => r.id === id);
    if (!cfg) return;
    cfg[field] = field === 'yahoo_ticker' ? ticker(value) : text(value);
    const { error } = await client.from(TABLE).upsert(cfg, { onConflict: 'id' });
    if (error) throw error;
  }

  async function saveAll() {
    const rows = state.config.map((r) => ({ ...r, yahoo_ticker: ticker(r.yahoo_ticker), isin: text(r.isin) }));
    const { error } = await client.from(TABLE).upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  }

  async function poll(previous) {
    for (let i = 1; i <= 12; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 15000));
      try {
        await loadData();
        const next = latest();
        if (next && next !== previous) {
          render();
          setStatus(`Aggiornamento completato. Dati aggiornati al ${new Date(next).toLocaleString('it-IT')}.`, 'ok');
          return;
        }
      } catch (_) {}
      setStatus(`GitHub Action avviata. Attendo nuovi dati… tentativo ${i}/12.`, 'info');
    }
    setStatus('Aggiornamento avviato. Se i dati non cambiano ancora, apri “GitHub Action” e controlla l’esecuzione.', 'warn');
  }

  async function triggerUpdate() {
    if (state.busy || !client) return;
    state.busy = true;
    const btn = $('etfDrawdownUpdateBtn');
    const previous = latest();
    btn.disabled = true;
    btn.textContent = 'Aggiornamento…';
    try {
      await saveAll();
      setStatus('Ticker salvati. Avvio GitHub Action…', 'info');
      const { data, error } = await client.functions.invoke(FUNCTION_NAME, { body: { requested_at: new Date().toISOString() } });
      if (error) throw error;
      if (data?.ok === false) throw new Error(data.message || data.error || 'Errore GitHub Action');
      setStatus(`GitHub Action avviata con ${data?.assets_sent || state.config.length} asset.`, 'info');
      await poll(previous);
    } catch (err) {
      setStatus(`Errore: ${err.message || String(err)}`, 'warn');
    } finally {
      state.busy = false;
      btn.disabled = false;
      btn.textContent = 'Aggiorna BTD Radar';
    }
  }

  function installControls() {
    const root = $('etfDrawdownSection');
    if (!root) return false;
    root.querySelector('h2').textContent = 'BTD Radar';
    const desc = root.querySelector('.etf-head .small');
    if (desc) desc.textContent = 'Radar buy-the-dip su 50 asset. I dati vengono mostrati solo quando il ticker nel JSON corrisponde al ticker Yahoo configurato.';
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
    p.textContent = 'Verifico ticker configurati…';
    head.insertAdjacentElement('afterend', p);
    return true;
  }

  function bind() {
    $('etfDrawdownSearch')?.addEventListener('input', (e) => { state.query = e.target.value; renderTable(); });
    $('etfDrawdownStatus')?.addEventListener('change', (e) => { state.status = e.target.value; renderTable(); });
    $('etfDrawdownSort')?.addEventListener('change', (e) => { state.sort = e.target.value; renderTable(); });
    $('etfDrawdownUpdateBtn')?.addEventListener('click', triggerUpdate);
    $('etfDrawdownTable')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-etf-toggle]');
      if (!btn) return;
      const n = Number(btn.dataset.etfToggle);
      state.expanded = state.expanded === n ? null : n;
      renderTable();
    });
    $('etfDrawdownTable')?.addEventListener('change', async (e) => {
      const input = e.target.closest('[data-config-field]');
      if (!input) return;
      const id = Number(input.dataset.configId);
      const field = input.dataset.configField;
      try {
        await saveAsset(id, field, input.value);
        const cfg = state.config.find((r) => r.id === id);
        if (cfg) input.value = cfg[field] || '';
        render();
        setStatus('Salvato. Premi “Aggiorna BTD Radar” per rigenerare i dati con il nuovo ticker.', 'ok');
      } catch (err) {
        setStatus(`Errore salvataggio: ${err.message}`, 'warn');
      }
    });
  }

  async function init() {
    if (!installControls()) return;
    try {
      await loadConfig();
      await loadData();
      bind();
      render();
      setStatus('Ticker configurati corretti caricati. Gli asset senza dati sono “Da aggiornare”: premi “Aggiorna BTD Radar”.', 'ok');
    } catch (err) {
      setStatus(`Errore verifica ticker: ${err.message}`, 'warn');
    }
  }

  window.addEventListener('load', () => setTimeout(init, 1200));
})();
