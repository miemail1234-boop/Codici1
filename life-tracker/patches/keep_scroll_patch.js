(() => {
  const RESTORE_MS = 1400;
  const RESTORE_STEPS = [0, 16, 40, 80, 160, 320, 640, 1100];
  let saved = null;
  let restoringUntil = 0;
  let restoring = false;

  function isActionControl(target) {
    return Boolean(target?.closest?.("button, [role='button'], input[type='button'], input[type='submit'], input[type='reset']"));
  }

  function captureScroll() {
    saved = {
      x: window.scrollX || window.pageXOffset || 0,
      y: window.scrollY || window.pageYOffset || 0,
      at: Date.now(),
    };
  }

  function restoreScroll() {
    if (!saved) return;
    window.scrollTo(saved.x, saved.y);
  }

  function restoreLoop() {
    if (restoring) return;
    restoring = true;
    const tick = () => {
      restoreScroll();
      if (Date.now() < restoringUntil) {
        requestAnimationFrame(tick);
      } else {
        restoring = false;
      }
    };
    requestAnimationFrame(tick);
  }

  function preserveScroll() {
    if (!saved) captureScroll();
    restoringUntil = Date.now() + RESTORE_MS;
    RESTORE_STEPS.forEach(delay => window.setTimeout(restoreScroll, delay));
    restoreLoop();
  }

  function refreshWorkoutSplit() {
    try {
      const panel = document.getElementById("screen-workout");
      if (panel?.classList.contains("active") && typeof renderWorkout === "function") {
        renderWorkout();
      }
    } catch {}
  }

  document.addEventListener("pointerdown", event => {
    if (!isActionControl(event.target)) return;
    captureScroll();
    preserveScroll();
  }, true);

  document.addEventListener("click", event => {
    if (event.target?.closest?.('[data-screen="workout"], [data-jump="workout"]')) {
      window.setTimeout(refreshWorkoutSplit, 80);
      window.setTimeout(refreshWorkoutSplit, 250);
    }
    if (!isActionControl(event.target)) return;
    if (!saved) captureScroll();
    preserveScroll();
  }, true);

  document.addEventListener("submit", () => {
    captureScroll();
    preserveScroll();
  }, true);

  if (document.body) {
    new MutationObserver(() => {
      if (saved && Date.now() < restoringUntil) restoreScroll();
    }).observe(document.body, { childList: true, subtree: true });
  }
})();
