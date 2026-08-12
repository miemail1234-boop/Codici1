(() => {
  'use strict';
  if (window.__BTD_CORE_V6_PATCH__) return;
  window.__BTD_CORE_V6_PATCH__ = true;

  const CORE_FUNCTION = 'btd-score-readout';

  function setText(node, value) {
    if (node && node.textContent !== value) node.textContent = value;
  }

  function captureReadout(response) {
    try {
      response.clone().json().then(data => {
        if (data?.results && Array.isArray(data.results)) {
          window.__BTD_LAST_READOUT__ = data;
          setTimeout(decorate, 0);
        }
      }).catch(() => {});
    } catch (_) {}
    return response;
  }

  function makeRoutedFetch(baseFetch) {
    if (typeof baseFetch !== 'function') return baseFetch;
    const routed = async function (input, init) {
      try {
        const isRequest = typeof Request !== 'undefined' && input instanceof Request;
        const rawUrl = isRequest ? input.url : String(input);
        if (rawUrl.includes('/functions/v1/btd-current-scan')) {
          const nextUrl = rawUrl.replace('/functions/v1/btd-current-scan', `/functions/v1/${CORE_FUNCTION}`);
          const response = isRequest
            ? await baseFetch(new Request(nextUrl, input), init)
            : await baseFetch(nextUrl, init);
          return captureReadout(response);
        }
        const response = await baseFetch(input, init);
        if (rawUrl.includes(`/functions/v1/${CORE_FUNCTION}`)) captureReadout(response);
        return response;
      } catch (_) {
        return baseFetch(input, init);
      }
    };
    routed.__btdCoreWrapped = true;
    return routed;
  }

  function patchSupabaseFactory() {
    const sb = window.supabase;
    if (!sb?.createClient || sb.createClient.__btdCoreWrapped) return;
    const original = sb.createClient.bind(sb);
    const wrapped = function (...args) {
      const options = args[2] && typeof args[2] === 'object' ? args[2] : {};
      const globalOptions = options.global && typeof options.global === 'object' ? options.global : {};
      const baseFetch = globalOptions.fetch || window.fetch.bind(window);
      args[2] = { ...options, global: { ...globalOptions, fetch: makeRoutedFetch(baseFetch) } };
      return original(...args);
    };
    wrapped.__btdCoreWrapped = true;
    sb.createClient = wrapped;
  }

  function rarityCard(row) {
    const score = Number(row?.historical_rarity_score);
    if (!Number.isFinite(score)) return null;
    const card = document.createElement('div');
    card.className = 'btd-driver btd-rarity-driver';
    const pct = Math.max(0, Math.min(100, score));
    const proxy = row.historical_rarity_proxy ? ` · proxy ${row.historical_rarity_ticker}` : '';
    card.innerHTML = `<span>Rarità storica · 40%</span><strong>${Math.round(score)}</strong><small>${row.historical_rarity_label || ''}${proxy}</small><div class="mini"><i style="width:${pct}%"></i></div>`;
    return card;
  }

  function decorateRarity() {
    const results = window.__BTD_LAST_READOUT__?.results;
    if (!Array.isArray(results)) return;
    const byId = new Map(results.map(row => [String(row.n), row]));
    document.querySelectorAll('.btd-detail[id^="btdDetail-"]').forEach(detail => {
      const id = detail.id.replace('btdDetail-', '');
      const row = byId.get(id);
      if (!row) return;
      const grid = detail.querySelector('.btd-score-grid');
      if (grid && !grid.querySelector('.btd-rarity-driver')) {
        const card = rarityCard(row);
        if (card) grid.prepend(card);
      }
      const why = detail.querySelector('.btd-why');
      if (why && !why.querySelector('.btd-rarity-note') && Number.isFinite(Number(row.historical_rarity_score))) {
        const note = document.createElement('div');
        note.className = 'btd-rarity-note';
        const source = row.historical_rarity_proxy ? `; profilo proxy ${row.historical_rarity_ticker}` : '';
        note.textContent = `Rarità storica: ${Math.round(Number(row.historical_rarity_score))}/100 · ${row.historical_rarity_label}${source}.`;
        why.prepend(note);
      }
    });
  }

  function decorate() {
    const section = document.getElementById('etfDrawdownSection');
    const description = section?.querySelector('.etf-head h2 + .small');
    setText(description, 'BTD Core v6: rarità storica del drawdown 40% + DD/vol 10% + ciclo 22,5% + monetario 17,5% + momentum 10%. Rischio strutturale solo warning.');

    document.querySelectorAll('.btd-score-grid .btd-driver').forEach(card => {
      const label = card.querySelector('span')?.textContent?.trim();
      if (label === 'Utili' || label === 'Rischio strutturale') card.style.display = 'none';
    });

    document.querySelectorAll('.btd-context-editor').forEach(editor => {
      const earnings = editor.querySelector('[data-field="earnings_score"]')?.closest('label');
      if (earnings) earnings.style.display = 'none';
      const risk = editor.querySelector('[data-field="structural_risk_score"]');
      if (risk) {
        const label = risk.closest('label');
        const first = label && [...label.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
        if (first) first.nodeValue = 'Rischio strutturale (solo warning)';
        risk.title = 'Non modifica il BTD Core Score; genera solo un avviso quando elevato.';
      }
    });

    document.querySelectorAll('.btd-context-warning').forEach(node => {
      if (/neutrali a 50|utili|rischio strutturale/i.test(node.textContent || '')) node.style.display = 'none';
    });
    document.querySelectorAll('.btd-signal small').forEach(node => {
      if ((node.textContent || '').trim().toLowerCase() === 'provvisorio') node.remove();
    });
    document.querySelectorAll('.btd-why').forEach(node => {
      let html = node.innerHTML;
      [
        'I driver macro sono ancora neutrali a 50/100: il punteggio è provvisorio finché non vengono configurati.',
        'Ciclo economico e politica monetaria sono automatici; utili e rischio strutturale sono ancora neutrali a 50/100: il punteggio resta parzialmente provvisorio.',
        'Politica monetaria, utili e rischio strutturale sono ancora neutrali a 50/100: il punteggio resta parzialmente provvisorio.',
        'Gli utili/revisioni sono impostati come costruttivi.',
        'Gli utili/revisioni restano un punto debole.'
      ].forEach(text => { html = html.replace(text, ''); });
      html = html.replace(/\s{2,}/g, ' ').trim();
      if (node.innerHTML !== html) node.innerHTML = html;
    });

    document.querySelectorAll('#etfDrawdownSummary .etf-card').forEach(card => {
      const label = card.querySelector('span');
      if (label && /^Macro/.test(label.textContent || '')) {
        setText(label, 'BTD Core');
        setText(card.querySelector('strong'), '5');
        setText(card.querySelector('small'), 'driver automatici');
      }
    });

    const meta = document.getElementById('etfDrawdownMeta');
    if (meta && /BTD Score|BTD Core|Fonte mercato/.test(meta.textContent || '')) {
      const suffix = meta.textContent?.match(/aggiornato\s+(.+?)(?:\.|$)/i)?.[1];
      setText(meta, `BTD Core v6 · snapshot persistente · Rarity 40% · DD/vol 10% · ciclo 22,5% · monetario 17,5% · momentum 10%${suffix ? ` · aggiornato ${suffix}` : ''}.`);
    }
    const status = document.getElementById('etfDrawdownUpdateStatus');
    if (status && /BTD Score v|BTD Core/.test(status.textContent || '')) setText(status, 'BTD Core v6: ultimo snapshot completo persistito in Supabase.');
    decorateRarity();
  }

  patchSupabaseFactory();
  const style = document.createElement('style');
  style.id = 'btdCoreV6Styles';
  style.textContent = '.btd-score-grid{grid-template-columns:repeat(5,minmax(0,1fr))!important}.btd-rarity-driver{border-color:rgba(125,211,252,.45)!important}.btd-rarity-driver small{display:block;font-size:10px;color:var(--muted);margin-top:2px}.btd-rarity-note{margin-bottom:6px;font-weight:700;color:#bae6fd}@media(max-width:800px){.btd-score-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}';
  document.head.appendChild(style);
  const observer = new MutationObserver(decorate);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', decorate, { once: true });
  setTimeout(decorate, 1200);
})();