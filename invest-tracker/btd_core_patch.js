(() => {
  'use strict';
  if (window.__BTD_CORE_V5_PATCH__) return;
  window.__BTD_CORE_V5_PATCH__ = true;

  const CORE_FUNCTION = 'btd-core-scan';

  function migrateNewsHistoryOnce() {
    try {
      const flag = 'invest-tracker-btd-core-v5-history-migrated-v2';
      if (localStorage.getItem(flag) === '1') return;
      localStorage.removeItem('invest-tracker-btd-news-history-v2');
      localStorage.setItem(flag, '1');
    } catch (_) {}
  }

  function makeRoutedFetch(baseFetch) {
    if (typeof baseFetch !== 'function') return baseFetch;
    const routed = function (input, init) {
      try {
        const isRequest = typeof Request !== 'undefined' && input instanceof Request;
        const rawUrl = isRequest ? input.url : String(input);
        if (rawUrl.includes('/functions/v1/btd-current-scan')) {
          const nextUrl = rawUrl.replace('/functions/v1/btd-current-scan', `/functions/v1/${CORE_FUNCTION}`);
          if (isRequest) return baseFetch(new Request(nextUrl, input), init);
          return baseFetch(nextUrl, init);
        }
      } catch (_) {}
      return baseFetch(input, init);
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
      args[2] = {
        ...options,
        global: {
          ...globalOptions,
          fetch: makeRoutedFetch(baseFetch)
        }
      };
      return original(...args);
    };
    wrapped.__btdCoreWrapped = true;
    sb.createClient = wrapped;
  }

  function setText(node, value) {
    if (node && node.textContent !== value) node.textContent = value;
  }

  function decorate() {
    const section = document.getElementById('etfDrawdownSection');
    const description = section?.querySelector('.etf-head h2 + .small');
    setText(description, 'BTD Core Score 0–100: drawdown normalizzato + ciclo economico + politica monetaria + momentum. Utili e rischio strutturale non entrano nel punteggio.');

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
        if (first && first.nodeValue !== 'Rischio strutturale (solo warning)') first.nodeValue = 'Rischio strutturale (solo warning)';
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
      const obsolete = [
        'I driver macro sono ancora neutrali a 50/100: il punteggio è provvisorio finché non vengono configurati.',
        'Ciclo economico e politica monetaria sono automatici; utili e rischio strutturale sono ancora neutrali a 50/100: il punteggio resta parzialmente provvisorio.',
        'Politica monetaria, utili e rischio strutturale sono ancora neutrali a 50/100: il punteggio resta parzialmente provvisorio.',
        'Gli utili/revisioni sono impostati come costruttivi.',
        'Gli utili/revisioni restano un punto debole.'
      ];
      obsolete.forEach(text => { html = html.replace(text, ''); });
      html = html.replace(/\s{2,}/g, ' ').trim();
      if (node.innerHTML !== html) node.innerHTML = html;
    });

    document.querySelectorAll('#etfDrawdownSummary .etf-card').forEach(card => {
      const label = card.querySelector('span');
      if (label && /^Macro/.test(label.textContent || '')) {
        setText(label, 'BTD Core');
        setText(card.querySelector('strong'), '4');
        setText(card.querySelector('small'), 'driver automatici');
      }
    });

    document.querySelectorAll('#btdNews .btd-news-item > div:first-child small').forEach(node => {
      const text = (node.textContent || '').trim();
      if (text === 'Macro neutro · score provvisorio' || text === 'Contesto macro configurato') setText(node, '4 driver automatici');
    });
    const newsMeta = document.querySelector('#btdNews .btd-news-head .small');
    if (newsMeta) {
      const next = (newsMeta.textContent || '').replace(/macro configurato\s+\d+\/\d+/i, 'Core automatico 14/14');
      setText(newsMeta, next);
    }

    const meta = document.getElementById('etfDrawdownMeta');
    if (meta && /BTD Score|Fonte mercato/.test(meta.textContent || '')) {
      const suffix = meta.textContent?.match(/aggiornato\s+(.+?)(?:\.|$)/i)?.[1];
      const value = `BTD Core v5 · pesi: DD 43,75% · ciclo 25% · monetario 18,75% · momentum 12,5%${suffix ? ` · aggiornato ${suffix}` : ''}.`;
      setText(meta, value);
    }

    const status = document.getElementById('etfDrawdownUpdateStatus');
    if (status && /BTD Score v|BTD Core/.test(status.textContent || '')) {
      setText(status, 'BTD Core v5 attivo: 4 driver automatici, cache macro 24h.');
    }
  }

  migrateNewsHistoryOnce();
  patchSupabaseFactory();

  const style = document.createElement('style');
  style.id = 'btdCoreV5Styles';
  style.textContent = '.btd-score-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}@media(max-width:800px){.btd-score-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}';
  document.head.appendChild(style);

  const observer = new MutationObserver(decorate);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', decorate, { once: true });
  setTimeout(decorate, 1200);
})();