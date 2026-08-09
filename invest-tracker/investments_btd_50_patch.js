(() => {
  'use strict';
  function load(src) {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    document.head.appendChild(s);
  }
  // I moduli BTD core sono caricati direttamente da index.html in ordine deterministico.
  load('investments_overview_chart.js?v=4');
  load('investments_entry_undo_patch.js?v=4');
  load('investments_entry_asset_name_patch.js?v=1');
  load('investments_position_return_patch.js?v=2');
  load('investments_sections_collapse_patch.js?v=7');
  load('investments_initial_metrics_patch.js?v=1');
  load('investments_strategy_buttons_patch.js?v=2');
})();
