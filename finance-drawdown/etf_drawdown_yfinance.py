#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import math
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

import requests
import yfinance as yf

ISIN = "IE00B4L5Y983"
NAME = "iShares Core MSCI World UCITS ETF"
TICKERS = ["IWDA.AS", "SWDA.L"]
OUT = Path("finance-drawdown/results")


@dataclass
class Result:
    isin: str
    name: str
    yahoo_ticker: str
    source: str
    latest_date: str
    latest_close: float
    all_time_high_date: str
    all_time_high: float
    drawdown_from_high_pct: float
    all_time_close_high_date: str
    all_time_close_high: float
    drawdown_from_close_high_pct: float
    rows_used: int
    generated_at_utc: str


def fnum(x):
    try:
        y = float(x)
    except Exception:
        return None
    return y if math.isfinite(y) else None


def dstr(x):
    if hasattr(x, "date"):
        return x.date().isoformat()
    return datetime.fromtimestamp(int(x), timezone.utc).date().isoformat()


def col(df, name):
    # yfinance may return normal columns or MultiIndex columns.
    if name in df.columns:
        s = df[name]
        if hasattr(s, "columns"):
            s = s.iloc[:, 0]
        return s
    for c in df.columns:
        if isinstance(c, tuple) and name in c:
            return df[c]
    raise KeyError(name)


def rows_from_yfinance(ticker):
    last = None
    for fn in ("download", "history"):
        for attempt in range(3):
            try:
                if fn == "download":
                    df = yf.download(ticker, period="max", interval="1d", auto_adjust=False, progress=False, threads=False)
                else:
                    df = yf.Ticker(ticker).history(period="max", interval="1d", auto_adjust=False)
                if df is not None and not df.empty:
                    highs = col(df, "High")
                    closes = col(df, "Close")
                    rows = []
                    for idx, h, c in zip(df.index, highs, closes):
                        h2, c2 = fnum(h), fnum(c)
                        if h2 is not None and c2 is not None:
                            rows.append((idx, h2, c2))
                    if rows:
                        return rows, f"yfinance.{fn}"
            except Exception as e:
                last = repr(e)
            time.sleep(attempt + 1)
    raise RuntimeError(last or "empty yfinance result")


def rows_from_yahoo_chart(ticker):
    headers = {"User-Agent": "Mozilla/5.0"}
    errors = []
    for host in ("query1.finance.yahoo.com", "query2.finance.yahoo.com"):
        url = f"https://{host}/v8/finance/chart/{ticker}"
        params = {"range": "max", "interval": "1d", "events": "history", "includeAdjustedClose": "true"}
        try:
            r = requests.get(url, params=params, headers=headers, timeout=30)
            if r.status_code != 200:
                errors.append(f"{host} HTTP {r.status_code}: {r.text[:200]}")
                continue
            data = r.json()
            chart = data.get("chart", {})
            if chart.get("error"):
                errors.append(f"{host} chart error: {chart['error']}")
                continue
            res = chart["result"][0]
            ts = res["timestamp"]
            q = res["indicators"]["quote"][0]
            rows = []
            for t, h, c in zip(ts, q.get("high", []), q.get("close", [])):
                h2, c2 = fnum(h), fnum(c)
                if h2 is not None and c2 is not None:
                    rows.append((t, h2, c2))
            if rows:
                return rows, f"yahoo_chart.{host}"
        except Exception as e:
            errors.append(f"{host}: {repr(e)}")
    raise RuntimeError("; ".join(errors))


def calc_from_rows(ticker, rows, source):
    latest_i, _, latest_close = rows[-1]
    max_high_i, max_high, _ = max(rows, key=lambda r: r[1])
    max_close_i, _, max_close = max(rows, key=lambda r: r[2])
    return Result(
        isin=ISIN,
        name=NAME,
        yahoo_ticker=ticker,
        source=source,
        latest_date=dstr(latest_i),
        latest_close=round(latest_close, 6),
        all_time_high_date=dstr(max_high_i),
        all_time_high=round(max_high, 6),
        drawdown_from_high_pct=round((latest_close / max_high - 1) * 100, 4),
        all_time_close_high_date=dstr(max_close_i),
        all_time_close_high=round(max_close, 6),
        drawdown_from_close_high_pct=round((latest_close / max_close - 1) * 100, 4),
        rows_used=len(rows),
        generated_at_utc=datetime.now(timezone.utc).isoformat(timespec="seconds"),
    )


def write(result):
    OUT.mkdir(parents=True, exist_ok=True)
    data = asdict(result)
    (OUT / "latest_drawdown.json").write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    with (OUT / "latest_drawdown.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(data))
        w.writeheader(); w.writerow(data)
    (OUT / "latest_drawdown.md").write_text(
        f"# ETF drawdown\n\n"
        f"- ISIN: `{result.isin}`\n"
        f"- Nome: {result.name}\n"
        f"- Ticker Yahoo: `{result.yahoo_ticker}`\n"
        f"- Fonte: `{result.source}`\n"
        f"- Ultimo close: **{result.latest_close}** al **{result.latest_date}**\n"
        f"- Massimo storico intraday: **{result.all_time_high}** al **{result.all_time_high_date}**\n"
        f"- Distanza dal massimo intraday: **{result.drawdown_from_high_pct}%**\n"
        f"- Massimo storico close: **{result.all_time_close_high}** al **{result.all_time_close_high_date}**\n"
        f"- Distanza dal massimo close: **{result.drawdown_from_close_high_pct}%**\n"
        f"- Righe usate: {result.rows_used}\n"
        f"- Generato UTC: {result.generated_at_utc}\n",
        encoding="utf-8",
    )


def main():
    errors = {}
    for ticker in TICKERS:
        for loader in (rows_from_yfinance, rows_from_yahoo_chart):
            try:
                rows, source = loader(ticker)
                result = calc_from_rows(ticker, rows, source)
                write(result)
                print(json.dumps(asdict(result), indent=2, ensure_ascii=False))
                return
            except Exception as e:
                errors[f"{ticker}/{loader.__name__}"] = str(e)
                print(f"FAILED {ticker} {loader.__name__}: {e}")
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "latest_drawdown_error.json").write_text(json.dumps(errors, indent=2, ensure_ascii=False) + "\n")
    raise SystemExit("All sources failed: " + json.dumps(errors, ensure_ascii=False))


if __name__ == "__main__":
    main()
