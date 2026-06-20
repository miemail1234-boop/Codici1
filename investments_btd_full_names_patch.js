(() => {
  'use strict';
  if (window.__INVESTMENTS_BTD_FULL_NAMES_PATCH__) return;
  window.__INVESTMENTS_BTD_FULL_NAMES_PATCH__ = true;

  const FULL_NAMES = {
    1: 'MSCI World Index — azioni dei mercati sviluppati globali',
    2: 'FTSE All-World Index — azionario globale sviluppati + emergenti',
    3: 'MSCI ACWI — All Country World Index',
    4: 'MSCI ACWI IMI — All Country World Investable Market Index',
    5: 'MSCI World Equal Weighted Index — mondiale a peso uguale',
    6: 'S&P 500 Index — large cap USA',
    7: 'Nasdaq 100 Index — growth/tech USA',
    8: 'Nasdaq 100 Equal Weighted Index — Nasdaq a peso uguale',
    9: 'S&P 500 Equal Weight Index — S&P 500 a peso uguale',
    10: 'MSCI USA Value Index — azioni value USA',
    11: 'S&P 500 Quality Index — qualità USA',
    12: 'MSCI USA Minimum Volatility Index — difensivo USA',
    13: 'S&P MidCap 400 Index — mid cap USA',
    14: 'Russell 2000 Index — small cap USA',
    15: 'MSCI World Quality Index — qualità globale',
    16: 'MSCI World Momentum Index — momentum globale',
    17: 'MSCI World Value Index — value globale',
    18: 'MSCI World Small Cap Index — small cap globali',
    19: 'MSCI World Minimum Volatility Index — difensivo globale',
    20: 'STOXX Europe 600 Index — azionario europeo ampio',
    21: 'MSCI Europe Index — Europa sviluppata',
    22: 'MSCI Europe Value Index — value europeo',
    23: 'STOXX Europe 600 Value Index — value/ciclici Europa',
    24: 'STOXX Europe 600 Equal Weight Index — Europa a peso uguale',
    25: 'EURO STOXX 50 Index — large cap Eurozona',
    26: 'MSCI EMU Index — azionario Eurozona ampio',
    27: 'FTSE 100 Index — large cap Regno Unito',
    28: 'FTSE 250 Index — mid cap Regno Unito',
    29: 'DAX Index — azionario Germania',
    30: 'CAC 40 Index — azionario Francia',
    31: 'FTSE MIB Index — azionario Italia',
    32: 'IBEX 35 Index — azionario Spagna',
    33: 'SMI Swiss Market Index — azionario Svizzera',
    34: 'Nordic Countries Equity — azionario paesi nordici',
    35: 'MSCI Japan Index — Giappone large cap',
    36: 'TOPIX — Tokyo Stock Price Index, Giappone ampio',
    37: 'MSCI Pacific ex Japan Index — Pacifico escluso Giappone',
    38: 'MSCI Emerging Markets Index — mercati emergenti globali',
    39: 'MSCI Emerging Markets ex China Index — emergenti esclusa Cina',
    40: 'MSCI India Index — azionario India',
    41: 'MSCI China Index — azionario Cina',
    42: 'MSCI Taiwan Index — azionario Taiwan',
    43: 'MSCI Korea Index — azionario Corea del Sud',
    44: 'MSCI Brazil Index — azionario Brasile',
    45: 'MSCI World Health Care Index — healthcare globale',
    46: 'MSCI World Energy Index — energia globale / oil & gas',
    47: 'Rio Tinto / Materials — proxy minerari e materiali globali',
    48: 'Physical Gold ETC — proxy oro fisico',
    49: 'Bitcoin — crypto asset BTC',
    50: 'Ethereum — crypto asset ETH'
  };

  function ensureStyle() {
    if (document.getElementById('btdFullNamesPatchStyle')) return;
    const style = document.createElement('style');
    style.id = 'btdFullNamesPatchStyle';
    style.textContent = '.etf-full-name{display:block;margin-top:3px;color:var(--muted);font-size:11px;line-height:1.25}.etf-full-name b{color:var(--text);font-weight:600}';
    document.head.appendChild(style);
  }

  function patchRows() {
    ensureStyle();
    document.querySelectorAll('#etfDrawdownTable .etf-row').forEach((row) => {
      const numNode = row.querySelector('.etf-num');
      const nameNode = row.querySelector('.etf-name');
      if (!numNode || !nameNode) return;
      const id = Number(numNode.textContent.trim());
      const fullName = FULL_NAMES[id];
      if (!fullName) return;
      let node = nameNode.querySelector('.etf-full-name');
      if (!node) {
        node = document.createElement('small');
        node.className = 'etf-full-name';
        nameNode.querySelector('strong')?.insertAdjacentElement('afterend', node);
      }
      node.innerHTML = `<b>Nome completo:</b> ${fullName}`;
    });
  }

  function boot() {
    const table = document.getElementById('etfDrawdownTable');
    if (table && !table.dataset.fullNamesPatchObserver) {
      table.dataset.fullNamesPatchObserver = '1';
      new MutationObserver(() => setTimeout(patchRows, 60)).observe(table, { childList: true, subtree: true });
    }
    setTimeout(patchRows, 200);
    setTimeout(patchRows, 1000);
    setTimeout(patchRows, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('load', boot);
})();
