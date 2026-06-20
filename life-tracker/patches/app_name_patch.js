(() => {
  const APP_NAME = "Life Tracker 3.1";

  function replaceTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE || !node.nodeValue) return;
    const next = node.nodeValue
      .replace(/Life Tracker 2\.0/g, APP_NAME)
      .replace(/Life Tracker 3\.0/g, APP_NAME)
      .replace(/Life Tracker(?!\s*3\.1)/g, APP_NAME);
    if (next !== node.nodeValue) node.nodeValue = next;
  }

  function applyAppName() {
    document.title = APP_NAME;
    const headerTitle = document.querySelector(".topbar h1");
    if (headerTitle) headerTitle.textContent = APP_NAME;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return /Life Tracker/.test(node.nodeValue || "")
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(replaceTextNode);
  }

  let scheduled = false;
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyAppName();
    });
  }

  document.addEventListener("DOMContentLoaded", scheduleApply);
  window.addEventListener("load", scheduleApply);
  if (document.body) {
    new MutationObserver(scheduleApply).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  scheduleApply();
})();
