(() => {
  if (window.__INVESTMENTS_ALLOCATION_GROUPING_PATCH__) return;
  window.__INVESTMENTS_ALLOCATION_GROUPING_PATCH__ = true;

  const MODE_KEY = "invest-tracker-allocation-mode-v1";
  const VALID_MODES = new Set(["asset", "region", "sector"]);
  let mode = VALID_MODES.has(localStorage.getItem(MODE_KEY)) ? localStorage.getItem(MODE_KEY) : "asset";
  let rawRows = [];
  let rawHtml = "";
  let observer = null;

  const safe = value => String(value ?? "").replace(/[&<>\"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
  const eur = value => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(Number(value) || 0);
  const pct = value => `${new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 }).format(Number(value) || 0)}%`;
  const normalize = value => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  function parseEuro(text) {
    const match = String(text || "").match(/(-?[\d.\s\u00a0]+,\d{2})\s*€/);
    if (!match) return 0;
    const normalized = match[1].replace(/[.\s\u00a0]/g, "").replace(",", ".");
    const value = Number(normalized);
    return Number.isFinite(value) ? value : 0;
  }

  function regionFor(name) {
    const x = normalize(name);
    if (x.includes("cash") || x.includes("liquidita")) return "Liquidità";
    if (x.includes("bitcoin") || x.includes("ethereum")) return "Crypto";
    if (x.includes("gold")) return "Materie prime";
    if (x.includes("nasdaq") || x.includes("berkshire")) return "USA";
    if (x.includes("france") || x.includes("healthcare") || x.includes("switzerland")) return "Europa";
    if (x.includes("india") || x.includes("korea") || x.includes("japan") || x.includes("indonesia")) return "Asia";
    if (x.includes("saudi")) return "Medio Oriente";
    if (x.includes("ex-usa") || x.includes("ex usa") || x.includes("minimum volatility") || x.includes("world")) return "Globale / multi-regione";
    return "Altro";
  }

  function sectorFor(name) {
    const x = normalize(name);
    if (x.includes("cash") || x.includes("liquidita")) return "Liquidità";
    if (x.includes("bitcoin") || x.includes("ethereum")) return "Crypto";
    if (x.includes("gold")) return "Oro / materie prime";
    if (x.includes("healthcare")) return "Sanità";
    if (x.includes("nasdaq")) return "Tecnologia / Growth";
    if (x.includes("berkshire")) return "Finanza / Conglomerato";
    return "Multi-settore";
  }

  function captureRawRows() {
    const holder = document.getElementById("allocation");
    if (!holder) return false;
    const nodes = [...holder.querySelectorAll(".allocation-row")];
    if (!nodes.length || nodes.every(node => node.classList.contains("allocation-grouped-row"))) return false;

    const parsed = nodes.map(node => {
      const name = node.querySelector("strong")?.textContent?.trim() || "";
      const detail = node.querySelector(".small")?.textContent || "";
      return { name, value: parseEuro(detail) };
    }).filter(row => row.name && row.value > 0);

    if (!parsed.length) return false;
    rawRows = parsed;
    rawHtml = holder.innerHTML;
    return true;
  }

  function groupedRows(kind) {
    const map = new Map();
    rawRows.forEach(row => {
      const group = kind === "region" ? regionFor(row.name) : sectorFor(row.name);
      const current = map.get(group) || { name: group, value: 0, members: [] };
      current.value += row.value;
      current.members.push(row.name);
      map.set(group, current);
    });
    return [...map.values()].sort((a, b) => b.value - a.value);
  }

  function updateControls() {
    document.querySelectorAll("[data-allocation-mode]").forEach(button => {
      button.classList.toggle("active", button.dataset.allocationMode === mode);
    });
    const note = document.getElementById("allocationModeNote");
    if (!note) return;
    note.textContent = mode === "region"
      ? "Aggregazione gestionale per area geografica. Gli ETF globali o multi-paese restano in Globale / multi-regione."
      : mode === "sector"
        ? "Settore / tema è una classificazione sintetica del prodotto, non il look-through delle singole partecipazioni dell’ETF."
        : "Vista per singolo asset.";
  }

  function renderMode() {
    const holder = document.getElementById("allocation");
    if (!holder) return;
    updateControls();

    if (mode === "asset") {
      if (rawHtml && holder.querySelector(".allocation-grouped-row")) holder.innerHTML = rawHtml;
      return;
    }

    if (!rawRows.length && !captureRawRows()) return;
    const rows = groupedRows(mode);
    const total = rows.reduce((sum, row) => sum + row.value, 0);
    holder.innerHTML = rows.length ? rows.map(row => {
      const share = total > 0 ? row.value / total * 100 : 0;
      const members = row.members.length > 3 ? `${row.members.slice(0, 3).join(" · ")} · +${row.members.length - 3}` : row.members.join(" · ");
      return `<div class="allocation-row allocation-grouped-row"><div class="history-title"><div><strong>${safe(row.name)}</strong><div class="small">${safe(members)} · ${eur(row.value)} · ${pct(share)}</div></div></div><div class="barbox"><div class="bar" style="width:${Math.max(2, Math.min(100, share))}%"></div></div></div>`;
    }).join("") : `<p class="small">Nessuna allocazione disponibile.</p>`;
  }

  function ensureControls() {
    const holder = document.getElementById("allocation");
    if (!holder) return false;
    if (!document.getElementById("allocationModeTabs")) {
      const tabs = document.createElement("div");
      tabs.id = "allocationModeTabs";
      tabs.className = "tabs";
      tabs.innerHTML = `
        <button type="button" data-allocation-mode="asset">Asset</button>
        <button type="button" data-allocation-mode="region">Regione</button>
        <button type="button" data-allocation-mode="sector">Settore / tema</button>`;
      holder.before(tabs);

      const note = document.createElement("p");
      note.id = "allocationModeNote";
      note.className = "small";
      tabs.after(note);

      tabs.addEventListener("click", event => {
        const button = event.target.closest("[data-allocation-mode]");
        if (!button) return;
        const next = button.dataset.allocationMode;
        if (!VALID_MODES.has(next)) return;
        if (mode !== "asset" && next === "asset" && rawHtml) {
          mode = next;
          localStorage.setItem(MODE_KEY, mode);
          renderMode();
          return;
        }
        mode = next;
        localStorage.setItem(MODE_KEY, mode);
        renderMode();
      });
    }
    updateControls();
    return true;
  }

  function install() {
    const holder = document.getElementById("allocation");
    if (!holder || !ensureControls()) {
      setTimeout(install, 250);
      return;
    }

    captureRawRows();
    renderMode();

    observer?.disconnect();
    observer = new MutationObserver(() => {
      const rows = [...holder.querySelectorAll(".allocation-row")];
      const hasFreshRawRender = rows.some(row => !row.classList.contains("allocation-grouped-row"));
      if (!hasFreshRawRender) return;
      if (captureRawRows() && mode !== "asset") renderMode();
    });
    observer.observe(holder, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
