(() => {
  if (window.__INVESTMENTS_MONTHLY_NET_METRIC__) return;
  window.__INVESTMENTS_MONTHLY_NET_METRIC__ = true;

  const SUPABASE_URL = "https://kujyowhezihjambhpahe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3";
  const TAX_RATE = 0.26;
  const SCREENSHOT_VALUES = {
    "Nasdaq": 49691.75,
    "Occidente ex-USA": 12179.66,
    "Stoxx healthcare": 10030.50,
    "Physical Gold": 6729.80,
    "FTSE Korea": 2080.40,
    "MSCI Indonesia": 2010.23,
    "MSCI Japan EUR (Acc)": 2002.32,
    "FTSE Saudi Arabia": 1994.37,
    "21share ETH Core ETP": 5012.00,
    "Berkshire H": 23625.00,
    "Franklin INDIA": 19195.00,
    "Ishare Bitcoin ETP": 4979.00,
    "MSCI World minimum volatility": 21285.00
  };
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const n = value => {
    const parsed = Number(String(value ?? 0).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const eur = value => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n(value));
  const safe = value => String(value ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));

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

  function computePosition(asset, trades, entries) {
    const rows = trades
      .filter(row => row.asset_id === asset.id)
      .slice()
      .sort((a, b) =>
        String(a.date || "").localeCompare(String(b.date || "")) ||
        String(a.created_at || "").localeCompare(String(b.created_at || ""))
      );
    let openQty = 0;
    let openCost = 0;
    let realizedGain = 0;

    rows.forEach(row => {
      const quantity = n(row.quantity);
      const amount = n(row.amount);
      if (row.side === "buy") {
        openQty += quantity;
        openCost += amount;
        return;
      }
      if (row.side === "sell" && openQty > 0) {
        const quantitySold = Math.min(quantity, openQty);
        const avgOpenCost = openCost / openQty;
        const allocatedProceeds = quantity > 0 ? amount * (quantitySold / quantity) : 0;
        realizedGain += allocatedProceeds - quantitySold * avgOpenCost;
        openQty -= quantitySold;
        openCost -= quantitySold * avgOpenCost;
        if (openQty < 0.0000001) {
          openQty = 0;
          openCost = 0;
        }
      }
    });

    const latestEntry = entries
      .filter(entry => entry.generic_option === asset.block_id && n(entry.current_value) > 0)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
    const fallbackPrice = n(asset.current_price) || (openQty > 0 ? n(latestEntry?.current_value) / openQty : 0);
    const screenshotValue = SCREENSHOT_VALUES[asset.name];
    const price = screenshotValue && openQty > 0 ? screenshotValue / openQty : fallbackPrice;
    const marketValue = screenshotValue && openQty > 0 ? screenshotValue : openQty * price;
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
    const unrealizedGain = positions.filter(pos => pos.openQty > 0.0000001).reduce((sum, pos) => sum + pos.unrealizedGain, 0);
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
      card.innerHTML = `<h3>${safe("Netto mensile stimato")}</h3><div class="value">${eur(totals.monthlyNet)}</div><div class="small">utile totale netto stimato ÷ 12</div>`;
      const netCard = [...dashboard.querySelectorAll(".card")].find(node => node.querySelector("h3")?.textContent?.trim() === "Utile totale netto stimato");
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
    if (event.target.closest?.("#reloadBtn,[data-metric-preset]")) setTimeout(renderMonthlyMetric, 1500);
  }, true);
  document.addEventListener("input", event => {
    if (event.target.matches?.("[data-metric-check]")) setTimeout(renderMonthlyMetric, 250);
  }, true);

  setTimeout(renderMonthlyMetric, 1800);
  setTimeout(renderMonthlyMetric, 3400);
})();