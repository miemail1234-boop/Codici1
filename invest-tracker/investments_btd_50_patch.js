(() => {
  'use strict';
  function load(src) {
    const s = document.createElement('script');
    s.src = src;
    s.defer = true;
    document.head.appendChild(s);
  }
  load('btd_edge_scan_patch.js?v=2');
  load('btd_cycle_auto_patch.js?v=3');
  load('btd_update_button_patch.js?v=1');
  load('btd_news_patch.js?v=2');
  load('investments_overview_chart.js?v=4');
  load('investments_entry_undo_patch.js?v=4');
  load('investments_entry_asset_name_patch.js?v=1');
  load('investments_position_return_patch.js?v=2');
  load('investments_sections_collapse_patch.js?v=7');
  load('investments_initial_metrics_patch.js?v=1');
  load('investments_strategy_buttons_patch.js?v=2');
})();
