(() => {
  if (window.__INVESTMENTS_FULL_HISTORY_CHARTS_V2__) return;
  window.__INVESTMENTS_FULL_HISTORY_CHARTS_V2__ = true;

  const SUPABASE_URL = "https://kujyowhezihjambhpahe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3";
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const EPS = 0.0000001;
  const n = value => {
    const parsed = Number(String(value ?? 0).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const eur = value => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n(value));
  const safe = value => String(value ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function ensureUi() {
    if (!document.getElementById("fullHistoryChartTooltipStyles")) {
      const style = document.createElement("style");
      style.id = "fullHistoryChartTooltipStyles";
      style.textContent = ".full-history-chart{overflow-x:auto;overflow-y:hidden}.asset-chart-tooltip{position:fixed;z-index:9999;pointer-events:none;background:#06131d;color:#eef6ff;border:1px solid var(--border);border-radius:12px;padding:8px 10px;font-size:12px;box-shadow:0 8px 24px rgba(0,0,0,.35);opacity:0;transform:translate(-50%,-115%)}.asset-chart-tooltip.show{opacity:1}.chart-hit{cursor:pointer}.chart-hit:focus-visible+.chart-dot,.chart-hit:hover+.chart-dot{filter:drop-shadow(0 0 5px currentColor)}.cycle-chart-controls{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.cycle-chart-controls .active{border-color:var(--accent);color:var(--accent)}.cycle-chart-note{margin-top:6px}";
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

  function orderedTrades(asset, trades) {
    return trades.filter(row => row.asset_id === asset.id).slice().sort((a, b) =>
      String(a.date || "").localeCompare(String(b.date || "")) ||
      String(a.created_at || "").localeCompare(String(b.created_at || ""))
    );
  }

  function buildCycles(asset, entries, trades) {
    const cycles = [];
    let current = null;
    let openQty = 0;
    let openCost = 0;

    orderedTrades(asset, trades).forEach(trade => {
      const quantity = n(trade.quantity);
      const amount = n(trade.amount);
      const fee = Math.max(0, n(trade.fee));
      if (trade.side === "buy") {
        if (openQty < EPS) {
          current = { index: cycles.length + 1, startDate: trade.date || "", endDate: "", closed: false, rows: [] };
          cycles.push(current);
          openQty = 0;
          openCost = 0;
        }
        openQty += quantity;
        openCost += amount + fee;
        current.rows.push({ date: trade.date, value: openCost, price: n(trade.price), kind: "acquisto", label: "Costo del ciclo dopo acquisto" });
        return;
      }
      if (trade.side === "sell" && current && openQty > EPS) {
        const sold = Math.min(quantity, openQty);
        const avg = openCost / openQty;
        const net = Math.max(0, amount - fee);
        openQty -= sold;
        openCost -= sold * avg;
        if (openQty < EPS) {
          current.rows.push({ date: trade.date, value: net, price: n(trade.price), kind: "vendita", label: "Vendita totale · ricavo netto" });
          current.endDate = trade.date || "";
          current.closed = true;
          current = null;
          openQty = 0;
          openCost = 0;
        }
      }
    });

    entries
      .filter(entry => entry.generic_option === asset.block_id && n(entry.current_value) > 0 && entry.date)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)) || n(a.created_at_ms) - n(b.created_at_ms))
      .forEach(entry => {
        const cycle = cycles.slice().reverse().find(item =>
          String(entry.date) >= String(item.startDate) &&
          (!item.endDate || String(entry.date) <= String(item.endDate))
        );
        if (!cycle) return;
        cycle.rows.push({
          date: entry.date,
          value: n(entry.current_value),
          price: n(entry.current_price),
          kind: "aggiornamento",
          label: "Aggiornamento prezzo"
        });
      });

    cycles.forEach(cycle => {
      const seen = new Set();
      cycle.rows = cycle.rows
        .sort((a, b) => String(a.date).localeCompare(String(b.date)) || ({ acquisto: 0, aggiornamento: 1, vendita: 2 }[a.kind] - { acquisto: 0, aggiornamento: 1, vendita: 2 }[b.kind]))
        .filter(row => {
          const key = row.date + "|" + row.value.toFixed(6) + "|" + row.kind;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
    });
    return cycles;
  }

  function svgForCycles(asset, cycles) {
    const flattened = [];
    cycles.forEach(cycle => cycle.rows.forEach(row => flattened.push({ cycle, row })));
    if (flattened.length < 2) return '<p class="small">Servono almeno due punti per questo intervallo.</p>';
    const gap = 44;
    const w = Math.max(520, 28 + (flattened.length - 1) * gap);
    const h = 130;
    const pad = 14;
    const min = Math.min(...flattened.map(item => item.row.value));
    const max = Math.max(...flattened.map(item => item.row.value));
    const span = Math.max(1, max - min);
    const coords = flattened.map((item, index) => ({
      ...item,
      x: (pad + index * (w - pad * 2) / Math.max(1, flattened.length - 1)).toFixed(1),
      y: (h - pad - ((item.row.value - min) / span) * (h - pad * 2)).toFixed(1)
    }));
    const lines = cycles.map(cycle => {
      const points = coords.filter(point => point.cycle === cycle).map(point => point.x + "," + point.y).join(" ");
      return points ? '<polyline points="' + points + '" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>' : "";
    }).join("");
    const dots = coords.map(({ cycle, row, x, y }) => {
      const tooltip = safe(row.date) + "<br>Ciclo " + cycle.index + " · " + safe(row.label) + "<br>" + eur(row.value) + (row.price ? "<br>Prezzo " + eur(row.price) : "");
      return '<g data-full-chart-tooltip="' + tooltip + '" tabindex="0"><circle class="chart-hit" cx="' + x + '" cy="' + y + '" r="11" fill="transparent"></circle><circle class="chart-dot" cx="' + x + '" cy="' + y + '" r="4" fill="currentColor"></circle><title>' + safe(row.date) + " · " + safe(row.label) + " · " + eur(row.value) + "</title></g>";
    }).join("");
    return '<div class="full-history-chart"><svg viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="130" role="img" aria-label="Andamento per cicli ' + safe(asset.name) + '">' + lines + dots + "</svg></div>";
  }

  function panelHtml(asset, cycles, currentMode) {
    const first = cycles[0]?.rows[0];
    const last = cycles[cycles.length - 1]?.rows.slice(-1)[0];
    const delta = first && last ? last.value - first.value : 0;
    const title = currentMode ? "Posizione attuale" : "Storico completo · cicli separati";
    const note = currentMode
      ? (first && last ? safe(first.date) + " → " + safe(last.date) + " · " + (delta >= 0 ? "+" : "") + eur(delta) : "Nessun ciclo aperto")
      : "La linea si interrompe a ogni vendita totale: il ciclo successivo riparte dal nuovo acquisto.";
    return '<div class="cycle-chart-panel" data-cycle-panel="' + (currentMode ? "current" : "all") + '"' + (currentMode ? "" : ' style="display:none"') + '><div class="history-title"><strong>' + title + "</strong>" + (currentMode && first && last ? '<span class="small ' + (delta >= 0 ? "pos" : "neg") + '">' + (delta >= 0 ? "+" : "") + eur(delta) + "</span>" : "") + "</div>" + svgForCycles(asset, cycles) + '<p class="small cycle-chart-note">' + note + "</p></div>";
  }

  function chartHtml(asset, cycles) {
    const current = cycles.filter(cycle => !cycle.closed).slice(-1);
    return '<div class="asset-line-chart cycle-aware-chart" style="margin-top:12px;border:1px solid var(--border);border-radius:14px;padding:10px;background:rgba(0,0,0,.12)"><div class="cycle-chart-controls"><button class="btn active" type="button" data-chart-mode="current">Posizione attuale</button><button class="btn" type="button" data-chart-mode="all">Storico completo</button></div>' + panelHtml(asset, current, true) + panelHtml(asset, cycles, false) + "</div>";
  }

  function showTooltip(event) {
    const point = event.target.closest?.("[data-full-chart-tooltip]");
    if (!point) return;
    const tip = ensureUi();
    const rect = point.getBoundingClientRect();
    tip.innerHTML = point.dataset.fullChartTooltip || "";
    tip.style.left = (event.clientX || rect.left + rect.width / 2) + "px";
    tip.style.top = ((event.clientY || rect.top) - 10) + "px";
    tip.classList.add("show");
  }

  function hideTooltip() {
    document.getElementById("assetChartTooltip")?.classList.remove("show");
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
    ensureUi();
    const data = await loadData();
    if (!data) return;
    document.querySelectorAll("#positions .asset").forEach(card => {
      const name = card.querySelector("h3")?.textContent?.trim();
      const asset = data.assets.find(row => row.name === name);
      if (!asset) return;
      const html = chartHtml(asset, buildCycles(asset, data.entries, data.trades));
      const old = card.querySelector(".asset-line-chart");
      if (old) old.outerHTML = html;
      else card.insertAdjacentHTML("beforeend", html);
    });
  }

  document.addEventListener("pointerover", event => { if (event.target.closest?.("[data-full-chart-tooltip]")) showTooltip(event); }, true);
  document.addEventListener("pointermove", event => { if (event.target.closest?.("[data-full-chart-tooltip]")) showTooltip(event); }, true);
  document.addEventListener("pointerout", event => { if (event.target.closest?.("[data-full-chart-tooltip]")) hideTooltip(); }, true);
  document.addEventListener("focusin", event => { if (event.target.closest?.("[data-full-chart-tooltip]")) showTooltip(event); }, true);
  document.addEventListener("focusout", hideTooltip, true);
  document.addEventListener("click", event => {
    const modeButton = event.target.closest?.("[data-chart-mode]");
    if (modeButton) {
      const root = modeButton.closest(".cycle-aware-chart");
      const mode = modeButton.dataset.chartMode;
      root.querySelectorAll("[data-chart-mode]").forEach(button => button.classList.toggle("active", button.dataset.chartMode === mode));
      root.querySelectorAll("[data-cycle-panel]").forEach(panel => { panel.style.display = panel.dataset.cyclePanel === mode ? "" : "none"; });
      return;
    }
    if (event.target.closest?.("#reloadBtn,[data-metric-preset]")) setTimeout(renderFullCharts, 1400);
  }, true);

  setTimeout(renderFullCharts, 1800);
  setTimeout(renderFullCharts, 3200);
})();
