(() => {
  'use strict';
  function load(src) {
    const s = document.createElement('script');
    s.src = src;
    s.defer = true;
    document.head.appendChild(s);
  }
  load('investments_overview_chart.js?v=4');
  load('investments_full_history_charts.js?v=2');
  load('investments_btd_correct_render.js?v=1');
  load('investments_btd_full_names_patch.js?v=1');
  load('investments_entry_undo_patch.js?v=4');
  load('investments_entry_asset_name_patch.js?v=1');
})();
