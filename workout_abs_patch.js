(() => {
  const ABS_EXERCISE = {
    id: "addominali",
    name: "Addominali",
    note: "Tempo: secondi per serie · recupero 30s",
    userNote: "3 serie da 35 secondi con 30 secondi di recupero",
    sets: [
      { kg: 35, reps: 1 },
      { kg: 35, reps: 1 },
      { kg: 35, reps: 1 },
    ],
  };

  function cloneExercise() {
    return JSON.parse(JSON.stringify(ABS_EXERCISE));
  }

  function hasAbs(list) {
    return Array.isArray(list) && list.some(ex => ex && ex.id === ABS_EXERCISE.id);
  }

  function appendAbs(list) {
    if (!Array.isArray(list) || hasAbs(list)) return false;
    list.push(cloneExercise());
    return true;
  }

  function applyAbsPatch() {
    if (typeof state === "undefined" || !state) return false;
    let changed = false;

    if (appendAbs(state.workoutTemplate)) changed = true;

    if (typeof todayISO === "function") {
      const today = todayISO();
      const todayWorkout = Array.isArray(state.workouts)
        ? state.workouts.find(workout => workout.date === today)
        : null;
      if (todayWorkout && appendAbs(todayWorkout.exercises)) changed = true;
    }

    if (typeof draftWorkout !== "undefined" && draftWorkout && appendAbs(draftWorkout.exercises)) {
      changed = true;
    }

    if (changed) {
      if (typeof saveState === "function") saveState();
      if (typeof render === "function") render();
      if (typeof switchScreen === "function") switchScreen("workout");
    }
    return true;
  }

  if (!applyAbsPatch()) {
    const timer = window.setInterval(() => {
      if (applyAbsPatch()) window.clearInterval(timer);
    }, 100);
    window.setTimeout(() => window.clearInterval(timer), 5000);
  }
})();
