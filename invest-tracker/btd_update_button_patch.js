(() => {
  'use strict';
  if (window.__BTD_PERSISTENT_UPDATE_BUTTON__) return;
  window.__BTD_PERSISTENT_UPDATE_BUTTON__ = true;

  const SUPABASE_URL = 'https://kujyowhezihjambhpahe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
  const SCAN_FUNCTION = 'btd-scan-and-store';
  const client = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);
  let busy = false;

  function ensureButton() {
    const section = document.getElementById('etfDrawdownSection');
    if (!section || document.getElementById('etfDrawdownUpdateBtn')) return;
    const head = section.querySelector('.etf-head') || section.querySelector('h2')?.parentElement || section;
    const actions = document.createElement('div');
    actions.className = 'etf-update-actions';
    actions.innerHTML = '<button class="btn primary" type="button" id="etfDrawdownUpdateBtn">Aggiorna BTD Radar</button>';
    head.appendChild(actions);
  }

  async function runPersistentScan(button) {
    if (busy || !client) return;
    busy = true;
    const statusNode = document.getElementById('etfDrawdownUpdateStatus');
    const original = button?.textContent || 'Aggiorna BTD Radar';
    if (button) { button.disabled = true; button.textContent = 'Aggiornamento BTD…'; }
    if (statusNode) statusNode.textContent = 'Nuovo snapshot BTD Core v6 con rarity index in corso…';
    try {
      const { data, error } = await client.functions.invoke(SCAN_FUNCTION, { body: { requested_at: new Date().toISOString(), force: true, source: 'invest-tracker-ui' } });
      if (error || !data || data.status !== 'success') {
        const message = error?.message || data?.message || data?.error || `scan ${data?.status || 'fallito'}`;
        if (statusNode) statusNode.textContent = `Aggiornamento BTD non completo: ${message}`;
        return;
      }
      if (statusNode) statusNode.textContent = `Snapshot Core v6 salvato: ${data.success_count}/${data.asset_count} asset. Ricarico…`;
      setTimeout(() => document.getElementById('reloadBtn')?.click(), 120);
    } finally {
      busy = false;
      if (button) { button.disabled = false; button.textContent = original; }
    }
  }

  document.addEventListener('click', event => {
    const button = event.target.closest?.('#etfDrawdownUpdateBtn');
    if (button) runPersistentScan(button);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureButton, { once: true });
  else ensureButton();
  setTimeout(ensureButton, 1000);
  setTimeout(ensureButton, 3000);
})();