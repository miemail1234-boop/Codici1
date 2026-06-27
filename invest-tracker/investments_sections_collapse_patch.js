(() => {
  'use strict';

  const DEFAULT_METRICS = { netReturn: true, annualNet: true };
  const LABELS = { 'Watchlist / Aggiornamenti prezzo': 'Aggiornamenti prezzo' };

  function emitInput(node) {
    if (!node) return;
    try { node.dispatchEvent(new Event('input', { bubbles: true })); }
    catch (err) {
      const ev = document.createEvent('Event');
      ev.initEvent('input', true, true);
      node.dispatchEvent(ev);
    }
  }

  function titleOf(panel) {
    const h = panel ? panel.getElementsByTagName('h2')[0] : null;
    return h ? h.textContent.trim() : '';
  }

  function eachChild(panel, button, fn) {
    const list = panel.children;
    for (let i = 0; i < list.length; i += 1) {
      if (list[i] !== button) fn(list[i]);
    }
  }

  function setPanelOpen(panel, button, label, open) {
    panel.dataset.open = open ? '1' : '0';
    button.textContent = (open ? '▾ ' : '▸ ') + label;
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    eachChild(panel, button, function (child) {
      child.style.display = open ? '' : 'none';
    });
  }

  function preparePanel(panel) {
    if (!panel || panel.id === 'authBox') return;
    const rawTitle = titleOf(panel);
    if (!rawTitle) return;
    if (rawTitle === 'Andamento') {
      panel.style.display = 'none';
      return;
    }
    if (panel.dataset.mobileSafeCollapse === '1') {
      const btn = panel.querySelector('.section-title-toggle');
      if (btn && panel.dataset.open !== '1') setPanelOpen(panel, btn, btn.dataset.label || rawTitle, false);
      return;
    }
    const label = LABELS[rawTitle] || rawTitle;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn primary section-title-toggle';
    button.dataset.label = label;
    button.style.width = '100%';
    button.style.justifyContent = 'flex-start';
    button.style.textAlign = 'left';
    button.style.margin = '0 0 6px';
    button.style.fontWeight = '700';
    panel.insertBefore(button, panel.firstChild);
    panel.dataset.mobileSafeCollapse = '1';
    button.addEventListener('click', function () {
      setPanelOpen(panel, button, label, panel.dataset.open !== '1');
    });
    setPanelOpen(panel, button, label, false);
  }

  function defaultMetricsOnce() {
    const controls = document.getElementById('metricControls');
    if (!controls || controls.dataset.defaultMetricsDone === '1') return;
    const checks = controls.querySelectorAll('[data-metric-check]');
    if (!checks.length) return;
    for (let i = 0; i < checks.length; i += 1) {
      checks[i].checked = !!DEFAULT_METRICS[checks[i].value];
      checks[i].style.minWidth = '22px';
      checks[i].style.minHeight = '22px';
    }
    const monthly = document.getElementById('monthlyNetMetricCheck');
    if (monthly) {
      monthly.checked = true;
      monthly.style.minWidth = '22px';
      monthly.style.minHeight = '22px';
    }
    controls.dataset.defaultMetricsDone = '1';
    emitInput(checks[0]);
  }

  function apply() {
    const panels = document.querySelectorAll('.panel');
    for (let i = 0; i < panels.length; i += 1) preparePanel(panels[i]);
    defaultMetricsOnce();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
  setTimeout(apply, 600);
  setTimeout(apply, 1800);
  setTimeout(apply, 3500);
})();
