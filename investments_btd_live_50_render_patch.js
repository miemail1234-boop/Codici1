(() => {
  'use strict';
  if (window.__INVESTMENTS_BTD_LIVE_50_RENDER_PATCH__) return;
  window.__INVESTMENTS_BTD_LIVE_50_RENDER_PATCH__ = true;

  const SUPABASE_URL = 'https://kujyowhezihjambhpahe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
  const DATA_URL = 'finance-drawdown/results/all_drawdowns.json';
  const TABLE = 'btd_drawdown_assets';
  const client = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);

  const FULL_NAMES = {
    1:'MSCI World Index — azioni dei mercati sviluppati globali',2:'FTSE All-World Index — azionario globale sviluppati + emergenti',3:'MSCI ACWI — All Country World Index',4:'MSCI ACWI IMI — All Country World Investable Market Index',5:'MSCI World Equal Weighted Index — mondiale a peso uguale',6:'S&P 500 Index — large cap USA',7:'Nasdaq 100 Index — growth/tech USA',8:'Nasdaq 100 Equal Weighted Index — Nasdaq a peso uguale',9:'S&P 500 Equal Weight Index — S&P 500 a peso uguale',10:'MSCI USA Value Index — azioni value USA',11:'S&P 500 Quality Index — qualità USA',12:'MSCI USA Minimum Volatility Index — difensivo USA',13:'S&P MidCap 400 Index — mid cap USA',14:'Russell 2000 Index — small cap USA',15:'MSCI World Quality Index — qualità globale',16:'MSCI World Momentum Index — momentum globale',17:'MSCI World Value Index — value globale',18:'MSCI World Small Cap Index — small cap globali',19:'MSCI World Minimum Volatility Index — difensivo globale',20:'STOXX Europe 600 Index — azionario europeo ampio',21:'MSCI Europe Index — Europa sviluppata',22:'MSCI Europe Value Index — value europeo',23:'STOXX Europe 600 Value Index — value/ciclici Europa',24:'STOXX Europe 600 Equal Weight Index — Europa a peso uguale',25:'EURO STOXX 50 Index — large cap Eurozona',26:'MSCI EMU Index — azionario Eurozona ampio',27:'FTSE 100 Index — large cap Regno Unito',28:'FTSE 250 Index — mid cap Regno Unito',29:'DAX Index — azionario Germania',30:'CAC 40 Index — azionario Francia',31:'FTSE MIB Index — azionario Italia',32:'IBEX 35 Index — azionario Spagna',33:'SMI Swiss Market Index — azionario Svizzera',34:'Nordic Countries Equity — azionario paesi nordici',35:'MSCI Japan Index — Giappone large cap',36:'TOPIX — Tokyo Stock Price Index, Giappone ampio',37:'MSCI Pacific ex Japan Index — Pacifico escluso Giappone',38:'MSCI Emerging Markets Index — mercati emergenti globali',39:'MSCI Emerging Markets ex China Index — emergenti esclusa Cina',40:'MSCI India Index — azionario India',41:'MSCI China Index — azionario Cina',42:'MSCI Taiwan Index — azionario Taiwan',43:'MSCI Korea Index — azionario Corea del Sud',44:'MSCI Brazil Index — azionario Brasile',45:'MSCI World Health Care Index — healthcare globale',46:'MSCI World Energy Index — energia globale / oil & gas',47:'Rio Tinto / Materials — proxy minerari e materiali globali',48:'Physical Gold ETC — proxy oro fisico',49:'Bitcoin — crypto asset BTC',50:'Ethereum — crypto asset ETH'
  };

  const n = value => { const x = Number(value); return Number.isFinite(x) ? x : null; };
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const cleanTicker = value => String(value ?? '').trim().toUpperCase();
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
  function statusLabel(value) { return { ok:'Ok', failed:'Fallito', outlier:'Outlier', suspicious:'Da verificare', pending:'Da aggiornare' }[value] || value; }
  function ddClass(value, state) {
    if (['failed','outlier','suspicious'].includes(state)) return 'warn';
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
  async function loadData() {
    const res = await fetch(`${DATA_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`JSON BTD non caricato: HTTP ${res.status}`);
    return await res.json();
  }

  function merge(config, data) {
    const byN = new Map((data || []).map(row => [Number(row.n), row]));
    const byTicker = new Map((data || []).map(row => [cleanTicker(row.yahoo_ticker || row.tickers_tried), row]));
    return (config || []).map(cfg => {
      const found = byN.get(Number(cfg.id)) || byTicker.get(cleanTicker(cfg.yahoo_ticker)) || {};
      const row = { ...found, id: Number(cfg.id), n: Number(cfg.id), asset: cfg.asset, yahoo_ticker: found.yahoo_ticker || cfg.yahoo_ticker, tickers_tried: found.tickers_tried || cfg.yahoo_ticker, isin: cfg.isin || found.isin || '', role: cfg.role || found.role || 'leader', category: cfg.category || found.category || '', note: cfg.note || found.note || '' };
      row._computedStatus = status(row);
      return row;
    });
  }

  function currentRows(rows) {
    const q = document.getElementById('etfDrawdownSearch')?.value?.trim().toLowerCase() || '';
    const filter = document.getElementById('etfDrawdownStatus')?.value || 'all';
    const sort = document.getElementById('etfDrawdownSort')?.value || 'drawdown_asc';
    let out = rows.filter(row => {
      if (filter !== 'all' && row._computedStatus !== filter) return false;
      if (!q) return true;
      return [row.asset,row.isin,row.yahoo_ticker,row.tickers_tried,row.source,row.category,row.note,FULL_NAMES[row.n]].some(v => String(v ?? '').toLowerCase().includes(q));
    });
    out = out.slice().sort((a,b) => {
      if (sort === 'name') return String(a.asset).localeCompare(String(b.asset), 'it');
      if (sort === 'number') return a.n - b.n;
      if (sort === 'drawdown_desc') return (primaryDrawdown(b) ?? -9999) - (primaryDrawdown(a) ?? -9999);
      return (primaryDrawdown(a) ?? 9999) - (primaryDrawdown(b) ?? 9999);
    });
    return out;
  }

  function renderSummary(rows) {
    const holder = document.getElementById('etfDrawdownSummary');
    const meta = document.getElementById('etfDrawdownMeta');
    if (!holder) return;
    const okRows = rows.filter(row => row._computedStatus === 'ok');
    const failed = rows.filter(row => row._computedStatus === 'failed').length;
    const pending = rows.filter(row => row._computedStatus === 'pending').length;
    const suspicious = rows.filter(row => ['outlier','suspicious'].includes(row._computedStatus)).length;
    const nearHigh = okRows.filter(row => (primaryDrawdown(row) ?? -999) >= -1).length;
    const dd = okRows.map(primaryDrawdown).filter(v => v !== null).sort((a,b) => a-b);
    const median = dd.length ? dd[Math.floor(dd.length / 2)] : null;
    const updated = rows.map(row => row.generated_at_utc).filter(Boolean).sort().at(-1);
    holder.innerHTML = `<div class="etf-card"><span>Totale</span><strong>${rows.length}</strong><small>asset leader BTD</small></div><div class="etf-card"><span>Ok</span><strong>${okRows.length}</strong><small>dati validi</small></div><div class="etf-card"><span>Vicini ai massimi</span><strong>${nearHigh}</strong><small>entro -1% da ATH 52 sett.</small></div><div class="etf-card"><span>Mediana drawdown</span><strong>${fmtPct(median)}</strong><small>da ATH 52 sett.</small></div><div class="etf-card"><span>Da verificare</span><strong>${suspicious + pending}</strong><small>${pending} da aggiornare</small></div><div class="etf-card"><span>Falliti</span><strong>${failed}</strong><small>ticker non risolti</small></div>`;
    if (meta) meta.textContent = `Fonte: GitHub JSON + Supabase config 50 asset. Ultimo aggiornamento dati: ${updated ? new Date(updated).toLocaleString('it-IT') : '—'}.`;
  }

  function renderTable(allRows) {
    const table = document.getElementById('etfDrawdownTable');
    if (!table) return;
    const rows = currentRows(allRows);
    if (!rows.length) { table.innerHTML = '<p class="small">Nessun asset corrisponde ai filtri selezionati.</p>'; return; }
    table.innerHTML = `<div class="etf-table">${rows.map(row => {
      const st = row._computedStatus;
      const quote = row.yahoo_ticker ? `https://finance.yahoo.com/quote/${encodeURIComponent(row.yahoo_ticker)}` : '';
      const full = FULL_NAMES[row.n] || row.note || '';
      return `<div class="etf-row ${st}"><div class="etf-main"><span class="etf-num">${row.n}</span><span class="etf-name"><strong>${esc(row.asset)}</strong><small><b>Nome completo:</b> ${esc(full)}</small><small>${esc(row.category || row.note || '')}</small></span><label class="etf-edit"><small>Ticker Yahoo</small><input data-btd50-field="yahoo_ticker" data-btd50-id="${row.n}" value="${esc(row.yahoo_ticker || '')}" placeholder="es. QQQ"></label><label class="etf-edit"><small>ISIN broker</small><input data-btd50-field="isin" data-btd50-id="${row.n}" value="${esc(row.isin || '')}" placeholder="opzionale"></label><span class="etf-status badge ${st}">${statusLabel(st)}</span><span class="etf-price">${fmtNum(row.latest_close,4)}<small>ultimo ${fmtDate(row.latest_date)}</small></span><span class="etf-price">${fmtNum(row.week_52_high,4)}<small>ATH 52 sett. ${fmtDate(row.week_52_high_date)}</small></span><span class="etf-dd ${ddClass(row.drawdown_from_52w_high_pct, st)}">${fmtPct(row.drawdown_from_52w_high_pct)}<small>da ATH 52 sett.</small></span><span class="etf-dd ${ddClass(row.drawdown_from_high_pct, st)}">${fmtPct(row.drawdown_from_high_pct)}<small>da ATH assoluto</small></span><a class="btn" target="_blank" rel="noopener" href="${quote}">Yahoo</a></div></div>`;
    }).join('')}</div>`;
  }

  let cacheRows = [];
  async function render() {
    const root = document.getElementById('etfDrawdownSection');
    if (!root) return;
    const descr = root.querySelector('.etf-head .small');
    if (descr) descr.textContent = 'Radar buy-the-dip su 50 asset leader. Dati dal JSON GitHub, configurazione ticker da Supabase.';
    const [cfg, data] = await Promise.all([loadConfig(), loadData()]);
    cacheRows = merge(cfg, data);
    renderSummary(cacheRows);
    renderTable(cacheRows);
  }

  document.addEventListener('input', async event => {
    const input = event.target.closest?.('[data-btd50-field]');
    if (!input || !client) return;
    const id = Number(input.dataset.btd50Id);
    const field = input.dataset.btd50Field;
    const value = field === 'yahoo_ticker' ? cleanTicker(input.value) : String(input.value || '').trim();
    await client.from(TABLE).update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', id);
    setTimeout(render, 500);
  }, true);

  document.addEventListener('input', event => {
    if (event.target.matches?.('#etfDrawdownSearch')) renderTable(cacheRows);
  }, true);
  document.addEventListener('change', event => {
    if (event.target.matches?.('#etfDrawdownStatus,#etfDrawdownSort')) renderTable(cacheRows);
  }, true);
  document.addEventListener('click', event => {
    if (event.target.closest?.('#etfDrawdownUpdateBtn,#reloadBtn')) setTimeout(render, 2500);
  }, true);

  function boot() {
    setTimeout(() => render().catch(console.error), 1200);
    setTimeout(() => render().catch(console.error), 3200);
    setInterval(() => render().catch(console.error), 30000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
