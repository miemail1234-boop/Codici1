(() => {
  if (window.__WORKOUT_SPLIT_SAFE_PATCH__) return;
  window.__WORKOUT_SPLIT_SAFE_PATCH__ = true;

  const KEY = "life-tracker-workout-day-safe-v1";
  const SPLITS = {
    upper: {
      title: "Upper",
      ids: ["panca-inclinata", "trazioni", "rematore", "alzate-laterali", "tricipiti", "bicipiti"],
    },
    lower: {
      title: "Lower",
      ids: ["bulgarian-split-squat", "stacco-rumeno", "back-extension", "polpacci", "addominali"],
    },
  };
  const DEFAULT_EXERCISES = {
    "bulgarian-split-squat": { id: "bulgarian-split-squat", name: "Bulgarian split squat", note: "Carico totale", sets: [{ kg: 6, reps: 12 }, { kg: 6, reps: 12 }, { kg: 6, reps: 12 }] },
    "stacco-rumeno": { id: "stacco-rumeno", name: "Stacco rumeno", note: "Femorali e glutei", sets: [{ kg: 8, reps: 10 }, { kg: 8, reps: 10 }, { kg: 8, reps: 10 }] },
    "back-extension": { id: "back-extension", name: "Back extension", note: "Iperestensioni lombari", sets: [{ kg: 0, reps: 12 }, { kg: 0, reps: 12 }, { kg: 0, reps: 12 }] },
    "polpacci": { id: "polpacci", name: "Polpacci", note: "Calf raise", sets: [{ kg: 0, reps: 15 }, { kg: 0, reps: 15 }, { kg: 0, reps: 15 }] },
    "addominali": { id: "addominali", name: "Addominali", note: "Prima casella: secondi esercizio · seconda casella: secondi recupero", userNote: "3 serie da 35 secondi con 30 secondi di recupero", sets: [{ kg: 35, reps: 30 }, { kg: 35, reps: 30 }, { kg: 35, reps: 30 }] },
  };

  let activeDay = localStorage.getItem(KEY) || "upper";
  if (!SPLITS[activeDay]) activeDay = "upper";

  const clone = value => JSON.parse(JSON.stringify(value));
  const dayOf = workout => workout?.workoutDay || workout?.workout_day || workout?.day || "full";
  const titleOf = day => SPLITS[day]?.title || "Completo";
  const allowedSet = day => new Set(SPLITS[day]?.ids || []);
  const isAllowed = (exercise, day = activeDay) => allowedSet(day).has(exercise?.id);

  function ensureTemplate() {
    if (!Array.isArray(state?.workoutTemplate)) state.workoutTemplate = [];
    Object.values(DEFAULT_EXERCISES).forEach(exercise => {
      if (!state.workoutTemplate.some(item => item.id === exercise.id)) state.workoutTemplate.push(clone(exercise));
    });
  }

  function normalizeExercise(exercise) {
    return {
      id: exercise?.id || `exercise-${Date.now().toString(36)}`,
      name: exercise?.name || exercise?.id || "Esercizio",
      note: exercise?.note || "",
      userNote: exercise?.userNote || "",
      sets: Array.isArray(exercise?.sets) && exercise.sets.length ? exercise.sets.map(set => ({ kg: number(set.kg, 0), reps: number(set.reps, 0) })) : [{ kg: 0, reps: 10 }],
    };
  }

  function latestExercise(id, date = selectedDate) {
    const sameDateFull = (state.workouts || []).find(workout => workout.date === date && dayOf(workout) === "full")?.exercises?.find(exercise => exercise.id === id);
    if (sameDateFull) return normalizeExercise(clone(sameDateFull));
    for (const workout of [...(state.workouts || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)))) {
      const found = workout.exercises?.find(exercise => exercise.id === id);
      if (found) return normalizeExercise(clone(found));
    }
    const fromTemplate = state.workoutTemplate?.find(exercise => exercise.id === id);
    if (fromTemplate) return normalizeExercise(clone(fromTemplate));
    return normalizeExercise(clone(DEFAULT_EXERCISES[id] || { id, name: id, note: "", sets: [{ kg: 0, reps: 10 }] }));
  }

  function findSplitWorkout(date, day = activeDay) {
    return (state.workouts || []).find(workout => workout.date === date && dayOf(workout) === day);
  }

  function buildSplitWorkout(date, day = activeDay) {
    ensureTemplate();
    const saved = findSplitWorkout(date, day);
    if (saved) {
      const copy = clone(saved);
      copy.workoutDay = day;
      copy.exercises = (copy.exercises || []).filter(exercise => isAllowed(exercise, day)).map(normalizeExercise);
      return copy;
    }
    const source = (state.workouts || []).find(workout => workout.date === date && dayOf(workout) === "full");
    return {
      id: `workout-${date}-${day}`,
      date,
      workoutDay: day,
      exercises: SPLITS[day].ids.map(id => {
        const fromSource = source?.exercises?.find(exercise => exercise.id === id);
        return normalizeExercise(clone(fromSource || latestExercise(id, date)));
      }),
    };
  }

  function setActiveDay(day) {
    activeDay = SPLITS[day] ? day : "upper";
    localStorage.setItem(KEY, activeDay);
  }

  function prepareDraft(date = selectedDate, day = activeDay) {
    setActiveDay(day);
    selectedDate = date || todayISO();
    draftWorkout = buildSplitWorkout(selectedDate, activeDay);
    const allowed = allowedSet(activeDay);
    draftWorkout.exercises = SPLITS[activeDay].ids.map(id => {
      const existing = draftWorkout.exercises.find(exercise => exercise.id === id);
      return normalizeExercise(existing || latestExercise(id, selectedDate));
    }).filter(exercise => allowed.has(exercise.id));
  }

  function splitTabsHtml() {
    return `<div class="segmented workout-split-tabs" data-workout-split-tabs>${Object.entries(SPLITS).map(([day, meta]) => `<button class="${activeDay === day ? "active" : ""}" data-workout-split-day="${day}">${meta.title}</button>`).join("")}</div>`;
  }

  function exerciseTotal(exercise) {
    try {
      return typeof exerciseVolume === "function" ? exerciseVolume(exercise) : (exercise.sets || []).reduce((sum, set) => sum + number(set.kg, 0) * number(set.reps, 0), 0);
    } catch {
      return 0;
    }
  }

  function historyHtml() {
    const workouts = [...(state.workouts || [])]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)) || titleOf(dayOf(a)).localeCompare(titleOf(dayOf(b))));
    if (!workouts.length) return `<p class="hint">Ancora vuoto.</p>`;
    return workouts.map(workout => {
      const day = dayOf(workout);
      const volume = (workout.exercises || []).reduce((sum, exercise) => sum + exerciseTotal(exercise), 0);
      return `<div class="history-item"><strong>${prettyDate(workout.date)} · ${titleOf(day)}</strong><small>${(workout.exercises || []).length} esercizi · volume totale ${fmt(volume)}</small><div class="row-actions"><button class="chip" data-load-workout-split="${workout.date}:${day}">Apri</button><button class="danger" data-delete-workout-split="${workout.date}:${day}">Elimina</button></div></div>`;
    }).join("");
  }

  function enhanceWorkoutScreen() {
    const panel = document.getElementById("screen-workout");
    if (!panel) return;
    const firstPanel = panel.querySelector(".panel");
    if (firstPanel && !firstPanel.querySelector("[data-workout-split-tabs]")) {
      firstPanel.insertAdjacentHTML("afterbegin", splitTabsHtml());
    }
    firstPanel?.querySelectorAll("[data-workout-split-day]").forEach(button => {
      button.classList.toggle("active", button.dataset.workoutSplitDay === activeDay);
    });
    const saveButton = panel.querySelector("#saveWorkout");
    if (saveButton) saveButton.textContent = `Salva ${titleOf(activeDay)}`;
    const hint = firstPanel?.querySelector(".manual-note");
    if (hint) hint.textContent = "Upper e Lower hanno salvataggi indipendenti. I dati precedenti restano nello storico.";
    const heading = Array.from(panel.querySelectorAll("h2")).find(item => item.textContent.trim() === "Andamento");
    if (heading) heading.textContent = `Andamento ${titleOf(activeDay)}`;
    const allowed = allowedSet(activeDay);
    panel.querySelectorAll(".exercise-card").forEach(card => {
      const id = card.dataset.exerciseId || "";
      if (id && !allowed.has(id)) card.remove();
    });
    const select = panel.querySelector("#chartExercise");
    if (select) {
      const previous = allowed.has(select.value) ? select.value : draftWorkout.exercises[0]?.id;
      select.innerHTML = draftWorkout.exercises.map(exercise => `<option value="${exercise.id}" ${exercise.id === previous ? "selected" : ""}>${exercise.name}</option>`).join("");
      if (previous) select.value = previous;
    }
    const history = panel.querySelector("#workoutHistory");
    if (history) history.innerHTML = historyHtml();
  }

  const nativeRenderWorkout = renderWorkout;
  renderWorkout = function patchedRenderWorkout(...args) {
    try {
      prepareDraft(draftWorkout?.date || selectedDate || todayISO(), activeDay);
    } catch {}
    const output = nativeRenderWorkout.apply(this, args);
    enhanceWorkoutScreen();
    return output;
  };

  const nativeCloudRowsFromState = typeof cloudRowsFromState === "function" ? cloudRowsFromState : null;
  if (nativeCloudRowsFromState) {
    cloudRowsFromState = function patchedCloudRowsFromState(userId) {
      const rows = nativeCloudRowsFromState(userId);
      const dayById = new Map((state.workouts || []).map(workout => [workout.id, dayOf(workout)]));
      (rows.workouts || []).forEach(row => { row.workout_day = dayById.get(row.id) || "full"; });
      return rows;
    };
  }

  const nativeStateFromCloudRows = typeof stateFromCloudRows === "function" ? stateFromCloudRows : null;
  if (nativeStateFromCloudRows) {
    stateFromCloudRows = function patchedStateFromCloudRows(rows) {
      const fresh = nativeStateFromCloudRows(rows);
      const dayById = new Map((rows.workouts || []).map(row => [row.id, row.workout_day || "full"]));
      fresh.workouts = (fresh.workouts || []).map(workout => ({ ...workout, workoutDay: dayById.get(workout.id) || workout.workoutDay || "full" }));
      return fresh;
    };
  }

  function saveSplitWorkout() {
    const date = document.getElementById("workoutDate")?.value || selectedDate || todayISO();
    draftWorkout.date = date;
    draftWorkout.workoutDay = activeDay;
    draftWorkout.id = draftWorkout.id || `workout-${date}-${activeDay}`;
    draftWorkout.exercises = (draftWorkout.exercises || []).filter(exercise => isAllowed(exercise, activeDay)).map(normalizeExercise);
    const index = (state.workouts || []).findIndex(workout => workout.date === date && dayOf(workout) === activeDay);
    if (index >= 0) state.workouts[index] = clone(draftWorkout);
    else state.workouts.push(clone(draftWorkout));
    ensureTemplate();
    draftWorkout.exercises.forEach(exercise => {
      const row = normalizeExercise(exercise);
      const templateIndex = state.workoutTemplate.findIndex(item => item.id === row.id);
      if (templateIndex >= 0) state.workoutTemplate[templateIndex] = row;
      else state.workoutTemplate.push(row);
    });
    saveState();
    if (typeof syncStateToCloud === "function") syncStateToCloud({ silent: true }).catch(() => {});
    toast(`Workout ${titleOf(activeDay)} salvato`);
    renderWorkout();
    renderHome();
  }

  document.addEventListener("click", event => {
    const dayButton = event.target.closest?.("[data-workout-split-day]");
    if (dayButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      prepareDraft(document.getElementById("workoutDate")?.value || selectedDate || todayISO(), dayButton.dataset.workoutSplitDay);
      renderWorkout();
      return;
    }
    if (event.target?.id === "saveWorkout" && document.getElementById("screen-workout")?.classList.contains("active")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      saveSplitWorkout();
      return;
    }
    const load = event.target.closest?.("[data-load-workout-split]");
    if (load) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const [date, day] = load.dataset.loadWorkoutSplit.split(":");
      prepareDraft(date, SPLITS[day] ? day : "upper");
      renderWorkout();
      return;
    }
    const del = event.target.closest?.("[data-delete-workout-split]");
    if (del) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const [date, day] = del.dataset.deleteWorkoutSplit.split(":");
      state.workouts = (state.workouts || []).filter(workout => !(workout.date === date && dayOf(workout) === day));
      saveState();
      prepareDraft(selectedDate || todayISO(), activeDay);
      toast("Workout eliminato");
      renderWorkout();
    }
  }, true);

  document.addEventListener("change", event => {
    if (event.target?.id === "workoutDate" && document.getElementById("screen-workout")?.classList.contains("active")) {
      prepareDraft(event.target.value || todayISO(), activeDay);
      renderWorkout();
    }
  }, true);

  ensureTemplate();
})();
