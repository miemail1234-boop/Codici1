(() => {
  const SUPABASE_URL = "https://kujyowhezihjambhpahe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3";
  const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/watchlist-yahoo`;
  const client = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);

  const WATCHLIST = [
    { n: "MSCI World", s: "IWDA.AS", isin: "IE00B4L5Y983", c: "Core globale" },
    { n: "FTSE All-World", s: "VWCE.DE", isin: "IE00BK5BQT80", c: "Core globale" },
    { n: "MSCI ACWI", s: "SSAC.L", isin: "IE00B6R52259", c: "Core globale" },
    { n: "MSCI ACWI IMI", s: "SPYI.DE", isin: "IE00B3YLTY66", c: "Core globale" },
    { n: "MSCI World Equal Weighted", s: "XDEW.DE", isin: "IE00BLNMYC90", c: "Global equal weight" },
    { n: "MSCI World Minimum Volatility", s: "MVOL.L", isin: "IE00B8FHGS14", c: "Difensivo" },
    { n: "MSCI World Quality", s: "IWQU.L", isin: "IE00BP3QZ601", c: "Quality" },
    { n: "MSCI World Momentum", s: "IWMO.L", isin: "IE00BP3QZ825", c: "Momentum" },
    { n: "MSCI World Value", s: "IWVL.L", isin: "IE00BP3QZB59", c: "Value" },
    { n: "MSCI World Small Cap", s: "WSML.L", isin: "IE00BF4RFH31", c: "Small cap" },
    { n: "S&P 500", s: "CSPX.L", isin: "IE00B5BMR087", c: "USA large cap" },
    { n: "S&P 500 Equal Weight", s: "SPES.L", isin: "", c: "USA equal weight" },
    { n: "S&P 500 Quality", s: "IQUF.L", isin: "", c: "USA quality" },
    { n: "MSCI USA Value", s: "IUVL.L", isin: "", c: "USA value" },
    { n: "MSCI USA Minimum Volatility", s: "IUMV.L", isin: "", c: "USA difensivo" },
    { n: "S&P MidCap 400", s: "SPY4.DE", isin: "", c: "USA mid cap" },
    { n: "S&P SmallCap 600", s: "ISP6.DE", isin: "", c: "USA small cap quality" },
    { n: "Russell 2000", s: "IUS3.DE", isin: "", c: "USA small cap" },
    { n: "Nasdaq 100", s: "SXRV.DE", isin: "IE00B53SZB19", c: "USA growth" },
    { n: "Nasdaq 100 Equal Weight", s: "EQAC.DE", isin: "", c: "USA growth equal weight" },
    { n: "STOXX Europe 600", s: "EXSA.DE", isin: "DE0002635307", c: "Europa ampia" },
    { n: "MSCI Europe", s: "IMEU.L", isin: "", c: "Europa ampia" },
    { n: "MSCI Europe Value", s: "IEVL.L", isin: "", c: "Europa value" },
    { n: "STOXX Europe 600 Value", s: "EXV1.DE", isin: "", c: "Europa value" },
    { n: "STOXX Europe 600 Equal Weight", s: "XESC.DE", isin: "", c: "Europa equal weight" },
    { n: "Euro STOXX 50", s: "SX5EEX.DE", isin: "", c: "Eurozona large cap" },
    { n: "MSCI EMU", s: "CEU.PA", isin: "", c: "Eurozona" },
    { n: "FTSE 100", s: "ISF.L", isin: "IE0005042456", c: "UK large cap" },
    { n: "FTSE 250", s: "MIDD.L", isin: "IE00B00FV128", c: "UK mid cap" },
    { n: "FTSE All-Share / UK proxy", s: "CUKX.L", isin: "", c: "UK broad" },
    { n: "MSCI UK Dividend", s: "IUKD.L", isin: "", c: "UK dividend" },
    { n: "CAC 40 / Francia", s: "C40.PA", isin: "FR0013380607", c: "Francia" },
    { n: "DAX / Germania", s: "EXS1.DE", isin: "DE0005933931", c: "Germania" },
    { n: "FTSE MIB / Italia", s: "CSMIB.MI", isin: "", c: "Italia" },
    { n: "IBEX 35 / Spagna proxy", s: "EWP", isin: "", c: "Spagna" },
    { n: "SMI / Svizzera", s: "CSSMI.SW", isin: "", c: "Svizzera" },
    { n: "Nordic Countries", s: "XDN0.DE", isin: "", c: "Nord Europa" },
    { n: "MSCI Japan", s: "IJPA.L", isin: "", c: "Giappone" },
    { n: "TOPIX", s: "XTPX.DE", isin: "", c: "Giappone broad" },
    { n: "Pacific ex Japan", s: "CPXJ.L", isin: "", c: "Asia sviluppata" },
    { n: "MSCI Emerging Markets", s: "EIMI.L", isin: "IE00BKM4GZ66", c: "Emergenti" },
    { n: "Emerging Markets ex China", s: "EMXC.L", isin: "", c: "Emergenti ex China" },
    { n: "MSCI India", s: "NDIA.L", isin: "", c: "India" },
    { n: "MSCI China", s: "ICHN.L", isin: "", c: "Cina" },
    { n: "MSCI Taiwan", s: "ITWN.L", isin: "", c: "Taiwan" },
    { n: "MSCI Korea", s: "IKOR.L", isin: "", c: "Corea" },
    { n: "MSCI Brazil", s: "IBZL.L", isin: "", c: "Brasile" },
    { n: "MSCI World Health Care", s: "WHEA.L", isin: "", c: "Healthcare globale" },
    { n: "World Energy", s: "WENS.L", isin: "", c: "Energia globale" },
    { n: "Oro fisico ETC", s: "SGLN.L", isin: "", c: "Oro" },
  ];

  function injectStyle() {
    if (document.getElementById("watchlistStyle")) return;
    const style = document.createElement("style");
    style.id = "watchlistStyle";
    style.textContent = `
      .watchlist-tools{display:flex;gap:10px;align-items:end;flex-wrap:wrap;margin:10px 0 14px}.watchlist-tools .field{margin:0;min-width:180px}.watchlist-table-wrap{overflow-x:auto;border:1px solid var(--border);border-radius:16px;background:rgba(0,0,0,.12)}.watchlist-table{width:100%;border-collapse:collapse;min-width:880px}.watchlist-table th,.watchlist-table td{padding:10px 12px;border-bottom:1px solid var(--border);text-align:right;white-space:nowrap}.watchlist-table th:first-child,.watchlist-table td:first-child,.watchlist-table th:nth-child(2),.watchlist-table td:nth-child(2),.watchlist-table th:nth-child(3),.watchlist-table td:nth-child(3){text-align:left}.watchlist-table tr:last-child td{border-bottom:0}.watchlist-symbol{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--accent)}.watchlist-dip{font-weight:800}.watchlist-dip.near{color:var(--muted)}.watchlist-dip.watch{color:var(--warn)}.watchlist-dip.good{color:var(--ok)}.watchlist-dip.deep{color:var(--danger)}.watchlist-status{border:1px solid var(--border);border-radius:999px;padding:4px 8px;font-size:12px}.watchlist-status.near{color:var(--muted)}.watchlist-status.watch{color:var(--warn)}.watchlist-status.good{color:var(--ok)}.watchlist-status.deep{color:var(--danger)}
    `;
    document.head.appendChild(style);
  }

  const eur = value => Number.isFinite(value) ? new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 }).format(value) : "n/d";
  const pct = value => Number.isFinite(value) ? `${new Intl.NumberFormat("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}%` : "n/d";
  const safe = value => String(value ?? "").replace(/[&<>\"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch]));

  function statusFor(drawdown) {
    if (!Number.isFinite(drawdown)) return { cls: "near", label: "n/d" };
    if (drawdown <= -15) return { cls: "deep", label: "Dip forte" };
    if (drawdown <= -10) return { cls: "good", label: "Seconda tranche" };
    if (drawdown <= -5) return { cls: "watch", label: "Prima tranche" };
    return { cls: "near", label: "Vicino ai massimi" };
  }

  function addTabAndPanel() {
    const app = document.getElementById("app");
    const tabs = app?.querySelector(".tabs");
    if (!app || !tabs || document.getElementById("watchlistPanel")) return;
    injectStyle();
    const button = document.createElement("button");
    button.id = "watchlistTab";
    button.type = "button";
    button.textContent = "Watchlist";
    tabs.appendChild(button);

    const panel = document.createElement("div");
    panel.id = "watchlistPanel";
    panel.className = "panel hidden";
    panel.innerHTML = `<h2>Watchlist ETF</h2><p class="small">Valore attuale rispetto al massimo a 52 settimane. Fonte dati: Yahoo Finance tramite funzione Supabase.</p><div id="watchlistBody"><p class="small">Premi Watchlist per caricare i dati.</p></div>`;
    tabs.insertAdjacentElement("afterend", panel);
  }

  function showWatchlist() {
    const grid = document.querySelector("#app > .grid");
    const panel = document.getElementById("watchlistPanel");
    if (!panel) return;
    if (grid) grid.classList.add("hidden");
    panel.classList.remove("hidden");
    document.querySelectorAll(".tabs button").forEach(btn => btn.classList.toggle("active", btn.id === "watchlistTab"));
    loadWatchlist();
  }

  function hideWatchlist() {
    const grid = document.querySelector("#app > .grid");
    const panel = document.getElementById("watchlistPanel");
    if (grid) grid.classList.remove("hidden");
    if (panel) panel.classList.add("hidden");
    const watchButton = document.getElementById("watchlistTab");
    if (watchButton) watchButton.classList.remove("active");
  }

  async function loadWatchlist() {
    const body = document.getElementById("watchlistBody");
    if (!body || !client) return;
    body.innerHTML = `<p class="small">Caricamento dati Yahoo...</p>`;
    const sessionResult = await client.auth.getSession();
    const token = sessionResult?.data?.session?.access_token;
    if (!token) {
      body.innerHTML = `<p class="small">Non risulti collegato a Supabase. Apri prima Life Tracker e fai login.</p>`;
      return;
    }
    const symbols = WATCHLIST.map(item => item.s).join(",");
    try {
      const response = await fetch(`${FUNCTION_URL}?symbols=${encodeURIComponent(symbols)}`, {
        headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_KEY },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const bySymbol = Object.fromEntries((data.quotes || []).map(item => [item.symbol, item]));
      const rows = WATCHLIST.map(item => ({ ...item, quote: bySymbol[item.s] || {} }))
        .sort((a, b) => {
          const av = Number.isFinite(a.quote?.pctOfHigh) ? a.quote.pctOfHigh : 999;
          const bv = Number.isFinite(b.quote?.pctOfHigh) ? b.quote.pctOfHigh : 999;
          return av - bv;
        });
      const okCount = rows.filter(row => row.quote?.ok).length;
      body.innerHTML = `<div class="watchlist-tools">
          <button class="btn primary" id="watchlistReload" type="button">Aggiorna dati</button>
          <span class="chip">ETF: <strong>${WATCHLIST.length}</strong></span>
          <span class="chip">Dati ok: <strong>${okCount}</strong></span>
          <span class="chip">Aggiornato: <strong>${safe(new Date(data.updatedAt || Date.now()).toLocaleString("it-IT"))}</strong></span>
        </div>
        <div class="watchlist-table-wrap"><table class="watchlist-table">
          <thead><tr><th>Asset</th><th>Ticker</th><th>Categoria</th><th>Prezzo</th><th>Max 52w</th><th>% del max</th><th>Drawdown</th><th>Giorno</th><th>Segnale</th></tr></thead>
          <tbody>${rows.map(row => {
            const q = row.quote || {};
            const st = statusFor(q.drawdownFromHigh);
            return `<tr>
              <td><strong>${safe(row.n)}</strong>${row.isin ? `<div class="small">${safe(row.isin)}</div>` : ""}</td>
              <td><span class="watchlist-symbol">${safe(row.s)}</span></td>
              <td>${safe(row.c)}</td>
              <td>${eur(q.price)} ${safe(q.currency || "")}</td>
              <td>${eur(q.high52)} ${safe(q.currency || "")}</td>
              <td class="watchlist-dip ${st.cls}">${pct(q.pctOfHigh)}</td>
              <td class="watchlist-dip ${st.cls}">${pct(q.drawdownFromHigh)}</td>
              <td>${pct(q.dayChangePercent)}</td>
              <td><span class="watchlist-status ${st.cls}">${safe(st.label)}</span></td>
            </tr>`;
          }).join("")}</tbody>
        </table></div>
        ${data.errors?.length ? `<p class="small">Alcuni ticker possono non essere disponibili su Yahoo o richiedere un ticker alternativo.</p>` : ""}`;
    } catch (error) {
      console.error(error);
      body.innerHTML = `<p class="small">Errore nel caricamento dati Yahoo: ${safe(error.message || error)}</p>`;
    }
  }

  document.addEventListener("click", event => {
    if (event.target?.id === "watchlistTab") {
      event.preventDefault();
      showWatchlist();
      return;
    }
    if (event.target?.id === "watchlistReload") {
      event.preventDefault();
      loadWatchlist();
      return;
    }
    if (event.target?.dataset?.day) hideWatchlist();
  }, true);

  const boot = () => {
    addTabAndPanel();
    setTimeout(addTabAndPanel, 1200);
    setTimeout(addTabAndPanel, 2600);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
