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

  const DEFAULT_METRIC_KEYS = {
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

    button.addEventListener('click', function (event) {
      event.preventDefault();
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

  function applyDefaultMetricsOnce() {
    const controls = document.getElementById('metricControls');
    if (!controls || controls.dataset.defaultMetricsApplied === '1') return;
    const checks = controls.querySelectorAll('[data-metric-check]');
    if (!checks.length) return;
    for (let i = 0; i < checks.length; i += 1) {
      const input = checks[i];
      input.checked = !!DEFAULT_METRIC_KEYS[input.value];
    }
    const monthly = document.getElementById('monthlyNetMetricCheck');
    if (monthly) monthly.checked = true;
    controls.dataset.defaultMetricsApplied = '1';
    const first = checks[0];
    if (first) first.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function makeMetricLabelsMobileFriendly() {
    const labels = document.querySelectorAll('#metricControls label.check');
    for (let i = 0; i < labels.length; i += 1) {
      const label = labels[i];
      if (label.dataset.mobileCheckReady === '1') continue;
      label.dataset.mobileCheckReady = '1';
      label.style.cursor = 'pointer';
      label.addEventListener('click', function (event) {
        const input = label.querySelector('input');
        if (!input || event.target === input) return;
        event.preventDefault();
        input.checked = !input.checked;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
  }

  function apply() {
    hideTrendPanels();
    collapseAllPanels();
    applyDefaultMetricsOnce();
    makeMetricLabelsMobileFriendly();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }

  setTimeout(apply, 500);
  setTimeout(apply, 1500);
  setTimeout(apply, 3000);
  setTimeout(apply, 5000);
})();
