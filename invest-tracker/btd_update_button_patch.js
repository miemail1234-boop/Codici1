(() => {
  'use strict';

  function ensureButton() {
    const section = document.getElementById('etfDrawdownSection');
    if (!section || document.getElementById('etfDrawdownUpdateBtn')) return;
    const head = section.querySelector('.etf-head') || section.querySelector('h2')?.parentElement || section;
    const actions = document.createElement('div');
    actions.className = 'etf-update-actions';
    actions.innerHTML = '<button class="btn primary" type="button" id="etfDrawdownUpdateBtn">Aggiorna BTD Radar</button>';
    head.appendChild(actions);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureButton, { once: true });
  } else {
    ensureButton();
  }

  setTimeout(ensureButton, 1000);
  setTimeout(ensureButton, 3000);
})();
