(() => {
  if (window.__INVESTMENTS_FULL_PRICE_UPDATES__) return;
  window.__INVESTMENTS_FULL_PRICE_UPDATES__ = true;

  const SUPABASE_URL = "https://kujyowhezihjambhpahe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3";
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const $ = id => document.getElementById(id);
  const n = value => {
    const parsed = Number(String(value ?? 0).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const eur = value => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n(value));
  const fmt4 = value => new Intl.NumberFormat("it-IT", { maximumFractionDigits: 4 }).format(n(value));
  const safe = value => String(value ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));

  async function renderAllPriceUpdates() {
    const holder = $("entryLog");
    if (!holder) return;
    const panel = holder.closest(".panel");
    const title = panel?.querySelector("h2");
    if (title) title.textContent = "Aggiornamenti prezzo";

    const auth = await client.auth.getSession();
    const session = auth.data.session;
    if (!session) return;

    const result = await client
      .from("investment_entries")
      .select("*")
      .eq("user_id", session.user.id)
      .gt("current_value", 0)
      .order("date", { ascending: false })
      .order("created_at_ms", { ascending: false });

    if (result.error) {
      console.error(result.error);
      return;
    }

    const rows = result.data || [];
    holder.innerHTML = rows.length ? rows.map(row => {
      const name = row.characteristic || "Aggiornamento prezzo";
      const quantity = n(row.number_value);
      const price = n(row.current_price);
      return `<div class="log-item"><strong>${safe(row.date)} · ${safe(name)}</strong><div class="small">valore ${eur(row.current_value)}${price ? ` · prezzo ${eur(price)}` : ""}${quantity ? ` · quantità ${fmt4(quantity)}` : ""}</div>${row.text_value ? `<p class="small">${safe(row.text_value)}</p>` : ""}</div>`;
    }).join("") : `<p class="small">Nessun aggiornamento prezzo.</p>`;
  }

  document.addEventListener("click", event => {
    if (event.target.closest?.("#reloadBtn,[data-metric-preset]")) setTimeout(renderAllPriceUpdates, 1400);
  }, true);

  setTimeout(renderAllPriceUpdates, 1800);
  setTimeout(renderAllPriceUpdates, 3200);
})();