(() => {
  if (window.__INVESTMENTS_FULL_HISTORY_CHARTS__) return;
  window.__INVESTMENTS_FULL_HISTORY_CHARTS__ = true;

  const SUPABASE_URL = "https://kujyowhezihjambhpahe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3";
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const n = value => {
    const parsed = Number(String(value ?? 0).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const eur = value => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n(value));
  const safe = value => String(value ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));

  function ensureTooltip() {
    if (!document.getElementById("fullHistoryChartTooltipStyles")) {
      const style = document.createElement("style");
      style.id = "fullHistoryChartTooltipStyles";
      style.textContent = `.full-history-chart{overflow-x:auto;overflow-y:hidden}.asset-chart-tooltip{position:fixed;z-index:9999;pointer-events:none;background:#06131d;color:#eef6ff;border:1px solid var(--border);border-radius:12px;padding:8px 10px;font-size:12px;box-shadow:0 8px 24px rgba(0,0,0,.35);opacity:0;transform:translate(-50%,-115%);transition:opacity .08s}.asset-chart-tooltip.show{opacity:1}.chart-hit{cursor:pointer}.chart-hit:focus-visible+.chart-dot,.chart-hit:hover+.chart-dot{filter:drop-shadow(0 0 5px currentColor)}`;
      document.head.appendChild(style);
    }
    let tip = document.getElementById("assetChartTooltip");
    if (!tip) {
      tip = document.createElement("div");
      tip.id = "assetChartTooltip";
      tip.className = "asset-chart-tooltip";
      document.body.appendChild(tip);
    }
    return tip;
  }

  function showTooltip(event) {
    const point = event.target.closest?.("[data-full-chart-tooltip]");
    if (!point) return;
    const tip = ensureTooltip();
    tip.innerHTML = point.dataset.fullChartTooltip || "";
    tip.style.left = `${event.clientX ?? point.getBoundingClientRect().left}px`;
    tip.style.top = `${(event.clientY ?? point.getBoundingClientRect().top) - 10}px`;
    tip.classList.add("show");
  }

  function hideTooltip() {
    document.getElementById("assetChartTooltip")?.classList.remove("show");
  }

  function dedupeRows(rows) {
    const seen = new Set();
    return rows.filter(row => {
      const key = `${row.date}|${Number(row.value).toFixed(6)}|${row.kind || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function historyForAsset(asset, entries, trades) {
    const assetTrades = trades.filter(trade => trade.asset_id === asset.id && trade.side === "buy").sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.created_at || "").localeCompare(String(b.created_at || "")));
    const firstBuy = assetTrades[0];
    const rows = [];

    if (firstBuy && n(firstBuy.amount) > 0) {
      rows.push({
        date: firstBuy.date,
        value: n(firstBuy.amount),
        price: n(firstBuy.price),
        kind: "acquisto",
        label: "Valore all'acquisto"
      });
    }

    entries
      .filter(entry => entry.generic_option === asset.block_id && n(entry.current_value) > 0 && entry.date)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)) || n(a.created_at_ms) - n(b.created_at_ms))
      .forEach(entry => rows.push({
        date: entry.date,
        value: n(entry.current_value),
        price: n(entry.current_price),
        kind: entry.transaction_type === "buy" ? "acquisto" : "aggiornamento",
        label: entry.transaction_type === "buy" ? "Valore all'acquisto" : "Aggiornamento prezzo"
      }));

    return dedupeRows(rows).sort((a, b) => String(a.date).localeCompare(String(b.date)) || (a.kind === "acquisto" ? -1 : 1));
  }

  function chartHtml(asset, rows) {
    if (rows.length < 2) return `<p class="small">Grafico valore: servono almeno due punti storici.</p>`;
    const pointGap = 44;
    const w = Math.max(520, 24 + (rows.length - 1) * pointGap);
    const h = 130;
    const pad = 14;
    const min = Math.min(...rows.map(row => row.value));
    const max = Math.max(...rows.map(row => row.value));
    const span = Math.max(1, max - min);
    const coords = rows.map((row, index) => {
      const x = pad + (rows.length === 1 ? 0 : index * (w - pad * 2) / (rows.length - 1));
      const y = h - pad - ((row.value - min) / span) * (h - pad * 2);
      return { row, x: x.toFixed(1), y: y.toFixed(1) };
    });
    const points = coords.map(point => `${point.x},${point.y}`).join(" ");
    const first = rows[0];
    const last = rows[rows.length - 1];
    const delta = last.value - first.value;

    return `<div class="asset-line-chart full-history-chart" style="margin-top:12px;border:1px solid var(--border);border-radius:14px;padding:10px;background:rgba(0,0,0,.12)">
      <div class="history-title"><strong>Andamento valore asset · tutti i punti</strong><span class="small ${delta >= 0 ? "pos" : "neg"}">${delta >= 0 ? "+" : ""}${eur(delta)}</span></div>
      <svg viewBox="0 0 ${w} ${h}" width="${w}" height="130" role="img" aria-label="Andamento valore completo ${safe(asset.name)}">
        <polyline points="${points}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${coords.map(({ row, x, y }, index) => {
          const tooltip = `${safe(row.date)}<br>${safe(row.label)}<br>${eur(row.value)}${row.price ? `<br>Prezzo ${eur(row.price)}` : ""}`;
          const radius = index === 0 ? 5 : 3.8;
          return `<g data-full-chart-tooltip="${tooltip}" tabindex="0"><circle class="chart-hit" cx="${x}" cy="${y}" r="11" fill="transparent"></circle><circle class="chart-dot" cx="${x}" cy="${y}" r="${radius}" fill="currentColor"></circle><title>${safe(row.date)} · ${safe(row.label)} · ${eur(row.value)}</title></g>`;
        }).join("")}
      </svg>
      <div class="history-title small"><span>${safe(first.date)} · acquisto · ${eur(first.value)}</span><span>${safe(last.date)} · ${eur(last.value)}</span></div>
    </div>`;
  }

  async function loadData() {
    const auth = await client.auth.getSession();
    const session = auth.data.session;
    if (!session) return null;
    const userId = session.user.id;
    const [assetRows, entryRows, tradeRows] = await Promise.all([
      client.from("investment_assets").select("*").eq("user_id", userId),
      client.from("investment_entries").select("*").eq("user_id", userId),
      client.from("investment_trades").select("*").eq("user_id", userId)
    ]);
    if (assetRows.error || entryRows.error || tradeRows.error) return null;
    return { assets: assetRows.data || [], entries: entryRows.data || [], trades: tradeRows.data || [] };
  }

  async function renderFullCharts() {
    ensureTooltip();
    const data = await loadData();
    if (!data) return;
    document.querySelectorAll("#positions .asset").forEach(card => {
      const name = card.querySelector("h3")?.textContent?.trim();
      if (!name) return;
      const asset = data.assets.find(row => row.name === name);
      if (!asset) return;
      const rows = historyForAsset(asset, data.entries, data.trades);
      const oldChart = card.querySelector(".asset-line-chart");
      if (oldChart) oldChart.outerHTML = chartHtml(asset, rows);
    });
  }

  document.addEventListener("pointerover", event => {
    if (event.target.closest?.("[data-full-chart-tooltip]")) showTooltip(event);
  }, true);
  document.addEventListener("pointermove", event => {
    if (event.target.closest?.("[data-full-chart-tooltip]")) showTooltip(event);
  }, true);
  document.addEventListener("pointerout", event => {
    if (event.target.closest?.("[data-full-chart-tooltip]")) hideTooltip();
  }, true);
  document.addEventListener("focusin", event => {
    const point = event.target.closest?.("[data-full-chart-tooltip]");
    if (!point) return;
    const rect = point.getBoundingClientRect();
    const tip = ensureTooltip();
    tip.innerHTML = point.dataset.fullChartTooltip || "";
    tip.style.left = `${rect.left + rect.width / 2}px`;
    tip.style.top = `${rect.top - 8}px`;
    tip.classList.add("show");
  }, true);
  document.addEventListener("focusout", hideTooltip, true);
  document.addEventListener("click", event => {
    if (event.target.closest?.("#reloadBtn,[data-metric-preset]")) setTimeout(renderFullCharts, 1400);
  }, true);

  setTimeout(renderFullCharts, 1800);
  setTimeout(renderFullCharts, 3200);
})();