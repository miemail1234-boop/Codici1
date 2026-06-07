(() => {
  const HIGHLIGHT_NAME = "revision-live-selection";
  let lastSelection = null;
  let restoreTimer = null;

  function injectStyle() {
    if (document.getElementById("revision-selection-persist-style")) return;
    const style = document.createElement("style");
    style.id = "revision-selection-persist-style";
    style.textContent = `
      ::highlight(${HIGHLIGHT_NAME}) {
        background: rgba(80, 150, 255, 0.34);
        color: inherit;
      }
      .revision-live-fallback {
        background: rgba(80, 150, 255, 0.34);
        border-radius: 3px;
      }
    `;
    document.head.appendChild(style);
  }

  function isRevisionScreen() {
    return document.querySelector('#screen-revisions.active') || window.currentScreen === "revisions";
  }

  function textRangeFromOffsets(root, start, end) {
    if (!root || start < 0 || end <= start) return null;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    let position = 0;
    let startNode = null;
    let startOffset = 0;
    let endNode = null;
    let endOffset = 0;

    while ((node = walker.nextNode())) {
      const next = position + node.nodeValue.length;
      if (!startNode && start >= position && start <= next) {
        startNode = node;
        startOffset = start - position;
      }
      if (!endNode && end >= position && end <= next) {
        endNode = node;
        endOffset = end - position;
        break;
      }
      position = next;
    }

    if (!startNode || !endNode) return null;
    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    return range;
  }

  function offsetFromRangeStart(textEl, range) {
    const pre = document.createRange();
    pre.selectNodeContents(textEl);
    pre.setEnd(range.startContainer, range.startOffset);
    return pre.toString().length;
  }

  function clearFallback() {
    document.querySelectorAll(".revision-live-fallback").forEach(mark => {
      const text = document.createTextNode(mark.textContent || "");
      mark.replaceWith(text);
      text.parentNode?.normalize?.();
    });
  }

  function applyFallback(range) {
    clearFallback();
    try {
      const mark = document.createElement("span");
      mark.className = "revision-live-fallback";
      range.surroundContents(mark);
    } catch {
      // If the selection crosses existing inline elements, do nothing. The native selection will still work.
    }
  }

  function applyPersistentHighlight() {
    injectStyle();
    if (!lastSelection) return;
    const row = document.querySelector(`#revisionReader .revision-line[data-line="${lastSelection.line}"]`);
    const textEl = row?.querySelector(".revision-text");
    if (!textEl) return;
    const range = textRangeFromOffsets(textEl, lastSelection.start, lastSelection.end);
    if (!range) return;

    if (window.CSS?.highlights && window.Highlight) {
      CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(range));
    } else {
      applyFallback(range);
    }
  }

  function rememberCurrentSelection() {
    if (!isRevisionScreen()) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount || !selection.toString().trim()) return;

    const range = selection.getRangeAt(0);
    const row1 = range.startContainer.parentElement?.closest?.("#revisionReader .revision-line");
    const row2 = range.endContainer.parentElement?.closest?.("#revisionReader .revision-line");
    if (!row1 || !row2 || row1 !== row2) return;

    const textEl = row1.querySelector(".revision-text");
    if (!textEl) return;

    const start = offsetFromRangeStart(textEl, range);
    const selectedText = selection.toString();
    lastSelection = {
      line: Number(row1.dataset.line),
      start,
      end: start + selectedText.length,
      text: selectedText,
    };
    applyPersistentHighlight();
  }

  function scheduleRestore() {
    window.clearTimeout(restoreTimer);
    restoreTimer = window.setTimeout(applyPersistentHighlight, 30);
    window.setTimeout(applyPersistentHighlight, 120);
    window.setTimeout(applyPersistentHighlight, 350);
  }

  document.addEventListener("selectionchange", () => {
    window.clearTimeout(rememberCurrentSelection.timer);
    rememberCurrentSelection.timer = window.setTimeout(rememberCurrentSelection, 60);
  });

  document.addEventListener("click", event => {
    if (event.target.closest?.("#revisionReader .revision-line")) {
      window.setTimeout(rememberCurrentSelection, 80);
    }
  }, true);

  document.addEventListener("keyup", event => {
    if (event.target.closest?.("#revisionReader")) rememberCurrentSelection();
  }, true);

  if (document.body) {
    new MutationObserver(() => {
      if (lastSelection && isRevisionScreen()) scheduleRestore();
    }).observe(document.body, { childList: true, subtree: true });
  }

  document.addEventListener("DOMContentLoaded", () => { injectStyle(); scheduleRestore(); });
  window.addEventListener("load", () => { injectStyle(); scheduleRestore(); });
})();
