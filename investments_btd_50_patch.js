(() => {
  'use strict';
  const scripts = [
    'investments_btd_correct_render.js?v=1',
    'investments_entry_undo_patch.js?v=4'
  ];
  for (const src of scripts) {
    const s = document.createElement('script');
    s.src = `${src}&t=${Date.now()}`;
    s.defer = true;
    document.head.appendChild(s);
  }
})();
