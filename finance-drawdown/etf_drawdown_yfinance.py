#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import math
import os
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests
import yfinance as yf

OUT = Path("finance-drawdown/results")

DEFAULT_ASSETS = [
    {"n": 1, "asset": "FTSE All-World / MSCI ACWI", "tickers": ["VWCE.DE"], "isin": "da verificare", "role": "leader", "category": "Globale core", "note": "Mercato globale"},
    {"n": 2, "asset": "S&P 500", "tickers": ["VUAA.DE"], "isin": "da verificare", "role": "leader", "category": "USA core", "note": "Large cap USA"},
    {"n": 3, "asset": "Nasdaq 100", "tickers": ["SXRV.DE"], "isin": "da verificare", "role": "leader", "category": "USA growth", "note": "Growth/tech"},
    {"n": 4, "asset": "Russell 2000", "tickers": ["IUS3.DE"], "isin": "da verificare", "role": "leader", "category": "USA small cap", "note": "Small cap USA"},
    {"n": 5, "asset": "MSCI World Value", "tickers": ["IWVL.L"], "isin": "da verificare", "role": "leader", "category": "World factor", "note": "Value globale"},
    {"n": 6, "asset": "MSCI World Quality", "tickers": ["IWQU.L"], "isin": "da verificare", "role": "leader", "category": "World factor", "note": "Quality globale"},
    {"n": 7, "asset": "MSCI World Minimum Volatility", "tickers": ["MVOL.L"], "isin": "da verificare", "role": "leader", "category": "World factor", "note": "Difensivo globale"},
    {"n": 8, "asset": "STOXX Europe 600", "tickers": ["EXSA.DE"], "isin": "da verificare", "role": "leader", "category": "Europa core", "note": "Europa ampia"},
    {"n": 9, "asset": "STOXX Europe 600 Value", "tickers": ["EXV1.DE"], "isin": "da verificare", "role": "leader", "category": "Europa value", "note": "Value europeo"},
    {"n": 10, "asset": "FTSE 100", "tickers": ["ISF.L"], "isin": "da verificare", "role": "leader", "category": "UK", "note": "UK large cap"},
    {"n": 11, "asset": "FTSE 250", "tickers": ["MIDD.L"], "isin": "da verificare", "role": "leader", "category": "UK", "note": "UK mid cap"},
    {"n": 12, "asset": "DAX", "tickers": ["EXS1.DE"], "isin": "da verificare", "role": "leader", "category": "Europa paese", "note": "Germania"},
    {"n": 13, "asset": "FTSE MIB", "tickers": ["CSMIB.MI"], "isin": "da verificare", "role": "leader", "category": "Europa paese", "note": "Italia"},
    {"n": 14, "asset": "SMI", "tickers": ["CSSMI.SW"], "isin": "da verificare", "role": "leader", "category": "Europa difensivo", "note": "Svizzera"},
    {"n": 15, "asset": "TOPIX / MSCI Japan", "tickers": ["XTPX.DE"], "isin": "da verificare", "role": "leader", "category": "Giappone", "note": "Giappone ampio"},
    {"n": 16, "asset": "MSCI Emerging Markets", "tickers": ["EIMI.L"], "isin": "da verificare", "role": "leader", "category": "Emergenti", "note": "EM globale"},
    {"n": 17, "asset": "Emerging Markets ex China", "tickers": ["EMXC.L"], "isin": "da verificare", "role": "leader", "category": "Emergenti", "note": "EM senza Cina"},
    {"n": 18, "asset": "MSCI India", "tickers": ["NDIA.L"], "isin": "da verificare", "role": "leader", "category": "Emergenti paese", "note": "India"},
    {"n": 19, "asset": "MSCI China", "tickers": ["ICHN.L"], "isin": "da verificare", "role": "leader", "category": "Emergenti paese", "note": "Cina"},
    {"n": 20, "asset": "MSCI Taiwan", "tickers": ["ITWN.L"], "isin": "da verificare", "role": "leader", "category": "Asia tech", "note": "Semiconduttori Asia"},
    {"n": 21, "asset": "MSCI Korea", "tickers": ["IKOR.L"], "isin": "da verificare", "role": "leader", "category": "Asia tech", "note": "Corea"},
    {"n": 22, "asset": "World Health Care", "tickers": ["WHEA.L"], "isin": "da verificare", "role": "leader", "category": "Settore difensivo", "note": "Healthcare globale"},
    {"n": 23, "asset": "World Energy", "tickers": ["WENS.L"], "isin": "da verificare", "role": "leader", "category": "Settore ciclico", "note": "Energia"},
    {"n": 24, "asset": "Rio Tinto / Materials", "tickers": ["RIO.PA"], "isin": "da verificare", "role": "leader", "category": "Materials", "note": "Mining/materiali"},
    {"n": 25, "asset": "Oro", "tickers": ["SGLN.L"], "isin": "da verificare", "role": "leader", "category": "Real asset", "note": "Gold ETC"},
    {"n": 26, "asset": "Bitcoin", "tickers": ["BTC-EUR"], "isin": "da verificare", "role": "leader", "category": "Crypto", "note": "Proxy Bitcoin"},
    {"n": 27, "asset": "Ethereum", "tickers": ["ETH-EUR"], "isin": "da verificare", "role": "leader", "category": "Crypto", "note": "Proxy Ethereum"},
]


def clean_assets(raw_assets):
    assets = []
    for idx, item in enumerate(raw_assets or [], start=1):
        ticker = str((item.get("tickers") or [item.get("yahoo_ticker") or item.get("ticker") or ""])[0]).strip().upper()
        asset = str(item.get("asset") or f"Asset {idx}").strip()
        if not ticker or not asset:
            continue
        assets.append({
            "n": int(item.get("n") or idx),
            "asset": asset,
            "tickers": [ticker],
            "isin": str(item.get("isin") or "da verificare").strip() or "da verificare",
            "role": str(item.get("role") or "leader").strip() or "leader",
            "category": str(item.get("category") or "").strip(),
            "note": str(item.get("note") or "").strip(),
        })
    return sorted(assets, key=lambda x: x["n"])


def load_assets():
    override = os.environ.get("ASSETS_JSON", "").strip()
    if override:
        try:
            assets = clean_assets(json.loads(override))
            if assets:
                print(f"Using {len(assets)} assets from ASSETS_JSON")
                return assets
        except Exception as e:
            print(f"Invalid ASSETS_JSON, falling back to defaults: {e}")
    return DEFAULT_ASSETS


ASSETS = load_assets()


@dataclass
class Result:
    n: int
    asset: str
    isin: str
    role: str
    category: str
    note: str
    tickers_tried: str
    yahoo_ticker: str
    status: str
    source: str
    latest_date: str | None
    latest_close: float | None
    all_time_high_date: str | None
    all_time_high: float | None
    drawdown_from_high_pct: float | None
    all_time_close_high_date: str | None
    all_time_close_high: float | None
    drawdown_from_close_high_pct: float | None
    week_52_high_date: str | None
    week_52_high: float | None
    drawdown_from_52w_high_pct: float | None
    rows_used: int
    error: str | None
    generated_at_utc: str


def fnum(x):
    try:
        y = float(x)
    except Exception:
        return None
    return y if math.isfinite(y) else None


def to_dt(x):
    if hasattr(x, "to_pydatetime"):
        x = x.to_pydatetime()
    if isinstance(x, datetime):
        return x if x.tzinfo else x.replace(tzinfo=timezone.utc)
    if hasattr(x, "date"):
        return datetime.combine(x.date(), datetime.min.time(), tzinfo=timezone.utc)
    return datetime.fromtimestamp(int(x), timezone.utc)


def dstr(x):
    return to_dt(x).date().isoformat()


def col(df, name):
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
        for attempt in range(2):
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
            time.sleep(1 + attempt)
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
                errors.append(f"{host} HTTP {r.status_code}: {r.text[:180]}")
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


def calc(asset, ticker, rows, source):
    latest_i, _, latest_close = rows[-1]
    latest_dt = to_dt(latest_i)
    max_high_i, max_high, _ = max(rows, key=lambda r: r[1])
    max_close_i, _, max_close = max(rows, key=lambda r: r[2])
    cutoff = latest_dt - timedelta(days=365)
    rows_52w = [r for r in rows if to_dt(r[0]) >= cutoff] or rows
    max_52w_i, max_52w, _ = max(rows_52w, key=lambda r: r[1])
    return Result(
        n=asset["n"],
        asset=asset["asset"],
        isin=asset.get("isin", "da verificare"),
        role=asset.get("role", "leader"),
        category=asset.get("category", ""),
        note=asset.get("note", ""),
        tickers_tried=", ".join(asset["tickers"]),
        yahoo_ticker=ticker,
        status="ok",
        source=source,
        latest_date=dstr(latest_i),
        latest_close=round(latest_close, 6),
        all_time_high_date=dstr(max_high_i),
        all_time_high=round(max_high, 6),
        drawdown_from_high_pct=round((latest_close / max_high - 1) * 100, 4),
        all_time_close_high_date=dstr(max_close_i),
        all_time_close_high=round(max_close, 6),
        drawdown_from_close_high_pct=round((latest_close / max_close - 1) * 100, 4),
        week_52_high_date=dstr(max_52w_i),
        week_52_high=round(max_52w, 6),
        drawdown_from_52w_high_pct=round((latest_close / max_52w - 1) * 100, 4),
        rows_used=len(rows),
        error=None,
        generated_at_utc=datetime.now(timezone.utc).isoformat(timespec="seconds"),
    )


def fail(asset, errors):
    return Result(
        n=asset["n"], asset=asset["asset"], isin=asset.get("isin", "da verificare"),
        role=asset.get("role", "leader"), category=asset.get("category", ""), note=asset.get("note", ""),
        tickers_tried=", ".join(asset["tickers"]), yahoo_ticker="", status="failed", source="",
        latest_date=None, latest_close=None, all_time_high_date=None, all_time_high=None,
        drawdown_from_high_pct=None, all_time_close_high_date=None, all_time_close_high=None,
        drawdown_from_close_high_pct=None, week_52_high_date=None, week_52_high=None,
        drawdown_from_52w_high_pct=None, rows_used=0,
        error=json.dumps(errors, ensure_ascii=False)[:2000],
        generated_at_utc=datetime.now(timezone.utc).isoformat(timespec="seconds"),
    )


def process(asset):
    errors = {}
    for ticker in asset["tickers"]:
        for loader in (rows_from_yfinance, rows_from_yahoo_chart):
            try:
                rows, source = loader(ticker)
                return calc(asset, ticker, rows, source)
            except Exception as e:
                errors[f"{ticker}/{loader.__name__}"] = str(e)
                print(f"FAILED {asset['n']} {asset['asset']} {ticker} {loader.__name__}: {e}")
    return fail(asset, errors)


def write(results):
    OUT.mkdir(parents=True, exist_ok=True)
    data = [asdict(r) for r in results]
    (OUT / "all_drawdowns.json").write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (OUT / "latest_drawdown.json").write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    fields = list(data[0].keys())
    for filename in ("all_drawdowns.csv", "latest_drawdown.csv"):
        with (OUT / filename).open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=fields)
            w.writeheader(); w.writerows(data)
    ok = [r for r in results if r.status == "ok"]
    failed = [r for r in results if r.status != "ok"]
    lines = [
        "# BTD radar drawdowns", "",
        f"Generato UTC: {datetime.now(timezone.utc).isoformat(timespec='seconds')}", "",
        f"Asset riusciti: {len(ok)} / {len(results)}", "",
        "| # | Asset | Categoria | Ticker | ISIN | Ultimo close | Data | ATH 52w | DD 52w | ATH assoluto | DD assoluto |",
        "|---:|---|---|---|---|---:|---|---:|---:|---:|---:|",
    ]
    for r in sorted(ok, key=lambda x: (x.drawdown_from_52w_high_pct if x.drawdown_from_52w_high_pct is not None else 999)):
        lines.append(
            f"| {r.n} | {r.asset} | {r.category} | `{r.yahoo_ticker}` | {r.isin} | {r.latest_close} | {r.latest_date} | "
            f"{r.week_52_high} | {r.drawdown_from_52w_high_pct}% | {r.all_time_high} | {r.drawdown_from_high_pct}% |"
        )
    if failed:
        lines += ["", "## Falliti", "", "| # | Asset | Ticker provati | Errore |", "|---:|---|---|---|"]
        for r in failed:
            lines.append(f"| {r.n} | {r.asset} | `{r.tickers_tried}` | {str(r.error).replace('|', '/')} |")
    md = "\n".join(lines) + "\n"
    (OUT / "all_drawdowns.md").write_text(md, encoding="utf-8")
    (OUT / "latest_drawdown.md").write_text(md, encoding="utf-8")


def main():
    results = []
    total = len(ASSETS)
    for asset in ASSETS:
        print(f"Processing {asset['n']}/{total}: {asset['asset']} ({', '.join(asset['tickers'])})")
        results.append(process(asset))
    write(results)
    print(json.dumps([asdict(r) for r in results], indent=2, ensure_ascii=False))
    if any(r.status == "failed" for r in results):
        print("WARNING: some assets failed; see CSV/JSON for details")


if __name__ == "__main__":
    main()
