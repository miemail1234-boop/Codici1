(() => {
  const ABS_ID = "addominali";
  const ABS_EXERCISE = {
    id: ABS_ID,
    name: "Addominali",
    note: "Prima casella: secondi esercizio · seconda casella: secondi recupero",
    userNote: "3 serie da 35 secondi con 30 secondi di recupero",
    sets: [
      { kg: 35, reps: 30 },
      { kg: 35, reps: 30 },
      { kg: 35, reps: 30 },
    ],
  };

  function cloneExercise() {
    return JSON.parse(JSON.stringify(ABS_EXERCISE));
  }

  function hasAbs(list) {
    return Array.isArray(list) && list.some(ex => ex && ex.id === ABS_ID);
  }

  function normalizeAbsExercise(exercise) {
    if (!exercise || exercise.id !== ABS_ID) return false;
    let changed = false;
    if (exercise.name !== ABS_EXERCISE.name) { exercise.name = ABS_EXERCISE.name; changed = true; }
    if (exercise.note !== ABS_EXERCISE.note) { exercise.note = ABS_EXERCISE.note; changed = true; }
    if (!exercise.userNote) { exercise.userNote = ABS_EXERCISE.userNote; changed = true; }
    if (!Array.isArray(exercise.sets) || !exercise.sets.length) {
      exercise.sets = cloneExercise().sets;
      return true;
    }
    exercise.sets.forEach(set => {
      if (number(set.kg, 0) <= 0) { set.kg = 35; changed = true; }
      if (number(set.reps, 0) <= 1) { set.reps = 30; changed = true; }
    });
    return changed;
  }

  function normalizeAbsList(list) {
    if (!Array.isArray(list)) return false;
    let changed = false;
    if (!hasAbs(list)) {
      list.push(cloneExercise());
      changed = true;
    }
    list.forEach(exercise => {
      if (normalizeAbsExercise(exercise)) changed = true;
    });
    return changed;
  }

  function patchAbsVolume() {
    if (typeof exerciseVolume === "function" && !exerciseVolume.__absSecondsPatch) {
      const originalExerciseVolume = exerciseVolume;
      const patchedExerciseVolume = function(exercise) {
        if (exercise?.id === ABS_ID) {
          return (exercise.sets || []).reduce((sum, set) => sum + Math.max(0, number(set.kg, 0)), 0);
        }
        return originalExerciseVolume(exercise);
      };
      patchedExerciseVolume.__absSecondsPatch = true;
      exerciseVolume = patchedExerciseVolume;
    }

    if (typeof exerciseVolumeLabel === "function" && !exerciseVolumeLabel.__absSecondsPatch) {
      const originalExerciseVolumeLabel = exerciseVolumeLabel;
      const patchedExerciseVolumeLabel = function(exercise) {
        if (exercise?.id === ABS_ID) return `${fmt(exerciseVolume(exercise))} sec esercizio`;
        return originalExerciseVolumeLabel(exercise);
      };
      patchedExerciseVolumeLabel.__absSecondsPatch = true;
      exerciseVolumeLabel = patchedExerciseVolumeLabel;
    }

    if (typeof miniWorkout === "function" && !miniWorkout.__absSecondsPatch) {
      const patchedMiniWorkout = function(workout) {
        return workout.exercises.slice(0, 4).map(ex => {
          const text = ex.id === ABS_ID
            ? ex.sets.map(set => `${fmt(set.kg)}s esercizio + ${fmt(set.reps)}s recupero`).join(" · ")
            : ex.sets.map(set => `${fmt(set.kg)}kg x ${fmt(set.reps)}`).join(" · ");
          return `<div class="history-item"><strong>${ex.name}</strong><br><small>${text}</small></div>`;
        }).join("");
      };
      patchedMiniWorkout.__absSecondsPatch = true;
      miniWorkout = patchedMiniWorkout;
    }
  }

  function patchAbsInputs() {
    const card = document.querySelector('[data-exercise-id="addominali"]');
    if (!card) return;
    card.querySelectorAll('[data-field="kg"]').forEach((input, index) => {
      input.setAttribute("aria-label", `Secondi esercizio Addominali serie ${index + 1}`);
      input.setAttribute("placeholder", "sec esercizio");
      input.inputMode = "numeric";
    });
    card.querySelectorAll('[data-field="reps"]').forEach((input, index) => {
      input.setAttribute("aria-label", `Secondi recupero Addominali serie ${index + 1}`);
      input.setAttribute("placeholder", "sec recupero");
      input.inputMode = "numeric";
    });
  }

  function applyAbsPatch() {
    if (typeof state === "undefined" || !state) return false;
    patchAbsVolume();
    let changed = false;

    if (normalizeAbsList(state.workoutTemplate)) changed = true;
    if (Array.isArray(state.workouts)) {
      state.workouts.forEach(workout => {
        if (workout?.exercises?.some(ex => ex.id === ABS_ID)) {
          workout.exercises.forEach(exercise => {
            if (normalizeAbsExercise(exercise)) changed = true;
          });
        }
      });
    }
    if (typeof todayISO === "function") {
      const today = todayISO();
      const todayWorkout = Array.isArray(state.workouts)
        ? state.workouts.find(workout => workout.date === today)
        : null;
      if (todayWorkout && normalizeAbsList(todayWorkout.exercises)) changed = true;
    }
    if (typeof draftWorkout !== "undefined" && draftWorkout && normalizeAbsList(draftWorkout.exercises)) {
      changed = true;
    }

    if (changed) {
      if (typeof saveState === "function") saveState();
      if (typeof render === "function") render();
      if (typeof switchScreen === "function") switchScreen("workout");
    }
    patchAbsInputs();
    return true;
  }

  let scheduled = false;
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyAbsPatch();
    });
  }

  if (!applyAbsPatch()) {
    const timer = window.setInterval(() => {
      if (applyAbsPatch()) window.clearInterval(timer);
    }, 100);
    window.setTimeout(() => window.clearInterval(timer), 5000);
  }
  document.addEventListener("DOMContentLoaded", scheduleApply);
  window.addEventListener("load", scheduleApply);
  document.addEventListener("click", scheduleApply, true);
  document.addEventListener("input", event => {
    if (event.target?.closest?.('[data-exercise-id="addominali"]')) scheduleApply();
  }, true);
  if (document.body) new MutationObserver(scheduleApply).observe(document.body, { childList: true, subtree: true });
})();
