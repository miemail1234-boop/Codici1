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

  let scheduled = false;
  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      syncInvestmentUndoRedoTopbar();
    });
  }

  document.addEventListener("DOMContentLoaded", scheduleSync);
  window.addEventListener("load", scheduleSync);
  document.addEventListener("click", event => {
    if (event.target && (event.target.id === UNDO_ID || event.target.id === REDO_ID)) {
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
