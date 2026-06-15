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

  function assetHistory(asset, entries, currentValue) {
    const byDate = new Map();
    entries
      .filter(entry => entry.generic_option === asset.block_id && n(entry.current_value) > 0 && entry.date)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)) || n(a.created_at_ms) - n(b.created_at_ms))
      .forEach(entry => byDate.set(entry.date, n(entry.current_value)));
    if (currentValue > 0) byDate.set("2026-06-15", currentValue);
    return [...byDate.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]))).map(([date, value]) => ({ date, value })).slice(-12);
  }

  function lineChartHtml(asset, entries, currentValue) {
    const rows = assetHistory(asset, entries, currentValue);
    if (rows.length < 2) return `<p class="small">Grafico valore: servono almeno due aggiornamenti prezzo.</p>`;
    const w = 520;
    const h = 120;
    const pad = 12;
    const min = Math.min(...rows.map(row => row.value));
    const max = Math.max(...rows.map(row => row.value));
    const span = Math.max(1, max - min);
    const points = rows.map((row, index) => {
      const x = pad + (rows.length === 1 ? 0 : index * (w - pad * 2) / (rows.length - 1));
      const y = h - pad - ((row.value - min) / span) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    const first = rows[0];
    const last = rows[rows.length - 1];
    const delta = last.value - first.value;
    return `<div class="asset-line-chart" style="margin-top:12px;border:1px solid var(--border);border-radius:14px;padding:10px;background:rgba(0,0,0,.12)">
      <div class="history-title"><strong>Andamento valore asset</strong><span class="small ${delta >= 0 ? "pos" : "neg"}">${delta >= 0 ? "+" : ""}${eur(delta)}</span></div>
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="120" role="img" aria-label="Andamento valore ${safe(asset.name)}">
        <polyline points="${points}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${rows.map((row, index) => {
          const [x, y] = points.split(" ")[index].split(",");
          return `<circle cx="${x}" cy="${y}" r="3.5" fill="currentColor"><title>${safe(row.date)} · ${eur(row.value)}</title></circle>`;
        }).join("")}
      </svg>
      <div class="history-title small"><span>${safe(first.date.slice(5))} · ${eur(first.value)}</span><span>${safe(last.date.slice(5))} · ${eur(last.value)}</span></div>
    </div>`;
  }

  function renderPositions(totals, blocks, entries) {
    $("positions").innerHTML = totals.openPositions.sort((a, b) => b.marketValue - a.marketValue).map(pos => {
      const allocation = totals.marketValue > 0 ? pos.marketValue / totals.marketValue * 100 : 0;
      return `<div class="asset"><div class="asset-head"><div><h3>${safe(pos.asset.name)}</h3><p class="small">Altro · Altro · ${safe(blockName(blocks, pos.asset.block_id))} · valori screenshot Trade Republic</p></div><div class="actions"><button class="btn" data-sellall="${safe(pos.asset.id)}">Vendi tutto</button></div></div><div class="metrics"><span class="pill">Quantità ${fmt4(pos.openQty)}</span><span class="pill">Costo medio ${eur(pos.avgCost)}</span><span class="pill">Valore aperto ${eur(pos.marketValue)}</span><span class="pill ${pos.unrealizedGain >= 0 ? "pos" : "neg"}">Guadagno ${eur(pos.unrealizedGain)}</span></div><p class="small">Realizzato ${eur(pos.realizedGain)} · aperto ${eur(pos.unrealizedGain)} · costo residuo ${eur(pos.openCost)} · allocazione ${pct(allocation)}</p>${lineChartHtml(pos.asset, entries, pos.marketValue)}</div>`;
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

  function renderPriceUpdates(entries) {
    const panel = $("entryLog")?.closest(".panel");
    const title = panel?.querySelector("h2");
    if (title) title.textContent = "Aggiornamenti prezzo";
    const holder = $("entryLog");
    if (!holder) return;
    const rows = entries.slice().filter(row => n(row.current_value) > 0).sort((a, b) => String(b.date).localeCompare(String(a.date)) || n(b.created_at_ms) - n(a.created_at_ms)).slice(0, 80);
    holder.innerHTML = rows.length ? rows.map(row => `<div class="log-item"><strong>${safe(row.date)} · ${safe(row.characteristic || "Aggiornamento prezzo")}</strong><div class="small">valore ${eur(row.current_value)}${n(row.current_price) ? ` · prezzo ${eur(row.current_price)}` : ""}${n(row.number_value) ? ` · quantità ${fmt4(row.number_value)}` : ""}</div>${row.text_value ? `<p class="small">${safe(row.text_value)}</p>` : ""}</div>`).join("") : `<p class="small">Nessun aggiornamento prezzo.</p>`;
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
      renderPositions(totals, rows.blocks, rows.entries);
      renderAllocation(totals);
      renderBlocks(totals, rows.blocks, rows.assets, positions);
      renderPriceUpdates(rows.entries);
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