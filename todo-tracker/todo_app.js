(() => {
  const SUPABASE_URL = "https://kujyowhezihjambhpahe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3";
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const $ = id => document.getElementById(id);
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const safe = value => String(value ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));

  let userId = "";
  let items = [];
  let draggedId = "";
  let pointerDrag = null;
  let pendingDrag = null;

  const labels = { today: "Oggi", urgent: "Urgente", later: "Più avanti", done: "Completati" };
  const listTargets = { today: "todayList", urgent: "urgentList", later: "laterList", done: "doneList" };
  const DRAG_THRESHOLD = 8;
  const LONG_PRESS_MS = 260;

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
    const due = item.due_date ? `<div class="small">Scadenza ${safe(item.due_date)}</div>` : "";
    return `<div class="todo ${item.completed ? "done" : ""}" data-item="${safe(item.id)}" aria-grabbed="false">
      <button class="delete-mini" data-delete="${safe(item.id)}" title="Elimina" aria-label="Elimina task">×</button>
      <div class="todo-title"><input type="checkbox" data-toggle="${safe(item.id)}" ${item.completed ? "checked" : ""}><div class="todo-main"><input class="task-title-input" data-title-input="${safe(item.id)}" data-original-title="${safe(item.title)}" value="${safe(item.title)}" aria-label="Titolo task">${due}${item.note ? `<p class="small">${safe(item.note)}</p>` : ""}</div></div>
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
    $("taskTitle").value = "";
    $("taskList").value = "today";
    $("taskDue").value = "";
    $("taskNote").value = "";
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
      id: uid("todo"),
      title,
      list,
      completed: list === "done",
      note: $("taskNote").value || "",
      due_date: $("taskDue").value || null,
      sort_order: items.filter(item => item.list === list).length + 1,
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

  async function saveTitle(id, title) {
    const item = items.find(row => row.id === id);
    const cleanTitle = title.trim();
    if (!item || !cleanTitle || cleanTitle === item.title) return;
    const now = new Date().toISOString();
    const result = await client.from("todo_standalone_items").update({ title: cleanTitle, updated_at: now }).eq("user_id", userId).eq("id", id);
    if (result.error) {
      console.error(result.error);
      toast("Errore modifica task");
      await loadCloud();
      return;
    }
    item.title = cleanTitle;
    item.updated_at = now;
    toast("Task modificato");
  }

  async function finishTitleInput(input, save = true) {
    const id = input?.dataset?.titleInput;
    if (!id) return;
    const original = input.dataset.originalTitle || "";
    const value = save ? input.value.trim() : original;
    if (!value) {
      input.value = original;
      toast("Titolo non vuoto");
      return;
    }
    input.value = value;
    input.dataset.originalTitle = value;
    await saveTitle(id, value);
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

  function clearPendingDrag() {
    if (pendingDrag?.timer) clearTimeout(pendingDrag.timer);
    pendingDrag = null;
  }

  function beginDrag(candidate) {
    if (!candidate || pointerDrag) return;
    clearPendingDrag();
    draggedId = candidate.id;
    pointerDrag = { id: candidate.id, card: candidate.card };
    candidate.card.classList.add("dragging");
    candidate.card.setAttribute("aria-grabbed", "true");
    markDropPosition(candidate.x, candidate.y, candidate.id);
  }

  function finishPointerDrag(event, cancelled = false) {
    clearPendingDrag();
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

  document.addEventListener("focusout", event => {
    const input = event.target.closest("[data-title-input]");
    if (input) finishTitleInput(input, true);
  });

  document.addEventListener("keydown", event => {
    const input = event.target.closest("[data-title-input]");
    if (!input) return;
    if (event.key === "Enter") {
      event.preventDefault();
      input.blur();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      input.value = input.dataset.originalTitle || "";
      input.blur();
    }
  });

  document.addEventListener("change", event => {
    const titleInput = event.target.closest("[data-title-input]");
    if (titleInput) {
      finishTitleInput(titleInput, true);
      return;
    }
    const toggle = event.target.dataset.toggle;
    if (toggle) toggleItem(toggle, event.target.checked);
  });

  document.addEventListener("pointerdown", event => {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target.closest("button,input,select,textarea,a")) return;
    const card = event.target.closest("[data-item]");
    if (!card) return;
    const id = card.dataset.item || "";
    pendingDrag = {
      id,
      card,
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
      timer: setTimeout(() => beginDrag(pendingDrag), LONG_PRESS_MS)
    };
    card.setPointerCapture?.(event.pointerId);
  });

  document.addEventListener("pointermove", event => {
    if (pendingDrag && pendingDrag.pointerId === event.pointerId) {
      const dx = Math.abs(event.clientX - pendingDrag.x);
      const dy = Math.abs(event.clientY - pendingDrag.y);
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) beginDrag(pendingDrag);
    }
    if (!pointerDrag) return;
    event.preventDefault();
    markDropPosition(event.clientX, event.clientY, pointerDrag.id);
  }, { passive: false });

  document.addEventListener("pointerup", event => finishPointerDrag(event));
  document.addEventListener("pointercancel", event => finishPointerDrag(event, true));

  $("addBtn").addEventListener("click", addOrUpdate);
  $("taskTitle").addEventListener("keydown", event => {
    if (event.key === "Enter") addOrUpdate();
  });
  $("reloadBtn").addEventListener("click", loadCloud);
  loadCloud();
})();