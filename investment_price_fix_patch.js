(() => {
  function patchReady() {
    return typeof number === "function" &&
      typeof investmentAssetById === "function" &&
      typeof investmentTradesForAsset === "function" &&
      typeof latestInvestmentSnapshotForAsset === "function" &&
      typeof investmentLedgerForAsset === "function" &&
      typeof investmentLedgerTotals === "function";
  }

  function tradeAmount(trade) {
    const qty = Math.max(0, number(trade?.quantity, 0));
    const price = Math.max(0, number(trade?.price, 0));
    return Math.max(0, number(trade?.amount, qty * price));
  }

  function lastTradePrice(trades) {
    for (let index = trades.length - 1; index >= 0; index -= 1) {
      const price = number(trades[index]?.price, 0);
      if (price > 0) return price;
    }
    return 0;
  }

  function patchedInvestmentLedgerForAsset(assetId, options = {}) {
    const asset = investmentAssetById(assetId);
    const dateLimit = options.dateLimit || "";
    const trades = investmentTradesForAsset(assetId)
      .filter(trade => trade.id !== options.excludeTradeId)
      .filter(trade => !dateLimit || trade.date <= dateLimit)
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

    const latestSnapshot = latestInvestmentSnapshotForAsset(asset, dateLimit);
    const assetCurrentPrice = number(asset?.currentPrice, 0);
    const assetPriceDate = asset?.currentPriceDate || "";
    const snapshotCurrentPrice = number(latestSnapshot?.currentPrice, 0);
    const tradePrice = lastTradePrice(trades);
    const snapshotMarketValue = number(latestSnapshot?.currentValue, 0);

    const currentPrice = !dateLimit && options.forceMarketPrice && assetCurrentPrice > 0
      ? assetCurrentPrice
      : snapshotCurrentPrice > 0
        ? snapshotCurrentPrice
        : dateLimit
          ? tradePrice || (assetPriceDate && assetPriceDate <= dateLimit ? assetCurrentPrice : 0)
          : assetCurrentPrice || tradePrice;

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

  function investmentTradeFlowBetween(fromDate, toDate) {
    try {
      return (typeof investmentTrades === "function" ? investmentTrades() : [])
        .filter(trade => trade.date > fromDate && trade.date <= toDate)
        .reduce((sum, trade) => {
          const amount = tradeAmount(trade);
          return sum + (trade.side === "sell" ? -amount : amount);
        }, 0);
    } catch {
      return 0;
    }
  }

  function investmentExternalFlowBetween(fromDate, toDate) {
    try {
      return (typeof investmentCashFlows === "function" ? investmentCashFlows() : [])
        .filter(flow => flow.date > fromDate && flow.date <= toDate)
        .reduce((sum, flow) => {
          const amount = Math.max(0, number(flow.amount, 0));
          return sum + (flow.type === "withdraw_external" ? -amount : amount);
        }, 0);
    } catch {
      return 0;
    }
  }

  function patchedInvestmentEstimatedTwr(dateLimit = "") {
    const totals = investmentLedgerTotals(dateLimit, { skipDerived: true });
    const fallbackReturn = totals.netContributedCapital > 0 ? (totals.totalGain / totals.netContributedCapital) * 100 : 0;

    let dates = [];
    try {
      dates = investmentChartDates().filter(date => !dateLimit || date <= dateLimit).sort();
    } catch {
      return fallbackReturn;
    }
    if (dates.length < 2) return fallbackReturn;

    const hasExplicitExternalFlows = (typeof investmentCashFlows === "function" ? investmentCashFlows() : []).length > 0;
    let cumulative = 1;
    let previousDate = dates[0];
    let previousValue = investmentLedgerTotals(previousDate, { skipDerived: true }).marketValue;

    for (let index = 1; index < dates.length; index += 1) {
      const date = dates[index];
      const currentValue = investmentLedgerTotals(date, { skipDerived: true }).marketValue;
      const externalFlow = investmentExternalFlowBetween(previousDate, date);
      const tradeFlowProxy = hasExplicitExternalFlows ? 0 : investmentTradeFlowBetween(previousDate, date);
      const flow = externalFlow + tradeFlowProxy;

      if (previousValue > 0) {
        const periodReturn = (currentValue - flow - previousValue) / previousValue;
        if (Number.isFinite(periodReturn) && periodReturn > -0.95 && periodReturn < 2) {
          cumulative *= 1 + periodReturn;
        }
      }
      previousDate = date;
      previousValue = Math.max(0, currentValue);
    }

    const twr = (cumulative - 1) * 100;
    if (!Number.isFinite(twr) || Math.abs(twr) > 80) return fallbackReturn;
    return twr;
  }

  function applyPatch() {
    if (!patchReady()) return false;
    investmentLedgerForAsset = patchedInvestmentLedgerForAsset;
    investmentEstimatedTwr = patchedInvestmentEstimatedTwr;
    if (typeof renderInvestments === "function") renderInvestments();
    if (typeof renderCharts === "function") renderCharts();
    return true;
  }

  if (!applyPatch()) {
    const timer = window.setInterval(() => {
      if (applyPatch()) window.clearInterval(timer);
    }, 50);
    window.setTimeout(() => window.clearInterval(timer), 5000);
  }
})();
