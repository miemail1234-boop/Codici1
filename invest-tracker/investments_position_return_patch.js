(() => {
  'use strict';

  const ATTR = 'data-position-return-patched';

  function euroToNumber(text) {
    const raw = String(text || '').split('€')[0].trim().split(' ').pop();
    if (!raw) return null;
    const value = Number(raw.replaceAll('.', '').replace(',', '.'));
    return Number.isFinite(value) ? value : null;
  }

  function costToNumber(text) {
    const part = String(text || '').split('costo residuo ')[1]?.split(' · ')[0];
    if (!part) return null;
    return euroToNumber(part);
  }

  function pctText(value) {
    const sign = value > 0 ? '+' : '';
    const formatted = new Intl.NumberFormat('it-IT', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value);
    return `${sign}${formatted}%`;
  }

  function patchCard(card) {
    const metrics = card.querySelector('.metrics');
    if (!metrics) return;
    const valuePill = [...metrics.querySelectorAll('.pill')].find(node => node.textContent.includes('Valore aperto'));
    const detailLine = [...card.querySelectorAll('p.small')].find(node => node.textContent.includes('costo residuo'));
    const market = euroToNumber(valuePill?.textContent);
    const cost = costToNumber(detailLine?.textContent);
    if (!market || !cost) return;

    const value = ((market / cost) - 1) * 100;
    const text = `Rendimento ${pctText(value)}`;
    const cls = `pill ${value >= 0 ? 'pos' : 'neg'}`;
    let pill = metrics.querySelector(`[${ATTR}]`);
    if (!pill) {
      pill = document.createElement('span');
      pill.setAttribute(ATTR, '1');
      metrics.appendChild(pill);
    }
    if (pill.textContent !== text) pill.textContent = text;
    if (pill.className !== cls) pill.className = cls;
  }

  function patchAll() {
    const holder = document.getElementById('positions');
    if (!holder) return;
    holder.querySelectorAll('.asset').forEach(patchCard);
  }

  let timer = 0;
  function schedulePatch() {
    clearTimeout(timer);
    timer = setTimeout(patchAll, 50);
  }

  function start() {
    const holder = document.getElementById('positions');
    if (holder) new MutationObserver(schedulePatch).observe(holder, { childList: true, subtree: true });
    patchAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
