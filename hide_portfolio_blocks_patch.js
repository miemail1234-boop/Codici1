(() => {
  const STYLE_ID = "hide-portfolio-blocks-style";

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .portfolio-blocks-hidden { display: none !important; }
    `;
    document.head.appendChild(style);
  }

  function hidePortfolioBlocksSection() {
    injectStyle();
    document.querySelectorAll(".panel h2").forEach(title => {
      if ((title.textContent || "").trim().toLowerCase() !== "blocchi portafoglio") return;
      const panel = title.closest(".panel");
      if (panel) panel.classList.add("portfolio-blocks-hidden");
    });
  }

  let scheduled = false;
  function scheduleHide() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      hidePortfolioBlocksSection();
    });
  }

  document.addEventListener("DOMContentLoaded", scheduleHide);
  window.addEventListener("load", scheduleHide);
  document.addEventListener("click", scheduleHide, true);
  if (document.body) {
    new MutationObserver(scheduleHide).observe(document.body, { childList: true, subtree: true });
  }
  scheduleHide();
})();
