(() => {
  if (window.__INVESTMENTS_OVERVIEW_CHART_V3__) return;
  window.__INVESTMENTS_OVERVIEW_CHART_V3__ = true;

  const SUPABASE_URL = "https://kujyowhezihjambhpahe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3";
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const n = value => {
    const parsed = Number(String(value ?? 0).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const pct = value => `${new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 }).format(n(value))}%`;
  const safe = value => String(value ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));

  let allAssets = [];
  let allEntries = [];
  let allTrades = [];

  function ensureStyles() {
    if (document.getElementById("investmentOverviewChartStyles")) return;
    const style = document.createElement("style");
    style.id = "investmentOverviewChartStyles";
    style.textContent = `.overview-chart-wrap{border:1px solid var(--border);border-radius:16px;padding:12px;background:rgba(0,0,0,.13);width:100%;overflow:hidden}.overview-chart-wrap svg{display:block;width:100%;height:auto;min-height:230px}.overview-chart-controls{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 12px}.overview-chart-controls label{user-select:none}.overview-chart-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}.overview-line-hit{stroke:transparent;stroke-width:12;fill:none;pointer-events:stroke}.overview-point{cursor:pointer}.overview-chart-tooltip{position:fixed;z-index:9999;pointer-events:none;background:#06131d;color:#eef6ff;border:1px solid var(--border);border-radius:12px;padding:8px 10px;font-size:12px;box-shadow:0 8px 24px rgba(0,0,0,.35);opacity:0;transform:translate(-50%,-115%);transition:opacity .08s}.overview-chart-tooltip.show{opacity:1}`;
    document.head.appendChild(style);
  }

  function ensurePanel() {
    ensureStyles();
    let panel = document.getElementById("overviewChartPanel");
    if (panel) return panel;
    const dashboard = document.getElementById("dashboard");
    if (!dashboard) return null;
    panel = document.createElement("section");
    panel.className = "panel";
    panel.id = "overviewChartPanel";
    panel.innerHTML = `<h2>Andamento generale</h2><p class="small">Linee normalizzate base 100 dal valore di acquisto. Il grafico ora comprime tutti i punti disponibili fino all'ultimo aggiornamento, senza tagliare la parte destra.</p><div class="overview-chart-actions"><button class="btn" type="button" id="overviewSelectAll">Tutti</button><button class="btn" type="button" id="overviewSelectNone">Nessuno</button><button class="btn" type="button" id="overviewOnlyAverage">Solo media</button></div><div class="overview-chart-controls" id="overviewAssetControls"></div><div id="overviewChart"></div>`;
    dashboard.insertAdjacentElement("afterend", panel);
    return panel;
  }

  function tooltip() {
    let tip = document.getElementById("overviewChartTooltip");
    if (!tip) {
      tip = document.createElement("div");
      tip.id = "overviewChartTooltip";
      tip.className = "overview-chart-tooltip";
      document.body.appendChild(tip);
    }
    return tip;
  }

  function showTip(event) {
    const target = event.target.closest?.("[data-overview-tip]");
    if (!target) return;
    const tip = tooltip();
    tip.innerHTML = target.dataset.overviewTip || "";
    tip.style.left = `${event.clientX}px`;
    tip.style.top = `${event.clientY - 10}px`;
    tip.classList.add("show");
  }

  function hideTip() {
    document.getElementById("overviewChartTooltip")?.classList.remove("show");
  }

  function firstBuy(asset) {
    return allTrades
      .filter(trade => trade.asset_id === asset.id && trade.side === "buy" && n(trade.amount) > 0 && trade.date)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.created_at || "").localeCompare(String(b.created_at || "")))[0];
  }

  function rawHistory(asset) {
    const buy = firstBuy(asset);
    if (!buy) return [];
    const baseValue = n(buy.amount);
    if (!baseValue) return [];
    const rows = [{ date: buy.date, value: baseValue, index: 100, label: "Acquisto" }];
    allEntries
      .filter(entry => entry.generic_option === asset.block_id && n(entry.current_value) > 0 && entry.date)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)) || n(a.created_at_ms) - n(b.created_at_ms))
      .forEach(entry => rows.push({
        date: entry.date,
        value: n(entry.current_value),
        index: n(entry.current_value) / baseValue * 100,
        label: entry.transaction_type === "buy" ? "Acquisto" : "Aggiornamento prezzo"
      }));
    const byDate = new Map();
    rows.forEach(row => byDate.set(row.date, row));
    return [...byDate.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }

  function availableHistories() {
    return allAssets
      .map(asset => ({ asset, rows: rawHistory(asset) }))
      .filter(item => item.rows.length > 0)
      .sort((a, b) => a.asset.name.localeCompare(b.asset.name));
  }

  function selectedAssetIds() {
    return [...document.querySelectorAll("#overviewAssetControls input[data-overview-asset]:checked")].map(input => input.value);
  }

  function showAverageLine() {
    return Boolean(document.getElementById("overviewAverageLine")?.checked);
  }

  function renderControls() {
    const holder = document.getElementById("overviewAssetControls");
    if (!holder) return;
    const existing = new Set(selectedAssetIds());
    const averageAlreadyExists = Boolean(document.getElementById("overviewAverageLine"));
    const averageChecked = averageAlreadyExists ? showAverageLine() : true;
    const hasExistingAssets = existing.size > 0;
    const assetControls = availableHistories()
      .map(({ asset }) => `<label class="check"><input type="checkbox" data-overview-asset value="${safe(asset.id)}" ${!hasExistingAssets || existing.has(asset.id) ? "checked" : ""}> ${safe(asset.name)}</label>`)
      .join("");
    holder.innerHTML = `<label class="check"><input type="checkbox" id="overviewAverageLine" ${averageChecked ? "checked" : ""}> Media</label>${assetControls}`;
  }

  function unionDates(histories) {
    return [...new Set(histories.flatMap(item => item.rows.map(row => row.date)))].sort((a, b) => String(a).localeCompare(String(b)));
  }

  function valueAtOrBefore(rows, date) {
    let found = null;
    for (const row of rows) {
      if (String(row.date).localeCompare(String(date)) <= 0) found = row;
      else break;
    }
    return found;
  }

  function pathFor(points) {
    if (!points.length) return "";
    return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  }

  function dateTickLimit() {
    return window.matchMedia?.("(max-width: 700px)").matches ? 6 : 9;
  }

  function renderChart() {
    const holder = document.getElementById("overviewChart");
    if (!holder) return;
    const allHistories = availableHistories();
    const ids = new Set(selectedAssetIds());
    const assetHistories = allHistories.filter(item => ids.has(item.asset.id));
    const averageEnabled = showAverageLine();
    const averageSourceHistories = assetHistories.length ? assetHistories : allHistories;
    const dateSources = [...assetHistories, ...(averageEnabled ? averageSourceHistories : [])];

    if (!assetHistories.length && !averageEnabled) {
      holder.innerHTML = `<p class="small">Seleziona almeno la media o un asset per visualizzare il grafico.</p>`;
      return;
    }
    if (!dateSources.length) {
      holder.innerHTML = `<p class="small">Nessun dato storico disponibile.</p>`;
      return;
    }

    const dates = unionDates(dateSources);
    const average = averageEnabled ? dates.map(date => {
      const values = averageSourceHistories.map(item => valueAtOrBefore(item.rows, date)?.index).filter(value => Number.isFinite(value));
      return { date, index: values.reduce((sum, value) => sum + value, 0) / values.length };
    }).filter(row => Number.isFinite(row.index)) : [];

    const allIndexes = assetHistories.flatMap(item => item.rows.map(row => row.index));
    allIndexes.push(...average.map(row => row.index));
    const min = Math.min(...allIndexes, 100);
    const max = Math.max(...allIndexes, 100);
    const span = Math.max(1, max - min);
    const w = 1000;
    const h = 300;
    const padL = 46;
    const padR = 22;
    const padT = 18;
    const padB = 36;
    const xForDate = date => padL + dates.indexOf(date) * (w - padL - padR) / Math.max(1, dates.length - 1);
    const yForIndex = value => h - padB - ((value - min) / span) * (h - padT - padB);

    const avgPoints = average.map(row => ({ ...row, x: xForDate(row.date), y: yForIndex(row.index) }));
    const assetPaths = assetHistories.map(item => {
      const points = item.rows.map(row => ({ ...row, x: xForDate(row.date), y: yForIndex(row.index) }));
      return { ...item, points };
    });

    const yTicks = [min, min + span * .25, min + span * .5, min + span * .75, max];
    const maxTicks = dateTickLimit();
    const step = Math.max(1, Math.ceil(dates.length / maxTicks));
    const dateTicks = dates.filter((date, i) => i === 0 || i === dates.length - 1 || i % step === 0);
    const lastDate = dates[dates.length - 1] || "";
    const footerRight = averageEnabled && average.length ? `Media: ${pct(average[average.length - 1].index - 100)} · ultimo dato ${safe(lastDate)}` : `${assetHistories.length} asset selezionati · ultimo dato ${safe(lastDate)}`;

    holder.innerHTML = `<div class="overview-chart-wrap">
      <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Andamento generale asset selezionati">
        ${yTicks.map(tick => `<line x1="${padL}" x2="${w - padR}" y1="${yForIndex(tick).toFixed(1)}" y2="${yForIndex(tick).toFixed(1)}" stroke="rgba(255,255,255,.12)"></line><text x="6" y="${(yForIndex(tick) + 4).toFixed(1)}" fill="currentColor" opacity=".7" font-size="12">${pct(tick - 100)}</text>`).join("")}
        ${dateTicks.map(date => `<text x="${xForDate(date).toFixed(1)}" y="${h - 10}" fill="currentColor" opacity=".72" font-size="11" text-anchor="middle">${safe(String(date).slice(5))}</text>`).join("")}
        <line x1="${padL}" x2="${w - padR}" y1="${yForIndex(100).toFixed(1)}" y2="${yForIndex(100).toFixed(1)}" stroke="rgba(255,255,255,.32)" stroke-dasharray="5 5"></line>
        ${assetPaths.map(item => `<path d="${pathFor(item.points)}" fill="none" stroke="currentColor" stroke-width="1.7" opacity=".46" stroke-linecap="round" stroke-linejoin="round"></path><path class="overview-line-hit" d="${pathFor(item.points)}" data-overview-tip="${safe(item.asset.name)}"></path>`).join("")}
        ${avgPoints.length ? `<path d="${pathFor(avgPoints)}" fill="none" stroke="currentColor" stroke-width="4" opacity=".98" stroke-linecap="round" stroke-linejoin="round"></path>` : ""}
        ${avgPoints.map(point => `<circle class="overview-point" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4" fill="currentColor" data-overview-tip="Media<br>${safe(point.date)}<br>${pct(point.index - 100)}"></circle>`).join("")}
        ${assetPaths.map(item => item.points.map(point => `<circle class="overview-point" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="3" fill="currentColor" opacity=".55" data-overview-tip="${safe(item.asset.name)}<br>${safe(point.date)}<br>${safe(point.label)}<br>${pct(point.index - 100)}"></circle>`).join("")).join("")}
      </svg>
      <div class="history-title small"><span>Base 100 = valore di acquisto · tutti i punti visibili</span><span>${footerRight}</span></div>
    </div>`;
  }

  async function loadData() {
    const auth = await client.auth.getSession();
    const session = auth.data.session;
    if (!session) return false;
    const userId = session.user.id;
    const [assetRows, entryRows, tradeRows] = await Promise.all([
      client.from("investment_assets").select("*").eq("user_id", userId),
      client.from("investment_entries").select("*").eq("user_id", userId),
      client.from("investment_trades").select("*").eq("user_id", userId)
    ]);
    if (assetRows.error || entryRows.error || tradeRows.error) return false;
    allAssets = assetRows.data || [];
    allEntries = entryRows.data || [];
    allTrades = tradeRows.data || [];
    return true;
  }

  async function initOverviewChart() {
    const panel = ensurePanel();
    if (!panel) return;
    const ok = await loadData();
    if (!ok) return;
    renderControls();
    renderChart();
  }

  document.addEventListener("change", event => {
    if (event.target.matches?.("#overviewAssetControls input")) renderChart();
  }, true);
  document.addEventListener("click", event => {
    if (event.target.closest?.("#overviewSelectAll")) {
      document.querySelectorAll("#overviewAssetControls input").forEach(input => input.checked = true);
      renderChart();
    }
    if (event.target.closest?.("#overviewSelectNone")) {
      document.querySelectorAll("#overviewAssetControls input").forEach(input => input.checked = false);
      renderChart();
    }
    if (event.target.closest?.("#overviewOnlyAverage")) {
      document.querySelectorAll("#overviewAssetControls input[data-overview-asset]").forEach(input => input.checked = false);
      const average = document.getElementById("overviewAverageLine");
      if (average) average.checked = true;
      renderChart();
    }
    if (event.target.closest?.("#reloadBtn,[data-metric-preset]")) setTimeout(initOverviewChart, 1600);
  }, true);
  document.addEventListener("pointerover", event => {
    if (event.target.closest?.("[data-overview-tip]")) showTip(event);
  }, true);
  document.addEventListener("pointermove", event => {
    if (event.target.closest?.("[data-overview-tip]")) showTip(event);
  }, true);
  document.addEventListener("pointerout", event => {
    if (event.target.closest?.("[data-overview-tip]")) hideTip();
  }, true);
  window.addEventListener("resize", () => setTimeout(renderChart, 100));

  setTimeout(initOverviewChart, 1900);
  setTimeout(initOverviewChart, 3400);
})();
