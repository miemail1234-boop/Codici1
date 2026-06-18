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

OUT = Path("finance-drawdown/results")

ASSETS = [
    {"n": 1, "asset": "MSCI World", "tickers": ["IWDA.AS", "SWDA.L"], "isin": "IE00B4L5Y983"},
    {"n": 2, "asset": "FTSE All-World", "tickers": ["VWCE.DE"], "isin": "IE00BK5BQT80"},
    {"n": 3, "asset": "MSCI ACWI", "tickers": ["SSAC.L"], "isin": "IE00B6R52259"},
    {"n": 4, "asset": "MSCI ACWI IMI", "tickers": ["SPYI.DE"], "isin": "IE00B3YLTY66"},
    {"n": 5, "asset": "MSCI World Equal Weighted", "tickers": ["XDEW.DE"], "isin": "IE00BLNMYC90"},
    {"n": 6, "asset": "MSCI World Minimum Volatility", "tickers": ["MVOL.L"], "isin": "IE00B8FHGS14"},
    {"n": 7, "asset": "MSCI World Quality", "tickers": ["IWQU.L"], "isin": "IE00BP3QZ601"},
    {"n": 8, "asset": "MSCI World Momentum", "tickers": ["IWMO.L"], "isin": "IE00BP3QZ825"},
    {"n": 9, "asset": "MSCI World Value", "tickers": ["IWVL.L"], "isin": "IE00BP3QZB59"},
    {"n": 10, "asset": "MSCI World Small Cap", "tickers": ["WSML.L"], "isin": "IE00BF4RFH31"},
    {"n": 11, "asset": "S&P 500", "tickers": ["CSPX.L", "VUAA.DE"], "isin": "IE00B5BMR087"},
    {"n": 12, "asset": "S&P 500 Equal Weight", "tickers": ["SPES.L"], "isin": "da verificare"},
    {"n": 13, "asset": "S&P 500 Quality", "tickers": ["IQUF.L"], "isin": "da verificare"},
    {"n": 14, "asset": "MSCI USA Value", "tickers": ["IUVL.L"], "isin": "da verificare"},
    {"n": 15, "asset": "MSCI USA Minimum Volatility", "tickers": ["IUMV.L"], "isin": "da verificare"},
    {"n": 16, "asset": "S&P MidCap 400", "tickers": ["SPY4.DE"], "isin": "da verificare"},
    {"n": 17, "asset": "S&P SmallCap 600", "tickers": ["ISP6.DE"], "isin": "da verificare"},
    {"n": 18, "asset": "Russell 2000", "tickers": ["IUS3.DE", "RTWO.L"], "isin": "da verificare"},
    {"n": 19, "asset": "Nasdaq 100", "tickers": ["CNDX.L", "SXRV.DE"], "isin": "IE00B53SZB19"},
    {"n": 20, "asset": "Nasdaq 100 Equal Weight", "tickers": ["EQAC.DE"], "isin": "da verificare"},
    {"n": 21, "asset": "STOXX Europe 600", "tickers": ["EXSA.DE"], "isin": "DE0002635307"},
    {"n": 22, "asset": "MSCI Europe", "tickers": ["IMEU.L"], "isin": "da verificare"},
    {"n": 23, "asset": "MSCI Europe Value", "tickers": ["IEVL.L"], "isin": "da verificare"},
    {"n": 24, "asset": "STOXX Europe 600 Value", "tickers": ["EXV1.DE"], "isin": "da verificare"},
    {"n": 25, "asset": "STOXX Europe 600 Equal Weight", "tickers": ["XESC.DE"], "isin": "da verificare"},
    {"n": 26, "asset": "Euro STOXX 50", "tickers": ["SX5EEX.DE", "EUEA.DE"], "isin": "da verificare"},
    {"n": 27, "asset": "MSCI EMU", "tickers": ["CEU.PA", "EMEU.MI"], "isin": "da verificare"},
    {"n": 28, "asset": "FTSE 100", "tickers": ["ISF.L"], "isin": "IE0005042456"},
    {"n": 29, "asset": "FTSE 250", "tickers": ["MIDD.L"], "isin": "IE00B00FV128"},
    {"n": 30, "asset": "FTSE All-Share", "tickers": ["VMID.L"], "isin": "da verificare"},
    {"n": 31, "asset": "MSCI UK", "tickers": ["CUKX.L", "IUKD.L"], "isin": "da verificare"},
    {"n": 32, "asset": "CAC 40 / Francia", "tickers": ["C40.PA"], "isin": "FR0013380607"},
    {"n": 33, "asset": "DAX / Germania", "tickers": ["EXS1.DE"], "isin": "DE0005933931"},
    {"n": 34, "asset": "FTSE MIB / Italia", "tickers": ["CSMIB.MI"], "isin": "da verificare"},
    {"n": 35, "asset": "IBEX 35 / Spagna", "tickers": ["EWP"], "isin": "proxy US / da verificare"},
    {"n": 36, "asset": "SMI / Svizzera", "tickers": ["CSSMI.SW"], "isin": "da verificare"},
    {"n": 37, "asset": "Nordic Countries", "tickers": ["XDN0.DE"], "isin": "da verificare"},
    {"n": 38, "asset": "MSCI Japan", "tickers": ["SJPA.L", "IJPA.L"], "isin": "da verificare"},
    {"n": 39, "asset": "TOPIX", "tickers": ["TPXU.L", "XTPX.DE"], "isin": "da verificare"},
    {"n": 40, "asset": "Pacific ex Japan", "tickers": ["CPXJ.L"], "isin": "da verificare"},
    {"n": 41, "asset": "MSCI Emerging Markets", "tickers": ["EIMI.L", "IS3N.DE"], "isin": "IE00BKM4GZ66"},
    {"n": 42, "asset": "Emerging Markets ex China", "tickers": ["EMXC.L"], "isin": "da verificare"},
    {"n": 43, "asset": "MSCI India", "tickers": ["NDIA.L", "FLXI.MI"], "isin": "da verificare"},
    {"n": 44, "asset": "MSCI China", "tickers": ["ICHN.L"], "isin": "da verificare"},
    {"n": 45, "asset": "MSCI Taiwan", "tickers": ["ITWN.L"], "isin": "da verificare"},
    {"n": 46, "asset": "MSCI Korea", "tickers": ["IKOR.L"], "isin": "da verificare"},
    {"n": 47, "asset": "Rio Tinto", "tickers": ["RIO.PA"], "isin": "da verificare"},
    {"n": 48, "asset": "MSCI World Health Care", "tickers": ["WHEA.L", "XDWH.DE"], "isin": "da verificare"},
    {"n": 49, "asset": "World Energy / Oil & Gas", "tickers": ["WENS.L", "EXH1.DE"], "isin": "da verificare"},
    {"n": 50, "asset": "Oro fisico ETC", "tickers": ["SGLN.L", "4GLD.DE"], "isin": "da verificare"},
]


@dataclass
class Result:
    n: int
    asset: str
    isin: str
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
    rows_used: int
    error: str | None
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
    max_high_i, max_high, _ = max(rows, key=lambda r: r[1])
    max_close_i, _, max_close = max(rows, key=lambda r: r[2])
    return Result(
        n=asset["n"],
        asset=asset["asset"],
        isin=asset["isin"],
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
        rows_used=len(rows),
        error=None,
        generated_at_utc=datetime.now(timezone.utc).isoformat(timespec="seconds"),
    )


def fail(asset, errors):
    return Result(
        n=asset["n"], asset=asset["asset"], isin=asset["isin"],
        tickers_tried=", ".join(asset["tickers"]), yahoo_ticker="", status="failed", source="",
        latest_date=None, latest_close=None, all_time_high_date=None, all_time_high=None,
        drawdown_from_high_pct=None, all_time_close_high_date=None, all_time_close_high=None,
        drawdown_from_close_high_pct=None, rows_used=0,
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
    # keep latest_* names for backward compatibility; now they contain all rows
    (OUT / "latest_drawdown.json").write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    fields = list(data[0].keys())
    for filename in ("all_drawdowns.csv", "latest_drawdown.csv"):
        with (OUT / filename).open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=fields)
            w.writeheader(); w.writerows(data)
    ok = [r for r in results if r.status == "ok"]
    failed = [r for r in results if r.status != "ok"]
    lines = [
        "# ETF drawdowns", "",
        f"Generato UTC: {datetime.now(timezone.utc).isoformat(timespec='seconds')}", "",
        f"Asset riusciti: {len(ok)} / {len(results)}", "",
        "| # | Asset | Ticker | Ultimo close | Data | Max intraday | Data max | Drawdown high | Max close | Drawdown close |",
        "|---:|---|---|---:|---|---:|---|---:|---:|---:|",
    ]
    for r in sorted(ok, key=lambda x: (x.drawdown_from_high_pct if x.drawdown_from_high_pct is not None else 999)):
        lines.append(
            f"| {r.n} | {r.asset} | `{r.yahoo_ticker}` | {r.latest_close} | {r.latest_date} | "
            f"{r.all_time_high} | {r.all_time_high_date} | {r.drawdown_from_high_pct}% | "
            f"{r.all_time_close_high} | {r.drawdown_from_close_high_pct}% |"
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
    for asset in ASSETS:
        print(f"Processing {asset['n']}/50: {asset['asset']} ({', '.join(asset['tickers'])})")
        results.append(process(asset))
    write(results)
    print(json.dumps([asdict(r) for r in results], indent=2, ensure_ascii=False))
    if any(r.status == "failed" for r in results):
        print("WARNING: some assets failed; see CSV/JSON for details")


if __name__ == "__main__":
    main()
