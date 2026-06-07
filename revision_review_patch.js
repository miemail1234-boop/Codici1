(() => {
  const DOCS = "revision_documents";
  const NOTES = "revision_comments";
  let docs = [];
  let notes = [];
  let openDocId = "";
  let selInfo = null;
  let popupTimer = null;
  let notesOpen = false;

  const h = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[ch]));
  const isReady = () => typeof supabaseClient !== "undefined" && supabaseClient && typeof cloudUser !== "undefined" && cloudUser?.id;
  const msg = text => typeof toast === "function" ? toast(text) : console.log(text);
  const lines = text => String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  function style() {
    if (document.getElementById("rev-style")) return;
    const s = document.createElement("style");
    s.id = "rev-style";
    s.textContent = `.revision-layout{display:grid;grid-template-columns:240px minmax(0,1fr);gap:12px}.revision-layout .panel{margin-bottom:12px}.revision-list{display:flex;flex-direction:column;gap:8px;max-height:56vh;overflow:auto}.revision-doc{background:#fff;border:1px solid #ddd;border-radius:12px;padding:9px;text-align:left}.revision-doc.active{outline:2px solid #3e8f75}.revision-main-panel{min-height:78vh}.revision-reader{background:#fff;border:1px solid #ddd;border-radius:16px;height:calc(100vh - 245px);min-height:560px;overflow:auto;padding:12px;user-select:text;-webkit-user-select:text;font-size:15.5px;line-height:1.6}.revision-line{display:grid;grid-template-columns:48px minmax(0,1fr);gap:12px;border-bottom:1px solid #eee;padding:5px 7px}.revision-num{text-align:right;color:#888;user-select:none}.revision-text{white-space:pre-wrap;overflow-wrap:anywhere}.rev-yellow{background:rgba(255,222,89,.78);border-radius:3px}.rev-red{background:rgba(255,99,99,.48);border-radius:3px}.revision-popup{position:fixed;z-index:9999;background:#fff;border:1px solid #ccc;border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,.18);padding:10px;width:min(350px,calc(100vw - 24px))}.revision-popup textarea{width:100%;min-height:72px}.revision-notes-panel{max-height:42vh;overflow:auto}.revision-comment{background:#fff;border-left:4px solid #d8d6cf;border-radius:10px;padding:9px;margin:8px 0}.revision-comment.yellow{border-left-color:#e9c46a}.revision-comment.red{border-left-color:#e76f51}.revision-comment blockquote{margin:6px 0;padding-left:8px;border-left:2px solid #ddd;color:#333}.revision-top-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.revision-icon-button{border:1px solid #ddd;border-radius:999px;background:#fff;padding:8px 10px;cursor:pointer}.revision-icon-button.active{outline:2px solid #3e8f75}@media(max-width:900px){.revision-layout{grid-template-columns:1fr}.revision-reader{height:65vh;min-height:420px}}`;
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

  function markLine(text, n, list) {
    const parts = list
      .filter(x => Number(x.line_number) === n && (x.highlight_color === "yellow" || x.highlight_color === "red"))
      .map(x => ({ a: Number(x.start_offset), b: Number(x.end_offset), c: x.highlight_color }))
      .filter(x => x.a >= 0 && x.b > x.a && x.b <= text.length)
      .sort((x, y) => x.a - y.a);
    let out = "", i = 0;
    for (const p of parts) {
      if (p.a < i) continue;
      out += h(text.slice(i, p.a)) + `<mark class="rev-${p.c}">${h(text.slice(p.a, p.b))}</mark>`;
      i = p.b;
    }
    return out + h(text.slice(i)) || "&nbsp;";
  }

  function renderNotesPanel(activeNotes) {
    if (!notesOpen) return "";
    return `<div class="panel revision-notes-panel"><h2>Note</h2>${activeNotes.length ? activeNotes.map(n => `<article class="revision-comment ${n.highlight_color || 'none'}"><small>Riga ${n.line_number}${n.highlight_color && n.highlight_color !== 'none' ? ` · ${n.highlight_color}` : ''}</small><blockquote>${h(n.selected_text)}</blockquote><p>${h(n.comment_text || "Senza commento")}</p></article>`).join("") : "<p class='hint'>Nessuna nota aperta.</p>"}</div>`;
  }

  function render() {
    style();
    const p = screen();
    if (!p) return;
    const d = doc();
    const activeNotes = d ? docNotes(d.id) : [];
    p.innerHTML = `<div class="revision-layout"><aside><div class="panel"><h2>Correzione revisioni</h2><p class="hint">Testo non modificabile. Seleziona testo in una sola riga per commentare.</p>${isReady()?"":"<p class='hint'>Accedi a Supabase nella sezione Dati.</p>"}<div class="field"><label>File Word .docx</label><input id="revisionFile" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></div><div class="field"><label>Titolo</label><input id="revisionTitle" placeholder="Titolo facoltativo"></div><button class="primary" id="revisionImport">Importa documento</button></div><div class="panel"><h2>Documenti</h2><div class="revision-list">${docs.length?docs.map(x=>`<button class="revision-doc ${x.id===d?.id?"active":""}" data-rev-doc="${h(x.id)}"><strong>${h(x.title)}</strong><br><small>${h(x.original_filename||"")} · ${x.line_count||0} righe</small></button>`).join(""):"<p class='hint'>Nessun documento.</p>"}</div></div></aside><main><div class="panel revision-main-panel"><div class="section-head"><div><h2>${d?h(d.title):"Documento"}</h2><p class="hint">Il testo selezionato resta selezionato finché non clicchi altrove. Il testo viene evidenziato solo se scegli Giallo o Rosso nel box commento.</p></div><div class="revision-top-actions">${d?"<button class='secondary' id='revisionRefresh'>Aggiorna</button>":""}<button class="revision-icon-button ${notesOpen?"active":""}" id="revisionToggleNotes" title="Note">📝 Note (${activeNotes.length})</button></div></div>${d?`<div class="revision-reader" id="revisionReader">${lines(d.text_content).map((line,i)=>`<div class="revision-line" data-line="${i+1}"><span class="revision-num">${i+1}</span><span class="revision-text">${markLine(line,i+1,activeNotes)}</span></div>`).join("")}</div>`:"<p class='hint'>Carica o apri un documento.</p>"}</div>${renderNotesPanel(activeNotes)}</main></div>`;
  }

  async function load() {
    if (!isReady()) { render(); return; }
    const a = await supabaseClient.from(DOCS).select("*").eq("user_id", cloudUser.id).order("updated_at", { ascending:false });
    if (a.error) { msg(a.error.message); return; }
    docs = a.data || [];
    if (!openDocId && docs[0]) openDocId = docs[0].id;
    const b = await supabaseClient.from(NOTES).select("*").eq("user_id", cloudUser.id).order("created_at", { ascending:true });
    if (b.error) { msg(b.error.message); return; }
    notes = b.data || [];
    render();
  }

  async function importFile() {
    if (!isReady()) return msg("Accedi a Supabase nella sezione Dati");
    const file = document.getElementById("revisionFile")?.files?.[0];
    if (!file) return msg("Scegli un file .docx");
    if (!window.mammoth?.extractRawText) return msg("Parser Word non ancora caricato");
    const ab = await file.arrayBuffer();
    const res = await window.mammoth.extractRawText({ arrayBuffer: ab });
    const text = String(res.value || "").trimEnd();
    if (!text.trim()) return msg("Nessun testo leggibile");
    const title = document.getElementById("revisionTitle")?.value?.trim() || file.name.replace(/\.docx$/i, "");
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
    p.style.left = `${Math.min(Math.max(12, info.rect.left), window.innerWidth - 370)}px`;
    p.style.top = `${Math.min(Math.max(12, info.rect.bottom + 8), window.innerHeight - 235)}px`;
    p.innerHTML = `<small>Riga ${info.line}: ${h(info.selected.slice(0,80))}</small><textarea id="revisionCommentText" placeholder="Commento..."></textarea><div class="row-actions"><button class="chip active" data-rev-color="none">No evidenziazione</button><button class="chip" data-rev-color="yellow">Giallo</button><button class="chip" data-rev-color="red">Rosso</button><button class="primary" id="revisionSaveNote">Salva</button><button class="secondary" id="revisionCancelNote">Annulla</button></div>`;
    document.body.appendChild(p);
    const t = p.querySelector("textarea");
    popupTimer = setTimeout(() => { if (!t.value.trim()) closePopup(); }, 5000);
    t.addEventListener("input", () => { if (popupTimer) clearTimeout(popupTimer); popupTimer = null; });
  }

  async function saveNote() {
    const d = doc();
    if (!isReady() || !d || !selInfo) return;
    const pop = document.getElementById("revisionPopup");
    const row = { user_id: cloudUser.id, document_id: d.id, line_number: selInfo.line, line_text: selInfo.lineText, selected_text: selInfo.selected, start_offset: selInfo.start, end_offset: selInfo.end, highlight_color: pop?.dataset.color || "none", comment_text: document.getElementById("revisionCommentText")?.value?.trim() || "", status: "open", updated_at: new Date().toISOString() };
    const q = await supabaseClient.from(NOTES).insert(row);
    if (q.error) return msg(q.error.message);
    closePopup();
    window.getSelection()?.removeAllRanges();
    await load();
    msg("Commento salvato");
  }

  document.addEventListener("click", e => {
    const insidePopup = e.target.closest?.("#revisionPopup");
    const insideReader = e.target.closest?.("#revisionReader");
    const isControl = e.target.closest?.('[data-screen="revisions"],[data-rev-doc]') || ["revisionImport", "revisionRefresh", "revisionSaveNote", "revisionCancelNote", "revisionToggleNotes"].includes(e.target.id) || e.target.closest?.("[data-rev-color]");
    if (selInfo && !insidePopup && !insideReader && !isControl) closePopup();
    if (e.target.closest?.('[data-screen="revisions"]')) { currentScreen = "revisions"; document.querySelectorAll(".screen").forEach(x => x.classList.toggle("active", x.dataset.screenPanel === "revisions")); render(); load(); }
    const d = e.target.closest?.("[data-rev-doc]"); if (d) { closePopup(); openDocId = d.dataset.revDoc; render(); }
    if (e.target.id === "revisionImport") importFile();
    if (e.target.id === "revisionRefresh") load();
    if (e.target.id === "revisionToggleNotes") { notesOpen = !notesOpen; render(); }
    if (e.target.id === "revisionSaveNote") saveNote();
    if (e.target.id === "revisionCancelNote") closePopup();
    const c = e.target.closest?.("[data-rev-color]"); if (c) { const p = document.getElementById("revisionPopup"); if (p) p.dataset.color = c.dataset.revColor; p?.querySelectorAll("[data-rev-color]").forEach(b => b.classList.toggle("active", b === c)); }
  }, true);

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
