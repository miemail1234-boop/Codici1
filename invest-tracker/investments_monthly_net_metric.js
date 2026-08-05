(() => {
  if (window.__INVESTMENTS_MONTHLY_NET_METRIC__) return;
  window.__INVESTMENTS_MONTHLY_NET_METRIC__ = true;

  const SUPABASE_URL = "https://kujyowhezihjambhpahe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3";
  const TAX_RATE = 0.26;
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const n = value => {
    const parsed = Number(String(value ?? 0).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const eur = value => new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
  }).format(n(value));
  const safe = value => String(value ?? "").replace(/[&<>"]/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;"
  }[c]));

  let rendering = false;

  function ensureControl() {
    const controls = document.getElementById("metricControls");
    if (!controls) return null;
    let input = document.getElementById("monthlyNetMetricCheck");
    if (input) return input;
    const label = document.createElement("label");
    label.className = "check";
    label.innerHTML = `<input type="checkbox" id="monthlyNetMetricCheck" checked> Netto mensile stimato`;
    controls.appendChild(label);
    return label.querySelector("input");
  }

  function latestEntryForAsset(asset, entries) {
    return entries
      .filter(entry => entry.generic_option === asset.block_id && n(entry.current_value) > 0)
      .slice()
      .sort((a, b) =>
        String(b.date || "").localeCompare(String(a.date || "")) ||
        n(b.created_at_ms) - n(a.created_at_ms) ||
        String(b.id || "").localeCompare(String(a.id || ""))
      )[0] || null;
  }

  function computePosition(asset, trades, entries) {
    const rows = trades
      .filter(row => row.asset_id === asset.id)
      .slice()
      .sort((a, b) =>
        String(a.date || "").localeCompare(String(b.date || "")) ||
        String(a.created_at || "").localeCompare(String(b.created_at || "")) ||
        String(a.id || "").localeCompare(String(b.id || ""))
      );

    let openQty = 0;
    let openCost = 0;
    let realizedGain = 0;
    let currentCycleStart = "";

    rows.forEach(row => {
      const quantity = Math.max(0, n(row.quantity));
      const amount = Math.max(0, n(row.amount));
      const fee = Math.max(0, n(row.fee));
      if (!quantity) return;

      if (row.side === "buy") {
        if (openQty < 0.0000001) currentCycleStart = row.date || "";
        openQty += quantity;
        openCost += amount + fee;
        return;
      }

      if (row.side === "sell" && openQty > 0) {
        const quantitySold = Math.min(quantity, openQty);
        const averageOpenCost = openCost / openQty;
        const netProceeds = Math.max(0, amount - fee);
        const allocatedProceeds = netProceeds * (quantitySold / quantity);

        realizedGain += allocatedProceeds - quantitySold * averageOpenCost;
        openQty -= quantitySold;
        openCost -= quantitySold * averageOpenCost;

        if (openQty < 0.0000001) {
          openQty = 0;
          openCost = 0;
          currentCycleStart = "";
        }
      }
    });

    const latestEntry = latestEntryForAsset(asset, entries);
    const latestBelongsToOpenCycle = Boolean(
      latestEntry &&
      currentCycleStart &&
      String(latestEntry.date || "").localeCompare(String(currentCycleStart)) >= 0
    );

    let marketValue = 0;
    if (openQty > 0) {
      if (n(asset.current_price) > 0) marketValue = openQty * n(asset.current_price);
      else if (latestBelongsToOpenCycle) marketValue = n(latestEntry.current_value);
      else marketValue = openCost;
    }

    const unrealizedGain = marketValue - openCost;
    return { realizedGain, unrealizedGain, openQty };
  }

  async function loadTotals() {
    const auth = await client.auth.getSession();
    const session = auth.data.session;
    if (!session) return null;
    const userId = session.user.id;

    const [assetRows, tradeRows, entryRows] = await Promise.all([
      client.from("investment_assets").select("*").eq("user_id", userId),
      client.from("investment_trades").select("*").eq("user_id", userId),
      client.from("investment_entries").select("*").eq("user_id", userId)
    ]);
    if (assetRows.error || tradeRows.error || entryRows.error) return null;

    const assets = assetRows.data || [];
    const trades = tradeRows.data || [];
    const entries = entryRows.data || [];
    const positions = assets.map(asset => computePosition(asset, trades, entries));
    const realizedGain = positions.reduce((sum, pos) => sum + pos.realizedGain, 0);
    const unrealizedGain = positions
      .filter(pos => pos.openQty > 0.0000001)
      .reduce((sum, pos) => sum + pos.unrealizedGain, 0);
    const grossProfit = realizedGain + unrealizedGain;
    const tax = grossProfit > 0 ? grossProfit * TAX_RATE : 0;
    const netProfit = grossProfit - tax;
    return { netProfit, monthlyNet: netProfit / 12 };
  }

  function setPresetState(event) {
    const button = event.target.closest?.("[data-metric-preset]");
    if (!button) return;
    const input = ensureControl();
    if (!input) return;
    const preset = button.getAttribute("data-metric-preset");
    if (preset === "none") input.checked = false;
    if (preset === "all" || preset === "essential") input.checked = true;
  }

  async function renderMonthlyMetric() {
    if (rendering) return;
    rendering = true;
    try {
      const input = ensureControl();
      const dashboard = document.getElementById("dashboard");
      if (!input || !dashboard) return;
      document.getElementById("monthlyNetMetricCard")?.remove();
      if (!input.checked) return;
      const totals = await loadTotals();
      if (!totals) return;

      const card = document.createElement("div");
      card.className = "card";
      card.id = "monthlyNetMetricCard";
      card.innerHTML = `<h3>${safe("Netto mensile stimato")}</h3><div class="value">${eur(totals.monthlyNet)}</div><div class="small">utile totale netto stimato ÷ 12 · cicli chiusi separati dalle posizioni riaperte</div>`;
      const netCard = [...dashboard.querySelectorAll(".card")]
        .find(node => node.querySelector("h3")?.textContent?.trim() === "Utile totale netto stimato");
      if (netCard?.nextSibling) netCard.parentNode.insertBefore(card, netCard.nextSibling);
      else dashboard.appendChild(card);
    } finally {
      rendering = false;
    }
  }

  document.addEventListener("change", event => {
    if (event.target.matches?.("#monthlyNetMetricCheck")) renderMonthlyMetric();
  }, true);
  document.addEventListener("click", event => {
    setPresetState(event);
    if (event.target.closest?.("#reloadBtn,[data-metric-preset]")) setTimeout(renderMonthlyMetric, 900);
  }, true);
  document.addEventListener("input", event => {
    if (event.target.matches?.("[data-metric-check]")) setTimeout(renderMonthlyMetric, 200);
  }, true);

  setTimeout(renderMonthlyMetric, 1400);
  setTimeout(renderMonthlyMetric, 3000);
})();