(() => {
  const DOCS = 'revision_documents';
  const PDF_MIME = 'application/pdf';
  let importing = false;

  const notify = message => typeof toast === 'function' ? toast(message) : console.log(message);
  const ready = () => typeof supabaseClient !== 'undefined' && supabaseClient && cloudUser?.id;

  function enhanceUploadControl() {
    const input = document.getElementById('revisionFile');
    if (input) input.accept = '.docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf';
    const button = document.getElementById('revisionUploadIcon');
    if (button) {
      button.title = 'Carica PDF o Word';
      button.textContent = '📄 Carica PDF/DOCX';
    }
    const hint = document.querySelector('#screen-revisions .revision-main-panel > .hint');
    if (hint && !hint.dataset.pdfHint) {
      hint.dataset.pdfHint = '1';
      hint.textContent = 'Carica un PDF o DOCX. Seleziona testo in una sola riga per commentare. Il commento compare passando il mouse sulle parti commentate.';
    }
  }

  async function extractPdfText(file) {
    if (!window.pdfjsLib?.getDocument) throw new Error('Parser PDF non ancora caricato');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
    const pages = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      let line = '';
      const lines = [];
      for (const item of content.items || []) {
        const text = String(item.str || '').trim();
        if (text) line += `${line ? ' ' : ''}${text}`;
        if (item.hasEOL && line.trim()) {
          lines.push(line.trim());
          line = '';
        }
      }
      if (line.trim()) lines.push(line.trim());
      pages.push(lines.join('\n'));
    }
    return pages.filter(Boolean).join('\n\n').trim();
  }

  async function importPdf(file) {
    if (!ready()) return notify('Accedi a Supabase prima di caricare il documento');
    if (importing) return;
    importing = true;
    try {
      notify('Lettura del PDF in corso...');
      const text = await extractPdfText(file);
      if (!text) throw new Error('Il PDF non contiene testo estraibile. I PDF scansionati richiedono OCR.');
      const title = file.name.replace(/\.pdf$/i, '');
      const now = new Date().toISOString();
      const row = {
        user_id: cloudUser.id,
        title,
        original_filename: file.name,
        text_content: text,
        revised_text_content: null,
        line_count: text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').length,
        updated_at: now
      };
      const { error } = await supabaseClient.from(DOCS).insert(row);
      if (error) throw error;
      notify('PDF importato. Aggiornamento del documento in corso...');
    } catch (error) {
      notify(error?.message || 'Errore durante il caricamento del PDF');
    } finally {
      importing = false;
    }
  }

  document.addEventListener('change', event => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.id !== 'revisionFile') return;
    const file = input.files?.[0];
    if (!file) return;
    const isPdf = file.type === PDF_MIME || /\.pdf$/i.test(file.name);
    if (!isPdf) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    importPdf(file);
  }, true);

  const observer = new MutationObserver(enhanceUploadControl);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', enhanceUploadControl);
  enhanceUploadControl();
})();
