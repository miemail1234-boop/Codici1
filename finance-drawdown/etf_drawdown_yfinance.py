#!/usr/bin/env python3
"""Calculate ETF drawdown from all-time high using yfinance/Yahoo Finance.

Default target:
- ISIN: IE00B4L5Y983
- ETF: iShares Core MSCI World UCITS ETF
- Yahoo tickers tried in order: IWDA.AS, SWDA.L

Outputs are written to finance-drawdown/results/:
- latest_drawdown.json
- latest_drawdown.csv
- latest_drawdown.md
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import sys
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

import yfinance as yf

DEFAULT_ISIN = "IE00B4L5Y983"
DEFAULT_NAME = "iShares Core MSCI World UCITS ETF"
DEFAULT_TICKERS = ["IWDA.AS", "SWDA.L"]


@dataclass
class DrawdownResult:
    isin: str
    name: str
    yahoo_ticker: str
    latest_date: str
    latest_close: float
    all_time_high_date: str
    all_time_high: float
    drawdown_from_high_pct: float
    all_time_close_high_date: str
    all_time_close_high: float
    drawdown_from_close_high_pct: float
    currency: str | None
    rows_used: int
    generated_at_utc: str


def _to_float(value) -> float | None:
    try:
        v = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(v) or math.isinf(v):
        return None
    return v


def _date_str(index_value) -> str:
    # yfinance returns pandas Timestamps; keep dependency indirect here.
    try:
        return index_value.date().isoformat()
    except AttributeError:
        return str(index_value)[:10]


def _download_history(ticker: str):
    # Use both APIs because Yahoo/yfinance can occasionally behave differently.
    last_error: Exception | None = None

    for attempt in range(1, 4):
        try:
            df = yf.download(
                ticker,
                period="max",
                interval="1d",
                auto_adjust=False,
                progress=False,
                threads=False,
            )
            if df is not None and not df.empty:
                return df
        except Exception as exc:  # noqa: BLE001
            last_error = exc
        time.sleep(attempt)

    for attempt in range(1, 4):
        try:
            df = yf.Ticker(ticker).history(
                period="max",
                interval="1d",
                auto_adjust=False,
            )
            if df is not None and not df.empty:
                return df
        except Exception as exc:  # noqa: BLE001
            last_error = exc
        time.sleep(attempt)

    if last_error:
        raise RuntimeError(f"No data for {ticker}: {last_error}") from last_error
    raise RuntimeError(f"No data for {ticker}")


def _get_column(df, column_name: str):
    # yfinance.download can return a MultiIndex even for one ticker.
    if column_name in df.columns:
        return df[column_name]
    matches = [col for col in df.columns if isinstance(col, tuple) and col[0] == column_name]
    if matches:
        return df[matches[0]]
    raise KeyError(column_name)


def _currency_for(ticker: str) -> str | None:
    try:
        info = yf.Ticker(ticker).fast_info
        return getattr(info, "currency", None) or info.get("currency")
    except Exception:  # noqa: BLE001
        return None


def calculate_drawdown(isin: str, name: str, tickers: Iterable[str]) -> DrawdownResult:
    errors: dict[str, str] = {}

    for ticker in tickers:
        ticker = ticker.strip()
        if not ticker:
            continue

        try:
            df = _download_history(ticker)
            high = _get_column(df, "High")
            close = _get_column(df, "Close")

            rows = []
            for idx, high_value, close_value in zip(df.index, high, close):
                h = _to_float(high_value)
                c = _to_float(close_value)
                if h is not None and c is not None:
                    rows.append((idx, h, c))

            if not rows:
                raise RuntimeError("history downloaded but no valid high/close rows")

            latest_idx, _latest_high, latest_close = rows[-1]
            max_high_idx, all_time_high, _close_at_high = max(rows, key=lambda row: row[1])
            max_close_idx, _high_at_close, all_time_close_high = max(rows, key=lambda row: row[2])

            return DrawdownResult(
                isin=isin,
                name=name,
                yahoo_ticker=ticker,
                latest_date=_date_str(latest_idx),
                latest_close=round(latest_close, 6),
                all_time_high_date=_date_str(max_high_idx),
                all_time_high=round(all_time_high, 6),
                drawdown_from_high_pct=round((latest_close / all_time_high - 1) * 100, 4),
                all_time_close_high_date=_date_str(max_close_idx),
                all_time_close_high=round(all_time_close_high, 6),
                drawdown_from_close_high_pct=round((latest_close / all_time_close_high - 1) * 100, 4),
                currency=_currency_for(ticker),
                rows_used=len(rows),
                generated_at_utc=datetime.now(timezone.utc).isoformat(timespec="seconds"),
            )
        except Exception as exc:  # noqa: BLE001
            errors[ticker] = str(exc)

    raise RuntimeError("All tickers failed: " + json.dumps(errors, ensure_ascii=False, indent=2))


def write_outputs(result: DrawdownResult, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    data = asdict(result)

    (output_dir / "latest_drawdown.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    with (output_dir / "latest_drawdown.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(data.keys()))
        writer.writeheader()
        writer.writerow(data)

    currency = f" {result.currency}" if result.currency else ""
    md = f"""# ETF drawdown

- ISIN: `{result.isin}`
- Nome: {result.name}
- Ticker Yahoo usato: `{result.yahoo_ticker}`
- Ultimo close: **{result.latest_close}{currency}** al **{result.latest_date}**
- Massimo storico intraday: **{result.all_time_high}{currency}** al **{result.all_time_high_date}**
- Distanza dal massimo intraday: **{result.drawdown_from_high_pct}%**
- Massimo storico close: **{result.all_time_close_high}{currency}** al **{result.all_time_close_high_date}**
- Distanza dal massimo close: **{result.drawdown_from_close_high_pct}%**
- Righe storiche usate: {result.rows_used}
- Generato UTC: {result.generated_at_utc}
"""
    (output_dir / "latest_drawdown.md").write_text(md, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--isin", default=DEFAULT_ISIN)
    parser.add_argument("--name", default=DEFAULT_NAME)
    parser.add_argument("--tickers", default=",".join(DEFAULT_TICKERS), help="Comma-separated Yahoo tickers")
    parser.add_argument("--output-dir", default="finance-drawdown/results")
    args = parser.parse_args()

    tickers = [t.strip() for t in args.tickers.split(",") if t.strip()]
    result = calculate_drawdown(args.isin, args.name, tickers)
    write_outputs(result, Path(args.output_dir))
    print(json.dumps(asdict(result), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
