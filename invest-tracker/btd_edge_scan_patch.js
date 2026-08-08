(() => {
  'use strict';
  if (window.__BTD_EDGE_SCAN_PATCH__) return;
  window.__BTD_EDGE_SCAN_PATCH__ = true;

  const SUPABASE_URL = 'https://kujyowhezihjambhpahe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
  const FUNCTION_NAME = 'btd-current-scan';
  const client = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);

  const n = value => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; };
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  const fmtNum = (value, digits = 2) => n(value) === null ? '—' : new Intl.NumberFormat('it-IT', { maximumFractionDigits: digits }).format(n(value));
  const fmtPct = value => n(value) === null ? '—' : `${new Intl.NumberFormat('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n(value))}%`;
  const fmtScore = value => n(value) === null ? '—' : `${Math.round(n(value))}`;
  const fmtDate = value => value ? new Date(value).toLocaleDateString('it-IT') : '—';
  const primaryDrawdown = row => n(row.drawdown_from_52w_high_pct) ?? n(row.drawdown_from_high_pct);

  const regimeLabels = {
    early_contraction: 'Early contraction',
    late_contraction: 'Late contraction',
    early_recovery: 'Early recovery',
    expansion: 'Expansion',
    late_expansion: 'Late expansion',
    neutral: 'Neutrale'
  };

  function status(row) {
    if (!row.status) return 'pending';
    if (row.status !== 'ok') return 'failed';
    const ddHigh = n(row.drawdown_from_high_pct);
    const ddClose = n(row.drawdown_from_close_high_pct);
    if (ddHigh !== null && ddHigh < -80 && (n(row.drawdown_from_52w_high_pct) ?? ddHigh) < -30) return 'outlier';
    if (ddHigh !== null && ddClose !== null && Math.abs(ddHigh - ddClose) > 30 && (n(row.drawdown_from_52w_high_pct) ?? 0) < -10) return 'suspicious';
    return 'ok';
  }

  function statusLabel(value) {
    return { ok: 'Ok', failed: 'Fallito', outlier: 'Outlier', suspicious: 'Da verificare', pending: 'Da aggiornare' }[value] || value;
  }

  function ddClass(value, st) {
    if (['failed', 'outlier', 'suspicious'].includes(st)) return 'warn';
    const x = n(value);
    if (x === null) return '';
    if (x <= -20) return 'neg strong';
    if (x <= -10) return 'neg mid';
    if (x >= -1) return 'pos';
    return 'neg';
  }

  function scoreTone(signal) {
    if (signal === 'MOLTO INTERESSANTE') return 'very-strong';
    if (signal === 'INTERESSANTE') return 'interesting';
    if (signal === 'OSSERVA') return 'observe';
    if (signal === 'VALUE TRAP RISK') return 'value-trap';
    if (signal === 'PRUDENZA') return 'prudence';
    return 'neutral';
  }

  function injectStyles() {
    if (document.getElementById('btdScoreStyles')) return;
    const style = document.createElement('style');
    style.id = 'btdScoreStyles';
    style.textContent = `
      #etfDrawdownSection .etf-main{
        grid-template-columns:34px minmax(155px,1.25fr) minmax(88px,.58fr) minmax(72px,.48fr) minmax(78px,.5fr) minmax(78px,.5fr) minmax(74px,.48fr) minmax(105px,.68fr) minmax(118px,.8fr) auto;
      }
      .btd-score{font-size:20px;font-weight:800;font-variant-numeric:tabular-nums}
      .btd-score small,.btd-regime small,.btd-signal small{display:block;font-size:10px;color:var(--muted);font-weight:500;margin-top:2px}
      .btd-signal{font-size:11px;font-weight:800;letter-spacing:.02em}
      .btd-signal.very-strong{color:var(--ok)}
      .btd-signal.interesting{color:#7dd3fc}
      .btd-signal.observe{color:var(--warn)}
      .btd-signal.value-trap,.btd-signal.prudence{color:var(--danger)}
      .btd-signal.neutral{color:var(--muted)}
      .btd-detail{border-top:1px solid var(--border);padding:14px 16px 16px;background:rgba(0,0,0,.14)}
      .btd-detail.hidden{display:none}
      .btd-score-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-bottom:12px}
      .btd-driver{border:1px solid var(--border);border-radius:13px;padding:9px;background:rgba(255,255,255,.025)}
      .btd-driver span{display:block;color:var(--muted);font-size:10px}
      .btd-driver strong{display:block;font-size:18px;margin-top:3px}
      .btd-driver .mini{height:5px;border-radius:999px;background:#07121b;overflow:hidden;margin-top:7px}
      .btd-driver .mini i{display:block;height:100%;background:var(--accent);border-radius:999px}
      .btd-why{margin:10px 0 12px;line-height:1.55}
      .btd-context-warning{border:1px solid rgba(250,204,21,.35);background:rgba(250,204,21,.06);border-radius:12px;padding:9px 11px;margin:10px 0;color:#fde68a}
      .btd-context-editor{border-top:1px solid var(--border);margin-top:12px;padding-top:12px}
      .btd-context-editor h4{margin:0 0 8px}
      .btd-context-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
      .btd-context-grid label{font-size:11px;color:var(--muted)}
      .btd-context-grid input,.btd-context-grid select{margin-top:4px;padding:8px}
      .btd-context-note{margin-top:8px}
      .btd-context-note input{margin-top:4px}
      .btd-market-line{display:flex;gap:10px;flex-wrap:wrap;color:var(--muted);font-size:12px}
      .btd-market-line b{color:var(--text);font-weight:600}
      @media(max-width:1050px){
        #etfDrawdownSection .etf-main{grid-template-columns:34px minmax(0,1fr)}
        #etfDrawdownSection .etf-main>*:not(.etf-num):not(.etf-name){grid-column:2}
        .btd-score-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
        .btd-context-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      }
      @media(max-width:620px){
        .btd-score-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .btd-context-grid{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(style);
  }

  function configureSection() {
    injectStyles();
    const section = document.getElementById('etfDrawdownSection');
    const description = section?.querySelector('.etf-head h2 + .small');
    if (description) {
      description.textContent = 'BTD Score 0–100: drawdown normalizzato per volatilità + ciclo economico + politica monetaria + utili + momentum, con penalità per rischio strutturale.';
    }
    const sort = document.getElementById('etfDrawdownSort');
    if (sort && !sort.querySelector('option[value="btd_desc"]')) {
      const option = document.createElement('option');
      option.value = 'btd_desc';
      option.textContent = 'BTD Score: più alto';
      sort.prepend(option);
      sort.value = 'btd_desc';
    }
  }

  function stopOldPolling() {
    const btn = document.getElementById('etfDrawdownUpdateBtn');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Aggiorna BTD Radar';
    }
    const statusNode = document.getElementById('etfDrawdownUpdateStatus');
    if (statusNode) statusNode.textContent = 'BTD Score v2 attivo: prezzo/volatilità live + contesto macro configurabile.';
  }

  function median(values) {
    const clean = values.filter(value => n(value) !== null).map(Number).sort((a, b) => a - b);
    if (!clean.length) return null;
    const middle = Math.floor(clean.length / 2);
    return clean.length % 2 ? clean[middle] : (clean[middle - 1] + clean[middle]) / 2;
  }

  function renderSummary(rows, generatedAt) {
    const summary = document.getElementById('etfDrawdownSummary');
    const meta = document.getElementById('etfDrawdownMeta');
    if (!summary) return;

    const normalized = rows.map(row => ({ ...row, _computedStatus: status(row) }));
    const okRows = normalized.filter(row => row._computedStatus === 'ok' && n(row.btd_score) !== null);
    const interesting = okRows.filter(row => n(row.btd_score) >= 70).length;
    const observe = okRows.filter(row => n(row.btd_score) >= 60 && n(row.btd_score) < 70).length;
    const unconfigured = okRows.filter(row => row.macro_context_configured !== true).length;
    const failed = normalized.filter(row => row._computedStatus !== 'ok').length;
    const scoreMedian = median(okRows.map(row => row.btd_score));
    const ddMedian = median(okRows.map(primaryDrawdown));

    summary.innerHTML =
      `<div class="etf-card"><span>Totale</span><strong>${normalized.length}</strong><small>${failed} con dati da verificare</small></div>` +
      `<div class="etf-card"><span>BTD ≥ 70</span><strong>${interesting}</strong><small>interessante / molto interessante</small></div>` +
      `<div class="etf-card"><span>Osserva</span><strong>${observe}</strong><small>BTD 60–69</small></div>` +
      `<div class="etf-card"><span>Mediana BTD</span><strong>${fmtScore(scoreMedian)}</strong><small>score 0–100</small></div>` +
      `<div class="etf-card"><span>Mediana drawdown</span><strong>${fmtPct(ddMedian)}</strong><small>da ATH 52 settimane</small></div>` +
      `<div class="etf-card"><span>Macro neutro</span><strong>${unconfigured}</strong><small>contesti ancora da configurare</small></div>`;

    if (meta) {
      meta.textContent = `Fonte mercato: Yahoo Chart via Supabase Edge Function. BTD Score v2 aggiornato ${generatedAt ? new Date(generatedAt).toLocaleString('it-IT') : '—'}. I fattori macro non configurati restano neutrali a 50/100.`;
    }
  }

  function currentRows(rows) {
    const q = document.getElementById('etfDrawdownSearch')?.value?.trim().toLowerCase() || '';
    const filter = document.getElementById('etfDrawdownStatus')?.value || 'all';
    const sort = document.getElementById('etfDrawdownSort')?.value || 'btd_desc';

    let out = rows.map(row => ({ ...row, _computedStatus: status(row) })).filter(row => {
      if (filter !== 'all' && row._computedStatus !== filter) return false;
      if (!q) return true;
      return [row.asset, row.isin, row.yahoo_ticker, row.tickers_tried, row.source, row.category, row.note, row.regime, row.btd_signal]
        .some(value => String(value ?? '').toLowerCase().includes(q));
    });

    out = out.slice().sort((a, b) => {
      if (sort === 'name') return String(a.asset).localeCompare(String(b.asset), 'it');
      if (sort === 'number') return a.n - b.n;
      if (sort === 'drawdown_desc') return (primaryDrawdown(b) ?? -9999) - (primaryDrawdown(a) ?? -9999);
      if (sort === 'drawdown_asc') return (primaryDrawdown(a) ?? 9999) - (primaryDrawdown(b) ?? 9999);
      return (n(b.btd_score) ?? -1) - (n(a.btd_score) ?? -1);
    });
    return out;
  }

  function driverCard(label, value, suffix = '') {
    const score = Math.max(0, Math.min(100, n(value) ?? 0));
    return `<div class="btd-driver"><span>${esc(label)}</span><strong>${fmtScore(value)}${suffix}</strong><div class="mini"><i style="width:${score}%"></i></div></div>`;
  }

  function whyText(row) {
    const parts = [];
    const ddScore = n(row.drawdown_score);
    const ratio = n(row.drawdown_vol_ratio);
    const cycle = n(row.economic_cycle_score);
    const monetary = n(row.monetary_score);
    const earnings = n(row.earnings_score);
    const momentum = n(row.momentum_score);
    const risk = n(row.structural_risk_score);

    if (ddScore !== null) {
      if (ddScore >= 75) parts.push(`Il ribasso è molto ampio rispetto alla volatilità storica (rapporto DD/vol ${fmtNum(ratio, 2)}).`);
      else if (ddScore >= 55) parts.push(`Il drawdown è significativo rispetto alla volatilità dell'asset (rapporto DD/vol ${fmtNum(ratio, 2)}).`);
      else parts.push(`Il drawdown, una volta corretto per la volatilità, non è ancora eccezionale (rapporto DD/vol ${fmtNum(ratio, 2)}).`);
    }
    if (cycle !== null) {
      if (cycle >= 65) parts.push('Il ciclo economico è impostato come favorevole o in miglioramento.');
      else if (cycle <= 40) parts.push('Il ciclo economico resta fragile e riduce la qualità del dip.');
    }
    if (monetary !== null) {
      if (monetary >= 65) parts.push('La componente monetaria sostiene il segnale.');
      else if (monetary <= 40) parts.push('La politica monetaria è ancora un vento contrario.');
    }
    if (earnings !== null) {
      if (earnings >= 65) parts.push('Gli utili/revisioni sono impostati come costruttivi.');
      else if (earnings <= 40) parts.push('Gli utili/revisioni restano un punto debole.');
    }
    if (momentum !== null) {
      if (momentum >= 65) parts.push('Il prezzo mostra segnali di stabilizzazione o inversione.');
      else if (momentum <= 40) parts.push('Il momentum non conferma ancora un’inversione.');
    }
    if (risk !== null && risk >= 70) parts.push('Il rischio strutturale è elevato: possibile value trap.');
    if (row.macro_context_configured !== true) parts.push('I driver macro sono ancora neutrali a 50/100: il punteggio è provvisorio finché non vengono configurati.');
    return parts.join(' ');
  }

  function contextEditor(row) {
    return `
      <div class="btd-context-editor" data-context-editor="${row.n}">
        <h4>Contesto macro</h4>
        <p class="small">0 = molto sfavorevole, 100 = molto favorevole. Per il rischio strutturale vale il contrario: 100 = rischio massimo.</p>
        <div class="btd-context-grid">
          <label>Ciclo economico<input type="number" min="0" max="100" step="1" data-field="economic_cycle_score" value="${fmtNum(row.economic_cycle_score, 0)}"></label>
          <label>Politica monetaria<input type="number" min="0" max="100" step="1" data-field="monetary_score" value="${fmtNum(row.monetary_score, 0)}"></label>
          <label>Utili / revisioni<input type="number" min="0" max="100" step="1" data-field="earnings_score" value="${fmtNum(row.earnings_score, 0)}"></label>
          <label>Rischio strutturale<input type="number" min="0" max="100" step="1" data-field="structural_risk_score" value="${fmtNum(row.structural_risk_score, 0)}"></label>
          <label>Regime
            <select data-field="regime">
              ${Object.entries(regimeLabels).map(([value, label]) => `<option value="${value}" ${row.regime === value ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
          </label>
        </div>
        <label class="field btd-context-note"><span class="small">Nota macro / fonti</span><input data-field="context_note" value="${esc(row.context_note || '')}" placeholder="Es. tassi in discesa, PMI in recupero, revisioni EPS stabili…"></label>
        <div class="actions"><button class="btn primary btd-context-save" data-asset-id="${row.n}" type="button">Salva contesto macro</button><span class="small btd-context-status"></span></div>
      </div>`;
  }

  function renderDetail(row) {
    return `
      <div class="btd-detail hidden" id="btdDetail-${row.n}">
        <div class="btd-score-grid">
          ${driverCard('Drawdown normalizzato', row.drawdown_score)}
          ${driverCard('Ciclo economico', row.economic_cycle_score)}
          ${driverCard('Politica monetaria', row.monetary_score)}
          ${driverCard('Utili', row.earnings_score)}
          ${driverCard('Momentum / inversione', row.momentum_score)}
          ${driverCard('Rischio strutturale', row.structural_risk_score)}
        </div>
        <div class="btd-market-line">
          <span>Opportunity <b>${fmtScore(row.opportunity_score)}/100</b></span>
          <span>Risk <b>${fmtScore(row.structural_risk_score)}/100</b></span>
          <span>Vol ann. <b>${fmtPct(row.annualized_volatility_pct)}</b></span>
          <span>1 mese <b>${fmtPct(row.return_1m_pct)}</b></span>
          <span>3 mesi <b>${fmtPct(row.return_3m_pct)}</b></span>
          <span>vs MA200 <b>${fmtPct(row.price_vs_ma200_pct)}</b></span>
          <span>DD assoluto <b>${fmtPct(row.drawdown_from_high_pct)}</b></span>
          <span>ISIN <b>${esc(row.isin || '—')}</b></span>
        </div>
        ${row.macro_context_configured === true ? '' : '<div class="btd-context-warning">Contesto macro non ancora configurato: ciclo, monetario, utili e rischio strutturale sono neutrali a 50/100.</div>'}
        <p class="btd-why"><strong>Perché:</strong> ${esc(whyText(row))}</p>
        ${row.context_note ? `<p class="small"><strong>Nota macro:</strong> ${esc(row.context_note)}</p>` : ''}
        ${contextEditor(row)}
      </div>`;
  }

  function renderTable(rows) {
    const table = document.getElementById('etfDrawdownTable');
    if (!table) return;
    const list = currentRows(rows);
    if (!list.length) {
      table.innerHTML = '<p class="small">Nessun asset BTD corrisponde ai filtri.</p>';
      return;
    }

    table.innerHTML = `<div class="etf-table">${list.map(row => {
      const st = row._computedStatus;
      const quote = row.yahoo_ticker ? `https://finance.yahoo.com/quote/${encodeURIComponent(row.yahoo_ticker)}` : '';
      const tone = scoreTone(row.btd_signal);
      const regime = regimeLabels[row.regime] || row.regime || 'Neutrale';
      const provisional = row.macro_context_configured === true ? '' : '<small>provvisorio</small>';
      return `<div class="etf-row ${st}" data-btd-score="${n(row.btd_score) ?? ''}" data-btd-signal="${esc(row.btd_signal || '')}" data-regime="${esc(row.regime || '')}" data-opportunity-score="${n(row.opportunity_score) ?? ''}" data-structural-risk="${n(row.structural_risk_score) ?? ''}">
        <div class="etf-main">
          <span class="etf-num">${row.n}</span>
          <span class="etf-name"><strong>${esc(row.asset)}</strong><small>${esc(row.note || row.category || '')}</small></span>
          <span class="etf-ticker"><code>${esc(row.yahoo_ticker || '—')}</code><small>${esc(row.category || '')}</small></span>
          <span class="etf-status badge ${st}">${statusLabel(st)}</span>
          <span class="etf-price">${fmtNum(row.latest_close, 4)}<small>${fmtDate(row.latest_date)}</small></span>
          <span class="etf-dd ${ddClass(row.drawdown_from_52w_high_pct, st)}">${fmtPct(row.drawdown_from_52w_high_pct)}<small>DD 52 sett.</small></span>
          <span class="btd-score">${fmtScore(row.btd_score)}<small>BTD /100</small></span>
          <span class="btd-regime">${esc(regime)}<small>regime</small></span>
          <span class="btd-signal ${tone}">${esc(row.btd_signal || '—')}${provisional}</span>
          <button class="btn btd-score-toggle" data-target="btdDetail-${row.n}" type="button">Dettagli</button>
        </div>
        ${row.error ? `<div class="etf-detail"><b>Errore:</b> ${esc(row.error)} ${quote ? `<a class="btn" target="_blank" rel="noopener" href="${quote}">Yahoo</a>` : ''}</div>` : renderDetail(row)}
      </div>`;
    }).join('')}</div>`;
  }

  let latestRows = [];
  let scanInFlight = false;

  async function scanAndRender() {
    const root = document.getElementById('etfDrawdownSection');
    if (!root || !client || scanInFlight) return;
    scanInFlight = true;
    configureSection();
    stopOldPolling();
    const statusNode = document.getElementById('etfDrawdownUpdateStatus');
    if (statusNode) statusNode.textContent = 'Calcolo BTD Score v2 in corso…';

    try {
      const { data, error } = await client.functions.invoke(FUNCTION_NAME, { body: { requested_at: new Date().toISOString() } });
      if (error || data?.ok === false) {
        if (statusNode) statusNode.textContent = `Errore BTD Score: ${error?.message || data?.message || data?.error || 'errore sconosciuto'}`;
        return;
      }
      latestRows = data.results || [];
      renderSummary(latestRows, data.generated_at_utc);
      renderTable(latestRows);
      if (statusNode) statusNode.textContent = `BTD Score aggiornato: ${latestRows.length} asset.`;
    } finally {
      scanInFlight = false;
    }
  }

  async function saveContext(assetId, editor) {
    if (!client || !editor) return;
    const statusNode = editor.querySelector('.btd-context-status');
    const getValue = field => editor.querySelector(`[data-field="${field}"]`)?.value;
    const scoreFields = ['economic_cycle_score', 'monetary_score', 'earnings_score', 'structural_risk_score'];
    const payload = { asset_id: Number(assetId) };

    for (const field of scoreFields) {
      const value = Number(getValue(field));
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        if (statusNode) statusNode.textContent = 'Inserisci valori tra 0 e 100.';
        return;
      }
      payload[field] = value;
    }
    payload.regime = getValue('regime') || 'neutral';
    payload.context_note = getValue('context_note') || '';
    payload.is_configured = true;
    payload.updated_at = new Date().toISOString();

    if (statusNode) statusNode.textContent = 'Salvataggio…';
    const { error } = await client.from('btd_macro_contexts').upsert(payload, { onConflict: 'asset_id' });
    if (error) {
      if (statusNode) statusNode.textContent = `Errore: ${error.message}`;
      return;
    }
    if (statusNode) statusNode.textContent = 'Salvato. Ricalcolo…';
    await scanAndRender();
  }

  document.addEventListener('input', event => {
    if (event.target.matches?.('#etfDrawdownSearch')) renderTable(latestRows);
  }, true);

  document.addEventListener('change', event => {
    if (event.target.matches?.('#etfDrawdownStatus,#etfDrawdownSort')) renderTable(latestRows);
  }, true);

  document.addEventListener('click', event => {
    const toggle = event.target.closest?.('.btd-score-toggle');
    if (toggle) {
      const detail = document.getElementById(toggle.dataset.target);
      if (detail) detail.classList.toggle('hidden');
      return;
    }

    const save = event.target.closest?.('.btd-context-save');
    if (save) {
      const editor = save.closest('.btd-context-editor');
      saveContext(save.dataset.assetId, editor);
      return;
    }

    if (event.target.closest?.('#etfDrawdownUpdateBtn,#reloadBtn')) setTimeout(scanAndRender, 500);
  }, true);

  function boot() {
    configureSection();
    setTimeout(scanAndRender, 900);
    setTimeout(scanAndRender, 3200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
