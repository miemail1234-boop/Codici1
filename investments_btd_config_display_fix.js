(() => {
  'use strict';

  const SUPABASE_URL = 'https://kujyowhezihjambhpahe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
  const TABLE = 'btd_drawdown_assets';

  const client = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);
  const cleanTicker = (value) => String(value ?? '').trim().toUpperCase();

  async function applyConfiguredTickers() {
    if (!client) return;
    const { data, error } = await client
      .from(TABLE)
      .select('id,yahoo_ticker,isin')
      .order('id', { ascending: true });
    if (error || !Array.isArray(data)) return;

    for (const row of data) {
      const id = Number(row.id);
      const tickerInput = document.querySelector(`[data-config-field="yahoo_ticker"][data-config-id="${id}"]`);
      const isinInput = document.querySelector(`[data-config-field="isin"][data-config-id="${id}"]`);
      if (tickerInput) tickerInput.value = cleanTicker(row.yahoo_ticker);
      if (isinInput) isinInput.value = row.isin || '';
    }

    const status = document.getElementById('etfDrawdownUpdateStatus');
    if (status) {
      status.textContent = 'Ticker Yahoo comuni caricati. Premi “Aggiorna BTD Radar” per rigenerare i drawdown corretti.';
      status.dataset.tone = 'ok';
    }
  }

  window.addEventListener('load', () => {
    setTimeout(applyConfiguredTickers, 900);
    setTimeout(applyConfiguredTickers, 2500);
  });
})();
