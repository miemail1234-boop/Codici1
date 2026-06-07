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
    if (document.getElementById("rev-style-v3")) return;
    document.getElementById("rev-style")?.remove();
    const s = document.createElement("style");
    s.id = "rev-style-v3";
    s.textContent = `
      #screen-revisions { padding-bottom: 24px; }
      .revision-full { width: min(100%, 1500px); margin: 0 auto; }
      .revision-toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:12px; }
      .revision-toolbar-left, .revision-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
      .revision-icon-button { border:1px solid rgba(16,24,32,.16); border-radius:999px; background:#fff; padding:8px 12px; cursor:pointer; font-weight:700; }
      .revision-icon-button.active { outline:2px solid #3e8f75; }
      .revision-doc-select { min-width:min(430px, 100%); max-width:100%; }
      .revision-main-panel { min-height:82vh; }
      .revision-reader { background:#fff; border:1px solid #ddd; border-radius:16px; height:calc(100vh - 205px); min-height:650px; overflow:auto; padding:14px; user-select:text; -webkit-user-select:text; font-size:16px; line-height:1.68; }
      .revision-line { display:grid; grid-template-columns:50px minmax(0,1fr); gap:13px; border-bottom:1px solid #eee; padding:5px 8px; }
      .revision-num { text-align:right; color:#888; user-select:none; font-variant-numeric:tabular-nums; }
      .revision-text { white-space:pre-wrap; overflow-wrap:anywhere; }
      .rev-note-target { border-bottom:1px dotted rgba(16,24,32,.55); cursor:help; }
      .rev-yellow { background:rgba(255,222,89,.78); border-radius:3px; cursor:help; }
      .rev-red { background:rgba(255,99,99,.48); border-radius:3px; cursor:help; }
      .revision-popup { position:fixed; z-index:9999; background:#fff; border:1px solid #ccc; border-radius:14px; box-shadow:0 12px 30px rgba(0,0,0,.18); padding:10px; width:min(360px,calc(100vw - 24px)); }
      .revision-popup textarea { width:100%; min-height:74px; }
      .revision-notes-drawer { position:fixed; z-index:9998; top:70px; right:14px; bottom:14px; width:min(430px, calc(100vw - 28px)); background:#fff; border:1px solid rgba(16,24,32,.16); border-radius:18px; box-shadow:0 18px 50px rgba(0,0,0,.20); padding:14px; overflow:auto; }
      .revision-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }
      .revision-comment { background:#fff; border-left:4px solid #d8d6cf; border-radius:10px; padding:9px; margin:8px 0; box-shadow:0 1px 5px rgba(0,0,0,.05); cursor:pointer; }
      .revision-comment.yellow { border-left-color:#e9c46a; }
      .revision-comment.red { border-left-color:#e76f51; }
      .revision-comment blockquote { margin:6px 0; padding-left:8px; border-left:2px solid #ddd; color:#333; }
      .revision-comment small { color:#666; }
      .revision-tooltip { position:fixed; z-index:10000; max-width:360px; background:#101820; color:#fff; border-radius:10px; padding:8px 10px; box-shadow:0 8px 22px rgba(0,0,0,.2); font-size:13px; line-height:1.4; pointer-events:none; white-space:pre-wrap; }
      @media(max-width:900px){ .revision-reader{height:68vh;min-height:460px;font-size:15px}.revision-doc-select{min-width:100%}.revision-toolbar{align-items:stretch}.revision-toolbar-left,.revision-toolbar-right{width:100%}.revision-icon-button{flex:1}.revision-notes-drawer{top:60px;right:8px;bottom:8px;width:calc(100vw - 16px)} }
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

  function markLine(text, n, list) {
    const parts = list
      .filter(x => Number(x.line_number) === n)
      .map(x => ({ a: Number(x.start_offset), b: Number(x.end_offset), color: x.highlight_color, comment: x.comment_text || "Senza commento" }))
      .filter(x => x.a >= 0 && x.b > x.a && x.b <= text.length)
      .sort((x, y) => x.a - y.a);
    let out = "", i = 0;
    for (const p of parts) {
      if (p.a < i) continue;
      const cls = p.color === "yellow" ? "rev-yellow" : p.color === "red" ? "rev-red" : "rev-note-target";
      out += h(text.slice(i, p.a));
      out += `<span class="${cls}" data-rev-tooltip="${h(`Riga ${n}\n${p.comment}`)}">${h(text.slice(p.a, p.b))}</span>`;
      i = p.b;
    }
    return out + h(text.slice(i)) || "&nbsp;";
  }

  function renderNotesDrawer(activeNotes) {
    if (!notesOpen) return "";
    return `<aside class="revision-notes-drawer" id="revisionNotesDrawer"><div class="revision-drawer-head"><div><h2>Note</h2><p class="hint">Parti selezionate e commenti.</p></div><button class="secondary" id="revisionCloseNotes">Chiudi</button></div>${activeNotes.length ? activeNotes.map(n => `<article class="revision-comment ${n.highlight_color || 'none'}" data-jump-revision-line="${Number(n.line_number)}"><small>Riga ${n.line_number}${n.highlight_color && n.highlight_color !== 'none' ? ` · ${n.highlight_color}` : ''}</small><blockquote>${h(n.selected_text)}</blockquote><p>${h(n.comment_text || "Senza commento")}</p></article>`).join("") : "<p class='hint'>Nessuna nota aperta.</p>"}</aside>`;
  }

  function render() {
    style();
    const p = screen();
    if (!p) return;
    const d = doc();
    const activeNotes = d ? docNotes(d.id) : [];
    const select = `<select class="revision-doc-select" id="revisionDocSelect">${docs.length ? docs.map(x => `<option value="${h(x.id)}" ${x.id === d?.id ? "selected" : ""}>${h(x.title)} · ${x.line_count || 0} righe</option>`).join("") : `<option>Nessun documento</option>`}</select>`;
    p.innerHTML = `<div class="revision-full"><div class="panel revision-main-panel"><div class="revision-toolbar"><div class="revision-toolbar-left"><h2>Correzione revisioni</h2>${select}</div><div class="revision-toolbar-right"><input id="revisionFile" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden><button class="revision-icon-button" id="revisionUploadIcon" title="Carica Word">📄 Carica</button>${d ? "<button class='revision-icon-button' id='revisionRefresh' title='Aggiorna'>↻</button>" : ""}<button class="revision-icon-button ${notesOpen ? "active" : ""}" id="revisionToggleNotes" title="Note">📝 Note (${activeNotes.length})</button></div></div><p class="hint">Testo non modificabile. Seleziona testo in una sola riga per commentare. Il commento compare passando il mouse sulle parti commentate.</p>${d ? `<div class="revision-reader" id="revisionReader">${lines(d.text_content).map((line,i)=>`<div class="revision-line" data-line="${i+1}"><span class="revision-num">${i+1}</span><span class="revision-text">${markLine(line,i+1,activeNotes)}</span></div>`).join("")}</div>` : `<p class="hint">Carica un documento Word con l'icona 📄.</p>`}</div>${renderNotesDrawer(activeNotes)}</div>`;
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
    p.style.left = `${Math.min(Math.max(12, info.rect.left), window.innerWidth - 380)}px`;
    p.style.top = `${Math.min(Math.max(12, info.rect.bottom + 8), window.innerHeight - 240)}px`;
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
    const isControl = e.target.closest?.('[data-screen="revisions"],[data-rev-doc]') || ["revisionUploadIcon", "revisionFile", "revisionDocSelect", "revisionRefresh", "revisionSaveNote", "revisionCancelNote", "revisionToggleNotes", "revisionCloseNotes"].includes(e.target.id) || e.target.closest?.("[data-rev-color],[data-jump-revision-line]");
    if (selInfo && !insidePopup && !insideReader && !isControl) closePopup();
    if (e.target.closest?.('[data-screen="revisions"]')) { currentScreen = "revisions"; document.querySelectorAll(".screen").forEach(x => x.classList.toggle("active", x.dataset.screenPanel === "revisions")); render(); load(); }
    if (e.target.id === "revisionUploadIcon") document.getElementById("revisionFile")?.click();
    if (e.target.id === "revisionRefresh") load();
    if (e.target.id === "revisionToggleNotes") { notesOpen = !notesOpen; render(); }
    if (e.target.id === "revisionCloseNotes") { notesOpen = false; render(); }
    if (e.target.id === "revisionSaveNote") saveNote();
    if (e.target.id === "revisionCancelNote") closePopup();
    const c = e.target.closest?.("[data-rev-color]"); if (c) { const p = document.getElementById("revisionPopup"); if (p) p.dataset.color = c.dataset.revColor; p?.querySelectorAll("[data-rev-color]").forEach(b => b.classList.toggle("active", b === c)); }
    const jump = e.target.closest?.("[data-jump-revision-line]"); if (jump) document.querySelector(`[data-line="${jump.dataset.jumpRevisionLine}"]`)?.scrollIntoView({ behavior:"smooth", block:"center" });
  }, true);

  document.addEventListener("change", e => {
    if (e.target.id === "revisionFile") importFile(e.target.files?.[0]);
    if (e.target.id === "revisionDocSelect") { openDocId = e.target.value; closePopup(); render(); }
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
