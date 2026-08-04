(() => {
  const SUPABASE_URL = "https://kujyowhezihjambhpahe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3";
  const TAX_RATE = 0.26;
  const UNDO_KEY = "life-tracker-investments-undo-v1";
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const $ = id => document.getElementById(id);
  const today = () => new Date().toISOString().slice(0, 10);
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const n = value => {
    const parsed = Number(String(value ?? 0).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const eur = value => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n(value));
  const pct = value => `${new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 }).format(n(value))}%`;
  const safe = value => String(value ?? "").replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
  const cssEscape = value => (window.CSS && CSS.escape ? CSS.escape(value) : String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&"));

  let userId = "";
  let assets = [];
  let trades = [];
  let flows = [];
  let entries = [];
  let blocks = [];
  let notes = [];
  let tradeSide = "buy";
  let flowType = "deposit_external";
  let editingTradeId = "";
  let positions = [];
  let totals = {};

  function toast(message) {
    const node = $("toast");
    node.textContent = message;
    node.classList.add("show");
    setTimeout(() => node.classList.remove("show"), 2200);
  }

  function fmt4(value) {
    return new Intl.NumberFormat("it-IT", { maximumFractionDigits: 4 }).format(n(value));
  }

  function dateValue(row) {
    return row?.date || row?.created_at?.slice?.(0, 10) || today();
  }

  function assetName(assetId) {
    return assets.find(asset => asset.id === assetId)?.name || assetId;
  }

  function blockName(blockId) {
    return blocks.find(block => block.id === blockId)?.name || blocks.find(block => block.id === blockId)?.title || "Altro";
  }

  function tradesForAsset(assetId) {
    return trades.filter(trade => trade.asset_id === assetId).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }

  function latestEntryValue(blockId) {
    const row = entries
      .filter(entry => entry.generic_option === blockId && n(entry.current_value) > 0)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)) || n(b.created_at_ms) - n(a.created_at_ms))[0];
    return row ? n(row.current_value) : 0;
  }

  function computePosition(asset) {
    const rows = tradesForAsset(asset.id);
    const ordered = rows.slice().sort((a, b) =>
      String(a.date || "").localeCompare(String(b.date || "")) ||
      String(a.created_at || "").localeCompare(String(b.created_at || ""))
    );
    let openQty = 0;
    let openCost = 0;
    let realizedGain = 0;
    let buyQty = 0;
    let buyAmount = 0;
    let sellQty = 0;
    let sellAmount = 0;
    let cycleCount = 0;
    let closedCycles = 0;
    let currentCycleStart = "";

    ordered.forEach(row => {
      const quantity = n(row.quantity);
      const amount = n(row.amount);
      const fee = Math.max(0, n(row.fee));
      if (row.side === "buy") {
        if (openQty < 0.0000001) {
          cycleCount += 1;
          currentCycleStart = row.date || "";
        }
        openQty += quantity;
        openCost += amount + fee;
        buyQty += quantity;
        buyAmount += amount + fee;
        return;
      }
      if (row.side === "sell" && openQty > 0) {
        const quantitySold = Math.min(quantity, openQty);
        const avgOpenCost = openCost / openQty;
        const netProceeds = Math.max(0, amount - fee);
        const allocatedProceeds = quantity > 0 ? netProceeds * (quantitySold / quantity) : 0;
        realizedGain += allocatedProceeds - quantitySold * avgOpenCost;
        openQty -= quantitySold;
        openCost -= quantitySold * avgOpenCost;
        sellQty += quantity;
        sellAmount += netProceeds;
        if (openQty < 0.0000001) {
          openQty = 0;
          openCost = 0;
          closedCycles += 1;
          currentCycleStart = "";
        }
      }
    });

    const avgCost = openQty > 0 ? openCost / openQty : 0;
    const price = n(asset.current_price) || (openQty > 0 ? latestEntryValue(asset.block_id) / openQty : 0);
    const marketValue = openQty * price;
    const unrealizedGain = marketValue - openCost;
    const openReturn = openCost > 0 ? unrealizedGain / openCost * 100 : 0;
    const cumulativeGain = realizedGain + unrealizedGain;
    return { asset, rows, buyQty, buyAmount, sellQty, sellAmount, avgCost, openQty, openCost, price, marketValue, realizedGain, unrealizedGain, openReturn, cumulativeGain, cycleCount, closedCycles, currentCycleStart };
  }

  function firstTrackedDate() {
    const dates = [...trades.map(dateValue), ...entries.map(dateValue)].filter(Boolean).sort();
    return dates[0] || today();
  }

  function lastTrackedDate() {
    const dates = [...trades.map(dateValue), ...entries.map(dateValue), today()].filter(Boolean).sort();
    return dates[dates.length - 1] || today();
  }

  function trackedMonths() {
    const first = new Date(`${firstTrackedDate()}T00:00:00`);
    const last = new Date(`${lastTrackedDate()}T00:00:00`);
    const days = Math.max(1, (last - first) / 86400000);
    return Math.max(1, Math.round(days / 30.44));
  }

  function cashFlowRowsForIrr(finalValue) {
    const rows = [];
    trades.forEach(trade => {
      const amount = n(trade.amount);
      if (!amount) return;
      rows.push({ date: dateValue(trade), amount: trade.side === "buy" ? -amount : amount });
    });
    flows.forEach(flow => {
      const amount = n(flow.amount);
      if (!amount) return;
      rows.push({ date: dateValue(flow), amount: flow.type === "deposit_external" ? -amount : amount });
    });
    rows.push({ date: lastTrackedDate(), amount: finalValue });
    return rows.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }

  function xirr(cashflows) {
    const valid = cashflows.filter(row => n(row.amount) !== 0 && row.date);
    if (!valid.some(row => row.amount < 0) || !valid.some(row => row.amount > 0)) return 0;
    const t0 = new Date(`${valid[0].date}T00:00:00`).getTime();
    const years = row => (new Date(`${row.date}T00:00:00`).getTime() - t0) / 31557600000;
    let rate = 0.05;
    for (let i = 0; i < 80; i++) {
      let f = 0;
      let df = 0;
      for (const row of valid) {
        const y = years(row);
        const base = 1 + rate;
        if (base <= 0) return 0;
        f += row.amount / Math.pow(base, y);
        df += -y * row.amount / Math.pow(base, y + 1);
      }
      if (Math.abs(df) < 1e-9) break;
      const next = rate - f / df;
      if (!Number.isFinite(next) || next <= -0.99 || next > 10) break;
      if (Math.abs(next - rate) < 1e-7) return next * 100;
      rate = next;
    }
    return rate * 100;
  }

  function snapshotTotalsByDate() {
    const byDate = new Map();
    entries.forEach(entry => {
      if (!entry.date) return;
      const value = n(entry.current_value) + n(entry.cash_value);
      byDate.set(entry.date, (byDate.get(entry.date) || 0) + value);
    });
    return [...byDate.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]))).map(([date, value]) => ({ date, value }));
  }

  function twrEstimate() {
    const rows = snapshotTotalsByDate().filter(row => row.value > 0);
    if (rows.length < 2) return 0;
    const first = rows[0].value;
    const last = rows[rows.length - 1].value;
    if (!first) return 0;
    return ((last / first) - 1) * 100;
  }

  function computeAll() {
    positions = assets.map(computePosition);
    const openPositions = positions.filter(pos => pos.openQty > 0.0000001);
    const totalBuy = positions.reduce((sum, pos) => sum + pos.buyAmount, 0);
    const totalSell = positions.reduce((sum, pos) => sum + pos.sellAmount, 0);
    const marketValue = openPositions.reduce((sum, pos) => sum + pos.marketValue, 0);
    const openCost = openPositions.reduce((sum, pos) => sum + pos.openCost, 0);
    const realizedGain = positions.reduce((sum, pos) => sum + pos.realizedGain, 0);
    const unrealizedGain = openPositions.reduce((sum, pos) => sum + pos.unrealizedGain, 0);
    const deposits = flows.filter(flow => flow.type === "deposit_external").reduce((sum, flow) => sum + n(flow.amount), 0);
    const withdrawals = flows.filter(flow => flow.type === "withdraw_external").reduce((sum, flow) => sum + n(flow.amount), 0);
    const netExternal = deposits - withdrawals;
    const cashInternal = flows.length ? Math.max(0, netExternal - totalBuy + totalSell) : Math.max(0, totalSell);
    const portfolioValue = marketValue + cashInternal;
    const netContributed = netExternal > 0 ? netExternal : totalBuy;
    const grossProfit = realizedGain + unrealizedGain;
    const tax = grossProfit > 0 ? grossProfit * TAX_RATE : 0;
    const netProfit = grossProfit - tax;
    const grossReturn = netContributed ? grossProfit / netContributed * 100 : 0;
    const netReturn = netContributed ? netProfit / netContributed * 100 : 0;
    const months = trackedMonths();
    totals = {
      openPositions, totalBuy, totalSell, marketValue, openCost, realizedGain, unrealizedGain,
      deposits, withdrawals, netExternal, cashInternal, portfolioValue, netContributed, grossProfit,
      tax, netProfit, grossReturn, netReturn, months,
      annualGross: grossReturn * 12 / months,
      annualNet: netReturn * 12 / months,
      irr: xirr(cashFlowRowsForIrr(portfolioValue)),
      twr: twrEstimate(),
    };
  }

  function metricCards() {
    return [
      { key: "portfolio", title: "Valore totale portafoglio", value: eur(totals.portfolioValue), hint: "asset aperti + cash interno stimato", essential: true },
      { key: "capital", title: "Capitale netto conferito", value: eur(totals.netContributed), hint: flows.length ? "depositi - prelievi" : "fallback: acquisti storici", essential: true },
      { key: "gross", title: "Utile totale lordo", value: eur(totals.grossProfit), hint: `realizzato ${eur(totals.realizedGain)} + aperto ${eur(totals.unrealizedGain)}`, essential: true },
      { key: "net", title: "Utile totale netto stimato", value: eur(totals.netProfit), hint: `tasse stimate 26%: ${eur(totals.tax)}`, essential: true },
      { key: "grossReturn", title: "Rendimento totale lordo", value: pct(totals.grossReturn), hint: "su capitale conferito", essential: true },
      { key: "netReturn", title: "Rendimento totale netto", value: pct(totals.netReturn), hint: "su capitale conferito", essential: true },
      { key: "annualGross", title: "Media annua lorda", value: pct(totals.annualGross), hint: `${totals.months} mesi tracciati`, essential: true },
      { key: "annualNet", title: "Media annua netta", value: pct(totals.annualNet), hint: `${totals.months} mesi tracciati`, essential: true },
      { key: "irr", title: "TIR / IRR stimato", value: pct(totals.irr), hint: "money-weighted annuo", essential: true },
      { key: "twr", title: "TWR stimato", value: pct(totals.twr), hint: "time-weighted", essential: true },
      { key: "realized", title: "Utile realizzato", value: eur(totals.realizedGain), hint: `vendite ${eur(totals.totalSell)}`, essential: true },
      { key: "unrealized", title: "Utile non realizzato", value: eur(totals.unrealizedGain), hint: "posizioni aperte", essential: true },
      { key: "openValue", title: "Valore aperto asset", value: eur(totals.marketValue), hint: `${totals.openPositions.length} posizioni aperte`, essential: true },
      { key: "openCost", title: "Capitale ancora investito", value: eur(totals.openCost), hint: "cost basis aperto", essential: false },
      { key: "cash", title: "Cash interno stimato", value: eur(totals.cashInternal), hint: "vendite non prelevate / cash conto", essential: false },
      { key: "openReturn", title: "Rendimento aperto", value: pct(totals.openCost ? totals.unrealizedGain / totals.openCost * 100 : 0), hint: "su capitale ancora investito", essential: false },
    ];
  }

  function selectedMetricKeys() {
    return [...document.querySelectorAll("[data-metric-check]:checked")].map(input => input.value);
  }

  function renderMetricControls() {
    const holder = $("metricControls");
    if (!holder || holder.dataset.ready) return;
    holder.dataset.ready = "1";
    holder.innerHTML = metricCards().map(card => `<label class="check"><input type="checkbox" data-metric-check value="${safe(card.key)}" ${card.essential ? "checked" : ""}> ${safe(card.title)}</label>`).join("");
  }

  function renderDashboard() {
    renderMetricControls();
    const visible = new Set(selectedMetricKeys());
    $("dashboard").innerHTML = metricCards().filter(card => visible.has(card.key)).map(card => `<div class="card"><h3>${safe(card.title)}</h3><div class="value">${card.value}</div><div class="small">${safe(card.hint)}</div></div>`).join("");
  }

  function positionHtml(pos) {
    const gainClass = pos.unrealizedGain >= 0 ? "pos" : "neg";
    const totalClass = pos.cumulativeGain >= 0 ? "pos" : "neg";
    const allocation = totals.marketValue > 0 ? pos.marketValue / totals.marketValue * 100 : 0;
    const cycleLabel = pos.cycleCount > 1 ? `Ciclo attuale #${pos.cycleCount} · dal ${safe(pos.currentCycleStart)}` : `Posizione aperta dal ${safe(pos.currentCycleStart)}`;
    return `<div class="asset">
      <div class="asset-head"><div><h3>${safe(pos.asset.name)}</h3><p class="small">${safe(pos.asset.category || "Altro")} · ${safe(pos.asset.broker || "Altro")} · ${safe(blockName(pos.asset.block_id))} · prezzo ${safe(pos.asset.current_price_date || "")}</p></div><div class="actions"><button class="btn" data-sellall="${safe(pos.asset.id)}">Vendi tutto</button></div></div>
      <div class="metrics"><span class="pill">Quantità ${fmt4(pos.openQty)}</span><span class="pill">Costo medio ${eur(pos.avgCost)}</span><span class="pill">Valore aperto ${eur(pos.marketValue)}</span><span class="pill ${gainClass}">Rendimento attuale ${pct(pos.openReturn)}</span><span class="pill ${gainClass}">Guadagno aperto ${eur(pos.unrealizedGain)}</span></div>
      <div class="row"><div class="field" style="flex:1"><label>Prezzo attuale</label><input data-price="${safe(pos.asset.id)}" inputmode="decimal" value="${safe(pos.price)}"></div><div class="field" style="width:160px"><label>Data</label><input data-pricedate="${safe(pos.asset.id)}" type="date" value="${safe(pos.asset.current_price_date || today())}"></div><div class="field"><label>&nbsp;</label><button class="btn" data-saveprice="${safe(pos.asset.id)}">Salva prezzo</button></div></div>
      <p class="small">${cycleLabel} · costo ciclo ${eur(pos.openCost)} · realizzato storico ${eur(pos.realizedGain)} · <span class="${totalClass}">guadagno cumulato ${eur(pos.cumulativeGain)}</span> · allocazione ${pct(allocation)}</p>
    </div>`;
  }

  function renderPositions() {
    const open = totals.openPositions.sort((a, b) => b.marketValue - a.marketValue);
    $("positions").innerHTML = open.length ? open.map(pos => positionHtml(pos)).join("") : `<p class="small">Nessuna posizione aperta.</p>`;
  }

  function renderTradeForm() {
    document.querySelectorAll("[data-side]").forEach(button => button.classList.toggle("active", button.dataset.side === tradeSide));
    document.querySelectorAll("[data-flow]").forEach(button => button.classList.toggle("active", button.dataset.flow === flowType));
    $("tradeAsset").innerHTML = assets.slice().sort((a, b) => a.name.localeCompare(b.name)).map(asset => `<option value="${safe(asset.id)}">${safe(asset.name)}</option>`).join("");
    $("saveTradeBtn").textContent = editingTradeId ? "Salva modifica movimento" : `Registra ${tradeSide === "sell" ? "vendita" : "acquisto"}`;
    $("cancelEditBtn")?.classList.toggle("hidden", !editingTradeId);
    updateTradeTotal();
  }

  function updateTradeTotal() {
    const gross = n($("tradeQty").value) * n($("tradePrice").value);
    const fee = Math.max(0, n($("tradeFee")?.value));
    const total = tradeSide === "sell" ? Math.max(0, gross - fee) : gross + fee;
    $("tradeTotal").textContent = `${tradeSide === "sell" ? "Ricavo netto" : "Costo totale"} ${eur(total)} · commissione ${eur(fee)}`;
  }

  function renderAllocation() {
    const rows = totals.openPositions.slice().sort((a, b) => b.marketValue - a.marketValue);
    const cashRow = totals.cashInternal > 0 ? [{ name: "Cash interno", value: totals.cashInternal }] : [];
    const total = totals.marketValue + totals.cashInternal;
    const all = [...rows.map(pos => ({ name: pos.asset.name, value: pos.marketValue, sub: `${pos.asset.category || "Altro"} · ${pos.asset.broker || "Altro"}` })), ...cashRow.map(row => ({ ...row, sub: "Liquidità interna" }))];
    $("allocation").innerHTML = all.length ? all.map(row => {
      const p = total > 0 ? row.value / total * 100 : 0;
      return `<div class="allocation-row"><div class="history-title"><div><strong>${safe(row.name)}</strong><div class="small">${safe(row.sub)} · ${eur(row.value)} · ${pct(p)}</div></div></div><div class="barbox"><div class="bar" style="width:${Math.max(2, Math.min(100, p))}%"></div></div></div>`;
    }).join("") : `<p class="small">Nessuna allocazione disponibile.</p>`;
  }

  function renderTradeLog() {
    const rows = trades.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.created_at || "").localeCompare(String(a.created_at || "")));
    $("tradeLog").innerHTML = rows.length ? rows.map(row => `<div class="log-item"><div class="history-title"><div><strong>${safe(row.date)} · ${row.side === "sell" ? "Vendita" : "Acquisto"} · ${safe(assetName(row.asset_id))}</strong><div class="small">${fmt4(row.quantity)} × ${eur(row.price)} · controvalore ${eur(row.amount)}${n(row.fee) ? ` · commissione ${eur(row.fee)}` : ""}</div></div><div class="actions"><button class="btn" data-edittrade="${safe(row.id)}">Modifica</button><button class="btn danger" data-deletetrade="${safe(row.id)}">Elimina</button></div></div>${row.note ? `<p class="small">${safe(row.note)}</p>` : ""}</div>`).join("") : `<p class="small">Nessun movimento.</p>`;
  }

  function renderNotes() {
    const noteBlock = $("noteBlock");
    if (noteBlock && !noteBlock.dataset.ready) {
      noteBlock.innerHTML = `<option value="">Nota generale</option>` + blocks.slice().sort((a, b) => n(a.sort_order) - n(b.sort_order)).map(block => `<option value="${safe(block.id)}">${safe(block.name || block.title)}</option>`).join("");
      noteBlock.dataset.ready = "1";
    }
    const rows = notes.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 8);
    $("notes").innerHTML = rows.length ? rows.map(note => `<div class="log-item"><strong>${safe(note.date)} · ${safe(note.block_id ? blockName(note.block_id) : "Generale")}</strong><p class="small multiline">${safe(note.text)}</p></div>`).join("") : `<p class="small">Nessuna nota.</p>`;
  }

  function renderBlocks() {
    const holder = $("blocks");
    if (!holder) return;
    holder.innerHTML = blocks.slice().sort((a, b) => n(a.sort_order) - n(b.sort_order)).map(block => {
      const relatedAssets = assets.filter(asset => asset.block_id === block.id);
      const relatedPositions = positions.filter(pos => relatedAssets.some(asset => asset.id === pos.asset.id));
      const invested = relatedPositions.reduce((sum, pos) => sum + pos.openCost, 0);
      const market = relatedPositions.reduce((sum, pos) => sum + pos.marketValue, 0);
      const profit = relatedPositions.reduce((sum, pos) => sum + pos.realizedGain + pos.unrealizedGain, 0);
      const cash = block.name === "FTSE Korea" || block.title === "FTSE Korea" ? totals.cashInternal : 0;
      return `<div class="asset"><div class="asset-head"><div><h3>${safe(block.title || block.name || "Blocco")}: ${safe(block.name || "")}</h3><p class="small">${safe(block.description || "Nessuna descrizione")}</p></div></div><div class="metrics"><span class="pill">Investito ${eur(invested)}</span><span class="pill">Mercato ${eur(market)}</span><span class="pill">Cash ${eur(cash)}</span><span class="pill ${profit >= 0 ? "pos" : "neg"}">Profitto ${eur(profit)}</span></div><div class="field"><label>Strategia e drawdown</label><textarea readonly>${safe(block.strategy || "")}</textarea></div><p class="small">${relatedAssets.length} strumenti collegati</p></div>`;
    }).join("") || `<p class="small">Nessun blocco portafoglio.</p>`;
  }

  function entryInvested(row) {
    return n(row.number_value) > 0 && n(row.purchase_price) > 0 ? n(row.number_value) * n(row.purchase_price) : n(row.purchase_price);
  }

  function renderEntryLog() {
    const holder = $("entryLog");
    if (!holder) return;
    const rows = entries.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)) || n(b.created_at_ms) - n(a.created_at_ms)).slice(0, 60);
    holder.innerHTML = rows.length ? rows.map(row => `<div class="log-item"><strong>${safe(row.date)} · ${safe(row.characteristic || blockName(row.generic_option))} ${row.transaction_type === "buy" ? "Acquisto" : "Aggiornamento"}</strong><div class="small">investito ${eur(entryInvested(row))} · valore ${eur(row.current_value)}${n(row.current_price) ? ` · prezzo ${eur(row.current_price)}` : ""}${n(row.cash_value) ? ` · cash ${eur(row.cash_value)}` : ""}</div>${row.text_value ? `<p class="small">${safe(row.text_value)}</p>` : ""}</div>`).join("") : `<p class="small">Nessun movimento snapshot.</p>`;
  }

  function renderTrend() {
    const holder = $("trend");
    if (!holder) return;
    const dateMap = new Map();
    entries.forEach(entry => {
      if (!entry.date) return;
      const value = n(entry.current_value) + n(entry.cash_value);
      dateMap.set(entry.date, (dateMap.get(entry.date) || 0) + value);
    });
    const rows = [...dateMap.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]))).slice(-10);
    if (rows.length < 2) {
      holder.innerHTML = `<p class="small">Servono almeno due snapshot per il grafico.</p>`;
      return;
    }
    const max = Math.max(...rows.map(row => row[1]), 1);
    const prev = rows[rows.length - 2][1];
    const last = rows[rows.length - 1][1];
    const symbol = last > prev ? "aumenta" : last < prev ? "diminuisce" : "stabile";
    holder.innerHTML = `<p class="small">Portafoglio totale: ${symbol}</p><div class="spark">${rows.map(row => `<div class="bar-wrap"><div class="bar" style="height:${Math.max(8, Math.round(row[1] / max * 90))}px"></div><small>${safe(row[0].slice(5))}</small></div>`).join("")}</div><div class="legend">Portafoglio totale · ${symbol}</div>`;
  }

  function renderUndoStatus() {
    const button = $("undoBtn");
    if (!button) return;
    const snapshot = undoSnapshot();
    button.disabled = !snapshot;
    button.textContent = snapshot ? `Annulla: ${snapshot.label}` : "Annulla ultima modifica";
  }

  function render() {
    computeAll();
    renderDashboard();
    renderPositions();
    renderTradeForm();
    renderAllocation();
    renderTradeLog();
    renderNotes();
    renderBlocks();
    renderEntryLog();
    renderTrend();
    renderUndoStatus();
  }

  function undoSnapshot() {
    try { return JSON.parse(localStorage.getItem(UNDO_KEY) || "null"); } catch { return null; }
  }

  function saveUndo(label) {
    const snapshot = { label, at: new Date().toISOString(), tables: { blocks, assets, trades, flows, entries, notes } };
    localStorage.setItem(UNDO_KEY, JSON.stringify(snapshot));
    renderUndoStatus();
  }

  async function restoreTable(name, rows) {
    await client.from(name).delete().eq("user_id", userId);
    if (rows?.length) {
      const insert = await client.from(name).insert(rows);
      if (insert.error) throw insert.error;
    }
  }

  async function undoLastChange() {
    const snapshot = undoSnapshot();
    if (!snapshot) {
      toast("Nessuna modifica da annullare");
      return;
    }
    if (!confirm(`Annullare l'ultima modifica: ${snapshot.label}?`)) return;
    try {
      await restoreTable("investment_entries", snapshot.tables.entries || []);
      await restoreTable("investment_trades", snapshot.tables.trades || []);
      await restoreTable("investment_cash_flows", snapshot.tables.flows || []);
      await restoreTable("investment_notes", snapshot.tables.notes || []);
      await restoreTable("investment_assets", snapshot.tables.assets || []);
      await restoreTable("investment_blocks", snapshot.tables.blocks || []);
      localStorage.removeItem(UNDO_KEY);
      editingTradeId = "";
      await loadCloud();
      toast("Modifica annullata");
    } catch (error) {
      console.error(error);
      toast("Errore durante annullamento");
    }
  }

  async function loadCloud() {
    const auth = await client.auth.getSession();
    const session = auth.data.session;
    if (!session) {
      $("authBox").innerHTML = "Non risulti collegato a Supabase. Apri prima la Life Tracker e fai login da Dati → Cloud Supabase.";
      return;
    }
    userId = session.user.id;
    $("authBox").classList.add("hidden");
    $("app").classList.remove("hidden");
    const [assetRows, tradeRows, flowRows, entryRows, blockRows, noteRows] = await Promise.all([
      client.from("investment_assets").select("*").eq("user_id", userId),
      client.from("investment_trades").select("*").eq("user_id", userId),
      client.from("investment_cash_flows").select("*").eq("user_id", userId),
      client.from("investment_entries").select("*").eq("user_id", userId),
      client.from("investment_blocks").select("*").eq("user_id", userId),
      client.from("investment_notes").select("*").eq("user_id", userId),
    ]);
    if (assetRows.error || tradeRows.error || flowRows.error || entryRows.error || blockRows.error || noteRows.error) {
      console.error(assetRows.error, tradeRows.error, flowRows.error, entryRows.error, blockRows.error, noteRows.error);
      toast("Errore lettura cloud");
      return;
    }
    assets = assetRows.data || [];
    trades = tradeRows.data || [];
    flows = flowRows.data || [];
    entries = entryRows.data || [];
    blocks = blockRows.data || [];
    notes = noteRows.data || [];
    const noteBlock = $("noteBlock");
    if (noteBlock) noteBlock.dataset.ready = "";
    render();
    toast("Investimenti caricati");
  }

  function startTradeEdit(tradeId) {
    const trade = trades.find(row => row.id === tradeId);
    if (!trade) return;
    editingTradeId = tradeId;
    tradeSide = trade.side || "buy";
    renderTradeForm();
    $("tradeDate").value = trade.date || today();
    $("tradeAsset").value = trade.asset_id;
    $("tradeQty").value = trade.quantity;
    $("tradePrice").value = trade.price;
    if ($("tradeFee")) $("tradeFee").value = n(trade.fee);
    $("tradeNote").value = trade.note || "";
    updateTradeTotal();
    document.getElementById("movementPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    toast("Movimento caricato per modifica");
  }

  function cancelTradeEdit() {
    editingTradeId = "";
    $("tradeQty").value = "";
    $("tradePrice").value = "";
    if ($("tradeFee")) $("tradeFee").value = "0";
    $("tradeNote").value = "";
    renderTradeForm();
  }

  async function saveTrade() {
    const assetId = $("tradeAsset").value;
    const quantity = n($("tradeQty").value);
    const price = n($("tradePrice").value);
    const fee = Math.max(0, n($("tradeFee")?.value));
    if (!assetId || quantity <= 0 || price <= 0) {
      toast("Inserisci strumento, quantità e prezzo");
      return;
    }
    saveUndo(editingTradeId ? "modifica movimento" : "nuovo movimento");
    const amount = quantity * price;
    const row = { user_id: userId, asset_id: assetId, date: $("tradeDate").value || today(), side: tradeSide, quantity, price, amount, fee, note: $("tradeNote").value || "", updated_at: new Date().toISOString() };
    const result = editingTradeId
      ? await client.from("investment_trades").update(row).eq("user_id", userId).eq("id", editingTradeId)
      : await client.from("investment_trades").insert({ ...row, id: uid("investment-trade") });
    if (result.error) {
      console.error(result.error);
      toast("Errore salvataggio movimento");
      return;
    }
    await client.from("investment_assets").update({ current_price: price, current_price_date: row.date, updated_at: new Date().toISOString() }).eq("user_id", userId).eq("id", assetId);
    editingTradeId = "";
    $("tradeQty").value = "";
    $("tradePrice").value = "";
    if ($("tradeFee")) $("tradeFee").value = "0";
    $("tradeNote").value = "";
    await loadCloud();
    toast("Movimento salvato");
  }

  async function deleteTrade(tradeId) {
    const trade = trades.find(row => row.id === tradeId);
    if (!trade || !confirm(`Eliminare il movimento ${trade.date} · ${assetName(trade.asset_id)}?`)) return;
    saveUndo("elimina movimento");
    const result = await client.from("investment_trades").delete().eq("user_id", userId).eq("id", tradeId);
    if (result.error) {
      console.error(result.error);
      toast("Errore eliminazione movimento");
      return;
    }
    await loadCloud();
    toast("Movimento eliminato");
  }

  async function savePrice(assetId) {
    const asset = assets.find(item => item.id === assetId);
    const price = n(document.querySelector(`[data-price="${cssEscape(assetId)}"]`)?.value);
    const date = document.querySelector(`[data-pricedate="${cssEscape(assetId)}"]`)?.value || today();
    if (!asset || price <= 0) {
      toast("Prezzo non valido");
      return;
    }
    saveUndo("aggiorna prezzo");
    const update = await client.from("investment_assets").update({ current_price: price, current_price_date: date, updated_at: new Date().toISOString() }).eq("user_id", userId).eq("id", assetId);
    if (update.error) {
      console.error(update.error);
      toast("Errore salvataggio prezzo");
      return;
    }
    const pos = computePosition({ ...asset, current_price: price, current_price_date: date });
    await client.from("investment_entries").insert({ user_id: userId, id: uid("price-snapshot"), date, characteristic: asset.name, number_value: pos.openQty, purchase_price: pos.avgCost, current_price: price, current_value: pos.marketValue, cash_value: 0, text_value: "Aggiornamento prezzo da app Investimenti separata", generic_option: asset.block_id, transaction_type: "update", ath: 0, created_at_ms: Date.now(), updated_at: new Date().toISOString() });
    await loadCloud();
    toast("Prezzo salvato");
  }

  async function saveFlow() {
    const amount = n($("flowAmount").value);
    if (amount <= 0) {
      toast("Importo non valido");
      return;
    }
    saveUndo("cash flow");
    const insert = await client.from("investment_cash_flows").insert({ user_id: userId, id: uid("investment-cash"), date: $("flowDate").value || today(), type: flowType, amount, broker: "Altro", note: $("flowNote").value || "", updated_at: new Date().toISOString() });
    if (insert.error) {
      console.error(insert.error);
      toast("Errore salvataggio cash flow");
      return;
    }
    $("flowAmount").value = "";
    $("flowNote").value = "";
    await loadCloud();
    toast("Cash flow salvato");
  }

  async function saveNote() {
    const text = $("noteText").value.trim();
    if (!text) return;
    saveUndo("nota investimento");
    const insert = await client.from("investment_notes").insert({ user_id: userId, id: uid("investment-note"), date: $("noteDate").value || today(), block_id: $("noteBlock")?.value || "", text, created_at_ms: Date.now(), updated_at: new Date().toISOString() });
    if (insert.error) {
      console.error(insert.error);
      toast("Errore salvataggio nota");
      return;
    }
    $("noteText").value = "";
    await loadCloud();
    toast("Nota salvata");
  }

  document.addEventListener("input", event => {
    if (["tradeQty", "tradePrice", "tradeFee"].includes(event.target.id)) updateTradeTotal();
    if (event.target.matches("[data-metric-check]")) renderDashboard();
  });

  document.addEventListener("click", event => {
    const side = event.target.dataset.side;
    if (side) {
      tradeSide = side;
      renderTradeForm();
      return;
    }
    const flow = event.target.dataset.flow;
    if (flow) {
      flowType = flow;
      renderTradeForm();
      return;
    }
    const preset = event.target.dataset.metricPreset;
    if (preset) {
      const cards = metricCards();
      document.querySelectorAll("[data-metric-check]").forEach(input => {
        const card = cards.find(item => item.key === input.value);
        input.checked = preset === "all" || (preset === "essential" && card?.essential);
      });
      renderDashboard();
      return;
    }
    const editTradeId = event.target.dataset.edittrade;
    if (editTradeId) startTradeEdit(editTradeId);
    const deleteTradeId = event.target.dataset.deletetrade;
    if (deleteTradeId) deleteTrade(deleteTradeId);
    const savePriceId = event.target.dataset.saveprice;
    if (savePriceId) savePrice(savePriceId);
    const sellAllId = event.target.dataset.sellall;
    if (sellAllId) {
      const pos = positions.find(item => item.asset.id === sellAllId);
      if (!pos) return;
      editingTradeId = "";
      tradeSide = "sell";
      renderTradeForm();
      $("tradeAsset").value = sellAllId;
      $("tradeQty").value = pos.openQty;
      $("tradePrice").value = pos.price;
      $("tradeNote").value = "Vendita totale posizione";
      updateTradeTotal();
      document.getElementById("movementPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  $("reloadBtn").addEventListener("click", loadCloud);
  $("undoBtn")?.addEventListener("click", undoLastChange);
  $("saveTradeBtn").addEventListener("click", saveTrade);
  $("cancelEditBtn")?.addEventListener("click", cancelTradeEdit);
  $("saveFlowBtn").addEventListener("click", saveFlow);
  $("saveNoteBtn").addEventListener("click", saveNote);
  $("tradeDate").value = today();
  $("flowDate").value = today();
  $("noteDate").value = today();
  renderUndoStatus();
  loadCloud();
})();
