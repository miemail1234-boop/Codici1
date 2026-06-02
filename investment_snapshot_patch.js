(() => {
  const STYLE_ID = "investment-snapshot-price-only-style";

  function parseNumber(value) {
    const parsed = Number(String(value || "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function currentBlockId() {
    return document.getElementById("investmentBlock")?.value || "";
  }

  function latestEntryForBlock(blockId) {
    try {
      if (typeof latestInvestmentEntry === "function") return latestInvestmentEntry(blockId) || null;
    } catch {}
    try {
      const entries = (state?.investments?.entries || [])
        .filter(entry => entry.genericOption === blockId)
        .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")) || Number(a.createdAt || 0) - Number(b.createdAt || 0));
      return entries.at(-1) || null;
    } catch {
      return null;
    }
  }

  function blockQuantity(blockId) {
    try {
      if (typeof investmentLedgerForBlock === "function") {
        const ledger = investmentLedgerForBlock(blockId);
        if (Number.isFinite(ledger?.quantity) && ledger.quantity > 0) return ledger.quantity;
      }
    } catch {}

    try {
      const assetIds = (state?.investments?.assets || [])
        .filter(asset => asset.blockId === blockId)
        .map(asset => asset.id);
      const assetSet = new Set(assetIds);
      let quantity = 0;
      (state?.investments?.trades || []).forEach(trade => {
        if (!assetSet.has(trade.assetId)) return;
        const q = parseNumber(trade.quantity);
        if (trade.side === "sell") quantity -= q;
        else if (trade.side === "buy") quantity += q;
      });
      if (quantity > 0) return quantity;
    } catch {}

    const previous = latestEntryForBlock(blockId);
    const invested = parseNumber(previous?.numberValue);
    const purchasePrice = parseNumber(previous?.purchasePrice);
    if (invested > 0 && purchasePrice > 0) return invested / purchasePrice;
    return 0;
  }

  function computedCurrentValue() {
    const blockId = currentBlockId();
    const price = parseNumber(document.getElementById("investmentCurrentPrice")?.value);
    if (!blockId || price <= 0) return 0;
    const quantity = blockQuantity(blockId);
    return quantity > 0 ? quantity * price : 0;
  }

  function fillCurrentValue() {
    const input = document.getElementById("investmentCurrentValue");
    if (!input) return;
    const computed = computedCurrentValue();
    if (computed > 0) input.value = String(Number(computed.toFixed(6)));
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .investment-current-value-hidden { display: none !important; }
    `;
    document.head.appendChild(style);
  }

  function applySnapshotPriceOnly() {
    injectStyle();
    const currentValueInput = document.getElementById("investmentCurrentValue");
    if (!currentValueInput) return;
    const field = currentValueInput.closest(".field") || currentValueInput.parentElement;
    if (field) field.classList.add("investment-current-value-hidden");
    fillCurrentValue();
  }

  document.addEventListener("input", event => {
    if (event.target?.id === "investmentCurrentPrice" || event.target?.id === "investmentBlock") fillCurrentValue();
  }, true);

  document.addEventListener("change", event => {
    if (event.target?.id === "investmentCurrentPrice" || event.target?.id === "investmentBlock") fillCurrentValue();
  }, true);

  document.addEventListener("click", event => {
    if (event.target?.id === "saveInvestmentEntry") fillCurrentValue();
  }, true);

  let scheduled = false;
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applySnapshotPriceOnly();
    });
  }

  document.addEventListener("DOMContentLoaded", scheduleApply);
  window.addEventListener("load", scheduleApply);
  document.addEventListener("click", scheduleApply, true);
  if (document.body) {
    new MutationObserver(scheduleApply).observe(document.body, { childList: true, subtree: true });
  }
  scheduleApply();
})();
