(() => {
  const SUPABASE_URL = "https://kujyowhezihjambhpahe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3";
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const $ = id => document.getElementById(id);
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const safe = value => String(value ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));

  let userId = "";
  let items = [];
  let editingId = "";
  let inlineEditingId = "";
  let draggedId = "";
  let pointerDrag = null;

  const labels = { today: "Oggi", urgent: "Urgente", later: "Più avanti", done: "Completati" };
  const listTargets = { today: "todayList", urgent: "urgentList", later: "laterList", done: "doneList" };

  function toast(message) {
    const node = $("toast");
    node.textContent = message;
    node.classList.add("show");
    setTimeout(() => node.classList.remove("show"), 2200);
  }

  function sorted(list) {
    return items
      .filter(item => item.list === list)
      .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1) || Number(a.sort_order || 0) - Number(b.sort_order || 0) || String(a.created_at || "").localeCompare(String(b.created_at || "")));
  }

  function renderSummary() {
    const counts = ["today", "urgent", "later", "done"].map(list => `<span class="chip">${labels[list]}: ${items.filter(item => item.list === list).length}</span>`);
    $("summary").innerHTML = counts.join("");
  }

  function itemHtml(item) {
    const due = item.due_date ? ` · scadenza ${safe(item.due_date)}` : "";
    return `<div class="todo ${item.completed ? "done" : ""}" data-item="${safe(item.id)}" draggable="true" aria-grabbed="false">
      <div class="todo-title"><span class="drag-handle" title="Trascina per spostare o riordinare" aria-hidden="true">☰</span><input type="checkbox" data-toggle="${safe(item.id)}" ${item.completed ? "checked" : ""}><div class="todo-main"><strong class="task-text" data-title-id="${safe(item.id)}" title="Doppio clic per modificare">${safe(item.title)}</strong><div class="small">${safe(labels[item.list] || item.list)}${due}</div>${item.note ? `<p class="small">${safe(item.note)}</p>` : ""}</div></div>
      <div class="actions" style="margin-top:10px"><button class="btn danger" data-delete="${safe(item.id)}">Elimina</button></div>
    </div>`;
  }

  function renderList(list, targetId) {
    const rows = sorted(list);
    const target = $(targetId);
    target.classList.add("drop-list");
    target.dataset.dropList = list;
    target.innerHTML = rows.length ? rows.map(itemHtml).join("") : `<p class="small empty-drop">Trascina qui un task.</p>`;
  }

  function render() {
    renderSummary();
    renderList("today", "todayList");
    renderList("urgent", "urgentList");
    renderList("later", "laterList");
    renderList("done", "doneList");
    $("addBtn").textContent = editingId ? "Salva modifica" : "Aggiungi";
  }

  async function loadCloud() {
    const auth = await client.auth.getSession();
    const session = auth.data.session;
    if (!session) {
      $("authBox").innerHTML = "Non risulti collegato a Supabase. Apri prima la Life Tracker e fai login da Dati → Cloud Supabase.";
      return;
    }
    userId = session.user.id;
    $("authBox").classList.add("hidden");
    $("app").classList.remove("hidden");
    const result = await client.from("todo_standalone_items").select("*").eq("user_id", userId).order("sort_order", { ascending: true });
    if (result.error) {
      console.error(result.error);
      toast("Errore lettura todo");
      return;
    }
    items = result.data || [];
    render();
    toast("Todo caricati");
  }

  function clearForm() {
    editingId = "";
    $("taskTitle").value = "";
    $("taskList").value = "today";
    $("taskDue").value = "";
    $("taskNote").value = "";
    render();
  }

  async function addOrUpdate() {
    const title = $("taskTitle").value.trim();
    if (!title) {
      toast("Inserisci un titolo");
      return;
    }
    const list = $("taskList").value || "today";
    const row = {
      user_id: userId,
      id: editingId || uid("todo"),
      title,
      list,
      completed: list === "done",
      note: $("taskNote").value || "",
      due_date: $("taskDue").value || null,
      sort_order: editingId ? (items.find(item => item.id === editingId)?.sort_order || 0) : items.filter(item => item.list === list).length + 1,
      updated_at: new Date().toISOString(),
      completed_at: list === "done" ? new Date().toISOString() : null,
    };
    const result = await client.from("todo_standalone_items").upsert(row, { onConflict: "user_id,id" });
    if (result.error) {
      console.error(result.error);
      toast("Errore salvataggio task");
      return;
    }
    clearForm();
    await loadCloud();
    toast("Task salvato");
  }

  async function saveInlineTitle(id, title) {
    const item = items.find(row => row.id === id);
    const cleanTitle = title.trim();
    if (!item || !cleanTitle || cleanTitle === item.title) return;
    const result = await client.from("todo_standalone_items").update({ title: cleanTitle, updated_at: new Date().toISOString() }).eq("user_id", userId).eq("id", id);
    if (result.error) {
      console.error(result.error);
      toast("Errore modifica task");
      await loadCloud();
      return;
    }
    item.title = cleanTitle;
    item.updated_at = new Date().toISOString();
    toast("Task modificato");
  }

  function startInlineEdit(node) {
    const id = node.dataset.titleId;
    const item = items.find(row => row.id === id);
    if (!item || inlineEditingId) return;
    inlineEditingId = id;
    const input = document.createElement("input");
    input.className = "inline-title-input";
    input.value = item.title || "";
    input.dataset.inlineEdit = id;
    input.dataset.originalTitle = item.title || "";
    node.replaceWith(input);
    input.focus();
    input.select();
  }

  async function finishInlineEdit(input, save = true) {
    if (!input?.dataset?.inlineEdit) return;
    const id = input.dataset.inlineEdit;
    const original = input.dataset.originalTitle || "";
    const value = save ? input.value.trim() : original;
    inlineEditingId = "";
    await saveInlineTitle(id, value || original);
    render();
  }

  function draggedCard() {
    return draggedId ? document.querySelector(`[data-item="${CSS.escape(draggedId)}"]`) : null;
  }

  function elementsAtPoint(x, y) {
    if (document.elementsFromPoint) return document.elementsFromPoint(x, y);
    const element = document.elementFromPoint(x, y);
    return element ? [element] : [];
  }

  function dropListFromPoint(x, y) {
    const activeCard = draggedCard();
    for (const element of elementsAtPoint(x, y)) {
      if (!element?.closest) continue;
      if (activeCard && (element === activeCard || activeCard.contains(element))) continue;
      const list = element.closest("[data-drop-list]");
      if (list) return list;
    }
    return null;
  }

  function beforeIdFromPoint(x, y, dragged) {
    const targetList = dropListFromPoint(x, y);
    if (!targetList) return "";
    const cards = [...targetList.querySelectorAll("[data-item]")].filter(card => card.dataset.item !== dragged);
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      if (y < rect.top + rect.height / 2) return card.dataset.item || "";
    }
    return "";
  }

  async function persistMove(id, targetList, beforeId = "") {
    const moving = items.find(row => row.id === id);
    if (!moving || !labels[targetList]) return;

    const completed = targetList === "done";
    const now = new Date().toISOString();
    const targetRows = sorted(targetList).filter(row => row.id !== id);
    const insertAt = beforeId ? targetRows.findIndex(row => row.id === beforeId) : targetRows.length;
    const normalizedInsertAt = insertAt < 0 ? targetRows.length : insertAt;
    const movedRow = { ...moving, list: targetList, completed, completed_at: completed ? now : null, updated_at: now };
    const ordered = [...targetRows];
    ordered.splice(normalizedInsertAt, 0, movedRow);

    if (moving.list === targetList) {
      const currentOrder = sorted(targetList).map(row => row.id).join("|");
      const nextOrder = ordered.map(row => row.id).join("|");
      if (currentOrder === nextOrder) return;
    }

    const updates = ordered.map((row, index) => client.from("todo_standalone_items").update({
      list: targetList,
      completed,
      sort_order: index + 1,
      completed_at: completed ? (row.completed_at || now) : null,
      updated_at: row.id === id ? now : (row.updated_at || now)
    }).eq("user_id", userId).eq("id", row.id));

    const results = await Promise.all(updates);
    const error = results.find(result => result.error)?.error;
    if (error) {
      console.error(error);
      toast("Errore ordinamento task");
      await loadCloud();
      return;
    }
    await loadCloud();
    toast(moving.list === targetList ? "Ordine aggiornato" : `Task spostato in ${labels[targetList]}`);
  }

  async function toggleItem(id, checked) {
    await persistMove(id, checked ? "done" : "today");
  }

  async function deleteItem(id) {
    const item = items.find(row => row.id === id);
    if (!item || !confirm(`Eliminare “${item.title}”?`)) return;
    const result = await client.from("todo_standalone_items").delete().eq("user_id", userId).eq("id", id);
    if (result.error) {
      console.error(result.error);
      toast("Errore eliminazione task");
      return;
    }
    await loadCloud();
    toast("Task eliminato");
  }

  function clearDropState() {
    Object.values(listTargets).forEach(id => $(id)?.classList.remove("drop-over"));
    document.querySelectorAll(".drop-before").forEach(node => node.classList.remove("drop-before"));
  }

  function markDropPosition(x, y, id) {
    clearDropState();
    const target = dropListFromPoint(x, y);
    if (!target) return;
    target.classList.add("drop-over");
    const beforeId = beforeIdFromPoint(x, y, id);
    if (beforeId) target.querySelector(`[data-item="${CSS.escape(beforeId)}"]`)?.classList.add("drop-before");
  }

  function finishPointerDrag(event, cancelled = false) {
    if (!pointerDrag) return;
    const { id, card } = pointerDrag;
    const target = cancelled ? null : dropListFromPoint(event.clientX, event.clientY);
    const beforeId = cancelled ? "" : beforeIdFromPoint(event.clientX, event.clientY, id);
    card.classList.remove("dragging");
    card.setAttribute("aria-grabbed", "false");
    draggedId = "";
    pointerDrag = null;
    clearDropState();
    if (target) persistMove(id, target.dataset.dropList, beforeId);
  }

  document.addEventListener("click", event => {
    const del = event.target.dataset.delete;
    if (del) deleteItem(del);
  });

  document.addEventListener("dblclick", event => {
    const title = event.target.closest("[data-title-id]");
    if (title) startInlineEdit(title);
  });

  document.addEventListener("focusout", event => {
    const input = event.target.closest("[data-inline-edit]");
    if (input) finishInlineEdit(input, true);
  });

  document.addEventListener("keydown", event => {
    const input = event.target.closest("[data-inline-edit]");
    if (!input) return;
    if (event.key === "Enter") {
      event.preventDefault();
      input.blur();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      finishInlineEdit(input, false);
    }
  });

  document.addEventListener("change", event => {
    const toggle = event.target.dataset.toggle;
    if (toggle) toggleItem(toggle, event.target.checked);
  });

  document.addEventListener("pointerdown", event => {
    const handle = event.target.closest(".drag-handle");
    const card = event.target.closest("[data-item]");
    if (!handle || !card) return;
    draggedId = card.dataset.item || "";
    pointerDrag = { id: draggedId, card };
    card.classList.add("dragging");
    card.setAttribute("aria-grabbed", "true");
    handle.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  document.addEventListener("pointermove", event => {
    if (!pointerDrag) return;
    event.preventDefault();
    markDropPosition(event.clientX, event.clientY, pointerDrag.id);
  }, { passive: false });

  document.addEventListener("pointerup", event => finishPointerDrag(event));
  document.addEventListener("pointercancel", event => finishPointerDrag(event, true));

  document.addEventListener("dragstart", event => {
    const card = event.target.closest("[data-item]");
    if (!card || event.target.closest("button,input,select,textarea,a")) return;
    draggedId = card.dataset.item || "";
    card.classList.add("dragging");
    card.setAttribute("aria-grabbed", "true");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggedId);
  });

  document.addEventListener("dragend", event => {
    event.target.closest("[data-item]")?.classList.remove("dragging");
    event.target.closest("[data-item]")?.setAttribute("aria-grabbed", "false");
    draggedId = "";
    clearDropState();
  });

  document.addEventListener("dragover", event => {
    const target = event.target.closest("[data-drop-list]");
    if (!target || !draggedId) return;
    event.preventDefault();
    markDropPosition(event.clientX, event.clientY, draggedId);
    event.dataTransfer.dropEffect = "move";
  });

  document.addEventListener("dragleave", event => {
    const target = event.target.closest("[data-drop-list]");
    if (target && !target.contains(event.relatedTarget)) clearDropState();
  });

  document.addEventListener("drop", event => {
    const target = event.target.closest("[data-drop-list]") || dropListFromPoint(event.clientX, event.clientY);
    const id = event.dataTransfer.getData("text/plain") || draggedId;
    if (!target || !id) return;
    const beforeId = beforeIdFromPoint(event.clientX, event.clientY, id);
    event.preventDefault();
    clearDropState();
    persistMove(id, target.dataset.dropList, beforeId);
  });

  $("addBtn").addEventListener("click", addOrUpdate);
  $("taskTitle").addEventListener("keydown", event => {
    if (event.key === "Enter") addOrUpdate();
  });
  $("reloadBtn").addEventListener("click", loadCloud);
  loadCloud();
})();