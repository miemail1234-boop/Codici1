(() => {
  'use strict';

  const TITLE_OVERRIDES = {
    'Watchlist / Aggiornamenti prezzo': 'Aggiornamenti prezzo',
  };

  const LABEL_OVERRIDES = {
    'Watchlist / Aggiornamenti prezzo': 'Aggiornamenti prezzo',
  };

  const HIDDEN_TITLES = {
    'Andamento': true,
  };

  const ALLOWED_DASHBOARD_TITLES = {
    'Rendimento totale netto': true,
    'Media annua netta': true,
    'Netto mensile stimato': true,
  };

  const ALLOWED_METRIC_KEYS = {
    netReturn: true,
    annualNet: true,
  };

  function firstH2(panel) {
    return panel ? panel.getElementsByTagName('h2')[0] : null;
  }

  function currentTitle(panel) {
    const h2 = firstH2(panel);
    return h2 ? h2.textContent.trim() : '';
  }

  function setButtonText(button, label, open) {
    button.textContent = `${open ? '▾' : '▸'} ${label}`;
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function hideTrendPanels() {
    const panels = document.querySelectorAll('.panel');
    for (let i = 0; i < panels.length; i += 1) {
      const title = currentTitle(panels[i]);
      if (HIDDEN_TITLES[title]) panels[i].style.display = 'none';
    }
  }

  function makeCollapsible(panel) {
    if (!panel || panel.id === 'authBox' || panel.dataset.collapseReady === '1') return;

    const h2 = firstH2(panel);
    if (!h2) return;

    const originalTitle = h2.textContent.trim();
    if (HIDDEN_TITLES[originalTitle]) return;

    const visibleTitle = TITLE_OVERRIDES[originalTitle] || originalTitle;
    const label = LABEL_OVERRIDES[originalTitle] || visibleTitle;
    h2.textContent = visibleTitle;

    const content = document.createElement('div');
    content.className = 'section-collapse-content';
    content.style.display = 'none';

    while (panel.firstChild) content.appendChild(panel.firstChild);

    const movedTitle = firstH2(content);
    if (movedTitle) movedTitle.style.display = 'none';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn primary section-title-toggle';
    button.style.width = '100%';
    button.style.justifyContent = 'flex-start';
    button.style.textAlign = 'left';
    button.style.margin = '0 0 4px';
    button.style.fontWeight = '700';
    setButtonText(button, label, false);

    panel.appendChild(button);
    panel.appendChild(content);
    panel.dataset.collapseReady = '1';
    panel.dataset.open = '0';

    button.addEventListener('click', function () {
      const open = panel.dataset.open !== '1';
      panel.dataset.open = open ? '1' : '0';
      content.style.display = open ? 'block' : 'none';
      setButtonText(button, label, open);
    });
  }

  function collapseAllPanels() {
    const panels = document.querySelectorAll('.panel');
    for (let i = 0; i < panels.length; i += 1) makeCollapsible(panels[i]);
  }

  function enforceMetricInputs() {
    const checks = document.querySelectorAll('[data-metric-check]');
    for (let i = 0; i < checks.length; i += 1) {
      const input = checks[i];
      input.checked = !!ALLOWED_METRIC_KEYS[input.value];
    }
    const monthly = document.getElementById('monthlyNetMetricCheck');
    if (monthly) monthly.checked = true;
  }

  function filterDashboardCards() {
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;
    const cards = dashboard.querySelectorAll('.card');
    for (let i = 0; i < cards.length; i += 1) {
      const titleNode = cards[i].getElementsByTagName('h3')[0];
      const title = titleNode ? titleNode.textContent.trim() : '';
      cards[i].style.display = ALLOWED_DASHBOARD_TITLES[title] ? '' : 'none';
    }
  }

  function apply() {
    hideTrendPanels();
    collapseAllPanels();
    enforceMetricInputs();
    filterDashboardCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }

  const observer = new MutationObserver(function () {
    enforceMetricInputs();
    filterDashboardCards();
  });

  function observeDashboard() {
    const dashboard = document.getElementById('dashboard');
    if (dashboard && dashboard.dataset.keyMetricsObserver !== '1') {
      dashboard.dataset.keyMetricsObserver = '1';
      observer.observe(dashboard, { childList: true, subtree: true });
    }
  }

  setTimeout(function () { apply(); observeDashboard(); }, 500);
  setTimeout(function () { apply(); observeDashboard(); }, 1500);
  setTimeout(function () { apply(); observeDashboard(); }, 3000);
  setTimeout(function () { apply(); observeDashboard(); }, 5000);
})();
