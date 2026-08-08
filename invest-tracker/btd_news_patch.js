(() => {
  'use strict';
  if (window.__BTD_NEWS_PATCH__) return;
  window.__BTD_NEWS_PATCH__ = true;

  const STORAGE_KEY = 'invest-tracker-btd-news-history-v2';
  const TODAY = new Date().toISOString().slice(0, 10);

  const num = value => {
    const parsed = Number(String(value ?? '').replace('%', '').replace(',', '.').trim());
    return Number.isFinite(parsed) ? parsed : null;
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const fmtPct = value => value == null ? '—' : `${new Intl.NumberFormat('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)}%`;
  const fmtScore = value => value == null ? '—' : `${Math.round(value)}/100`;

  function injectStyles() {
    if (document.getElementById('btdNewsStyles')) return;
    const style = document.createElement('style');
    style.id = 'btdNewsStyles';
    style.textContent = `
      .btd-news{margin:14px 0;padding:14px;border:1px solid var(--border);border-radius:18px;background:linear-gradient(135deg,rgba(2,132,199,.10),rgba(15,118,110,.08))}
      .btd-news-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:10px}
      .btd-news-head h3{margin:0;font-size:18px}
      .btd-news-list{display:grid;gap:8px}
      .btd-news-item{display:grid;grid-template-columns:minmax(150px,1.35fr) minmax(115px,.8fr) auto auto minmax(135px,.9fr);gap:10px;align-items:center;padding:10px 12px;border:1px solid var(--border);border-radius:14px;background:rgba(255,255,255,.03)}
      .btd-news-item strong{display:block}.btd-news-item small{color:var(--muted)}
      .btd-news-level{font-weight:800;font-size:12px}
      .btd-news-level.very-strong{color:var(--ok)}
      .btd-news-level.interesting{color:var(--accent)}
      .btd-news-level.observe{color:var(--warn)}
      .btd-news-level.value-trap,.btd-news-level.prudence{color:var(--danger)}
      .btd-news-level.neutral{color:var(--muted)}
      .btd-news-score{font-size:18px;font-weight:800}
      .btd-news-empty{color:var(--muted);margin:0}
      @media(max-width:760px){
        .btd-news-item{grid-template-columns:1fr 1fr}
        .btd-news-item .btd-news-trend{grid-column:1/-1}
      }
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
      const dd52 = num(row.querySelector('.etf-dd')?.childNodes?.[0]?.textContent || row.querySelector('.etf-dd')?.textContent);
      const score = num(row.dataset.btdScore);
      const signal = row.dataset.btdSignal || '';
      const regime = row.dataset.regime || '';
      const provisional = !!row.querySelector('.btd-signal small');
      const isOk = row.classList.contains('ok') || !['failed', 'outlier', 'suspicious', 'pending'].some(cls => row.classList.contains(cls));
      return { asset, dd52, score, signal, regime, provisional, isOk };
    }).filter(row => row.asset && row.score != null && row.isOk);
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
    history[TODAY] = Object.fromEntries(rows.map(row => [row.asset, { score: row.score, dd52: row.dd52 }]));
    const dates = Object.keys(history).sort();
    while (dates.length > 14) delete history[dates.shift()];
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch (_) {}
  }

  function signalClass(signal) {
    if (signal === 'MOLTO INTERESSANTE') return 'very-strong';
    if (signal === 'INTERESSANTE') return 'interesting';
    if (signal === 'OSSERVA') return 'observe';
    if (signal === 'VALUE TRAP RISK') return 'value-trap';
    if (signal === 'PRUDENZA') return 'prudence';
    return 'neutral';
  }

  function trendFor(row, previous) {
    const old = previous?.[row.asset];
    if (!old || num(old.score) == null) return 'Nuovo riferimento';
    const delta = row.score - Number(old.score);
    if (delta >= 5) return `Score in miglioramento (+${Math.round(delta)})`;
    if (delta <= -5) return `Score in deterioramento (${Math.round(delta)})`;
    const oldDd = num(old.dd52);
    if (oldDd != null && row.dd52 != null) {
      const ddDelta = row.dd52 - oldDd;
      if (ddDelta <= -2) return `Score stabile, dip più profondo (${fmtPct(ddDelta)} p.p.)`;
      if (ddDelta >= 2) return `Score stabile, rimbalzo (${fmtPct(ddDelta)} p.p.)`;
    }
    return `Score stabile (${delta >= 0 ? '+' : ''}${Math.round(delta)})`;
  }

  function median(values) {
    const clean = values.filter(value => num(value) != null).map(Number).sort((a, b) => a - b);
    if (!clean.length) return null;
    const middle = Math.floor(clean.length / 2);
    return clean.length % 2 ? clean[middle] : (clean[middle - 1] + clean[middle]) / 2;
  }

  function renderNews() {
    const node = ensureContainer();
    if (!node) return;
    const rows = readRowsFromRadar();
    if (!rows.length) {
      node.innerHTML = '<div class="btd-news-head"><div><h3>BTD News</h3><p class="small">Sintesi automatica basata sul BTD Score.</p></div></div><p class="btd-news-empty">Attendo i dati aggiornati del BTD Radar…</p>';
      return;
    }

    const history = loadHistory();
    const previous = previousSnapshot(history);
    const opportunities = rows
      .filter(row => row.score >= 60 || row.signal === 'VALUE TRAP RISK')
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    const scoreMedian = median(rows.map(row => row.score));
    const configuredCount = rows.filter(row => !row.provisional).length;
    const meta = document.getElementById('etfDrawdownMeta')?.textContent?.trim() || '';

    node.innerHTML =
      `<div class="btd-news-head"><div><h3>BTD News</h3><p class="small">Segnali ordinati per BTD Score, non per semplice drawdown. Mediana radar: ${fmtScore(scoreMedian)} · macro configurato ${configuredCount}/${rows.length}.</p></div><span class="badge ok">${opportunities.length} segnali</span></div>` +
      (opportunities.length
        ? `<div class="btd-news-list">${opportunities.map(row =>
            `<div class="btd-news-item">
              <div><strong>${esc(row.asset)}</strong><small>${row.provisional ? 'Macro neutro · score provvisorio' : 'Contesto macro configurato'}</small></div>
              <span class="btd-news-level ${signalClass(row.signal)}">${esc(row.signal || '—')}</span>
              <span class="btd-news-score">${fmtScore(row.score)}</span>
              <strong>${fmtPct(row.dd52)}<small>DD 52 sett.</small></strong>
              <span class="btd-news-trend small">${esc(trendFor(row, previous))}</span>
            </div>`).join('')}</div>`
        : '<p class="btd-news-empty">Nessun asset raggiunge oggi BTD Score 60/100.</p>') +
      `<p class="small" style="margin:10px 0 0">${esc(meta)}</p>`;

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
