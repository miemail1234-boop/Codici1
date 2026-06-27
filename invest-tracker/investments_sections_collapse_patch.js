(() => {
  'use strict';

  const TITLE_OVERRIDES = { 'Watchlist / Aggiornamenti prezzo': 'Aggiornamenti prezzo' };
  const LABEL_OVERRIDES = { 'Watchlist / Aggiornamenti prezzo': 'Aggiornamenti prezzo' };
  const DEFAULT_METRIC_KEYS = { netReturn: true, annualNet: true };

  function h2(panel) { return panel ? panel.getElementsByTagName('h2')[0] : null; }
  function title(panel) { const node = h2(panel); return node ? node.textContent.trim() : ''; }
  function emitInput(node) {
    if (!node) return;
    try {
      node.dispatchEvent(new Event('input', { bubbles: true }));
    } catch (e) {
      const ev = document.createEvent('Event');
      ev.initEvent('input', true, true);
      node.dispatchEvent(ev);
    }
  }
  function btnText(button, label, open) {
    button.textContent = (open ? '▾ ' : '▸ ') + label;
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function hideTrend() {
    const panels = document.querySelectorAll('.panel');
    for (let i = 0; i < panels.length; i++) {
      if (title(panels[i]) === 'Andamento') panels[i].style.display = 'none';
    }
  }
  function collapse(panel) {
    if (!panel || panel.id === 'authBox' || panel.dataset.collapseReady === '1') return;
    const head = h2(panel);
    if (!head) return;
    const oldTitle = head.textContent.trim();
    if (oldTitle === 'Andamento') return;
    const visible = TITLE_OVERRIDES[oldTitle] || oldTitle;
    const label = LABEL_OVERRIDES[oldTitle] || visible;
    head.textContent = visible;
    const content = document.createElement('div');
    content.className = 'section-collapse-content';
    content.style.display = 'none';
    while (panel.firstChild) content.appendChild(panel.firstChild);
    const movedTitle = h2(content);
    if (movedTitle) movedTitle.style.display = 'none';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn primary section-title-toggle';
    button.style.width = '100%';
    button.style.justifyContent = 'flex-start';
    button.style.textAlign = 'left';
    button.style.margin = '0 0 4px';
    button.style.fontWeight = '700';
    btnText(button, label, false);
    panel.appendChild(button);
    panel.appendChild(content);
    panel.dataset.collapseReady = '1';
    panel.dataset.open = '0';
    button.addEventListener('click', function () {
      const open = panel.dataset.open !== '1';
      panel.dataset.open = open ? '1' : '0';
      content.style.display = open ? 'block' : 'none';
      btnText(button, label, open);
    });
  }
  function defaultMetrics() {
    const controls = document.getElementById('metricControls');
    if (!controls || controls.dataset.defaultMetricsApplied === '1') return;
    const checks = controls.querySelectorAll('[data-metric-check]');
    if (!checks.length) return;
    for (let i = 0; i < checks.length; i++) {
      checks[i].checked = !!DEFAULT_METRIC_KEYS[checks[i].value];
      checks[i].style.minWidth = '22px';
      checks[i].style.minHeight = '22px';
    }
    const monthly = document.getElementById('monthlyNetMetricCheck');
    if (monthly) monthly.checked = true;
    controls.dataset.defaultMetricsApplied = '1';
    emitInput(checks[0]);
  }
  function checkboxFix() {
    const controls = document.getElementById('metricControls');
    if (!controls || controls.dataset.androidMetricFix === '1') return;
    controls.dataset.androidMetricFix = '1';
    controls.addEventListener('change', function (event) {
      const target = event.target;
      if (target && target.matches && target.matches('[data-metric-check]')) setTimeout(function () { emitInput(target); }, 0);
    }, true);
  }
  function apply() {
    hideTrend();
    const panels = document.querySelectorAll('.panel');
    for (let i = 0; i < panels.length; i++) collapse(panels[i]);
    defaultMetrics();
    checkboxFix();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
  setTimeout(apply, 500);
  setTimeout(apply, 1500);
  setTimeout(apply, 3000);
  setTimeout(apply, 5000);
})();
