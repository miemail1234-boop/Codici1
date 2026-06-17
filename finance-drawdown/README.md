# ETF drawdown via yfinance

This folder calculates the current price of an ETF versus its historical maximum using `yfinance` and Yahoo Finance data.

Default ETF:

- ISIN: `IE00B4L5Y983`
- ETF: iShares Core MSCI World UCITS ETF
- Yahoo tickers tried in order: `IWDA.AS`, then `SWDA.L`

The GitHub Action writes results to:

- `finance-drawdown/results/latest_drawdown.json`
- `finance-drawdown/results/latest_drawdown.csv`
- `finance-drawdown/results/latest_drawdown.md`

It can be run manually from the Actions tab, runs on pushes touching this folder, and is scheduled on weekdays.
