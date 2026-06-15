(() => {
  if (window.__INVESTMENTS_COHERENCE_PATCH__) return;
  window.__INVESTMENTS_COHERENCE_PATCH__ = true;

  const SUPABASE_URL = "https://kujyowhezihjambhpahe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3";
  const TAX_RATE = 0.26;
  const SCREENSHOT_CASH = 33096.52 + 8963 + 1825.39;
  const SCREENSHOT_VALUES = {
    "Nasdaq": 52081.97,
    "Occidente ex-USA": 11860.47,
    "Stoxx healthcare": 9850.13,
    "Physical Gold": 7115.14,
    "21share ETH Core ETP": 4886,
    "Berkshire H": 22587,
    "Franklin INDIA": 18811,
    "Ishare Bitcoin ETP": 5195,
    "MSCI World minimum volatility": 20351
  };
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const $ = id => document.getElementById(id);
  const n = value => {
    const parsed = Number(String(value ?? 0).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const eur = value => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n(value));
  const pct = value => `${new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 }).format(n(value))}%`;
  const fmt4 = value => new Intl.NumberFormat("it-IT", { maximumFractionDigits: 4 }).format(n(value));
  const safe = value => String(value ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));
  let patching = false;

  function assetName(assets, id) {
    return assets.find(asset => asset.id === id)?.name || id;
  }

  function blockName(blocks, id) {
    return blocks.find(block => block.id === id)?.name || blocks.find(block => block.id === id)?.title || "Altro";
  }

  function computePosition(asset, trades, entries) {
    const rows = trades.filter(row => row.asset_id === asset.id);
    const buyQty = rows.filter(row => row.side === "buy").reduce((sum, row) => sum + n(row.quantity), 0);
    const buyAmount = rows.filter(row => row.side === "buy").reduce((sum, row) => sum + n(row.amount), 0);
    const sellQty = rows.filter(row => row.side === "sell").reduce((sum, row) => sum + n(row.quantity), 0);
    const sellAmount = rows.filter(row => row.side === "sell").reduce((sum, row) => sum + n(row.amount), 0);
    const avgCost = buyQty > 0 ? buyAmount / buyQty : 0;
    const openQty = Math.max(0, buyQty - sellQty);
    const openCost = openQty * avgCost;
    const latestEntry = entries.filter(entry => entry.generic_option === asset.block_id && n(entry.current_value) > 0).sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
    const fallbackPrice = n(asset.current_price) || (openQty > 0 ? n(latestEntry?.current_value) / openQty : 0);
    const screenshotValue = SCREENSHOT_VALUES[asset.name];
    const price = screenshotValue && openQty > 0 ? screenshotValue / openQty : fallbackPrice;
    const marketValue = screenshotValue && openQty > 0 ? screenshotValue : openQty * price;
    const realizedGain = sellAmount - sellQty * avgCost;
    const unrealizedGain = marketValue - openCost;
    return { asset, openQty, openCost, avgCost, price, marketValue, realizedGain, unrealizedGain, sellAmount, buyAmount };
  }

  function selectedMetricKeys() {
    return [...document.querySelectorAll("[data-metric-check]:checked")].map(input => input.value);
  }

  function metricCards(totals) {
    return [
      { key: "portfolio", title: "Valore totale portafoglio", value: eur(totals.portfolioValue), hint: "asset investiti + cash non investito" },
      { key: "capital", title: "Capitale netto conferito", value: eur(totals.totalBuy), hint: "fallback: acquisti storici" },
      { key: "gross", title: "Utile totale lordo", value: eur(totals.grossProfit), hint: `realizzato ${eur(totals.realizedGain)} + aperto ${eur(totals.unrealizedGain)}` },
      { key: "net", title: "Utile totale netto stimato", value: eur(totals.netProfit), hint: `tasse stimate 26%: ${eur(totals.tax)}` },
      { key: "grossReturn", title: "Rendimento totale lordo", value: pct(totals.grossReturn), hint: "su capitale conferito" },
      { key: "netReturn", title: "Rendimento totale netto", value: pct(totals.netReturn), hint: "su capitale conferito" },
      { key: "annualGross", title: "Media annua lorda", value: pct(totals.annualGross), hint: "13 mesi tracciati" },
      { key: "annualNet", title: "Media annua netta", value: pct(totals.annualNet), hint: "13 mesi tracciati" },
      { key: "irr", title: "TIR / IRR stimato", value: "n/d", hint: "da riallineare alla formula storica" },
      { key: "twr", title: "TWR stimato", value: "n/d", hint: "da riallineare alla formula storica" },
      { key: "realized", title: "Utile realizzato", value: eur(totals.realizedGain), hint: `vendite ${eur(totals.totalSell)}` },
      { key: "unrealized", title: "Utile non realizzato", value: eur(totals.unrealizedGain), hint: "posizioni aperte" },
      { key: "openValue", title: "Valore aperto asset", value: eur(totals.marketValue), hint: `${totals.openPositions.length} posizioni aperte` },
      { key: "openCost", title: "Capitale ancora investito", value: eur(totals.openCost), hint: "cost basis aperto" },
      { key: "cash", title: "Cash non investito", value: eur(totals.cashNonInvested), hint: "overnight + saldo liquidità; altcoin escluse" },
      { key: "openReturn", title: "Rendimento aperto", value: pct(totals.openCost ? totals.unrealizedGain / totals.openCost * 100 : 0), hint: "su capitale ancora investito" }
    ];
  }

  function normalizeMetricControls() {
    const labels = [...document.querySelectorAll("label.check")];
    labels.forEach(label => {
      const input = label.querySelector("input[data-metric-check]");
      if (!input) return;
      const names = {
        portfolio: "Valore totale portafoglio",
        capital: "Capitale netto conferito",
        gross: "Utile totale lordo",
        net: "Utile totale netto stimato",
        grossReturn: "Rendimento totale lordo",
        netReturn: "Rendimento totale netto",
        annualGross: "Media annua lorda",
        annualNet: "Media annua netta",
        irr: "TIR / IRR stimato",
        twr: "TWR stimato",
        realized: "Utile realizzato",
        unrealized: "Utile non realizzato",
        openValue: "Valore aperto asset",
        openCost: "Capitale ancora investito",
        cash: "Cash non investito",
        openReturn: "Rendimento aperto"
      };
      label.childNodes[label.childNodes.length - 1].textContent = ` ${names[input.value] || input.value}`;
      if (["cash", "openCost"].includes(input.value) && !label.dataset.userTouched) input.checked = true;
    });
  }

  function renderDashboard(totals) {
    normalizeMetricControls();
    const visible = new Set(selectedMetricKeys());
    $("dashboard").innerHTML = metricCards(totals).filter(card => visible.has(card.key)).map(card => `<div class="card"><h3>${safe(card.title)}</h3><div class="value">${card.value}</div><div class="small">${safe(card.hint)}</div></div>`).join("");
  }

  function renderPositions(totals, blocks) {
    $("positions").innerHTML = totals.openPositions.sort((a, b) => b.marketValue - a.marketValue).map(pos => {
      const allocation = totals.marketValue > 0 ? pos.marketValue / totals.marketValue * 100 : 0;
      return `<div class="asset"><div class="asset-head"><div><h3>${safe(pos.asset.name)}</h3><p class="small">Altro · Altro · ${safe(blockName(blocks, pos.asset.block_id))} · valori screenshot Trade Republic</p></div><div class="actions"><button class="btn" data-sellall="${safe(pos.asset.id)}">Vendi tutto</button></div></div><div class="metrics"><span class="pill">Quantità ${fmt4(pos.openQty)}</span><span class="pill">Costo medio ${eur(pos.avgCost)}</span><span class="pill">Valore aperto ${eur(pos.marketValue)}</span><span class="pill ${pos.unrealizedGain >= 0 ? "pos" : "neg"}">Guadagno ${eur(pos.unrealizedGain)}</span></div><p class="small">Realizzato ${eur(pos.realizedGain)} · aperto ${eur(pos.unrealizedGain)} · costo residuo ${eur(pos.openCost)} · allocazione ${pct(allocation)}</p></div>`;
    }).join("");
  }

  function renderAllocation(totals) {
    const grandTotal = totals.marketValue + totals.cashNonInvested;
    const rows = totals.openPositions.sort((a, b) => b.marketValue - a.marketValue).map(pos => ({ name: pos.asset.name, value: pos.marketValue, sub: "Asset investito" }));
    rows.push({ name: "Cash non investito", value: totals.cashNonInvested, sub: "Overnight + saldo liquidità; altcoin escluse" });
    $("allocation").innerHTML = rows.map(row => {
      const p = grandTotal ? row.value / grandTotal * 100 : 0;
      return `<div class="allocation-row"><div class="history-title"><div><strong>${safe(row.name)}</strong><div class="small">${safe(row.sub)} · ${eur(row.value)} · ${pct(p)}</div></div></div><div class="barbox"><div class="bar" style="width:${Math.max(2, Math.min(100, p))}%"></div></div></div>`;
    }).join("");
  }

  function renderBlocks(totals, blocks, assets, positions) {
    const rows = blocks.slice().sort((a, b) => n(a.sort_order) - n(b.sort_order)).map(block => {
      const relatedAssets = assets.filter(asset => asset.block_id === block.id);
      const relatedPositions = positions.filter(pos => relatedAssets.some(asset => asset.id === pos.asset.id));
      const invested = relatedPositions.reduce((sum, pos) => sum + pos.openCost, 0);
      const market = relatedPositions.reduce((sum, pos) => sum + pos.marketValue, 0);
      const profit = relatedPositions.reduce((sum, pos) => sum + pos.realizedGain + pos.unrealizedGain, 0);
      return `<div class="asset"><h3>${safe(block.title || block.name)}: ${safe(block.name || "")}</h3><div class="metrics"><span class="pill">Investito ${eur(invested)}</span><span class="pill">Mercato ${eur(market)}</span><span class="pill">Cash 0,00 €</span><span class="pill ${profit >= 0 ? "pos" : "neg"}">Profitto ${eur(profit)}</span></div><div class="field"><label>Strategia e drawdown</label><textarea readonly>${safe(block.strategy || "")}</textarea></div></div>`;
    });
    rows.push(`<div class="asset"><h3>Cash non investito</h3><div class="metrics"><span class="pill">Overnight + saldo ${eur(totals.cashNonInvested)}</span><span class="pill">Altcoin escluse</span></div></div>`);
    $("blocks").innerHTML = rows.join("");
  }

  async function loadRows() {
    const auth = await client.auth.getSession();
    const session = auth.data.session;
    if (!session) return null;
    const userId = session.user.id;
    const [assetRows, tradeRows, flowRows, entryRows, blockRows] = await Promise.all([
      client.from("investment_assets").select("*").eq("user_id", userId),
      client.from("investment_trades").select("*").eq("user_id", userId),
      client.from("investment_cash_flows").select("*").eq("user_id", userId),
      client.from("investment_entries").select("*").eq("user_id", userId),
      client.from("investment_blocks").select("*").eq("user_id", userId)
    ]);
    if (assetRows.error || tradeRows.error || flowRows.error || entryRows.error || blockRows.error) return null;
    return { assets: assetRows.data || [], trades: tradeRows.data || [], flows: flowRows.data || [], entries: entryRows.data || [], blocks: blockRows.data || [] };
  }

  async function applyCoherence() {
    if (patching) return;
    patching = true;
    try {
      const rows = await loadRows();
      if (!rows) return;
      const positions = rows.assets.map(asset => computePosition(asset, rows.trades, rows.entries));
      const openPositions = positions.filter(pos => pos.openQty > 0.0000001);
      const marketValue = openPositions.reduce((sum, pos) => sum + pos.marketValue, 0);
      const openCost = openPositions.reduce((sum, pos) => sum + pos.openCost, 0);
      const realizedGain = positions.reduce((sum, pos) => sum + pos.realizedGain, 0);
      const unrealizedGain = openPositions.reduce((sum, pos) => sum + pos.unrealizedGain, 0);
      const totalBuy = positions.reduce((sum, pos) => sum + pos.buyAmount, 0);
      const totalSell = positions.reduce((sum, pos) => sum + pos.sellAmount, 0);
      const cashNonInvested = SCREENSHOT_CASH;
      const portfolioValue = marketValue + cashNonInvested;
      const grossProfit = realizedGain + unrealizedGain;
      const tax = grossProfit > 0 ? grossProfit * TAX_RATE : 0;
      const netProfit = grossProfit - tax;
      const grossReturn = totalBuy ? grossProfit / totalBuy * 100 : 0;
      const netReturn = totalBuy ? netProfit / totalBuy * 100 : 0;
      const totals = { openPositions, marketValue, openCost, realizedGain, unrealizedGain, totalBuy, totalSell, cashNonInvested, portfolioValue, grossProfit, tax, netProfit, grossReturn, netReturn };
      totals.annualGross = grossReturn * 12 / 13;
      totals.annualNet = netReturn * 12 / 13;
      renderDashboard(totals);
      renderPositions(totals, rows.blocks);
      renderAllocation(totals);
      renderBlocks(totals, rows.blocks, rows.assets, positions);
    } finally {
      patching = false;
    }
  }

  document.addEventListener("input", e => {
    if (e.target.matches("[data-metric-check]")) setTimeout(applyCoherence, 0);
  }, true);
  document.addEventListener("click", e => {
    if (e.target.closest("#reloadBtn,[data-metric-preset]")) setTimeout(applyCoherence, 900);
  }, true);
  setTimeout(applyCoherence, 1200);
  setTimeout(applyCoherence, 2500);
})();
