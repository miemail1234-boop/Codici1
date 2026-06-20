(() => {
  'use strict';

  if (window.__investmentEntryAssetNamePatchLoaded) return;
  window.__investmentEntryAssetNamePatchLoaded = true;

  const SUPABASE_URL = 'https://kujyowhezihjambhpahe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
  const client = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);

  const n = (value) => {
    const parsed = Number(String(value ?? 0).replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  function sortEntries(rows) {
    return (rows || []).slice().sort((a, b) => {
      return String(b.date || '').localeCompare(String(a.date || '')) || n(b.created_at_ms) - n(a.created_at_ms);
    });
  }

  async function getUserId() {
    const auth = await client.auth.getSession();
    return auth.data.session?.user?.id || '';
  }

  function assetForEntry(entry, assets) {
    return assets.find((asset) => asset.block_id === entry.generic_option) || null;
  }

  function ensureAssetName(item, asset) {
    if (!asset?.name) return;
    let label = item.querySelector('[data-price-update-asset-name]');
    if (!label) {
      label = document.createElement('div');
      label.dataset.priceUpdateAssetName = '1';
      label.className = 'small';
      label.style.margin = '4px 0 6px';
      const firstChild = item.firstElementChild;
      if (firstChild) firstChild.insertAdjacentElement('afterend', label);
      else item.prepend(label);
    }
    label.innerHTML = `<strong>Asset aggiornato:</strong> ${asset.name}`;
  }

  async function attachAssetNames() {
    const holder = document.getElementById('entryLog');
    if (!holder || !client || holder.dataset.assetNamePatchBusy === '1') return;
    holder.dataset.assetNamePatchBusy = '1';
    try {
      const userId = await getUserId();
      if (!userId) return;
      const [entryRows, assetRows] = await Promise.all([
        client.from('investment_entries').select('id,date,created_at_ms,transaction_type,current_price,generic_option').eq('user_id', userId),
        client.from('investment_assets').select('name,block_id').eq('user_id', userId),
      ]);
      if (entryRows.error) throw entryRows.error;
      if (assetRows.error) throw assetRows.error;
      const rows = sortEntries(entryRows.data || []).slice(0, 80);
      const assets = assetRows.data || [];
      const items = [...holder.querySelectorAll('.log-item')];
      items.forEach((item, index) => {
        const row = rows[index];
        if (!row || row.transaction_type === 'buy' || !n(row.current_price)) return;
        ensureAssetName(item, assetForEntry(row, assets));
      });
    } catch (error) {
      console.error(error);
    } finally {
      holder.dataset.assetNamePatchBusy = '0';
    }
  }

  function boot() {
    const holder = document.getElementById('entryLog');
    if (holder && !holder.dataset.assetNamePatchObserver) {
      holder.dataset.assetNamePatchObserver = '1';
      new MutationObserver(() => setTimeout(attachAssetNames, 60)).observe(holder, { childList: true, subtree: true });
    }
    setTimeout(attachAssetNames, 200);
    setTimeout(attachAssetNames, 1000);
    setTimeout(attachAssetNames, 2500);
    setInterval(attachAssetNames, 5000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('load', boot);
})();
