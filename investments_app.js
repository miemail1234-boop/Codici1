(() => {
  const SUPABASE_URL = "https://kujyowhezihjambhpahe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3";
  const TAX_RATE = 0.26;
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

  let userId = "";
  let assets = [];
  let trades = [];
  let flows = [];
  let entries = [];
  let blocks = [];
  let notes = [];
  let tradeSide = "buy";
  let flowType = "deposit_external";
  let positions = [];
  let totals = {};

  function toast(message) {
    const node = $("toast");
    node.textContent = message;
    node.classList.add("show");
    setTimeout(() => node.classList.remove("show"), 2200);
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
    const buys = rows.filter(row => row.side === "buy");
    const sells = rows.filter(row => row.side === "sell");
    const buyQty = buys.reduce((sum, row) => sum + n(row.quantity), 0);
    const buyAmount = buys.reduce((sum, row) => sum + n(row.amount), 0);
    const sellQty = sells.reduce((sum, row) => sum + n(row.quantity), 0);
    const sellAmount = sells.reduce((sum, row) => sum + n(row.amount), 0);
    const avgCost = buyQty > 0 ? buyAmount / buyQty : 0;
    const openQty = Math.max(0, buyQty - sellQty);
    const openCost = openQty * avgCost;
    const price = n(asset.current_price) || (openQty > 0 ? latestEntryValue(asset.block_id) / openQty : 0);
    const marketValue = openQty * price;
    const realizedGain = sellAmount - sellQty * avgCost;
    const unrealizedGain = marketValue - openCost;
    return { asset, rows, buyQty, buyAmount, sellQty, sellAmount, avgCost, openQty, openCost, price, marketValue, realizedGain, unrealizedGain };
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
    totals = { openPositions, totalBuy, totalSell, marketValue, openCost, realizedGain, unrealizedGain, deposits, withdrawals, netExternal, cashInternal, portfolioValue, netContributed, grossProfit, tax, netProfit };
  }

  function renderDashboard() {
    const cards = [
      ["Valore totale portafoglio", eur(totals.portfolioValue), "asset aperti + cash interno"],
      ["Valore aperto asset", eur(totals.marketValue), `${totals.openPositions.length} posizioni aperte`],
      ["Cash interno stimato", eur(totals.cashInternal), "vendite non prelevate / cash conto"],
      ["Capitale storico investito", eur(totals.netContributed), flows.length ? "depositi - prelievi" : "fallback: acquisti storici"],
      ["Utile totale lordo", eur(totals.grossProfit), `realizzato ${eur(totals.realizedGain)} + aperto ${eur(totals.unrealizedGain)}`],
      ["Utile netto stimato", eur(totals.netProfit), `tasse stimate 26%: ${eur(totals.tax)}`],
      ["Rendimento lordo", pct(totals.netContributed ? totals.grossProfit / totals.netContributed * 100 : 0), "su capitale storico/conferito"],
      ["Utile realizzato", eur(totals.realizedGain), `vendite ${eur(totals.totalSell)}`],
      ["Capitale ancora investito", eur(totals.openCost), "cost basis aperto"],
    ];
    $("dashboard").innerHTML = cards.map(card => `<div class="card"><h3>${safe(card[0])}</h3><div class="value">${card[1]}</div><div class="small">${safe(card[2])}</div></div>`).join("");
  }

  function renderPositions() {
    const open = totals.openPositions.sort((a, b) => b.marketValue - a.marketValue);
    $("positions").innerHTML = open.length ? open.map(pos => positionHtml(pos)).join("") : `<p class="small">Nessuna posizione aperta.</p>`;
  }

  function positionHtml(pos) {
    const gainClass = pos.unrealizedGain >= 0 ? "pos" : "neg";
    const allocation = totals.marketValue > 0 ? pos.marketValue / totals.marketValue * 100 : 0;
    return `<div class="asset">
      <div class="asset-head"><div><h3>${safe(pos.asset.name)}</h3><p class="small">${safe(blockName(pos.asset.block_id))} · prezzo ${safe(pos.asset.current_price_date || "")}</p></div><div class="actions"><button class="btn" data-sellall="${safe(pos.asset.id)}">Vendi tutto</button></div></div>
      <div class="row"><span class="pill">Quantità ${fmt4(pos.openQty)}</span><span class="pill">Costo medio ${eur(pos.avgCost)}</span><span class="pill">Valore ${eur(pos.marketValue)}</span><span class="pill ${gainClass}">${eur(pos.unrealizedGain)}</span></div>
      <div class="barbox" style="margin:12px 0"><div class="bar" style="width:${Math.max(2, Math.min(100, allocation))}%"></div></div>
      <div class="row"><div class="field" style="flex:1"><label>Prezzo attuale</label><input data-price="${safe(pos.asset.id)}" inputmode="decimal" value="${safe(pos.price)}"></div><div class="field" style="width:160px"><label>Data</label><input data-pricedate="${safe(pos.asset.id)}" type="date" value="${safe(pos.asset.current_price_date || today())}"></div><div class="field"><label>&nbsp;</label><button class="btn" data-saveprice="${safe(pos.asset.id)}">Salva prezzo</button></div></div>
      <p class="small">Realizzato ${eur(pos.realizedGain)} · costo residuo ${eur(pos.openCost)} · allocazione ${pct(allocation)}</p>
    </div>`;
  }

  function fmt4(value) {
    return new Intl.NumberFormat("it-IT", { maximumFractionDigits: 4 }).format(n(value));
  }

  function renderTradeForm() {
    document.querySelectorAll("[data-side]").forEach(button => button.classList.toggle("active", button.dataset.side === tradeSide));
    $("tradeAsset").innerHTML = assets.slice().sort((a, b) => a.name.localeCompare(b.name)).map(asset => `<option value="${safe(asset.id)}">${safe(asset.name)}</option>`).join("");
    updateTradeTotal();
  }

  function updateTradeTotal() {
    const total = n($("tradeQty").value) * n($("tradePrice").value);
    $("tradeTotal").textContent = `Controvalore ${eur(total)}`;
  }

  function renderAllocation() {
    const rows = totals.openPositions.slice().sort((a, b) => b.marketValue - a.marketValue);
    const cashRow = totals.cashInternal > 0 ? [{ name: "Cash interno", value: totals.cashInternal }] : [];
    const total = totals.marketValue + totals.cashInternal;
    const all = [...rows.map(pos => ({ name: pos.asset.name, value: pos.marketValue })), ...cashRow];
    $("allocation").innerHTML = all.length ? all.map(row => {
      const p = total > 0 ? row.value / total * 100 : 0;
      return `<div style="margin-bottom:12px"><div class="history-title"><span>${safe(row.name)}</span><span class="small">${eur(row.value)} · ${pct(p)}</span></div><div class="barbox"><div class="bar" style="width:${Math.max(2, Math.min(100, p))}%"></div></div></div>`;
    }).join("") : `<p class="small">Nessuna allocazione disponibile.</p>`;
  }

  function renderTradeLog() {
    const rows = trades.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.created_at || "").localeCompare(String(a.created_at || "")));
    $("tradeLog").innerHTML = rows.length ? rows.map(row => `<div class="log-item"><strong>${safe(row.date)} · ${row.side === "sell" ? "Vendita" : "Acquisto"} · ${safe(assetName(row.asset_id))}</strong><div class="small">${fmt4(row.quantity)} × ${eur(row.price)} · controvalore ${eur(row.amount)}</div>${row.note ? `<p class="small">${safe(row.note)}</p>` : ""}</div>`).join("") : `<p class="small">Nessun movimento.</p>`;
  }

  function renderNotes() {
    const rows = notes.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 8);
    $("notes").innerHTML = rows.length ? rows.map(note => `<div class="log-item"><strong>${safe(note.date)} · ${safe(note.block_id ? blockName(note.block_id) : "Generale")}</strong><p class="small">${safe(note.text)}</p></div>`).join("") : `<p class="small">Nessuna nota.</p>`;
  }

  function render() {
    computeAll();
    renderDashboard();
    renderPositions();
    renderTradeForm();
    renderAllocation();
    renderTradeLog();
    renderNotes();
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
    render();
    toast("Investimenti caricati");
  }

  async function saveTrade() {
    const assetId = $("tradeAsset").value;
    const quantity = n($("tradeQty").value);
    const price = n($("tradePrice").value);
    if (!assetId || quantity <= 0 || price <= 0) {
      toast("Inserisci strumento, quantità e prezzo");
      return;
    }
    const amount = quantity * price;
    const row = {
      user_id: userId,
      id: uid("investment-trade"),
      asset_id: assetId,
      date: $("tradeDate").value || today(),
      side: tradeSide,
      quantity,
      price,
      amount,
      note: $("tradeNote").value || "",
      updated_at: new Date().toISOString(),
    };
    const insert = await client.from("investment_trades").insert(row);
    if (insert.error) {
      console.error(insert.error);
      toast("Errore salvataggio movimento");
      return;
    }
    await client.from("investment_assets").update({ current_price: price, current_price_date: row.date, updated_at: new Date().toISOString() }).eq("user_id", userId).eq("id", assetId);
    $("tradeQty").value = "";
    $("tradePrice").value = "";
    $("tradeNote").value = "";
    await loadCloud();
    toast("Movimento salvato");
  }

  async function savePrice(assetId) {
    const asset = assets.find(item => item.id === assetId);
    const price = n(document.querySelector(`[data-price="${CSS.escape(assetId)}"]`)?.value);
    const date = document.querySelector(`[data-pricedate="${CSS.escape(assetId)}"]`)?.value || today();
    if (!asset || price <= 0) {
      toast("Prezzo non valido");
      return;
    }
    const update = await client.from("investment_assets").update({ current_price: price, current_price_date: date, updated_at: new Date().toISOString() }).eq("user_id", userId).eq("id", assetId);
    if (update.error) {
      console.error(update.error);
      toast("Errore salvataggio prezzo");
      return;
    }
    const pos = computePosition({ ...asset, current_price: price, current_price_date: date });
    await client.from("investment_entries").insert({
      user_id: userId,
      id: uid("price-snapshot"),
      date,
      characteristic: asset.name,
      number_value: pos.openQty,
      purchase_price: pos.openCost,
      current_price: price,
      current_value: pos.marketValue,
      cash_value: 0,
      text_value: "Aggiornamento prezzo da app Investimenti separata",
      generic_option: asset.block_id,
      transaction_type: "update",
      ath: 0,
      created_at_ms: Date.now(),
      updated_at: new Date().toISOString(),
    });
    await loadCloud();
    toast("Prezzo salvato");
  }

  async function saveFlow() {
    const amount = n($("flowAmount").value);
    if (amount <= 0) {
      toast("Importo non valido");
      return;
    }
    const insert = await client.from("investment_cash_flows").insert({
      user_id: userId,
      id: uid("investment-cash"),
      date: $("flowDate").value || today(),
      type: flowType,
      amount,
      broker: "Altro",
      note: $("flowNote").value || "",
      updated_at: new Date().toISOString(),
    });
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
    const insert = await client.from("investment_notes").insert({
      user_id: userId,
      id: uid("investment-note"),
      date: $("noteDate").value || today(),
      block_id: "",
      text,
      created_at_ms: Date.now(),
      updated_at: new Date().toISOString(),
    });
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
    if (["tradeQty", "tradePrice"].includes(event.target.id)) updateTradeTotal();
  });

  document.addEventListener("click", event => {
    const side = event.target.dataset.side;
    if (side) {
      tradeSide = side;
      document.querySelectorAll("[data-side]").forEach(button => button.classList.toggle("active", button.dataset.side === tradeSide));
      return;
    }
    const flow = event.target.dataset.flow;
    if (flow) {
      flowType = flow;
      document.querySelectorAll("[data-flow]").forEach(button => button.classList.toggle("active", button.dataset.flow === flowType));
      return;
    }
    const savePriceId = event.target.dataset.saveprice;
    if (savePriceId) savePrice(savePriceId);
    const sellAllId = event.target.dataset.sellall;
    if (sellAllId) {
      const pos = positions.find(item => item.asset.id === sellAllId);
      if (!pos) return;
      tradeSide = "sell";
      renderTradeForm();
      $("tradeAsset").value = sellAllId;
      $("tradeQty").value = pos.openQty;
      $("tradePrice").value = pos.price;
      $("tradeNote").value = "Vendita totale posizione";
      updateTradeTotal();
      window.scrollTo({ top: document.querySelector("aside").offsetTop - 70, behavior: "smooth" });
    }
  });

  $("reloadBtn").addEventListener("click", loadCloud);
  $("saveTradeBtn").addEventListener("click", saveTrade);
  $("saveFlowBtn").addEventListener("click", saveFlow);
  $("saveNoteBtn").addEventListener("click", saveNote);
  $("tradeDate").value = today();
  $("flowDate").value = today();
  $("noteDate").value = today();
  loadCloud();
})();
