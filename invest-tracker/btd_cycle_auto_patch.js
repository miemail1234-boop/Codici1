(() => {
  'use strict';
  if (window.__BTD_MACRO_AUTO_PATCH__) return;
  window.__BTD_MACRO_AUTO_PATCH__ = true;

  const SUPABASE_URL = 'https://kujyowhezihjambhpahe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
  const CYCLE_FUNCTION = 'btd-economic-cycle';
  const MONETARY_FUNCTION = 'btd-monetary-update';
  const TTL_MS = 24 * 60 * 60 * 1000;
  const EXPECTED_ASSETS = 14;
  const client = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);

  let cycleRows = new Map();
  let monetaryRows = new Map();
  let refreshPromise = null;
  let replayingUpdateClick = false;

  const n = value => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; };
  const fmtNum = (value, digits = 2) => n(value) === null ? '—' : new Intl.NumberFormat('it-IT', { maximumFractionDigits: digits }).format(n(value));
  const fmtPct = value => n(value) === null ? '—' : `${new Intl.NumberFormat('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(n(value))}%`;
  function fmtDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
  }
  function status(text, tone = '') {
    const node = document.getElementById('etfDrawdownUpdateStatus');
    if (!node) return;
    if (node.textContent !== text) node.textContent = text;
    if (tone) node.dataset.tone = tone;
    else delete node.dataset.tone;
  }
  async function waitForSession(maxTries = 12) {
    if (!client) return null;
    for (let i = 0; i < maxTries; i += 1) {
      const { data } = await client.auth.getSession();
      if (data?.session) return data.session;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    return null;
  }
  function cacheState(rows) {
    const now = Date.now();
    const stale = rows.filter(row => {
      const t = row.fetched_at ? new Date(row.fetched_at).getTime() : NaN;
      return !Number.isFinite(t) || now - t > TTL_MS;
    });
    return { count: rows.length, staleCount: stale.length, refreshNeeded: rows.length < EXPECTED_ASSETS || stale.length > 0 };
  }
  async function loadCycleRows() {
    const { data, error } = await client.from('btd_cycle_scores')
      .select('asset_id,economic_cycle_score,regime,provider,source,frequency,latest_period,indicator_latest,delta_recent,delta_medium,fetched_at')
      .order('asset_id', { ascending: true });
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    cycleRows = new Map(rows.map(row => [Number(row.asset_id), row]));
    return { rows, state: cacheState(rows) };
  }
  async function loadMonetaryRows() {
    const { data, error } = await client.from('btd_monetary_scores')
      .select('asset_id,monetary_score,policy_rate,inflation_yoy,real_policy_rate,provider,policy_source,inflation_source,latest_policy_period,latest_inflation_period,policy_component_score,inflation_component_score,methodology_note,fetched_at')
      .order('asset_id', { ascending: true });
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    monetaryRows = new Map(rows.map(row => [Number(row.asset_id), row]));
    return { rows, state: cacheState(rows) };
  }
  function setLabelText(label, text) {
    if (!label) return;
    const first = [...label.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
    if (first && first.nodeValue !== text) first.nodeValue = text;
  }
  function setInfo(editor, className, html, title = '') {
    let info = editor.parentElement?.querySelector(`.${className}`);
    if (!info) {
      info = document.createElement('p');
      info.className = `small ${className}`;
      editor.parentElement?.insertBefore(info, editor);
    }
    if (!info) return;
    if (info.innerHTML !== html) info.innerHTML = html;
    if (info.title !== title) info.title = title;
  }
  function decorate() {
    document.querySelectorAll('.btd-context-editor').forEach(editor => {
      const cycleInput = editor.querySelector('[data-field="economic_cycle_score"]');
      if (cycleInput) {
        cycleInput.disabled = true;
        cycleInput.title = 'Calcolato automaticamente dalla fonte del ciclo economico';
        setLabelText(cycleInput.closest('label'), 'Ciclo economico (automatico)');
      }
      const monetaryInput = editor.querySelector('[data-field="monetary_score"]');
      if (monetaryInput) {
        monetaryInput.disabled = true;
        monetaryInput.title = 'Calcolato automaticamente da tassi, inflazione e condizioni monetarie';
        setLabelText(monetaryInput.closest('label'), 'Politica monetaria (automatica)');
      }
      const regimeSelect = editor.querySelector('[data-field="regime"]');
      if (regimeSelect) {
        regimeSelect.disabled = true;
        regimeSelect.title = 'Regime derivato automaticamente dall’indicatore del ciclo';
        setLabelText(regimeSelect.closest('label'), 'Regime (automatico)');
      }

      const assetId = Number(editor.dataset.contextEditor);
      const cycle = cycleRows.get(assetId);
      if (cycle) {
        setInfo(editor, 'btd-cycle-source-info',
          `<strong>Ciclo automatico:</strong> ${String(cycle.provider || '—')} · ${String(cycle.latest_period || '—')} · indice ${fmtNum(cycle.indicator_latest, 3)} · score ${fmtNum(cycle.economic_cycle_score, 1)} · aggiornato ${fmtDate(cycle.fetched_at)}`,
          String(cycle.source || ''));
      }

      const money = monetaryRows.get(assetId);
      if (money) {
        const ratePart = n(money.policy_rate) === null
          ? `condizioni FX ${fmtNum(money.policy_component_score, 1)}/100`
          : `tasso ${fmtPct(money.policy_rate)} (${String(money.latest_policy_period || '—')}) · reale ${fmtPct(money.real_policy_rate)}`;
        setInfo(editor, 'btd-monetary-source-info',
          `<strong>Monetario automatico:</strong> ${String(money.provider || '—')} · ${ratePart} · inflazione ${fmtPct(money.inflation_yoy)} (${String(money.latest_inflation_period || '—')}) · score ${fmtNum(money.monetary_score, 1)} · aggiornato ${fmtDate(money.fetched_at)}`,
          [money.policy_source, money.inflation_source, money.methodology_note].filter(Boolean).join(' | '));
      }
    });

    document.querySelectorAll('.btd-context-warning').forEach(node => {
      const text = node.textContent || '';
      if (text.includes('ciclo, monetario, utili e rischio strutturale') || text.includes('Ciclo economico automatico. Politica monetaria')) {
        const replacement = 'Ciclo economico e politica monetaria automatici. Utili e rischio strutturale sono ancora neutrali a 50/100 finché non vengono automatizzati o configurati.';
        if (node.textContent !== replacement) node.textContent = replacement;
      }
    });

    document.querySelectorAll('.btd-why').forEach(node => {
      let html = node.innerHTML;
      html = html.replace(
        'I driver macro sono ancora neutrali a 50/100: il punteggio è provvisorio finché non vengono configurati.',
        'Ciclo economico e politica monetaria sono automatici; utili e rischio strutturale sono ancora neutrali a 50/100: il punteggio resta parzialmente provvisorio.'
      ).replace(
        'Politica monetaria, utili e rischio strutturale sono ancora neutrali a 50/100: il punteggio resta parzialmente provvisorio.',
        'Ciclo economico e politica monetaria sono automatici; utili e rischio strutturale sono ancora neutrali a 50/100: il punteggio resta parzialmente provvisorio.'
      );
      if (node.innerHTML !== html) node.innerHTML = html;
    });

    document.querySelectorAll('#etfDrawdownSummary .etf-card').forEach(card => {
      const label = card.querySelector('span');
      if (label?.textContent === 'Macro neutro' || label?.textContent === 'Macro manuale neutro') {
        label.textContent = 'Macro manuali';
        const small = card.querySelector('small');
        if (small) small.textContent = 'utili / rischio ancora manuali';
      }
    });

    const metaNode = document.getElementById('etfDrawdownMeta');
    if (metaNode) {
      let text = metaNode.textContent || '';
      text = text.replace(
        'I fattori macro non configurati restano neutrali a 50/100.',
        'Ciclo e monetario automatici; utili e rischio restano neutrali a 50/100 finché non vengono automatizzati o configurati.'
      ).replace(
        'Ciclo economico automatico; monetario, utili e rischio restano neutrali a 50/100 finché non vengono automatizzati o configurati.',
        'Ciclo e monetario automatici; utili e rischio restano neutrali a 50/100 finché non vengono automatizzati o configurati.'
      );
      if (metaNode.textContent !== text) metaNode.textContent = text;
    }

    const updateStatus = document.getElementById('etfDrawdownUpdateStatus');
    if (updateStatus?.textContent?.startsWith('BTD Score v2 attivo') || updateStatus?.textContent?.startsWith('BTD Score v3 attivo')) {
      updateStatus.textContent = 'BTD Score v4 attivo: ciclo + monetario automatici (cache 24h) + mercato Yahoo.';
    }
  }

  async function invokeUpdate(fn, label, reason) {
    const { data, error } = await client.functions.invoke(fn, { body: { reason, requested_at: new Date().toISOString() } });
    if (error) throw new Error(`${label}: ${error.message}`);
    if (!data?.cache_saved) throw new Error(`${label}: ${data?.cache_error || data?.message || 'cache non salvata'}`);
    return data;
  }
  async function refreshMacro(reason = 'manual', options = { cycle: true, monetary: true }) {
    if (!client) throw new Error('Client Supabase non disponibile');
    if (refreshPromise) return refreshPromise;
    refreshPromise = (async () => {
      status(reason === 'manual' ? 'Aggiornamento macro 14/14 in corso…' : 'Dati macro scaduti: aggiornamento in background…');
      const jobs = [];
      if (options.cycle) jobs.push(invokeUpdate(CYCLE_FUNCTION, 'Ciclo', reason));
      if (options.monetary) jobs.push(invokeUpdate(MONETARY_FUNCTION, 'Monetario', reason));
      const results = await Promise.allSettled(jobs);
      await Promise.all([loadCycleRows(), loadMonetaryRows()]);
      decorate();
      const rejected = results.filter(x => x.status === 'rejected');
      if (rejected.length) {
        status(`Aggiornamento macro parziale: ${rejected.map(x => x.reason?.message || x.reason).join(' · ')}`, 'warn');
      } else {
        status('Macro aggiornato: ciclo 14/14 + monetario 14/14.', 'ok');
      }
      return results;
    })();
    try { return await refreshPromise; }
    finally { refreshPromise = null; }
  }
  function replayRadarUpdate(button) {
    if (!button) return;
    replayingUpdateClick = true;
    try { button.click(); }
    finally { replayingUpdateClick = false; }
  }

  window.addEventListener('click', async event => {
    const button = event.target?.closest?.('#etfDrawdownUpdateBtn');
    if (!button || replayingUpdateClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    button.disabled = true;
    const oldText = button.textContent;
    button.textContent = 'Aggiorno macro…';
    try { await refreshMacro('manual', { cycle: true, monetary: true }); }
    catch (error) { status(`Errore aggiornamento macro: ${error?.message || error}`, 'warn'); }
    finally {
      button.disabled = false;
      button.textContent = oldText || 'Aggiorna BTD Radar';
      replayRadarUpdate(button);
    }
  }, true);

  const observer = new MutationObserver(() => decorate());
  observer.observe(document.documentElement, { childList: true, subtree: true });

  async function boot() {
    if (!client) return;
    await waitForSession();
    try {
      const [cycle, monetary] = await Promise.all([loadCycleRows(), loadMonetaryRows()]);
      decorate();
      if (!cycle.state.refreshNeeded && !monetary.state.refreshNeeded) return;
      await refreshMacro('stale_24h', { cycle: cycle.state.refreshNeeded, monetary: monetary.state.refreshNeeded });
      const button = document.getElementById('etfDrawdownUpdateBtn');
      if (button) replayRadarUpdate(button);
      else document.getElementById('reloadBtn')?.click();
    } catch (error) {
      console.warn('[BTD macro auto]', error);
      decorate();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 1600), { once: true });
  else setTimeout(boot, 1600);
})();