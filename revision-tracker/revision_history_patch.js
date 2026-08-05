(() => {
  const DOCS = 'revision_documents';
  const NOTES = 'revision_comments';
  const HISTORY = 'revision_paper_history';
  const POLL_INTERVAL = 300;
  const POLL_LIMIT = 40;

  let journalDraft = '';
  let pendingUpload = null;
  let historyRows = [];
  let enhancing = false;

  const h = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[ch]));

  const ready = () => typeof supabaseClient !== 'undefined' && supabaseClient && cloudUser?.id;
  const notify = message => typeof toast === 'function' ? toast(message) : console.log(message);

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  }

  function installStyle() {
    if (document.getElementById('revision-history-style')) return;
    const style = document.createElement('style');
    style.id = 'revision-history-style';
    style.textContent = `
      .revision-journal-wrap{display:flex;align-items:center;gap:7px;min-width:min(310px,100%)}
      .revision-journal-input{min-width:230px;padding:9px 11px;border:1px solid rgba(16,24,32,.18);border-radius:12px;background:#fff}
      .revision-history{margin-top:18px}
      .revision-history-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:12px}
      .revision-history-table-wrap{overflow:auto;border:1px solid rgba(16,24,32,.12);border-radius:14px;background:#fff}
      .revision-history-table{width:100%;border-collapse:collapse;min-width:680px}
      .revision-history-table th,.revision-history-table td{padding:11px 12px;text-align:left;border-bottom:1px solid rgba(16,24,32,.09);vertical-align:middle}
      .revision-history-table th{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#667085;background:#f8fafc}
      .revision-history-table tr:last-child td{border-bottom:0}
      .revision-history-journal{width:100%;min-width:190px;padding:8px 9px;border:1px solid rgba(16,24,32,.16);border-radius:10px}
      .revision-history-empty{padding:18px;color:#667085}
      @media(max-width:900px){.revision-journal-wrap{width:100%}.revision-journal-input{min-width:0;flex:1}}
    `;
    document.head.appendChild(style);
  }

  function ensureJournalField() {
    const toolbar = document.querySelector('#screen-revisions .revision-toolbar-right');
    if (!toolbar || toolbar.querySelector('#revisionJournalName')) return;
    const upload = toolbar.querySelector('#revisionUploadIcon');
    const wrap = document.createElement('label');
    wrap.className = 'revision-journal-wrap';
    wrap.innerHTML = `<span class="hint">Rivista</span><input id="revisionJournalName" class="revision-journal-input" placeholder="Nome della rivista" value="${h(journalDraft)}">`;
    toolbar.insertBefore(wrap, upload || toolbar.firstChild);
    wrap.querySelector('input').addEventListener('input', event => {
      journalDraft = event.target.value;
    });
  }

  function historyMarkup() {
    const rows = historyRows.length ? historyRows.map(row => `
      <tr>
        <td><strong>${h(row.title)}</strong></td>
        <td><input class="revision-history-journal" data-history-journal="${h(row.id)}" value="${h(row.journal_name || '')}" placeholder="Rivista non indicata"></td>
        <td>${h(formatDate(row.last_modified_at))}</td>
      </tr>`).join('') : `<tr><td colspan="3" class="revision-history-empty">Nessun paper nella cronologia.</td></tr>`;

    return `
      <section class="panel revision-history" id="revisionHistorySection">
        <div class="revision-history-head">
          <div><h2>Cronologia</h2><p class="hint">Conserva soltanto titolo, rivista e data di ultima modifica. Il testo dei paper precedenti e i relativi commenti vengono eliminati quando carichi un nuovo documento.</p></div>
          <button class="secondary" id="revisionHistoryRefresh">Aggiorna</button>
        </div>
        <div class="revision-history-table-wrap">
          <table class="revision-history-table">
            <thead><tr><th>Titolo paper</th><th>Rivista</th><th>Ultima modifica</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>`;
  }

  function renderHistory() {
    let section = document.getElementById('revisionHistorySection');
    if (section) section.outerHTML = historyMarkup();
    else document.querySelector('main')?.insertAdjacentHTML('beforeend', historyMarkup());
  }

  async function loadHistory() {
    if (!ready()) return;
    const { data, error } = await supabaseClient
      .from(HISTORY)
      .select('*')
      .eq('user_id', cloudUser.id)
      .order('last_modified_at', { ascending: false });
    if (error) return notify(error.message);
    historyRows = data || [];
    renderHistory();
  }

  async function saveJournal(historyId, journalName) {
    if (!ready() || !historyId) return;
    const { error } = await supabaseClient
      .from(HISTORY)
      .update({ journal_name: String(journalName || '').trim() })
      .eq('id', historyId)
      .eq('user_id', cloudUser.id);
    if (error) return notify(error.message);
    notify('Rivista aggiornata');
  }

  async function syncCurrentMetadata() {
    if (!ready()) return;
    const { data: current, error } = await supabaseClient
      .from(DOCS)
      .select('title,updated_at,revised_updated_at,created_at')
      .eq('user_id', cloudUser.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !current) return;
    const lastModified = current.revised_updated_at || current.updated_at || current.created_at || new Date().toISOString();
    await supabaseClient.from(HISTORY).upsert({
      user_id: cloudUser.id,
      title: current.title,
      last_modified_at: lastModified
    }, { onConflict: 'user_id,title', ignoreDuplicates: false });
  }

  async function findUploadedDocument(upload) {
    for (let attempt = 0; attempt < POLL_LIMIT; attempt += 1) {
      const { data, error } = await supabaseClient
        .from(DOCS)
        .select('id,title,original_filename,created_at,updated_at,revised_updated_at')
        .eq('user_id', cloudUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        const created = new Date(data.created_at).getTime();
        if (data.original_filename === upload.fileName && created >= upload.startedAt - 5000) return data;
      }
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
    return null;
  }

  async function finalizeUpload(upload) {
    if (!ready()) return;
    const newest = await findUploadedDocument(upload);
    if (!newest) return notify('Documento caricato, ma la pulizia automatica non è stata completata. Usa Aggiorna e riprova.');

    const lastModified = newest.revised_updated_at || newest.updated_at || newest.created_at || new Date().toISOString();
    const { error: historyError } = await supabaseClient.from(HISTORY).upsert({
      user_id: cloudUser.id,
      title: newest.title,
      journal_name: upload.journal,
      last_modified_at: lastModified
    }, { onConflict: 'user_id,title', ignoreDuplicates: false });
    if (historyError) return notify(historyError.message);

    const { error: notesError } = await supabaseClient
      .from(NOTES)
      .delete()
      .eq('user_id', cloudUser.id)
      .neq('document_id', newest.id);
    if (notesError) return notify(notesError.message);

    const { error: docsError } = await supabaseClient
      .from(DOCS)
      .delete()
      .eq('user_id', cloudUser.id)
      .neq('id', newest.id);
    if (docsError) return notify(docsError.message);

    pendingUpload = null;
    journalDraft = upload.journal;
    await loadHistory();
    document.getElementById('revisionRefresh')?.click();
    notify('Nuovo paper caricato. Testi e revisioni precedenti eliminati; cronologia aggiornata.');
  }

  function handleFileSelection(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.id !== 'revisionFile') return;
    const file = input.files?.[0];
    if (!file || !ready()) return;
    const journalInput = document.getElementById('revisionJournalName');
    journalDraft = String(journalInput?.value || journalDraft || '').trim();
    pendingUpload = {
      fileName: file.name,
      journal: journalDraft,
      startedAt: Date.now()
    };
    setTimeout(() => finalizeUpload(pendingUpload), 50);
  }

  async function enhance() {
    if (enhancing) return;
    enhancing = true;
    try {
      installStyle();
      ensureJournalField();
      if (!document.getElementById('revisionHistorySection')) await loadHistory();
    } finally {
      enhancing = false;
    }
  }

  document.addEventListener('change', event => {
    if (event.target?.id === 'revisionFile') handleFileSelection(event);
    const journal = event.target?.closest?.('[data-history-journal]');
    if (journal) saveJournal(journal.dataset.historyJournal, journal.value);
  }, true);

  document.addEventListener('click', event => {
    if (event.target?.closest?.('#revisionHistoryRefresh')) {
      syncCurrentMetadata().then(loadHistory);
    }
  });

  const observer = new MutationObserver(() => enhance());
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('load', () => {
    enhance();
    syncCurrentMetadata().then(loadHistory);
  });

  setInterval(() => {
    if (!ready()) return;
    syncCurrentMetadata().then(loadHistory);
  }, 30000);

  enhance();
})();