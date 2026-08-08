(() => {
  'use strict';
  if (window.__BTD_CYCLE_AUTO_PATCH__) return;
  window.__BTD_CYCLE_AUTO_PATCH__ = true;

  const SUPABASE_URL = 'https://kujyowhezihjambhpahe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
  const CYCLE_FUNCTION = 'btd-economic-cycle';
  const TTL_MS = 24 * 60 * 60 * 1000;
  const EXPECTED_ASSETS = 14;
  const client = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_KEY);

  let cycleRows = new Map();
  let refreshPromise = null;
  let replayingUpdateClick = false;

  const n = value => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  function fmtNum(value, digits = 2) {
    const number = n(value);
    return number === null ? '—' : new Intl.NumberFormat('it-IT', { maximumFractionDigits: digits }).format(number);
  }

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
    return {
      count: rows.length,
      staleCount: stale.length,
      refreshNeeded: rows.length < EXPECTED_ASSETS || stale.length > 0,
    };
  }

  async function loadCycleRows() {
    if (!client) return { rows: [], state: { count: 0, staleCount: EXPECTED_ASSETS, refreshNeeded: true } };
    const { data, error } = await client
      .from('btd_cycle_scores')
      .select('asset_id,economic_cycle_score,regime,provider,source,frequency,latest_period,indicator_latest,delta_recent,delta_medium,fetched_at')
      .order('asset_id', { ascending: true });
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    cycleRows = new Map(rows.map(row => [Number(row.asset_id), row]));
    return { rows, state: cacheState(rows) };
  }

  function setLabelText(label, text) {
    if (!label) return;
    const first = [...label.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
    if (first && first.nodeValue !== text) first.nodeValue = text;
  }

  function decorate() {
    document.querySelectorAll('.btd-context-editor').forEach(editor => {
      const cycleInput = editor.querySelector('[data-field="economic_cycle_score"]');
      if (cycleInput) {
        cycleInput.disabled = true;
        cycleInput.title = 'Calcolato automaticamente dalla fonte del ciclo economico';
        setLabelText(cycleInput.closest('label'), 'Ciclo economico (automatico)');
      }

      const regimeSelect = editor.querySelector('[data-field="regime"]');
      if (regimeSelect) {
        regimeSelect.disabled = true;
        regimeSelect.title = 'Regime derivato automaticamente dall’indicatore del ciclo';
        setLabelText(regimeSelect.closest('label'), 'Regime (automatico)');
      }

      const assetId = Number(editor.dataset.contextEditor);
      const meta = cycleRows.get(assetId);
      if (meta) {
        let info = editor.parentElement?.querySelector('.btd-cycle-source-info');
        if (!info) {
          info = document.createElement('p');
          info.className = 'small btd-cycle-source-info';
          editor.parentElement?.insertBefore(info, editor);
        }
        if (info) {
          const html = `<strong>Ciclo automatico:</strong> ${String(meta.provider || '—')} · ${String(meta.latest_period || '—')} · indice ${fmtNum(meta.indicator_latest, 3)} · score ${fmtNum(meta.economic_cycle_score, 1)} · aggiornato ${fmtDate(meta.fetched_at)}`;
          if (info.innerHTML !== html) info.innerHTML = html;
          const title = String(meta.source || '');
          if (info.title !== title) info.title = title;
        }
      }
    });

    document.querySelectorAll('.btd-context-warning').forEach(node => {
      if (node.textContent?.includes('ciclo, monetario, utili e rischio strutturale')) {
        node.textContent = 'Ciclo economico automatico. Politica monetaria, utili e rischio strutturale sono ancora neutrali a 50/100 finché non vengono automatizzati o configurati.';
      }
    });

    document.querySelectorAll('.btd-why').forEach(node => {
      if (node.textContent?.includes('I driver macro sono ancora neutrali a 50/100')) {
        node.innerHTML = node.innerHTML.replace(
          'I driver macro sono ancora neutrali a 50/100: il punteggio è provvisorio finché non vengono configurati.',
          'Politica monetaria, utili e rischio strutturale sono ancora neutrali a 50/100: il punteggio resta parzialmente provvisorio.'
        );
      }
    });

    document.querySelectorAll('#etfDrawdownSummary .etf-card').forEach(card => {
      const label = card.querySelector('span');
      if (label?.textContent === 'Macro neutro') {
        label.textContent = 'Macro manuale neutro';
        const small = card.querySelector('small');
        if (small) small.textContent = 'monetario / utili / rischio a 50';
      }
    });

    const metaNode = document.getElementById('etfDrawdownMeta');
    if (metaNode?.textContent?.includes('I fattori macro non configurati restano neutrali a 50/100.')) {
      metaNode.textContent = metaNode.textContent.replace(
        'I fattori macro non configurati restano neutrali a 50/100.',
        'Ciclo economico automatico; monetario, utili e rischio restano neutrali a 50/100 finché non vengono automatizzati o configurati.'
      );
    }

    const updateStatus = document.getElementById('etfDrawdownUpdateStatus');
    if (updateStatus?.textContent?.startsWith('BTD Score v2 attivo')) {
      updateStatus.textContent = 'BTD Score v3 attivo: ciclo economico automatico (cache 24h) + mercato Yahoo.';
    }
  }

  async function refreshCycle(reason = 'manual') {
    if (!client) throw new Error('Client Supabase non disponibile');
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      status(reason === 'manual' ? 'Aggiornamento ciclo economico 14/14 in corso…' : 'Ciclo economico scaduto: aggiornamento in background…');
      const { data, error } = await client.functions.invoke(CYCLE_FUNCTION, {
        body: { reason, requested_at: new Date().toISOString() },
      });
      if (error) throw error;
      if (!data?.cache_saved) throw new Error(data?.cache_error || data?.message || 'Cache ciclo non salvata');
      await loadCycleRows();
      decorate();
      if (data?.success_count === EXPECTED_ASSETS && data?.failed_count === 0) {
        status(`Ciclo economico aggiornato: ${EXPECTED_ASSETS}/${EXPECTED_ASSETS} fonti operative.`, 'ok');
      } else {
        status(`Ciclo aggiornato parzialmente: ${data?.success_count || 0}/${EXPECTED_ASSETS}. I valori precedenti restano disponibili per le fonti fallite.`, 'warn');
      }
      return data;
    })();

    try {
      return await refreshPromise;
    } finally {
      refreshPromise = null;
    }
  }

  function replayRadarUpdate(button) {
    if (!button) return;
    replayingUpdateClick = true;
    try {
      button.click();
    } finally {
      replayingUpdateClick = false;
    }
  }

  window.addEventListener('click', async event => {
    const button = event.target?.closest?.('#etfDrawdownUpdateBtn');
    if (!button || replayingUpdateClick) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    button.disabled = true;
    const oldText = button.textContent;
    button.textContent = 'Aggiorno ciclo…';

    try {
      await refreshCycle('manual');
    } catch (error) {
      status(`Errore aggiornamento ciclo: ${error?.message || error}`, 'warn');
    } finally {
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
      const { state } = await loadCycleRows();
      decorate();
      if (!state.refreshNeeded) return;

      await refreshCycle('stale_24h');
      const button = document.getElementById('etfDrawdownUpdateBtn');
      if (button) replayRadarUpdate(button);
      else document.getElementById('reloadBtn')?.click();
    } catch (error) {
      console.warn('[BTD cycle auto]', error);
      decorate();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 1600), { once: true });
  } else {
    setTimeout(boot, 1600);
  }
})();
