(() => {
  'use strict';

  const SUPABASE_URL = 'https://kujyowhezihjambhpahe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
  const client = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);
  let booted = false;

  const n = (value) => {
    const parsed = Number(String(value ?? 0).replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  function toast(message) {
    const node = document.getElementById('toast');
    if (!node) return;
    node.textContent = message;
    node.classList.add('show');
    setTimeout(() => node.classList.remove('show'), 2400);
  }

  function sortEntries(rows) {
    return (rows || []).slice().sort((a, b) => {
      return String(b.date || '').localeCompare(String(a.date || '')) || n(b.created_at_ms) - n(a.created_at_ms);
    });
  }

  function entryLabel(row) {
    return `${row.date || ''} · ${row.characteristic || 'Aggiornamento'} · valore ${n(row.current_value).toLocaleString('it-IT', { maximumFractionDigits: 2 })} €`;
  }

  async function getUserId() {
    const auth = await client.auth.getSession();
    return auth.data.session?.user?.id || '';
  }

  async function fetchInvestmentData(userId) {
    const [entryRows, assetRows, tradeRows] = await Promise.all([
      client.from('investment_entries').select('*').eq('user_id', userId),
      client.from('investment_assets').select('*').eq('user_id', userId),
      client.from('investment_trades').select('*').eq('user_id', userId),
    ]);
    if (entryRows.error) throw entryRows.error;
    if (assetRows.error) throw assetRows.error;
    if (tradeRows.error) throw tradeRows.error;
    return {
      entries: entryRows.data || [],
      assets: assetRows.data || [],
      trades: tradeRows.data || [],
    };
  }

  function assetForEntry(entry, assets) {
    return assets.find((asset) => asset.block_id === entry.generic_option) || null;
  }

  function latestPriceEntryForBlock(entries, blockId, excludedId = '') {
    return sortEntries(entries)
      .filter((row) => row.id !== excludedId && row.generic_option === blockId && n(row.current_price) > 0 && n(row.current_value) > 0)[0] || null;
  }

  function fallbackTradePrice(asset, trades) {
    return (trades || [])
      .filter((trade) => trade.asset_id === asset.id && n(trade.price) > 0)
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || String(b.created_at || '').localeCompare(String(a.created_at || '')))[0] || null;
  }

  async function deleteEntryAndRestore(entryId) {
    if (!client) return toast('Supabase non disponibile');
    const userId = await getUserId();
    if (!userId) return toast('Sessione Supabase non trovata');

    const { entries, assets, trades } = await fetchInvestmentData(userId);
    const entry = entries.find((row) => row.id === entryId);
    if (!entry) return toast('Aggiornamento non trovato');
    if (entry.transaction_type === 'buy') return toast('Questo è un acquisto: eliminalo dal log movimenti asset');
    if (!confirm(`Annullare questo aggiornamento prezzo?\n\n${entryLabel(entry)}`)) return;

    const asset = assetForEntry(entry, assets);
    const latestBeforeDelete = latestPriceEntryForBlock(entries, entry.generic_option);
    const shouldRestoreAssetPrice = asset && latestBeforeDelete?.id === entry.id;
    const previousEntry = latestPriceEntryForBlock(entries, entry.generic_option, entry.id);
    const previousTrade = asset ? fallbackTradePrice(asset, trades) : null;

    const deletion = await client
      .from('investment_entries')
      .delete()
      .eq('user_id', userId)
      .eq('id', entry.id);
    if (deletion.error) throw deletion.error;

    if (shouldRestoreAssetPrice) {
      const restore = previousEntry
        ? { current_price: n(previousEntry.current_price), current_price_date: previousEntry.date || null, updated_at: new Date().toISOString() }
        : previousTrade
          ? { current_price: n(previousTrade.price), current_price_date: previousTrade.date || null, updated_at: new Date().toISOString() }
          : null;
      if (restore) {
        const update = await client
          .from('investment_assets')
          .update(restore)
          .eq('user_id', userId)
          .eq('id', asset.id);
        if (update.error) throw update.error;
      }
    }

    toast('Aggiornamento annullato');
    setTimeout(() => document.getElementById('reloadBtn')?.click(), 250);
  }

  async function attachUndoButtons() {
    const holder = document.getElementById('entryLog');
    if (!holder || holder.dataset.undoPatchBusy === '1') return;
    if (!client) return;
    holder.dataset.undoPatchBusy = '1';
    try {
      const userId = await getUserId();
      if (!userId) return;
      const { entries } = await fetchInvestmentData(userId);
      const rows = sortEntries(entries).slice(0, 60);
      const items = [...holder.querySelectorAll('.log-item')];
      items.forEach((item, index) => {
        const row = rows[index];
        if (!row || row.transaction_type === 'buy' || !n(row.current_price) || item.querySelector('[data-delete-entry-update]')) return;
        const actions = document.createElement('div');
        actions.className = 'actions';
        actions.style.marginTop = '8px';
        actions.innerHTML = `<button class="btn danger" type="button" data-delete-entry-update="${row.id}">Annulla aggiornamento</button>`;
        item.appendChild(actions);
      });
    } catch (error) {
      console.error(error);
    } finally {
      holder.dataset.undoPatchBusy = '0';
    }
  }

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-delete-entry-update]');
    if (!button) return;
    event.preventDefault();
    button.disabled = true;
    try {
      await deleteEntryAndRestore(button.dataset.deleteEntryUpdate);
    } catch (error) {
      console.error(error);
      toast('Errore durante annullamento aggiornamento');
      button.disabled = false;
    }
  });

  function boot() {
    if (booted) return;
    booted = true;
    const installObserver = () => {
      const holder = document.getElementById('entryLog');
      if (holder && !holder.dataset.undoPatchObserver) {
        holder.dataset.undoPatchObserver = '1';
        new MutationObserver(() => setTimeout(attachUndoButtons, 50)).observe(holder, { childList: true, subtree: true });
      }
    };
    installObserver();
    setTimeout(installObserver, 500);
    setTimeout(attachUndoButtons, 200);
    setTimeout(attachUndoButtons, 1000);
    setTimeout(attachUndoButtons, 2500);
    setInterval(attachUndoButtons, 5000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('load', boot);
})();
