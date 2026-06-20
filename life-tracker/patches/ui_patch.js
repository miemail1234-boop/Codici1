(() => {
  const UNDO_ID = "undoInvestmentChange";
  const REDO_ID = "redoInvestmentChange";

  function topActions() {
    return document.querySelector(".top-actions");
  }

  function findTopButton(id) {
    return Array.from(document.querySelectorAll(`#${id}`)).find(button => button.closest(".top-actions"));
  }

  function ensureButton(id, label, className, afterElement) {
    const actions = topActions();
    if (!actions) return null;
    let button = findTopButton(id);
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.id = id;
      button.className = `secondary ${className}`;
      button.textContent = label;
      button.disabled = true;
      if (afterElement && afterElement.parentElement === actions) {
        afterElement.insertAdjacentElement("afterend", button);
      } else {
        actions.appendChild(button);
      }
    }
    return button;
  }

  function removeSectionCopies(id, keepButton) {
    Array.from(document.querySelectorAll(`#${id}`))
      .filter(button => button !== keepButton && !button.closest(".top-actions"))
      .forEach(button => {
        const wrapper = button.closest(".row-actions");
        button.remove();
        if (wrapper && !wrapper.querySelector("button")) wrapper.remove();
      });
  }

  function syncInvestmentUndoRedoTopbar() {
    const actions = topActions();
    if (!actions) return;

    const syncButton = document.getElementById("cloudSyncQuick");
    const exportButton = document.getElementById("exportQuick");
    const undoTop = ensureButton(UNDO_ID, "Annulla", "top-investment-undo", syncButton);
    const redoTop = ensureButton(REDO_ID, "Ripeti", "top-investment-redo", undoTop);
    if (!undoTop || !redoTop) return;

    const undoSection = Array.from(document.querySelectorAll(`#${UNDO_ID}`))
      .find(button => button !== undoTop && !button.closest(".top-actions"));
    const redoSection = Array.from(document.querySelectorAll(`#${REDO_ID}`))
      .find(button => button !== redoTop && !button.closest(".top-actions"));

    if (undoSection) undoTop.disabled = undoSection.disabled;
    if (redoSection) redoTop.disabled = redoSection.disabled;

    if (syncButton && undoTop.previousElementSibling !== syncButton) {
      syncButton.insertAdjacentElement("afterend", undoTop);
    }
    if (undoTop && redoTop.previousElementSibling !== undoTop) {
      undoTop.insertAdjacentElement("afterend", redoTop);
    }
    if (exportButton && exportButton.previousElementSibling !== redoTop) {
      redoTop.insertAdjacentElement("afterend", exportButton);
    }

    removeSectionCopies(UNDO_ID, undoTop);
    removeSectionCopies(REDO_ID, redoTop);
  }

  function canUseTodoInternals() {
    return typeof state !== "undefined" &&
      typeof rememberTodoUndo === "function" &&
      typeof autosaveTodos === "function" &&
      Array.isArray(state.todos);
  }

  function activeTodoItemsForList(listId) {
    if (!canUseTodoInternals()) return [];
    return state.todos
      .filter(todo => !todo.completed && todo.list === listId)
      .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
  }

  function stampTodoOrder(listId, orderedIds) {
    if (!canUseTodoInternals()) return;
    const base = Date.UTC(2020, 0, 1);
    const listOffset = ["today", "urgent", "later"].indexOf(listId);
    const start = base + Math.max(listOffset, 0) * 100000000;
    orderedIds.forEach((id, index) => {
      const todo = state.todos.find(item => item.id === id);
      if (!todo) return;
      todo.list = listId;
      todo.createdAt = new Date(start + index * 1000).toISOString();
      todo.updatedAt = new Date().toISOString();
    });
  }

  function reorderTodo(dragId, targetListId, targetId = "", insertAfter = false) {
    if (!canUseTodoInternals() || !dragId || !targetListId) return false;
    const dragged = state.todos.find(todo => todo.id === dragId && !todo.completed);
    if (!dragged) return false;

    const sourceListId = dragged.list;
    const sourceIds = activeTodoItemsForList(sourceListId).map(todo => todo.id).filter(id => id !== dragId);
    const targetIds = sourceListId === targetListId
      ? [...sourceIds]
      : activeTodoItemsForList(targetListId).map(todo => todo.id).filter(id => id !== dragId);

    let insertAt = targetIds.length;
    if (targetId && targetId !== dragId) {
      const targetIndex = targetIds.indexOf(targetId);
      if (targetIndex >= 0) insertAt = targetIndex + (insertAfter ? 1 : 0);
    }
    targetIds.splice(insertAt, 0, dragId);

    rememberTodoUndo();
    if (sourceListId !== targetListId) stampTodoOrder(sourceListId, sourceIds);
    stampTodoOrder(targetListId, targetIds);
    autosaveTodos(sourceListId === targetListId ? "Ordine aggiornato" : "Elemento spostato");
    if (typeof switchScreen === "function") switchScreen("todo");
    return true;
  }

  function editTodoTitle(todoId) {
    if (!canUseTodoInternals() || !todoId) return;
    const todo = state.todos.find(item => item.id === todoId);
    if (!todo) return;
    const nextTitle = window.prompt("Modifica task", todo.title || "");
    if (nextTitle === null) return;
    const cleanTitle = nextTitle.trim();
    if (!cleanTitle) {
      if (typeof toast === "function") toast("Il testo del task non può essere vuoto");
      return;
    }
    if (cleanTitle === todo.title) return;
    rememberTodoUndo();
    todo.title = cleanTitle;
    todo.updatedAt = new Date().toISOString();
    autosaveTodos("Task modificato");
    if (typeof switchScreen === "function") switchScreen("todo");
  }

  function injectTodoStyle() {
    if (document.getElementById("todo-enhancement-style")) return;
    const style = document.createElement("style");
    style.id = "todo-enhancement-style";
    style.textContent = `
      .todo-board, .todo-column, .todo-items, .todo-card { touch-action: pan-y; }
      .todo-column { overscroll-behavior: contain; }
      .todo-items { -webkit-overflow-scrolling: touch; }
      .todo-card { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; align-items: center; gap: 8px; }
      .todo-card p { min-width: 0; overflow-wrap: anywhere; }
      .todo-edit-btn, .todo-drag-handle { touch-action: none; }
      .todo-edit-btn { border: 0; border-radius: 999px; padding: 6px 8px; font-weight: 800; cursor: pointer; background: var(--surface-soft, #eef2ec); color: inherit; }
      .todo-drag-handle { cursor: grab; user-select: none; }
      .todo-card.todo-drop-before { box-shadow: inset 0 3px 0 rgba(61,150,120,.9); }
      .todo-card.todo-drop-after { box-shadow: inset 0 -3px 0 rgba(61,150,120,.9); }
      .todo-column.drag-over { outline: 2px dashed rgba(61,150,120,.65); outline-offset: 4px; }
      body.todo-dragging { cursor: grabbing; }
    `;
    document.head.appendChild(style);
  }

  function enhanceTodoCards() {
    injectTodoStyle();
    document.querySelectorAll(".todo-card[data-todo-id]").forEach(card => {
      card.setAttribute("draggable", "false");
      if (!card.querySelector("[data-edit-todo]")) {
        const title = card.querySelector("p")?.textContent?.trim() || "task";
        const button = document.createElement("button");
        button.type = "button";
        button.className = "todo-edit-btn";
        button.dataset.editTodo = card.dataset.todoId;
        button.setAttribute("aria-label", `Modifica ${title}`);
        button.textContent = "Modifica";
        const handle = card.querySelector("[data-todo-drag]");
        if (handle) card.insertBefore(button, handle);
        else card.appendChild(button);
      }
    });
  }

  function clearTodoPatchHighlights() {
    document.querySelectorAll(".todo-card.todo-drop-before, .todo-card.todo-drop-after").forEach(card => {
      card.classList.remove("todo-drop-before", "todo-drop-after");
    });
  }

  let todoDrag = null;

  document.addEventListener("click", event => {
    const editButton = event.target.closest?.("[data-edit-todo]");
    if (!editButton) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    editTodoTitle(editButton.dataset.editTodo);
  }, true);

  document.addEventListener("dragstart", event => {
    if (event.target.closest?.(".todo-card")) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  document.addEventListener("pointerdown", event => {
    const handle = event.target.closest?.("[data-todo-drag]");
    if (!handle) return;
    const card = handle.closest("[data-todo-id]");
    if (!card) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    todoDrag = {
      id: card.dataset.todoId,
      pointerId: event.pointerId,
      targetListId: card.closest("[data-todo-list]")?.dataset.todoList || "",
      targetId: "",
      insertAfter: false,
    };
    document.body.classList.add("todo-dragging");
    card.classList.add("dragging");
    try { handle.setPointerCapture(event.pointerId); } catch {}
  }, true);

  document.addEventListener("pointermove", event => {
    if (!todoDrag) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    clearTodoPatchHighlights();
    document.querySelectorAll(".todo-column.drag-over").forEach(column => column.classList.remove("drag-over"));

    const element = document.elementFromPoint(event.clientX, event.clientY);
    const column = element?.closest?.("[data-todo-list]");
    const card = element?.closest?.(".todo-card[data-todo-id]");
    todoDrag.targetListId = column?.dataset.todoList || "";
    todoDrag.targetId = "";
    todoDrag.insertAfter = false;

    if (column) column.classList.add("drag-over");
    if (card && card.dataset.todoId !== todoDrag.id) {
      const rect = card.getBoundingClientRect();
      todoDrag.targetId = card.dataset.todoId;
      todoDrag.insertAfter = event.clientY > rect.top + rect.height / 2;
      card.classList.add(todoDrag.insertAfter ? "todo-drop-after" : "todo-drop-before");
    }
  }, true);

  document.addEventListener("pointerup", event => {
    if (!todoDrag) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const drag = todoDrag;
    todoDrag = null;
    document.body.classList.remove("todo-dragging");
    document.querySelectorAll(".todo-card.dragging").forEach(card => card.classList.remove("dragging"));
    document.querySelectorAll(".todo-column.drag-over").forEach(column => column.classList.remove("drag-over"));
    clearTodoPatchHighlights();
    if (drag.targetListId) reorderTodo(drag.id, drag.targetListId, drag.targetId, drag.insertAfter);
    else if (typeof renderTodo === "function") renderTodo();
  }, true);

  document.addEventListener("pointercancel", event => {
    if (!todoDrag) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    todoDrag = null;
    document.body.classList.remove("todo-dragging");
    document.querySelectorAll(".todo-card.dragging").forEach(card => card.classList.remove("dragging"));
    document.querySelectorAll(".todo-column.drag-over").forEach(column => column.classList.remove("drag-over"));
    clearTodoPatchHighlights();
  }, true);

  let scheduled = false;
  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      syncInvestmentUndoRedoTopbar();
      enhanceTodoCards();
    });
  }

  document.addEventListener("DOMContentLoaded", scheduleSync);
  window.addEventListener("load", scheduleSync);
  document.addEventListener("click", event => {
    if (event.target && (event.target.id === UNDO_ID || event.target.id === REDO_ID || event.target.id === "undoTodo")) {
      setTimeout(scheduleSync, 0);
    }
  }, true);

  if (document.body) {
    new MutationObserver(scheduleSync).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled"]
    });
  }

  scheduleSync();
})();
