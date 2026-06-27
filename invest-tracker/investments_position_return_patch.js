(() => {
  'use strict';

  const PATCH_ATTR = 'data-position-return-patched';

  function parseEuro(text) {
    const match = String(text || '').match(/-?\d[\d.]*,\d{2}/);
    if (!match) return null;
    const value = Number(match[0].replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(value) ? value : null;
  }

  function parseCost(text) {
    const match = String(text || '').match(/costo residuo\s+(-?\d[\d.]*,\d{2})/i);
    if (!match) return null;
    const value = Number(match[1].replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(value) ? value : null;
  }

  function formatPct(value) {
    const sign = value > 0 ? '+' : '';
    return `${sign}${new Intl.NumberFormat('it-IT', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value)}%`;
  }

  function patchPositionCard(card) {
    const metrics = card.querySelector('.metrics');
    if (!metrics) return;

    const oldPill = metrics.querySelector(`[${PATCH_ATTR}]`);
    if (oldPill) oldPill.remove();

    const valuePill = [...metrics.querySelectorAll('.pill')]
      .find(node => node.textContent.includes('Valore aperto'));
    const detailLine = [...card.querySelectorAll('p.small')]
      .find(node => node.textContent.includes('costo residuo'));

    const marketValue = parseEuro(valuePill?.textContent);
    const openCost = parseCost(detailLine?.textContent);
    if (!marketValue || !openCost) return;

    const returnPct = ((marketValue / openCost) - 1) * 100;
    const pill = document.createElement('span');
    pill.className = `pill ${returnPct >= 0 ? 'pos' : 'neg'}`;
    pill.setAttribute(PATCH_ATTR, '1');
    pill.textContent = `Rendimento ${formatPct(returnPct)}`;
    metrics.appendChild(pill);
  }

  function patchAll() {
    const holder = document.getElementById('positions');
    if (!holder) return;
    holder.querySelectorAll('.asset').forEach(patchPositionCard);
  }

  const observer = new MutationObserver(() => patchAll());

  function start() {
    const holder = document.getElementById('positions');
    if (holder) observer.observe(holder, { childList: true, subtree: true });
    patchAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
