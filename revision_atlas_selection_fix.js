(() => {
  const originalFocus = HTMLTextAreaElement.prototype.focus;

  HTMLTextAreaElement.prototype.focus = function patchedTextareaFocus(...args) {
    if (this && this.id === "revisionCommentText") {
      const selection = window.getSelection?.();
      const selectedInsideRevision = selection &&
        !selection.isCollapsed &&
        selection.anchorNode?.parentElement?.closest?.("#revisionReader");
      if (selectedInsideRevision) return;
    }
    return originalFocus.apply(this, args);
  };

  function clearFakeSelectionHighlight() {
    try {
      if (window.CSS?.highlights?.has?.("revision-live-selection")) {
        CSS.highlights.delete("revision-live-selection");
      }
    } catch {}
    document.querySelectorAll(".revision-live-fallback").forEach(mark => {
      const text = document.createTextNode(mark.textContent || "");
      mark.replaceWith(text);
      text.parentNode?.normalize?.();
    });
  }

  document.addEventListener("selectionchange", () => {
    const selection = window.getSelection?.();
    if (!selection || selection.isCollapsed) return;
    if (selection.anchorNode?.parentElement?.closest?.("#revisionReader")) {
      clearFakeSelectionHighlight();
    }
  });

  document.addEventListener("click", event => {
    if (event.target?.id === "revisionCommentText") {
      clearFakeSelectionHighlight();
    }
  }, true);
})();
