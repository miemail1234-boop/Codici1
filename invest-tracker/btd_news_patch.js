(() => {
  'use strict';
  if (window.__BTD_NEWS_PATCH__) return;
  window.__BTD_NEWS_PATCH__ = true;

  const STORAGE_KEY = 'invest-tracker-btd-news-history-v1';
  const TODAY = new Date().toISOString().slice(0, 10);

  const parsePct = value => {
    const parsed = Number(String(value ?? '').replace('%', '').replace(',', '.').trim());
    return Number.isFinite(parsed) ? parsed : null;
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const fmtPct = value => value == null ? '—' : `${new Intl.NumberFormat('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)}%`;

  function injectStyles() {
    if (document.getElementById('btdNewsStyles')) return;
    const style = document.createElement('style');
    style.id = 'btdNewsStyles';
    style.textContent = `
      .btd-news{margin:14px 0;padding:14px;border:1px solid var(--border);border-radius:18px;background:linear-gradient(135deg,rgba(2,132,199,.10),rgba(15,118,110,.08))}
      .btd-news-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:10px}
      .btd-news-head h3{margin:0;font-size:18px}
      .btd-news-list{display:grid;gap:8px}
      .btd-news-item{display:grid;grid-template-columns:minmax(160px,1.4fr) auto auto minmax(130px,.8fr);gap:10px;align-items:center;padding:10px 12px;border:1px solid var(--border);border-radius:14px;background:rgba(255,255,255,.03)}
      .btd-news-item strong{display:block}.btd-news-item small{color:var(--muted)}
      .btd-news-level{font-weight:700}.btd-news-level.very-strong{color:var(--danger)}.btd-news-level.strong{color:var(--warn)}.btd-news-level.interesting{color:var(--accent)}
      .btd-news-empty{color:var(--muted);margin:0}
      @media(max-width:760px){.btd-news-item{grid-template-columns:1fr 1fr}.btd-news-item .btd-news-trend{grid-column:1/-1}}
    `;
    document.head.appendChild(style);
  }

  function ensureContainer() {
    injectStyles();
    const section = document.getElementById('etfDrawdownSection');
    if (!section) return null;
    let node = document.getElementById('btdNews');
    if (node) return node;
    node = document.createElement('div');
    node.id = 'btdNews';
    node.className = 'btd-news';
    const summary = document.getElementById('etfDrawdownSummary');
    if (summary) section.insertBefore(node, summary);
    else section.appendChild(node);
    return node;
  }

  function readRowsFromRadar() {
    return [...document.querySelectorAll('#etfDrawdownTable .etf-row')].map(row => {
      const asset = row.querySelector('.etf-name strong')?.textContent?.trim() || '';
      const dds = row.querySelectorAll('.etf-dd');
      const dd52 = parsePct(dds[0]?.childNodes?.[0]?.textContent || dds[0]?.textContent);
      const ddAll = parsePct(dds[1]?.childNodes?.[0]?.textContent || dds[1]?.textContent);
      const isOk = row.classList.contains('ok') || !['failed', 'outlier', 'suspicious', 'pending'].some(cls => row.classList.contains(cls));
      return { asset, dd52, ddAll, isOk };
    }).filter(row => row.asset && row.dd52 != null && row.isOk);
  }

  function loadHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function previousSnapshot(history) {
    const dates = Object.keys(history).filter(date => date < TODAY).sort();
    return dates.length ? history[dates[dates.length - 1]] : null;
  }

  function saveSnapshot(rows) {
    const history = loadHistory();
    history[TODAY] = Object.fromEntries(rows.map(row => [row.asset, row.dd52]));
    const dates = Object.keys(history).sort();
    while (dates.length > 14) delete history[dates.shift()];
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch (_) {}
  }

  function levelFor(dd) {
    if (dd <= -30) return { label: 'Molto forte', cls: 'very-strong', rank: 3 };
    if (dd <= -20) return { label: 'Forte', cls: 'strong', rank: 2 };
    if (dd <= -12) return { label: 'Interessante', cls: 'interesting', rank: 1 };
    return null;
  }

  function trendFor(asset, current, previous) {
    if (!previous || previous[asset] == null) return 'Nuovo riferimento';
    const delta = current - Number(previous[asset]);
    if (delta <= -2) return `Dip in approfondimento (${fmtPct(delta)} p.p.)`;
    if (delta >= 2) return `Rimbalzo (${fmtPct(delta)} p.p.)`;
    return `Stabile (${fmtPct(delta)} p.p.)`;
  }

  function renderNews() {
    const node = ensureContainer();
    if (!node) return;
    const rows = readRowsFromRadar();
    if (!rows.length) {
      node.innerHTML = '<div class="btd-news-head"><div><h3>BTD News</h3><p class="small">Sintesi automatica delle occasioni del radar.</p></div></div><p class="btd-news-empty">Attendo i dati aggiornati del BTD Radar…</p>';
      return;
    }

    const history = loadHistory();
    const previous = previousSnapshot(history);
    const opportunities = rows
      .map(row => ({ ...row, level: levelFor(row.dd52) }))
      .filter(row => row.level)
      .sort((a, b) => a.dd52 - b.dd52)
      .slice(0, 6);

    const meta = document.getElementById('etfDrawdownMeta')?.textContent?.trim() || '';
    const median = rows.map(row => row.dd52).sort((a, b) => a - b)[Math.floor(rows.length / 2)];

    node.innerHTML = `<div class="btd-news-head"><div><h3>BTD News</h3><p class="small">Segnali ordinati per drawdown da ATH a 52 settimane. Mediana radar: ${fmtPct(median)}.</p></div><span class="badge ok">${opportunities.length} segnali</span></div>${opportunities.length ? `<div class="btd-news-list">${opportunities.map(row => `<div class="btd-news-item"><div><strong>${esc(row.asset)}</strong><small>ATH 52 settimane</small></div><span class="btd-news-level ${row.level.cls}">${row.level.label}</span><strong>${fmtPct(row.dd52)}</strong><span class="btd-news-trend small">${esc(trendFor(row.asset, row.dd52, previous))}</span></div>`).join('')}</div>` : '<p class="btd-news-empty">Nessun asset supera oggi la soglia BTD di −12% dal massimo a 52 settimane.</p>'}<p class="small" style="margin:10px 0 0">${esc(meta)}</p>`;

    saveSnapshot(rows);
  }

  let timer = null;
  function scheduleRender() {
    clearTimeout(timer);
    timer = setTimeout(renderNews, 120);
  }

  function boot() {
    ensureContainer();
    renderNews();
    const table = document.getElementById('etfDrawdownTable');
    if (table) new MutationObserver(scheduleRender).observe(table, { childList: true, subtree: true, characterData: true });
    const meta = document.getElementById('etfDrawdownMeta');
    if (meta) new MutationObserver(scheduleRender).observe(meta, { childList: true, subtree: true, characterData: true });
    setTimeout(renderNews, 1500);
    setTimeout(renderNews, 4000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
