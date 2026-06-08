(() => {
  const KEY = "life-tracker-workout-day-v1";
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
    "stacco-rumeno": { id: "stacco-rumeno", name: "Stacco rumeno", note: "Femorali e glutei", sets: [{ kg: 8, reps: 10 }, { kg: 8, reps: 10 }, { kg: 8, reps: 10 }] },
    "back-extension": { id: "back-extension", name: "Back extension", note: "Iperestensioni lombari", sets: [{ kg: 0, reps: 12 }, { kg: 0, reps: 12 }, { kg: 0, reps: 12 }] },
    "polpacci": { id: "polpacci", name: "Polpacci", note: "Calf raise", sets: [{ kg: 0, reps: 15 }, { kg: 0, reps: 15 }, { kg: 0, reps: 15 }] },
    "addominali": { id: "addominali", name: "Addominali", note: "Prima casella: secondi esercizio · seconda casella: secondi recupero", userNote: "3 serie da 35 secondi con 30 secondi di recupero", sets: [{ kg: 35, reps: 30 }, { kg: 35, reps: 30 }, { kg: 35, reps: 30 }] },
  };
  let activeDay = localStorage.getItem(KEY) || "upper";
  if (!SPLITS[activeDay]) activeDay = "upper";

  const oldNormalizeWorkout = typeof normalizeWorkout === "function" ? normalizeWorkout : null;
  const oldCloudRowsFromState = typeof cloudRowsFromState === "function" ? cloudRowsFromState : null;
  const oldStateFromCloudRows = typeof stateFromCloudRows === "function" ? stateFromCloudRows : null;

  const workoutDayOf = workout => workout?.workoutDay || workout?.workout_day || workout?.day || "full";
  const splitTitle = day => day === "lower" ? "Lower" : day === "upper" ? "Upper" : "Full";
  const isSplitExercise = (exercise, day = activeDay) => SPLITS[day]?.ids.includes(exercise?.id);
  const safeClone = value => JSON.parse(JSON.stringify(value));
  const template = () => Array.isArray(state?.workoutTemplate) ? state.workoutTemplate : [];

  function latestExerciseById(id) {
    for (const workout of [...(state.workouts || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)))) {
      const found = workout.exercises?.find(ex => ex.id === id);
      if (found) return safeClone(found);
    }
    const fromTemplate = template().find(ex => ex.id === id);
    if (fromTemplate) return safeClone(fromTemplate);
    return safeClone(DEFAULT_EXERCISES[id] || { id, name: id, note: "", sets: [{ kg: 0, reps: 10 }, { kg: 0, reps: 10 }, { kg: 0, reps: 10 }] });
  }

  function ensureWorkoutTemplate() {
    if (!Array.isArray(state.workoutTemplate)) state.workoutTemplate = [];
    Object.values(DEFAULT_EXERCISES).forEach(ex => {
      if (!state.workoutTemplate.some(item => item.id === ex.id)) state.workoutTemplate.push(safeClone(ex));
    });
  }

  function normalizeWithDay(workout) {
    const normalized = oldNormalizeWorkout ? oldNormalizeWorkout(workout) : {
      id: workout?.id || uid(),
      date: workout?.date || todayISO(),
      exercises: Array.isArray(workout?.exercises) ? workout.exercises : [],
    };
    normalized.workoutDay = workoutDayOf(workout);
    return normalized;
  }

  if (oldNormalizeWorkout) normalizeWorkout = normalizeWithDay;

  function splitWorkoutId(date, day) {
    return `workout-${date}-${day}`;
  }

  function findSplitWorkout(date, day = activeDay) {
    return (state.workouts || []).find(workout => workout.date === date && workoutDayOf(workout) === day);
  }

  function sourceWorkoutForDate(date) {
    return findSplitWorkout(date, activeDay) || (state.workouts || []).find(workout => workout.date === date && workoutDayOf(workout) === "full") || null;
  }

  function createSplitWorkout(date, day = activeDay) {
    ensureWorkoutTemplate();
    const source = sourceWorkoutForDate(date);
    const exercises = SPLITS[day].ids.map(id => {
      const fromSource = source?.exercises?.find(ex => ex.id === id);
      return safeClone(fromSource || latestExerciseById(id));
    });
    return normalizeWithDay({ id: splitWorkoutId(date, day), date, workoutDay: day, exercises });
  }

  function setDraftForSplit(date = selectedDate, day = activeDay) {
    ensureWorkoutTemplate();
    selectedDate = date || todayISO();
    activeDay = day;
    localStorage.setItem(KEY, activeDay);
    draftWorkout = safeClone(findSplitWorkout(selectedDate, activeDay) || createSplitWorkout(selectedDate, activeDay));
    draftWorkout.date = selectedDate;
    draftWorkout.workoutDay = activeDay;
    draftWorkout.exercises = draftWorkout.exercises.filter(ex => isSplitExercise(ex, activeDay));
    SPLITS[activeDay].ids.forEach(id => {
      if (!draftWorkout.exercises.some(ex => ex.id === id)) draftWorkout.exercises.push(latestExerciseById(id));
    });
  }

  function saveSplitWorkout() {
    draftWorkout = normalizeWithDay({ ...draftWorkout, workoutDay: activeDay, id: draftWorkout.id || splitWorkoutId(draftWorkout.date, activeDay) });
    draftWorkout.exercises = draftWorkout.exercises.filter(ex => isSplitExercise(ex, activeDay));
    const index = (state.workouts || []).findIndex(workout => workout.date === draftWorkout.date && workoutDayOf(workout) === activeDay);
    if (index >= 0) state.workouts[index] = safeClone(draftWorkout);
    else state.workouts.push(safeClone(draftWorkout));
    ensureWorkoutTemplate();
    draftWorkout.exercises.forEach(ex => {
      const row = { id: ex.id, name: ex.name, note: ex.note, userNote: ex.userNote || "", sets: ex.sets.map(set => ({ ...set })) };
      const templateIndex = state.workoutTemplate.findIndex(item => item.id === ex.id);
      if (templateIndex >= 0) state.workoutTemplate[templateIndex] = row;
      else state.workoutTemplate.push(row);
    });
    saveState();
    if (typeof syncStateToCloud === "function") syncStateToCloud({ silent: true }).catch(() => {});
    toast(`Workout ${splitTitle(activeDay)} salvato`);
    render();
    switchScreen("workout");
  }

  function renderSplitTabs() {
    return `<div class="segmented" data-workout-day-tabs>${Object.entries(SPLITS).map(([day, meta]) => `<button class="${activeDay === day ? "active" : ""}" data-workout-day="${day}">${meta.title}</button>`).join("")}</div>`;
  }

  function renderWorkoutHistorySplit() {
    const workouts = [...(state.workouts || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)) || splitTitle(workoutDayOf(a)).localeCompare(splitTitle(workoutDayOf(b))));
    if (!workouts.length) return `<p class="hint">Ancora vuoto.</p>`;
    return workouts.map(workout => {
      const day = workoutDayOf(workout);
      const volume = workout.exercises.reduce((sum, exercise) => sum + exerciseVolume(exercise), 0);
      return `<div class="history-item"><strong>${prettyDate(workout.date)} · ${splitTitle(day)}</strong><small>${workout.exercises.length} esercizi · volume totale ${fmt(volume)}</small><div class="row-actions"><button class="chip" data-load-workout-split="${workout.date}:${day}">Apri</button><button class="danger" data-delete-workout-split="${workout.date}:${day}">Elimina</button></div></div>`;
    }).join("");
  }

  function renderWorkoutSplit() {
    setDraftForSplit(draftWorkout?.date || selectedDate || todayISO(), activeDay);
    const selectedExercise = draftWorkout.exercises[0]?.id;
    document.getElementById("screen-workout").innerHTML = `
      <div class="wide-layout">
        <div>
          <div class="panel">
            ${renderSplitTabs()}
            <div class="form-grid cols">
              <div class="field">
                <label for="workoutDate">Data workout</label>
                <input id="workoutDate" type="date" value="${draftWorkout.date}">
              </div>
              <div class="field">
                <label>&nbsp;</label>
                <button class="primary" id="saveWorkoutSplit">Salva ${splitTitle(activeDay)}</button>
              </div>
            </div>
            <p class="hint manual-note">Upper e Lower hanno salvataggi indipendenti. I dati già raccolti restano nello storico e vengono usati come base iniziale.</p>
          </div>
          <div class="panel timer-panel">
            <h2>Timer recupero</h2>
            <div class="field timer-duration-field">
              <label for="timerDuration">Durata secondi</label>
              <input id="timerDuration" inputmode="numeric" value="${workoutTimerDuration}">
            </div>
            <div class="timer-face" id="timerFace">${workoutTimerRemaining}</div>
            <div class="row-actions timer-actions">
              <button class="primary timer-main-action" id="timerStart">Start</button>
              <button class="secondary" id="timerPause">Pausa</button>
              <button class="secondary timer-main-action" id="timerReset">Reset</button>
            </div>
          </div>
          <div id="exerciseList">${draftWorkout.exercises.map(renderExerciseCard).join("")}</div>
        </div>
        <div>
          <div class="panel">
            <h2>Andamento ${splitTitle(activeDay)}</h2>
            <div class="field">
              <label for="chartExercise">Esercizio</label>
              <select id="chartExercise">${draftWorkout.exercises.map(ex => `<option value="${ex.id}" ${ex.id === selectedExercise ? "selected" : ""}>${ex.name}</option>`).join("")}</select>
            </div>
            <div class="chart" id="workoutChart">${renderWorkoutChart(selectedExercise)}</div>
          </div>
          <div class="panel"><h2>Log workout salvati</h2><div id="workoutHistory">${renderWorkoutHistorySplit()}</div></div>
        </div>
      </div>
    `;
  }

  renderWorkout = renderWorkoutSplit;
  renderWorkoutHistory = renderWorkoutHistorySplit;

  if (oldCloudRowsFromState) {
    cloudRowsFromState = function patchedCloudRowsFromState(userId) {
      const rows = oldCloudRowsFromState(userId);
      const byId = new Map((state.workouts || []).map(workout => [workout.id, workoutDayOf(workout)]));
      (rows.workouts || []).forEach(row => { row.workout_day = byId.get(row.id) || "full"; });
      return rows;
    };
  }

  if (oldStateFromCloudRows) {
    stateFromCloudRows = function patchedStateFromCloudRows(rows) {
      const fresh = oldStateFromCloudRows(rows);
      const byId = new Map((rows.workouts || []).map(row => [row.id, row.workout_day || "full"]));
      fresh.workouts = (fresh.workouts || []).map(workout => ({ ...workout, workoutDay: byId.get(workout.id) || "full" }));
      return fresh;
    };
  }

  document.addEventListener("click", event => {
    const dayBtn = event.target.closest?.("[data-workout-day]");
    if (dayBtn) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setDraftForSplit(draftWorkout?.date || selectedDate || todayISO(), dayBtn.dataset.workoutDay);
      renderWorkout();
      return;
    }
    if (event.target.id === "saveWorkoutSplit") {
      event.preventDefault();
      event.stopImmediatePropagation();
      draftWorkout.date = document.getElementById("workoutDate")?.value || todayISO();
      saveSplitWorkout();
      return;
    }
    const load = event.target.closest?.("[data-load-workout-split]");
    if (load) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const [date, day] = load.dataset.loadWorkoutSplit.split(":");
      setDraftForSplit(date, SPLITS[day] ? day : "upper");
      render();
      switchScreen("workout");
      return;
    }
    const del = event.target.closest?.("[data-delete-workout-split]");
    if (del) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const [date, day] = del.dataset.deleteWorkoutSplit.split(":");
      state.workouts = (state.workouts || []).filter(workout => !(workout.date === date && workoutDayOf(workout) === day));
      saveState();
      setDraftForSplit(selectedDate || todayISO(), activeDay);
      toast("Workout eliminato");
      render();
      switchScreen("workout");
    }
  }, true);

  document.addEventListener("input", event => {
    if (event.target?.id === "workoutDate") {
      event.preventDefault();
      event.stopImmediatePropagation();
      setDraftForSplit(event.target.value || todayISO(), activeDay);
      render();
      switchScreen("workout");
    }
  }, true);

  ensureWorkoutTemplate();
  if (document.querySelector("#screen-workout.active")) renderWorkout();
})();
