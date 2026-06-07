(() => {
  const DOCS = "revision_documents";
  const NOTES = "revision_comments";
  let docs = [];
  let notes = [];
  let openDocId = "";
  let selInfo = null;
  let popupTimer = null;
  let notesOpen = false;
  let editNoteId = "";

  const h = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[ch]));
  const isReady = () => typeof supabaseClient !== "undefined" && supabaseClient && typeof cloudUser !== "undefined" && cloudUser?.id;
  const msg = text => typeof toast === "function" ? toast(text) : console.log(text);
  const lines = text => String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  function style() {
    if (document.getElementById("rev-style-v4")) return;
    document.getElementById("rev-style")?.remove();
    document.getElementById("rev-style-v3")?.remove();
    const s = document.createElement("style");
    s.id = "rev-style-v4";
    s.textContent = `
      #screen-revisions { padding-bottom: 24px; }
      .revision-full { width: min(100%, 1560px); margin: 0 auto; }
      .revision-toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:12px; }
      .revision-toolbar-left, .revision-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
      .revision-icon-button { border:1px solid rgba(16,24,32,.16); border-radius:999px; background:#fff; padding:8px 12px; cursor:pointer; font-weight:700; }
      .revision-icon-button.active { outline:2px solid #3e8f75; }
      .revision-doc-select { min-width:min(460px, 100%); max-width:100%; }
      .revision-main-panel { min-height:84vh; }
      .revision-reader { background:#fff; border:1px solid #ddd; border-radius:16px; height:calc(100vh - 195px); min-height:690px; overflow:auto; padding:16px; user-select:text; -webkit-user-select:text; font-size:16px; line-height:1.7; }
      .revision-line { display:grid; grid-template-columns:50px minmax(0,1fr); gap:13px; border-bottom:1px solid #eee; padding:5px 8px; }
      .revision-num { text-align:right; color:#888; user-select:none; font-variant-numeric:tabular-nums; }
      .revision-text { white-space:pre-wrap; overflow-wrap:anywhere; }
      .rev-note-target { border-bottom:1px dotted rgba(16,24,32,.55); cursor:pointer; }
      .rev-yellow { background:rgba(255,222,89,.78); border-radius:3px; cursor:pointer; }
      .rev-red { background:rgba(255,99,99,.48); border-radius:3px; cursor:pointer; }
      .revision-popup { position:fixed; z-index:9999; background:#fff; border:1px solid #ccc; border-radius:14px; box-shadow:0 12px 30px rgba(0,0,0,.18); padding:10px; width:min(380px,calc(100vw - 24px)); }
      .revision-popup textarea, .revision-edit-textarea { width:100%; min-height:78px; }
      .revision-notes-drawer { position:fixed; z-index:9998; top:70px; right:14px; bottom:14px; width:min(460px, calc(100vw - 28px)); background:#fff; border:1px solid rgba(16,24,32,.16); border-radius:18px; box-shadow:0 18px 50px rgba(0,0,0,.20); padding:14px; overflow:auto; }
      .revision-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }
      .revision-comment { background:#fff; border-left:4px solid #d8d6cf; border-radius:10px; padding:9px; margin:8px 0; box-shadow:0 1px 5px rgba(0,0,0,.05); cursor:pointer; }
      .revision-comment.yellow { border-left-color:#e9c46a; }
      .revision-comment.red { border-left-color:#e76f51; }
      .revision-comment.active { outline:2px solid #3e8f75; }
      .revision-comment blockquote { margin:6px 0; padding-left:8px; border-left:2px solid #ddd; color:#333; }
      .revision-comment small { color:#666; }
      .revision-note-actions { display:flex; gap:6px; flex-wrap:wrap; margin-top:8px; }
      .revision-tooltip { position:fixed; z-index:10000; max-width:380px; background:#101820; color:#fff; border-radius:10px; padding:8px 10px; box-shadow:0 8px 22px rgba(0,0,0,.2); font-size:13px; line-height:1.4; pointer-events:none; white-space:pre-wrap; }
      @media(max-width:900px){ .revision-reader{height:68vh;min-height:480px;font-size:15px}.revision-doc-select{min-width:100%}.revision-toolbar{align-items:stretch}.revision-toolbar-left,.revision-toolbar-right{width:100%}.revision-icon-button{flex:1}.revision-notes-drawer{top:60px;right:8px;bottom:8px;width:calc(100vw - 16px)} }
    `;
    document.head.appendChild(s);
  }

  function screen() {
    let p = document.getElementById("screen-revisions");
    const main = document.querySelector("main");
    if (!p && main) {
      p = document.createElement("section");
      p.id = "screen-revisions";
      p.className = "screen";
      p.dataset.screenPanel = "revisions";
      main.appendChild(p);
    }
    const grid = document.querySelector("#screen-home .home-grid");
    if (grid && !grid.querySelector('[data-screen="revisions"]')) {
      const b = document.createElement("button");
      b.className = "home-card";
      b.dataset.screen = "revisions";
      b.innerHTML = `<span>✎</span><div><strong>Correzione revisioni</strong><small>Commenti su Word</small></div>`;
      grid.appendChild(b);
    }
    return p;
  }

  function doc() { return docs.find(d => d.id === openDocId) || docs[0] || null; }
  function docNotes(id) { return notes.filter(n => n.document_id === id && n.status !== "resolved"); }
  function captureReaderScroll() { return document.getElementById("revisionReader")?.scrollTop ?? null; }
  function restoreReaderScroll(value) { if (value === null || value === undefined) return; requestAnimationFrame(() => { const r = document.getElementById("revisionReader"); if (r) r.scrollTop = value; }); }
  function scrollToLine(line) { requestAnimationFrame(() => document.querySelector(`[data-line="${line}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" })); }
  function scrollToNote(noteId) { requestAnimationFrame(() => document.querySelector(`[data-revision-note-id="${noteId}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" })); }

  function markLine(text, n, list) {
    const parts = list
      .filter(x => Number(x.line_number) === n)
      .map(x => ({ id: x.id, a: Number(x.start_offset), b: Number(x.end_offset), color: x.highlight_color, comment: x.comment_text || "Senza commento" }))
      .filter(x => x.a >= 0 && x.b > x.a && x.b <= text.length)
      .sort((x, y) => x.a - y.a);
    let out = "", i = 0;
    for (const p of parts) {
      if (p.a < i) continue;
      const cls = p.color === "yellow" ? "rev-yellow" : p.color === "red" ? "rev-red" : "rev-note-target";
      out += h(text.slice(i, p.a));
      out += `<span class="${cls}" data-rev-note-id="${h(p.id)}" data-rev-tooltip="${h(`Riga ${n}\n${p.comment}`)}">${h(text.slice(p.a, p.b))}</span>`;
      i = p.b;
    }
    return out + h(text.slice(i)) || "&nbsp;";
  }

  function colorButton(color, current, attr = "data-rev-edit-color") {
    const label = color === "none" ? "No evidenziazione" : color === "yellow" ? "Giallo" : "Rosso";
    return `<button class="chip ${current === color ? "active" : ""}" ${attr}="${color}">${label}</button>`;
  }

  function renderNotesDrawer(activeNotes) {
    if (!notesOpen) return "";
    return `<aside class="revision-notes-drawer" id="revisionNotesDrawer"><div class="revision-drawer-head"><div><h2>Note</h2><p class="hint">Parti selezionate e commenti.</p></div><button class="secondary" id="revisionCloseNotes">Chiudi</button></div>${activeNotes.length ? activeNotes.map(n => {
      const color = n.highlight_color || "none";
      if (editNoteId === n.id) {
        return `<article class="revision-comment ${color} active" data-revision-note-id="${h(n.id)}"><small>Riga ${n.line_number}</small><blockquote>${h(n.selected_text)}</blockquote><textarea class="revision-edit-textarea" data-edit-note-text="${h(n.id)}">${h(n.comment_text || "")}</textarea><div class="revision-note-actions">${colorButton("none", color)}${colorButton("yellow", color)}${colorButton("red", color)}<button class="primary" data-save-revision-note="${h(n.id)}">Salva</button><button class="secondary" data-cancel-edit-revision-note="${h(n.id)}">Annulla</button></div></article>`;
      }
      return `<article class="revision-comment ${color}" data-jump-revision-line="${Number(n.line_number)}" data-revision-note-id="${h(n.id)}"><small>Riga ${n.line_number}${color !== 'none' ? ` · ${color}` : ''}</small><blockquote>${h(n.selected_text)}</blockquote><p>${h(n.comment_text || "Senza commento")}</p><div class="revision-note-actions"><button class="chip" data-edit-revision-note="${h(n.id)}">Modifica</button><button class="danger" data-delete-revision-note="${h(n.id)}">Elimina</button></div></article>`;
    }).join("") : "<p class='hint'>Nessuna nota aperta.</p>"}</aside>`;
  }

  function render(options = {}) {
    const scrollTop = options.keepScroll ? captureReaderScroll() : null;
    style();
    const p = screen();
    if (!p) return;
    const d = doc();
    const activeNotes = d ? docNotes(d.id) : [];
    const select = `<select class="revision-doc-select" id="revisionDocSelect">${docs.length ? docs.map(x => `<option value="${h(x.id)}" ${x.id === d?.id ? "selected" : ""}>${h(x.title)} · ${x.line_count || 0} righe</option>`).join("") : `<option>Nessun documento</option>`}</select>`;
    p.innerHTML = `<div class="revision-full"><div class="panel revision-main-panel"><div class="revision-toolbar"><div class="revision-toolbar-left"><h2>Correzione revisioni</h2>${select}</div><div class="revision-toolbar-right"><input id="revisionFile" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden><button class="revision-icon-button" id="revisionUploadIcon" title="Carica Word">📄 Carica</button>${d ? "<button class='revision-icon-button' id='revisionRefresh' title='Aggiorna'>↻</button>" : ""}<button class="revision-icon-button ${notesOpen ? "active" : ""}" id="revisionToggleNotes" title="Note">📝 Note (${activeNotes.length})</button></div></div><p class="hint">Testo non modificabile. Seleziona testo in una sola riga per commentare. Il commento compare passando il mouse sulle parti commentate.</p>${d ? `<div class="revision-reader" id="revisionReader">${lines(d.text_content).map((line,i)=>`<div class="revision-line" data-line="${i+1}"><span class="revision-num">${i+1}</span><span class="revision-text">${markLine(line,i+1,activeNotes)}</span></div>`).join("")}</div>` : `<p class="hint">Carica un documento Word con l'icona 📄.</p>`}</div>${renderNotesDrawer(activeNotes)}</div>`;
    restoreReaderScroll(scrollTop);
    if (options.focusNoteId) scrollToNote(options.focusNoteId);
    if (options.line) scrollToLine(options.line);
  }

  async function load(options = {}) {
    if (!isReady()) { render(options); return; }
    const a = await supabaseClient.from(DOCS).select("*").eq("user_id", cloudUser.id).order("updated_at", { ascending:false });
    if (a.error) { msg(a.error.message); return; }
    docs = a.data || [];
    if (!openDocId && docs[0]) openDocId = docs[0].id;
    const b = await supabaseClient.from(NOTES).select("*").eq("user_id", cloudUser.id).order("created_at", { ascending:true });
    if (b.error) { msg(b.error.message); return; }
    notes = b.data || [];
    render(options);
  }

  async function importFile(file) {
    if (!isReady()) return msg("Accedi a Supabase nella sezione Dati");
    if (!file) return msg("Scegli un file .docx");
    if (!window.mammoth?.extractRawText) return msg("Parser Word non ancora caricato");
    const ab = await file.arrayBuffer();
    const res = await window.mammoth.extractRawText({ arrayBuffer: ab });
    const text = String(res.value || "").trimEnd();
    if (!text.trim()) return msg("Nessun testo leggibile");
    const title = file.name.replace(/\.docx$/i, "");
    const row = { user_id: cloudUser.id, title, original_filename: file.name, text_content: text, line_count: lines(text).length, updated_at: new Date().toISOString() };
    const q = await supabaseClient.from(DOCS).insert(row).select("*").single();
    if (q.error) return msg(q.error.message);
    openDocId = q.data.id;
    await load();
    msg("Documento importato");
  }

  function selectionInfo() {
    const s = window.getSelection();
    if (!s || s.isCollapsed || !s.rangeCount) return null;
    const r = s.getRangeAt(0);
    const row1 = r.startContainer.parentElement?.closest?.(".revision-line");
    const row2 = r.endContainer.parentElement?.closest?.(".revision-line");
    if (!row1 || row1 !== row2) { msg("Seleziona testo dentro una sola riga"); return null; }
    const d = doc();
    const textEl = row1.querySelector(".revision-text");
    const pre = document.createRange();
    pre.selectNodeContents(textEl);
    pre.setEnd(r.startContainer, r.startOffset);
    const start = pre.toString().length;
    const selected = s.toString();
    return { docId: d?.id || "", line: Number(row1.dataset.line), lineText: textEl.textContent || "", selected, start, end: start + selected.length, rect: r.getBoundingClientRect() };
  }

  function closePopup() {
    document.getElementById("revisionPopup")?.remove();
    if (popupTimer) clearTimeout(popupTimer);
    popupTimer = null;
    selInfo = null;
  }

  function openPopup(info) {
    closePopup();
    selInfo = info;
    const p = document.createElement("div");
    p.id = "revisionPopup";
    p.className = "revision-popup";
    p.dataset.color = "none";
    p.style.left = `${Math.min(Math.max(12, info.rect.left), window.innerWidth - 400)}px`;
    p.style.top = `${Math.min(Math.max(12, info.rect.bottom + 8), window.innerHeight - 250)}px`;
    p.innerHTML = `<small>Riga ${info.line}: ${h(info.selected.slice(0,80))}</small><textarea id="revisionCommentText" placeholder="Commento..."></textarea><div class="row-actions">${colorButton("none", "none", "data-rev-color")}${colorButton("yellow", "none", "data-rev-color")}${colorButton("red", "none", "data-rev-color")}<button class="primary" id="revisionSaveNote">Salva</button><button class="secondary" id="revisionCancelNote">Annulla</button></div>`;
    document.body.appendChild(p);
    const t = p.querySelector("textarea");
    popupTimer = setTimeout(() => { if (!t.value.trim()) closePopup(); }, 5000);
    t.addEventListener("input", () => { if (popupTimer) clearTimeout(popupTimer); popupTimer = null; });
    t.addEventListener("keydown", event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); saveNote(); } });
    requestAnimationFrame(() => t.focus());
  }

  async function saveNote() {
    const d = doc();
    if (!isReady() || !d || !selInfo) return;
    const line = selInfo.line;
    const pop = document.getElementById("revisionPopup");
    const row = { user_id: cloudUser.id, document_id: d.id, line_number: selInfo.line, line_text: selInfo.lineText, selected_text: selInfo.selected, start_offset: selInfo.start, end_offset: selInfo.end, highlight_color: pop?.dataset.color || "none", comment_text: document.getElementById("revisionCommentText")?.value?.trim() || "", status: "open", updated_at: new Date().toISOString() };
    const q = await supabaseClient.from(NOTES).insert(row);
    if (q.error) return msg(q.error.message);
    closePopup();
    window.getSelection()?.removeAllRanges();
    await load({ line });
    msg("Commento salvato");
  }

  async function updateNote(noteId) {
    if (!isReady() || !noteId) return;
    const text = document.querySelector(`[data-edit-note-text="${CSS.escape(noteId)}"]`)?.value || "";
    const card = document.querySelector(`[data-revision-note-id="${CSS.escape(noteId)}"]`);
    const color = card?.dataset.editColor || notes.find(n => n.id === noteId)?.highlight_color || "none";
    const q = await supabaseClient.from(NOTES).update({ comment_text: text.trim(), highlight_color: color, updated_at: new Date().toISOString() }).eq("user_id", cloudUser.id).eq("id", noteId);
    if (q.error) return msg(q.error.message);
    editNoteId = "";
    await load({ keepScroll: true, focusNoteId: noteId });
    msg("Commento aggiornato");
  }

  async function deleteNote(noteId) {
    if (!isReady() || !noteId) return;
    const q = await supabaseClient.from(NOTES).delete().eq("user_id", cloudUser.id).eq("id", noteId);
    if (q.error) return msg(q.error.message);
    if (editNoteId === noteId) editNoteId = "";
    await load({ keepScroll: true });
    msg("Commento eliminato");
  }

  function openNotesAt(noteId, line) {
    notesOpen = true;
    editNoteId = "";
    const scrollTop = captureReaderScroll();
    render({ keepScroll: true, focusNoteId: noteId });
    restoreReaderScroll(scrollTop);
    if (line) scrollToLine(line);
  }

  function showTooltip(target, event) {
    const text = target?.dataset?.revTooltip;
    if (!text) return;
    hideTooltip();
    const tip = document.createElement("div");
    tip.id = "revisionTooltip";
    tip.className = "revision-tooltip";
    tip.textContent = text;
    document.body.appendChild(tip);
    moveTooltip(event);
  }

  function moveTooltip(event) {
    const tip = document.getElementById("revisionTooltip");
    if (!tip) return;
    tip.style.left = `${Math.min(event.clientX + 12, window.innerWidth - tip.offsetWidth - 12)}px`;
    tip.style.top = `${Math.min(event.clientY + 14, window.innerHeight - tip.offsetHeight - 12)}px`;
  }

  function hideTooltip() { document.getElementById("revisionTooltip")?.remove(); }

  document.addEventListener("click", e => {
    const insidePopup = e.target.closest?.("#revisionPopup");
    const insideReader = e.target.closest?.("#revisionReader");
    const isControl = e.target.closest?.('[data-screen="revisions"],[data-rev-doc]') || ["revisionUploadIcon", "revisionFile", "revisionDocSelect", "revisionRefresh", "revisionSaveNote", "revisionCancelNote", "revisionToggleNotes", "revisionCloseNotes"].includes(e.target.id) || e.target.closest?.("[data-rev-color],[data-rev-edit-color],[data-jump-revision-line],[data-edit-revision-note],[data-delete-revision-note],[data-save-revision-note],[data-cancel-edit-revision-note]");
    if (selInfo && !insidePopup && !insideReader && !isControl) closePopup();

    if (e.target.closest?.('[data-screen="revisions"]')) { currentScreen = "revisions"; document.querySelectorAll(".screen").forEach(x => x.classList.toggle("active", x.dataset.screenPanel === "revisions")); render(); load(); }
    if (e.target.id === "revisionUploadIcon") document.getElementById("revisionFile")?.click();
    if (e.target.id === "revisionRefresh") load({ keepScroll: true });
    if (e.target.id === "revisionToggleNotes") { notesOpen = !notesOpen; render({ keepScroll: true }); }
    if (e.target.id === "revisionCloseNotes") { notesOpen = false; render({ keepScroll: true }); }
    if (e.target.id === "revisionSaveNote") saveNote();
    if (e.target.id === "revisionCancelNote") closePopup();

    const textNote = e.target.closest?.("[data-rev-note-id]");
    if (textNote && textNote.closest("#revisionReader")) {
      const line = textNote.closest(".revision-line")?.dataset.line;
      openNotesAt(textNote.dataset.revNoteId, line);
    }

    const c = e.target.closest?.("[data-rev-color]");
    if (c) { const p = document.getElementById("revisionPopup"); if (p) p.dataset.color = c.dataset.revColor; p?.querySelectorAll("[data-rev-color]").forEach(b => b.classList.toggle("active", b === c)); }

    const editColor = e.target.closest?.("[data-rev-edit-color]");
    if (editColor) {
      const card = editColor.closest("[data-revision-note-id]");
      if (card) card.dataset.editColor = editColor.dataset.revEditColor;
      card?.querySelectorAll("[data-rev-edit-color]").forEach(b => b.classList.toggle("active", b === editColor));
    }

    const jump = e.target.closest?.("[data-jump-revision-line]");
    if (jump && !e.target.closest("button, textarea")) document.querySelector(`[data-line="${jump.dataset.jumpRevisionLine}"]`)?.scrollIntoView({ behavior:"smooth", block:"center" });

    const edit = e.target.closest?.("[data-edit-revision-note]");
    if (edit) { editNoteId = edit.dataset.editRevisionNote; render({ keepScroll: true, focusNoteId: editNoteId }); requestAnimationFrame(() => document.querySelector(`[data-edit-note-text="${CSS.escape(editNoteId)}"]`)?.focus()); }

    const del = e.target.closest?.("[data-delete-revision-note]");
    if (del) deleteNote(del.dataset.deleteRevisionNote);

    const save = e.target.closest?.("[data-save-revision-note]");
    if (save) updateNote(save.dataset.saveRevisionNote);

    const cancel = e.target.closest?.("[data-cancel-edit-revision-note]");
    if (cancel) { editNoteId = ""; render({ keepScroll: true, focusNoteId: cancel.dataset.cancelEditRevisionNote }); }
  }, true);

  document.addEventListener("change", e => {
    if (e.target.id === "revisionFile") importFile(e.target.files?.[0]);
    if (e.target.id === "revisionDocSelect") { openDocId = e.target.value; closePopup(); render(); }
  }, true);

  document.addEventListener("keydown", e => {
    const edit = e.target.closest?.("[data-edit-note-text]");
    if (edit && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); updateNote(edit.dataset.editNoteText); }
  }, true);

  document.addEventListener("mouseover", e => showTooltip(e.target.closest?.("[data-rev-tooltip]"), e), true);
  document.addEventListener("mousemove", moveTooltip, true);
  document.addEventListener("mouseout", e => { if (e.target.closest?.("[data-rev-tooltip]")) hideTooltip(); }, true);

  document.addEventListener("selectionchange", () => {
    if (currentScreen !== "revisions") return;
    const s = window.getSelection();
    if (!s || s.isCollapsed || !s.toString().trim()) return;
    if (!s.anchorNode?.parentElement?.closest?.("#revisionReader")) return;
    clearTimeout(openPopup.timer);
    openPopup.timer = setTimeout(() => { const i = selectionInfo(); if (i?.selected.trim()) openPopup(i); }, 250);
  });

  document.addEventListener("DOMContentLoaded", () => { style(); screen(); load(); });
  window.addEventListener("load", () => { style(); screen(); load(); });
  if (document.body) new MutationObserver(screen).observe(document.body, { childList:true, subtree:true });
})();
