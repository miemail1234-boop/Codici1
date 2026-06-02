(() => {
  function patchReady() {
    return typeof number === "function" &&
      typeof investmentAssetById === "function" &&
      typeof investmentTradesForAsset === "function" &&
      typeof latestInvestmentSnapshotForAsset === "function" &&
      typeof investmentLedgerForAsset === "function";
  }

  function patchedInvestmentLedgerForAsset(assetId, options = {}) {
    const asset = investmentAssetById(assetId);
    const trades = investmentTradesForAsset(assetId)
      .filter(trade => trade.id !== options.excludeTradeId)
      .filter(trade => !options.dateLimit || trade.date <= options.dateLimit)
      .sort((a, b) => a.date.localeCompare(b.date) || String(a.createdAt).localeCompare(String(b.createdAt)));

    let quantity = 0;
    let costBasis = 0;
    let realizedGain = 0;
    let boughtAmount = 0;
    let soldAmount = 0;
    let boughtQuantity = 0;
    let soldQuantity = 0;

    trades.forEach(trade => {
      const qty = Math.max(0, number(trade.quantity, 0));
      const amount = Math.max(0, qty * number(trade.price, 0));
      if (!qty || !amount) return;
      if (trade.side === "sell") {
        const avgCost = quantity > 0 ? costBasis / quantity : 0;
        const matchedQty = Math.min(qty, quantity);
        const removedCost = avgCost * matchedQty;
        realizedGain += amount - removedCost;
        quantity = Math.max(0, quantity - qty);
        costBasis = Math.max(0, costBasis - removedCost);
        soldAmount += amount;
        soldQuantity += qty;
        return;
      }
      quantity += qty;
      costBasis += amount;
      boughtAmount += amount;
      boughtQuantity += qty;
    });

    const latestSnapshot = latestInvestmentSnapshotForAsset(asset, options.dateLimit || "");
    const assetCurrentPrice = number(asset?.currentPrice, 0);
    const snapshotCurrentPrice = number(latestSnapshot?.currentPrice, 0);
    const snapshotMarketValue = number(latestSnapshot?.currentValue, 0);

    const currentPrice = options.forceMarketPrice && assetCurrentPrice > 0
      ? assetCurrentPrice
      : snapshotCurrentPrice > 0
        ? snapshotCurrentPrice
        : assetCurrentPrice;

    const marketValue = quantity <= 0
      ? 0
      : currentPrice > 0
        ? quantity * currentPrice
        : snapshotMarketValue;

    const unrealizedGain = marketValue - costBasis;
    const totalGain = realizedGain + unrealizedGain;
    const avgCost = quantity > 0 ? costBasis / quantity : 0;
    const returnPct = costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0;
    const hasSell = trades.some(trade => trade.side === "sell");

    return {
      asset,
      trades,
      quantity,
      costBasis,
      avgCost,
      currentPrice,
      marketValue,
      realizedGain,
      unrealizedGain,
      totalGain,
      returnPct,
      boughtAmount,
      soldAmount,
      boughtQuantity,
      soldQuantity,
      hasSell,
      netInvested: boughtAmount - soldAmount,
    };
  }

  function applyPatch() {
    if (!patchReady()) return false;
    investmentLedgerForAsset = patchedInvestmentLedgerForAsset;
    return true;
  }

  if (!applyPatch()) {
    const timer = window.setInterval(() => {
      if (applyPatch()) window.clearInterval(timer);
    }, 50);
    window.setTimeout(() => window.clearInterval(timer), 5000);
  }
})();
