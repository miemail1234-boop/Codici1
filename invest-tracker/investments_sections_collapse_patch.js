(() => {
  'use strict';

  const SECTIONS = [
    { match: 'Log movimenti asset', label: 'Log movimenti asset' },
    { match: 'Allocazione attuale', label: 'Allocazione attuale' },
    { match: 'Watchlist / Aggiornamenti prezzo', label: 'Aggiornamenti prezzo', title: 'Aggiornamenti prezzo' },
  ];

  function panelByTitle(title) {
    return [...document.querySelectorAll('.panel')].find(panel => {
      const h2 = panel.querySelector(':scope > h2');
      return h2 && h2.textContent.trim() === title;
    });
  }

  function hideTrendPanel() {
    const panel = panelByTitle('Andamento');
    if (panel) panel.remove();
  }

  function makeCollapsible(config) {
    const panel = panelByTitle(config.match);
    if (!panel || panel.dataset.collapseReady === '1') return;

    const h2 = panel.querySelector(':scope > h2');
    if (!h2) return;
    if (config.title) h2.textContent = config.title;

    const content = document.createElement('div');
    content.className = 'section-collapse-content hidden';
    while (h2.nextSibling) content.appendChild(h2.nextSibling);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn primary section-collapse-btn';
    button.textContent = `Mostra ${config.label}`;
    button.style.margin = '8px 0 4px';

    panel.appendChild(button);
    panel.appendChild(content);
    panel.dataset.collapseReady = '1';
    panel.dataset.open = '0';

    button.addEventListener('click', () => {
      const open = panel.dataset.open !== '1';
      panel.dataset.open = open ? '1' : '0';
      content.classList.toggle('hidden', !open);
      button.textContent = `${open ? 'Nascondi' : 'Mostra'} ${config.label}`;
    });
  }

  function apply() {
    hideTrendPanel();
    SECTIONS.forEach(makeCollapsible);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }

  setTimeout(apply, 500);
  setTimeout(apply, 1500);
})();
