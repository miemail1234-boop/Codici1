(() => {
  const DOCS = "revision_documents";
  let editorOpen = false;
  let saveTimer = null;
  let lastSavedText = "";

  const h = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[ch]));
  const ready = () => typeof supabaseClient !== "undefined" && supabaseClient && typeof cloudUser !== "undefined" && cloudUser?.id;
  const msg = text => typeof toast === "function" ? toast(text) : console.log(text);

  function style() {
    if (document.getElementById("revision-editor-style")) return;
    const s = document.createElement("style");
    s.id = "revision-editor-style";
    s.textContent = `
      .revision-editor-layer { position: fixed; z-index: 9997; inset: 70px 14px 14px 14px; background: #fff; border: 1px solid rgba(16,24,32,.16); border-radius: 18px; box-shadow: 0 18px 50px rgba(0,0,0,.22); display: flex; flex-direction: column; overflow: hidden; }
      .revision-editor-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 14px; border-bottom: 1px solid #eee; }
      .revision-editor-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
      .revision-editor-body { flex: 1; overflow: auto; padding: 18px; }
      .revision-editor { min-height: 100%; outline: none; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 16px; line-height: 1.7; user-select: text; -webkit-user-select: text; }
      .revision-editor[contenteditable="true"] { cursor: text; }
      .revision-editor-status { color: #666; font-size: 13px; }
      @media(max-width: 900px) { .revision-editor-layer { inset: 58px 8px 8px 8px; } .revision-editor { font-size: 15px; } }
    `;
    document.head.appendChild(s);
  }

  function currentDocId() {
    return document.getElementById("revisionDocSelect")?.value || "";
  }

  async function fetchDoc(id) {
    if (!ready() || !id) return null;
    const q = await supabaseClient.from(DOCS).select("*").eq("user_id", cloudUser.id).eq("id", id).single();
    if (q.error) { msg(q.error.message); return null; }
    return q.data;
  }

  function installButton() {
    const toolbar = document.querySelector("#screen-revisions .revision-toolbar-right");
    if (!toolbar || document.getElementById("revisionEditorToggle")) return;
    const notes = document.getElementById("revisionToggleNotes");
    const b = document.createElement("button");
    b.className = "revision-icon-button";
    b.id = "revisionEditorToggle";
    b.title = "Revisione";
    b.textContent = "✍️ Revisione";
    if (notes) toolbar.insertBefore(b, notes);
    else toolbar.appendChild(b);
  }

  function textToHtml(text) {
    return h(text || "");
  }

  function editorText() {
    const el = document.getElementById("revisionEditorText");
    return el ? el.innerText.replace(/\n$/g, "") : "";
  }

  function setStatus(text) {
    const el = document.getElementById("revisionEditorStatus");
    if (el) el.textContent = text;
  }

  async function saveRevision({ silent = false } = {}) {
    const id = currentDocId();
    if (!ready() || !id) return;
    const text = editorText();
    const q = await supabaseClient
      .from(DOCS)
      .update({ revised_text_content: text, revised_updated_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("user_id", cloudUser.id)
      .eq("id", id);
    if (q.error) { msg(q.error.message); return; }
    lastSavedText = text;
    setStatus(`Salvato ${new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`);
    if (!silent) msg("Revisione salvata");
  }

  function scheduleSave() {
    setStatus("Modifiche non salvate...");
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => saveRevision({ silent: true }), 2500);
  }

  async function openEditor() {
    style();
    const id = currentDocId();
    const data = await fetchDoc(id);
    if (!data) return;
    editorOpen = true;
    document.getElementById("revisionEditorLayer")?.remove();
    const text = data.revised_text_content ?? data.text_content ?? "";
    lastSavedText = text;
    const layer = document.createElement("div");
    layer.className = "revision-editor-layer";
    layer.id = "revisionEditorLayer";
    layer.innerHTML = `
      <div class="revision-editor-head">
        <div>
          <h2>Revisione manuscript</h2>
          <p class="hint">Editing libero del testo revisionato. Selezione nativa attiva per Atlas.</p>
        </div>
        <div class="revision-editor-actions">
          <span class="revision-editor-status" id="revisionEditorStatus">Pronto</span>
          <button class="secondary" id="revisionEditorSave">Salva</button>
          <button class="secondary" id="revisionEditorReset">Ripristina originale</button>
          <button class="secondary" id="revisionEditorClose">Chiudi</button>
        </div>
      </div>
      <div class="revision-editor-body">
        <div id="revisionEditorText" class="revision-editor" contenteditable="true" spellcheck="true">${textToHtml(text)}</div>
      </div>
    `;
    document.body.appendChild(layer);
    requestAnimationFrame(() => document.getElementById("revisionEditorText")?.focus());
  }

  function closeEditor() {
    editorOpen = false;
    window.clearTimeout(saveTimer);
    document.getElementById("revisionEditorLayer")?.remove();
  }

  async function resetOriginal() {
    const id = currentDocId();
    const data = await fetchDoc(id);
    if (!data) return;
    const editor = document.getElementById("revisionEditorText");
    if (editor) editor.textContent = data.text_content || "";
    scheduleSave();
  }

  document.addEventListener("click", event => {
    if (event.target.closest?.('[data-screen="revisions"]')) {
      setTimeout(installButton, 200);
      setTimeout(installButton, 700);
    }
    if (event.target.id === "revisionEditorToggle") openEditor();
    if (event.target.id === "revisionEditorClose") closeEditor();
    if (event.target.id === "revisionEditorSave") saveRevision();
    if (event.target.id === "revisionEditorReset") resetOriginal();
  }, true);

  document.addEventListener("input", event => {
    if (event.target?.id === "revisionEditorText") scheduleSave();
  }, true);

  document.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s" && document.getElementById("revisionEditorLayer")) {
      event.preventDefault();
      saveRevision();
    }
    if (event.key === "Escape" && document.getElementById("revisionEditorLayer")) closeEditor();
  }, true);

  document.addEventListener("selectionchange", () => {
    const selection = window.getSelection?.();
    if (!selection || selection.isCollapsed) return;
    if (selection.anchorNode?.parentElement?.closest?.("#revisionEditorText")) {
      setStatus("Testo selezionato");
    }
  });

  const observer = new MutationObserver(() => installButton());
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", () => { style(); installButton(); });
  window.addEventListener("load", () => { style(); installButton(); });
})();
