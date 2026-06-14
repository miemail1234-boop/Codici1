(() => {
  const SUPABASE_URL = "https://kujyowhezihjambhpahe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3";
  const ACTIVE_DAY_KEY = "life-tracker-standalone-workout-day-v1";

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const $ = id => document.getElementById(id);
  const today = () => new Date().toISOString().slice(0, 10);
  const num = value => {
    const parsed = Number(String(value ?? 0).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const fmt = value => new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 }).format(num(value));
  const safe = value => String(value ?? "").replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));

  const splits = {
    upper: ["panca-inclinata", "trazioni", "rematore", "alzate-laterali", "tricipiti", "bicipiti"],
    lower: ["bulgarian-split-squat", "back-extension", "addominali"],
  };
  splits.full = [...splits.upper, ...splits.lower];

  const defaults = {
    "panca-inclinata": { id: "panca-inclinata", name: "Panca inclinata", note: "Manubri/macchina", sets: [{ kg: 9, reps: 10 }, { kg: 9, reps: 10 }, { kg: 9, reps: 10 }] },
    "trazioni": { id: "trazioni", name: "Trazioni", note: "Peso corporeo", sets: [{ kg: 0, reps: 6 }, { kg: 0, reps: 6 }, { kg: 0, reps: 6 }] },
    "rematore": { id: "rematore", name: "Rematore", note: "Carico per mano/macchina", sets: [{ kg: 11, reps: 10 }, { kg: 11, reps: 10 }, { kg: 11, reps: 10 }] },
    "alzate-laterali": { id: "alzate-laterali", name: "Alzate laterali", note: "Manubri", sets: [{ kg: 4, reps: 10 }, { kg: 4, reps: 10 }, { kg: 4, reps: 10 }] },
    "tricipiti": { id: "tricipiti", name: "Tricipiti", note: "Esercizio corrente", sets: [{ kg: 5, reps: 10 }, { kg: 5, reps: 10 }] },
    "bicipiti": { id: "bicipiti", name: "Bicipiti", note: "Esercizio corrente", sets: [{ kg: 7, reps: 12 }, { kg: 7, reps: 12 }] },
    "bulgarian-split-squat": { id: "bulgarian-split-squat", name: "Bulgarian split squat", note: "Carico totale", sets: [{ kg: 6, reps: 12 }, { kg: 6, reps: 12 }, { kg: 6, reps: 12 }] },
    "back-extension": { id: "back-extension", name: "Back extension", note: "Pancia in giù su panca: solleva la schiena", sets: [{ kg: 0, reps: 20 }, { kg: 0, reps: 20 }, { kg: 0, reps: 20 }, { kg: 0, reps: 20 }] },
    "addominali": { id: "addominali", name: "Addominali", note: "Prima casella: secondi esercizio · seconda casella: secondi recupero", user_note: "3 serie da 30 secondi", sets: [{ kg: 30, reps: 30 }, { kg: 30, reps: 30 }, { kg: 30, reps: 30 }] },
  };

  let userId = "";
  let activeDay = localStorage.getItem(ACTIVE_DAY_KEY) || "upper";
  if (!splits[activeDay]) activeDay = "upper";
  let workouts = [];
  let exercises = [];
  let sets = [];
  let draft = [];

  function toast(message) {
    const node = $("toast");
    node.textContent = message;
    node.classList.add("show");
    setTimeout(() => node.classList.remove("show"), 2200);
  }

  function cloneExercise(exercise) {
    return {
      id: exercise.id || exercise.exercise_id,
      name: exercise.name || defaults[exercise.id || exercise.exercise_id]?.name || exercise.id || exercise.exercise_id || "Esercizio",
      note: exercise.note || "",
      user_note: exercise.user_note || exercise.userNote || "",
      sets: Array.isArray(exercise.sets) && exercise.sets.length
        ? exercise.sets.map(set => ({ kg: num(set.kg), reps: num(set.reps) }))
        : [{ kg: 0, reps: 10 }],
    };
  }

  function setVolume(exercise) {
    if (!exercise || !Array.isArray(exercise.sets)) return 0;
    if (exercise.id === "addominali") return exercise.sets.reduce((sum, set) => sum + num(set.kg), 0);
    const hasExternalLoad = exercise.sets.some(set => num(set.kg) > 0);
    if (!hasExternalLoad) return exercise.sets.reduce((sum, set) => sum + num(set.reps), 0);
    return exercise.sets.reduce((sum, set) => sum + num(set.kg) * num(set.reps), 0);
  }

  function volumeUnit(exercise) {
    if (exercise?.id === "addominali") return "sec esercizio";
    const hasExternalLoad = exercise?.sets?.some(set => num(set.kg) > 0);
    return hasExternalLoad ? "volume" : "rep";
  }

  function totalVolume(list = draft) {
    return list.reduce((sum, exercise) => sum + setVolume(exercise), 0);
  }

  function maxLoad(exercise) {
    if (!exercise?.sets?.length) return 0;
    return Math.max(...exercise.sets.map(set => exercise.id === "addominali" ? num(set.kg) : num(set.kg)));
  }

  function getExercises(workoutId) {
    return exercises
      .filter(exercise => exercise.workout_id === workoutId)
      .sort((a, b) => num(a.sort_order) - num(b.sort_order))
      .map(exercise => ({
        id: exercise.exercise_id,
        row_id: exercise.id,
        name: exercise.name,
        note: exercise.note || "",
        user_note: exercise.user_note || "",
        sets: sets
          .filter(set => set.exercise_row_id === exercise.id)
          .sort((a, b) => num(a.sort_order) - num(b.sort_order))
          .map(set => ({ kg: num(set.kg), reps: num(set.reps) })),
      }));
  }

  function findWorkout(date, day) {
    return workouts
      .filter(workout => workout.date === date && (workout.workout_day || "full") === day)
      .sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")))[0] || null;
  }

  function latestExercise(exerciseId, dateLimit = "") {
    const ordered = [...workouts].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    for (const workout of ordered) {
      if (dateLimit && workout.date > dateLimit) continue;
      const found = getExercises(workout.id).find(exercise => exercise.id === exerciseId);
      if (found) return cloneExercise(found);
    }
    return cloneExercise(defaults[exerciseId]);
  }

  function orderedDraftFromSaved(savedExercises, date) {
    return splits[activeDay].map(id => {
      const saved = savedExercises.find(exercise => exercise.id === id);
      return cloneExercise(saved || latestExercise(id, date));
    });
  }

  function buildDraft() {
    const date = $("dateInput").value || today();
    const savedWorkout = findWorkout(date, activeDay);
    if (savedWorkout) {
      draft = orderedDraftFromSaved(getExercises(savedWorkout.id), date);
    } else {
      draft = splits[activeDay].map(id => latestExercise(id, date));
    }
    render();
  }

  function render() {
    document.querySelectorAll("[data-day]").forEach(button => button.classList.toggle("active", button.dataset.day === activeDay));
    $("modeHint").textContent = activeDay === "full"
      ? "Archivio storico dei vecchi workout completi. Usalo solo come consultazione o salvataggio non diviso."
      : `Workout ${activeDay}: salvataggio indipendente, senza toccare altre sezioni.`;
    $("exerciseList").innerHTML = draft.map((exercise, index) => exerciseHtml(exercise, index)).join("");
    updateVolumes();
    renderHistory();
  }

  function exerciseHtml(exercise, index) {
    const isAbs = exercise.id === "addominali";
    return `<div class="exercise" data-ex="${index}">
      <div class="exercise-head">
        <div><h3>${safe(exercise.name)}</h3><p class="note">${safe(exercise.note || "")}</p></div>
        <span class="chip"><span data-ex-volume="${index}">0</span> ${safe(volumeUnit(exercise))}</span>
      </div>
      <div class="sets">
        ${(exercise.sets || []).map((set, setIndex) => `<div class="setrow">
          <span>${setIndex + 1}</span>
          <input data-kg="${index}:${setIndex}" inputmode="decimal" value="${safe(set.kg)}" placeholder="${isAbs ? "sec esercizio" : "kg"}">
          <input data-reps="${index}:${setIndex}" inputmode="decimal" value="${safe(set.reps)}" placeholder="${isAbs ? "sec recupero" : "reps"}">
          <button class="btn danger" data-delset="${index}:${setIndex}">×</button>
        </div>`).join("")}
      </div>
      <div class="row" style="margin-top:10px"><button class="btn" data-addset="${index}">+ serie</button></div>
      <div class="field" style="margin-top:10px"><label>Note esercizio</label><textarea data-note="${index}">${safe(exercise.user_note || "")}</textarea></div>
      <div class="mini-chart" data-chart="${index}">${chartHtml(exercise.id, exercise)}</div>
    </div>`;
  }

  function historyForExercise(exerciseId, previewExercise = null) {
    const rows = workouts
      .filter(workout => (workout.workout_day || "full") === activeDay)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map(workout => {
        const exercise = getExercises(workout.id).find(item => item.id === exerciseId);
        if (!exercise) return null;
        return { date: workout.date, volume: setVolume(exercise), load: maxLoad(exercise) };
      })
      .filter(Boolean);
    const currentDate = $("dateInput")?.value || today();
    if (previewExercise) {
      const preview = { date: currentDate, volume: setVolume(previewExercise), load: maxLoad(previewExercise), preview: true };
      const existingIndex = rows.findIndex(row => row.date === currentDate);
      if (existingIndex >= 0) rows[existingIndex] = preview;
      else rows.push(preview);
    }
    return rows.sort((a, b) => String(a.date).localeCompare(String(b.date))).slice(-8);
  }

  function trendInfo(rows) {
    if (rows.length < 2) return { symbol: "·", label: "Dati insufficienti", className: "" };
    const previous = rows[rows.length - 2];
    const latest = rows[rows.length - 1];
    const tolerance = Math.max(1, Math.abs(previous.volume) * 0.01);
    if (latest.volume > previous.volume + tolerance) return { symbol: "↗", label: "Migliora", className: "good" };
    if (latest.volume < previous.volume - tolerance) return { symbol: "↘", label: "Peggiora", className: "bad" };
    return { symbol: "→", label: "Stasi", className: "flat" };
  }

  function chartHtml(exerciseId, previewExercise = null) {
    const rows = historyForExercise(exerciseId, previewExercise);
    if (rows.length < 2) return `<div class="chart-title">Andamento</div><p class="small">Servono almeno due salvataggi per il grafico.</p>`;
    const max = Math.max(...rows.map(row => row.volume), 1);
    const trend = trendInfo(rows);
    const loadIncreased = rows.length >= 2 && rows[rows.length - 1].load > rows[rows.length - 2].load;
    return `<div class="chart-title">Andamento volume <span class="trend ${trend.className}">${trend.symbol} ${trend.label}</span>${loadIncreased ? `<span class="trend warn">! carico/tempo aumentato</span>` : ""}</div>
      <div class="spark">${rows.map(row => `<div class="bar-wrap"><div class="bar ${row.preview ? "preview" : ""}" style="height:${Math.max(8, Math.round((row.volume / max) * 78))}px"></div><small>${safe(row.date.slice(5))}</small></div>`).join("")}</div>
      <div class="legend">↗ Migliora · → Stasi · ↘ Peggiora · ! carico/tempo aumentato</div>`;
  }

  function updateVolumes() {
    draft.forEach((exercise, index) => {
      const volumeNode = document.querySelector(`[data-ex-volume="${index}"]`);
      if (volumeNode) volumeNode.textContent = fmt(setVolume(exercise));
      const chartNode = document.querySelector(`[data-chart="${index}"]`);
      if (chartNode) chartNode.innerHTML = chartHtml(exercise.id, exercise);
    });
    const total = totalVolume();
    $("topVolume").textContent = fmt(total);
    $("summary").innerHTML = `<p><span class="chip">${draft.length} esercizi</span> <span class="chip">volume totale ${fmt(total)}</span></p>`;
  }

  function workoutVolume(workout) {
    return getExercises(workout.id).reduce((sum, exercise) => sum + setVolume(exercise), 0);
  }

  function renderHistory() {
    const list = workouts
      .filter(workout => (workout.workout_day || "full") === activeDay)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    $("history").innerHTML = list.length
      ? list.map(workout => `<div class="history-item"><div class="history-title"><strong>${safe(workout.date)} · ${safe(activeDay)}</strong><button class="btn" data-open="${safe(workout.date)}">Apri</button></div><div class="small">${getExercises(workout.id).length} esercizi · volume ${fmt(workoutVolume(workout))}</div></div>`).join("")
      : `<p class="small">Nessun workout ${safe(activeDay)} salvato.</p>`;
  }

  async function loadCloud() {
    const auth = await client.auth.getSession();
    const session = auth.data.session;
    if (!session) {
      $("authBox").innerHTML = "Non risulti collegato a Supabase. Apri prima la Life Tracker e fai login da Dati → Cloud Supabase.";
      return;
    }
    userId = session.user.id;
    $("authBox").classList.add("hidden");
    $("app").classList.remove("hidden");
    const [workoutRows, exerciseRows, setRows] = await Promise.all([
      client.from("workouts").select("*").eq("user_id", userId).order("date", { ascending: false }),
      client.from("workout_exercises").select("*").eq("user_id", userId),
      client.from("workout_sets").select("*").eq("user_id", userId),
    ]);
    if (workoutRows.error || exerciseRows.error || setRows.error) {
      console.error(workoutRows.error, exerciseRows.error, setRows.error);
      toast("Errore lettura cloud");
      return;
    }
    workouts = workoutRows.data || [];
    exercises = exerciseRows.data || [];
    sets = setRows.data || [];
    if (!$("dateInput").value) $("dateInput").value = today();
    buildDraft();
    toast("Workout caricati");
  }

  async function saveWorkout() {
    const date = $("dateInput").value || today();
    const oldWorkout = findWorkout(date, activeDay);
    const workoutId = oldWorkout?.id || `workout-${date}-${activeDay}`;
    const oldExercises = oldWorkout ? getExercises(oldWorkout.id) : [];
    if (oldExercises.length) {
      const oldIds = oldExercises.map(exercise => exercise.row_id).filter(Boolean);
      if (oldIds.length) await client.from("workout_sets").delete().eq("user_id", userId).in("exercise_row_id", oldIds);
      await client.from("workout_exercises").delete().eq("user_id", userId).eq("workout_id", workoutId);
    }
    const workoutUpsert = await client.from("workouts").upsert({
      user_id: userId,
      id: workoutId,
      date,
      workout_day: activeDay,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,id" });
    if (workoutUpsert.error) {
      console.error(workoutUpsert.error);
      toast("Errore salvataggio workout");
      return;
    }
    const exerciseRows = [];
    const setRows = [];
    draft.forEach((exercise, exerciseIndex) => {
      const exerciseRowId = `${workoutId}-${exercise.id}`;
      exerciseRows.push({
        user_id: userId,
        id: exerciseRowId,
        workout_id: workoutId,
        exercise_id: exercise.id,
        name: exercise.name,
        note: exercise.note || "",
        user_note: exercise.user_note || "",
        sort_order: exerciseIndex,
        updated_at: new Date().toISOString(),
      });
      (exercise.sets || []).forEach((set, setIndex) => {
        setRows.push({
          user_id: userId,
          id: `${exerciseRowId}-set-${setIndex}`,
          exercise_row_id: exerciseRowId,
          kg: num(set.kg),
          reps: num(set.reps),
          sort_order: setIndex,
          updated_at: new Date().toISOString(),
        });
      });
    });
    const exerciseInsert = await client.from("workout_exercises").insert(exerciseRows);
    if (exerciseInsert.error) {
      console.error(exerciseInsert.error);
      toast("Errore salvataggio esercizi");
      return;
    }
    if (setRows.length) {
      const setInsert = await client.from("workout_sets").insert(setRows);
      if (setInsert.error) {
        console.error(setInsert.error);
        toast("Errore salvataggio serie");
        return;
      }
    }
    await loadCloud();
    activeDay = activeDay;
    $("dateInput").value = date;
    buildDraft();
    toast("Workout salvato");
  }

  document.addEventListener("input", event => {
    const kg = event.target.dataset.kg;
    const reps = event.target.dataset.reps;
    const note = event.target.dataset.note;
    if (kg) {
      const [exerciseIndex, setIndex] = kg.split(":").map(Number);
      draft[exerciseIndex].sets[setIndex].kg = event.target.value;
      updateVolumes();
    }
    if (reps) {
      const [exerciseIndex, setIndex] = reps.split(":").map(Number);
      draft[exerciseIndex].sets[setIndex].reps = event.target.value;
      updateVolumes();
    }
    if (note) draft[Number(note)].user_note = event.target.value;
  });

  document.addEventListener("click", event => {
    const day = event.target.dataset.day;
    if (day) {
      activeDay = day;
      localStorage.setItem(ACTIVE_DAY_KEY, activeDay);
      buildDraft();
      return;
    }
    const addSet = event.target.dataset.addset;
    if (addSet != null) {
      const exercise = draft[Number(addSet)];
      exercise.sets.push(exercise.id === "addominali" ? { kg: 30, reps: 30 } : { kg: 0, reps: 10 });
      render();
      return;
    }
    const delSet = event.target.dataset.delset;
    if (delSet) {
      const [exerciseIndex, setIndex] = delSet.split(":").map(Number);
      draft[exerciseIndex].sets.splice(setIndex, 1);
      render();
      return;
    }
    const openDate = event.target.dataset.open;
    if (openDate) {
      $("dateInput").value = openDate;
      buildDraft();
      return;
    }
  });

  $("dateInput").addEventListener("change", buildDraft);
  $("calendarBtn").addEventListener("click", () => {
    const input = $("dateInput");
    if (typeof input.showPicker === "function") input.showPicker();
    else input.focus();
  });
  $("saveBtn").addEventListener("click", saveWorkout);
  $("saveBtn2").addEventListener("click", saveWorkout);
  $("reloadBtn").addEventListener("click", loadCloud);
  $("dateInput").value = today();
  loadCloud();
})();
