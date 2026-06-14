(() => {
  if (window.__WORKOUT_SPLIT_TRIGGER_PATCH__) return;
  window.__WORKOUT_SPLIT_TRIGGER_PATCH__ = true;

  function refreshWorkout() {
    try {
      const panel = document.getElementById("screen-workout");
      if (panel?.classList.contains("active") && typeof renderWorkout === "function") {
        renderWorkout();
      }
    } catch {}
  }

  document.addEventListener("click", event => {
    if (event.target?.closest?.('[data-screen="workout"], [data-jump="workout"]')) {
      window.setTimeout(refreshWorkout, 80);
      window.setTimeout(refreshWorkout, 250);
    }
  }, true);

  window.setTimeout(refreshWorkout, 500);
})();
