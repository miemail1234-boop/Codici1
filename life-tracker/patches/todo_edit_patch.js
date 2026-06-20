(() => {
  const STYLE_ID = "todo-dblclick-edit-style";
  const DOUBLE_TAP_MS = 360;
  const MOVE_TOLERANCE = 8;
  let lastTap = { id: "", time: 0 };
  let pointerStart = null;
  let activeEditor = null;

  function canUseTodoInternals() {
    return typeof state !== "undefined" &&
      typeof rememberTodoUndo === "function" &&
      typeof autosaveTodos === "function" &&
      Array.isArray(state.todos);
  }

  function findTodo(todoId) {
    if (!canUseTodoInternals() || !todoId) return null;
    return state.todos.find(item => item.id === todoId) || null;
  }

  function saveTodoTitle(todoId, nextTitle) {
    const todo = findTodo(todoId);
    if (!todo) return false;
    const cleanTitle = String(nextTitle || "").trim();
    if (!cleanTitle) {
      if (typeof toast === "function") toast("Il testo del task non può essere vuoto");
      return false;
    }
    if (cleanTitle !== todo.title) {
      rememberTodoUndo();
      todo.title = cleanTitle;
      todo.updatedAt = new Date().toISOString();
      autosaveTodos("Task modificato");
    }
    return true;
  }

  function replaceEditorWithText(input, todoId) {
    if (!input || !input.isConnected) return;
    const todo = findTodo(todoId);
    const p = document.createElement("p");
    p.textContent = todo?.title || input.value || "";
    p.title = "Doppio clic per modificare";
    input.replaceWith(p);
  }

  function rerenderTodoSoon(input, todoId) {
    setTimeout(() => {
      if (typeof renderTodo === "function") renderTodo();
      else replaceEditorWithText(input, todoId);
    }, 0);
  }

  function startInlineEdit(textNode) {
    if (!textNode) return;
    const card = textNode.closest(".todo-card[data-todo-id]");
    if (!card) return;
    const todoId = card.dataset.todoId;
    const currentText = textNode.textContent || "";

    if (activeEditor?.finish) {
      activeEditor.finish(true);
    }

    const input = document.createElement("input");
    input.type = "text";
    input.className = "todo-inline-editor";
    input.value = currentText;
    input.setAttribute("aria-label", "Modifica task");

    let finished = false;
    const finish = (save) => {
      if (finished) return;
      if (save) {
        const ok = saveTodoTitle(todoId, input.value);
        if (!ok) {
          input.focus();
          input.select();
          return;
        }
      }
      finished = true;
      const editorInput = input;
      const editorTodoId = todoId;
      activeEditor = null;
      if (save) rerenderTodoSoon(editorInput, editorTodoId);
      else if (typeof renderTodo === "function") renderTodo();
      else replaceEditorWithText(editorInput, editorTodoId);
    };

    input.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        finish(true);
      }
      if (event.key === "Escape") {
        event.preventDefault();
        finish(false);
      }
    });
    input.addEventListener("blur", () => finish(true));
    input.addEventListener("click", event => event.stopPropagation());
    input.addEventListener("pointerdown", event => event.stopPropagation());

    textNode.replaceWith(input);
    activeEditor = { input, todoId, finish };
    input.focus();
    input.select();
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
      .todo-inline-editor { width: 100%; min-width: 0; border: 1px solid rgba(61,150,120,.75); border-radius: 10px; padding: 7px 9px; font: inherit; background: #fff; color: inherit; }
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
    event.preventDefault();
    event.stopImmediatePropagation();
    startInlineEdit(text);
  }, true);

  document.addEventListener("pointerdown", event => {
    const clickedInsideEditor = event.target.closest?.(".todo-inline-editor");
    if (activeEditor?.finish && !clickedInsideEditor) {
      activeEditor.finish(true);
    }
    if (clickedInsideEditor) return;
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
    if (event.target.closest?.(".todo-inline-editor")) return;
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
      startInlineEdit(text);
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
      if (!activeEditor) removeEditButtons();
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
