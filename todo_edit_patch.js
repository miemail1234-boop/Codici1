(() => {
  const STYLE_ID = "todo-dblclick-edit-style";
  const DOUBLE_TAP_MS = 360;
  const MOVE_TOLERANCE = 8;
  let lastTap = { id: "", time: 0 };
  let pointerStart = null;

  function canUseTodoInternals() {
    return typeof state !== "undefined" &&
      typeof rememberTodoUndo === "function" &&
      typeof autosaveTodos === "function" &&
      Array.isArray(state.todos);
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

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .todo-card { grid-template-columns: auto minmax(0, 1fr) auto !important; }
      .todo-card [data-edit-todo], .todo-card .todo-edit-btn { display: none !important; }
      .todo-card p { cursor: text; user-select: text; -webkit-user-select: text; }
      .todo-card p::after { content: ""; }
    `;
    document.head.appendChild(style);
  }

  function removeEditButtons() {
    injectStyle();
    document.querySelectorAll(".todo-card [data-edit-todo], .todo-card .todo-edit-btn").forEach(button => button.remove());
    document.querySelectorAll(".todo-card[data-todo-id] p").forEach(text => {
      text.title = "Doppio clic per modificare";
    });
  }

  document.addEventListener("dblclick", event => {
    const text = event.target.closest?.(".todo-card[data-todo-id] p");
    if (!text) return;
    const card = text.closest(".todo-card[data-todo-id]");
    if (!card) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    editTodoTitle(card.dataset.todoId);
  }, true);

  document.addEventListener("pointerdown", event => {
    const text = event.target.closest?.(".todo-card[data-todo-id] p");
    if (!text) {
      pointerStart = null;
      return;
    }
    const card = text.closest(".todo-card[data-todo-id]");
    pointerStart = {
      id: card?.dataset.todoId || "",
      x: event.clientX,
      y: event.clientY,
      time: Date.now(),
    };
  }, true);

  document.addEventListener("pointerup", event => {
    const text = event.target.closest?.(".todo-card[data-todo-id] p");
    if (!text || !pointerStart) return;
    const card = text.closest(".todo-card[data-todo-id]");
    const id = card?.dataset.todoId || "";
    const dx = Math.abs(event.clientX - pointerStart.x);
    const dy = Math.abs(event.clientY - pointerStart.y);
    if (!id || id !== pointerStart.id || dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) return;

    const now = Date.now();
    if (lastTap.id === id && now - lastTap.time <= DOUBLE_TAP_MS) {
      event.preventDefault();
      event.stopImmediatePropagation();
      lastTap = { id: "", time: 0 };
      editTodoTitle(id);
    } else {
      lastTap = { id, time: now };
    }
  }, true);

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      removeEditButtons();
    });
  }

  document.addEventListener("DOMContentLoaded", schedule);
  window.addEventListener("load", schedule);
  document.addEventListener("click", schedule, true);
  if (document.body) {
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  }
  schedule();
})();
