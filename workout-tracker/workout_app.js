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
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

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

  function setCount(exercise) {
    return Array.isArray(exercise?.sets) ? exercise.sets.length : 0;
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
        return { date: workout.date, volume: setVolume(exercise), load: maxLoad(exercise), setCount: setCount(exercise) };
      })
      .filter(Boolean);
    const currentDate = $("dateInput")?.value || today();
    if (previewExercise) {
      const preview = { date: currentDate, volume: setVolume(previewExercise), load: maxLoad(previewExercise), setCount: setCount(previewExercise), preview: true };
      const existingIndex = rows.findIndex(row => row.date === currentDate);
      if (existingIndex >= 0) rows[existingIndex] = preview;
      else rows.push(preview);
    }
    return rows.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }

  function globalHistoryRows() {
    const rows = workouts
      .filter(workout => (workout.workout_day || "full") === activeDay)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map(workout => {
        const list = getExercises(workout.id);
        return {
          date: workout.date,
          volume: totalVolume(list),
          load: list.reduce((sum, exercise) => sum + maxLoad(exercise), 0),
          setCount: list.reduce((sum, exercise) => sum + setCount(exercise), 0),
        };
      });
    const currentDate = $("dateInput")?.value || today();
    if (draft.length) {
      const preview = {
        date: currentDate,
        volume: totalVolume(draft),
        load: draft.reduce((sum, exercise) => sum + maxLoad(exercise), 0),
        setCount: draft.reduce((sum, exercise) => sum + setCount(exercise), 0),
        preview: true,
      };
      const existingIndex = rows.findIndex(row => row.date === currentDate);
      if (existingIndex >= 0) rows[existingIndex] = preview;
      else rows.push(preview);
    }
    return rows.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }

  function trendInfo(rows, index = rows.length - 1) {
    if (rows.length < 2 || index <= 0) return { symbol: "·", label: "Baseline", className: "", color: "var(--accent)" };
    const previous = num(rows[index - 1].volume);
    const latest = num(rows[index].volume);
    if (latest > previous) return { symbol: "↗", label: "Migliora", className: "good", color: "var(--ok)" };
    if (latest < previous) return { symbol: "↘", label: "Peggiora", className: "bad", color: "var(--danger)" };
    return { symbol: "→", label: "Stasi", className: "warn", color: "var(--warn)" };
  }

  function progressionInfo(rows, index) {
    if (rows.length < 2 || index <= 0) return false;
    const previous = rows[index - 1];
    const latest = rows[index];
    return num(latest.load) > num(previous.load) || num(latest.setCount) > num(previous.setCount);
  }

  function progressIndex(rows) {
    if (rows.length < 3) {
      return { score: 50, label: "Dati insufficienti", className: "warn", advice: "Servono almeno 3 salvataggi per stimare la stasi." };
    }
    const recent = rows.slice(-6);
    let improvements = 0;
    let declines = 0;
    let stases = 0;
    let progressions = 0;
    for (let index = 1; index < recent.length; index += 1) {
      const previous = num(recent[index - 1].volume);
      const latest = num(recent[index].volume);
      if (latest > previous) improvements += 1;
      else if (latest < previous) declines += 1;
      else stases += 1;
      if (progressionInfo(recent, index)) progressions += 1;
    }
    const first = Math.max(1, num(recent[0].volume));
    const last = num(recent[recent.length - 1].volume);
    const percentChange = ((last - first) / first) * 100;
    const latestTrend = trendInfo(recent);
    const rawScore = 50 + improvements * 8 + progressions * 5 - declines * 12 - stases * 4 + clamp(percentChange, -20, 20);
    const score = Math.round(clamp(rawScore, 0, 100));
    if (score >= 70) return { score, label: "Progressione buona", className: "good", advice: "Segnale positivo: non serve aumentare calorie per questo indicatore.", latestTrend };
    if (score >= 45) return { score, label: "Stasi lieve", className: "warn", advice: "Monitorare: non è ancora un segnale forte per aumentare calorie.", latestTrend };
    return { score, label: "Stallo probabile", className: "bad", advice: "Possibile limite di recupero/energia: valuta +150-250 kcal se dura 2-3 settimane.", latestTrend };
  }

  function calorieSignal(rows) {
    const index = progressIndex(rows);
    if (index.score >= 70) return { ...index, label: "Calorie ok", advice: "Progressione globale buona: puoi restare sulle calorie attuali." };
    if (index.score >= 45) return { ...index, label: "Monitora", advice: "Progressione incerta: resta stabile e rivaluta tra 1-2 settimane." };
    return { ...index, label: "Possibile aumento", advice: "Stallo globale: valuta +150-250 kcal/die, soprattutto se peso e performance calano." };
  }

  function lineChartSvg(rows, ariaLabel) {
    const width = Math.max(330, 52 + (rows.length - 1) * 58);
    const height = 132;
    const padX = 26;
    const top = 14;
    const chartHeight = 82;
    const volumes = rows.map(row => num(row.volume));
    const min = Math.min(...volumes);
    const max = Math.max(...volumes);
    const range = max - min || 1;
    const xFor = index => padX + index * ((width - padX * 2) / (rows.length - 1));
    const yFor = volume => top + ((max - volume) / range) * chartHeight;
    const points = rows.map((row, index) => {
      const trend = trendInfo(rows, index);
      return {
        row,
        index,
        x: Math.round(xFor(index) * 10) / 10,
        y: Math.round(yFor(num(row.volume)) * 10) / 10,
        trend,
        progression: progressionInfo(rows, index),
      };
    });
    const labelStep = Math.max(1, Math.ceil(rows.length / 7));
    const segments = points.slice(1).map(point => {
      const previous = points[point.index - 1];
      const dash = point.row.preview ? ` stroke-dasharray="5 5"` : "";
      return `<line x1="${previous.x}" y1="${previous.y}" x2="${point.x}" y2="${point.y}" stroke="${point.trend.color || "var(--accent)"}" stroke-width="3.5" stroke-linecap="round"${dash}></line>`;
    }).join("");
    const markers = points.map(point => {
      const showDate = rows.length <= 10 || point.index === 0 || point.index === rows.length - 1 || point.index % labelStep === 0;
      const title = `${point.row.date}: ${fmt(point.row.volume)} · ${point.trend.label}${point.progression ? " · aumento serie/carico" : ""}`;
      return `<g><title>${safe(title)}</title><circle cx="${point.x}" cy="${point.y}" r="5" fill="${point.trend.color || "var(--accent)"}" stroke="#0b141d" stroke-width="${point.row.preview ? 3 : 2}"></circle></g>
        ${point.progression ? `<text x="${point.x}" y="${Math.max(12, point.y - 9)}" fill="var(--warn)" font-size="17" font-weight="800" text-anchor="middle">!</text>` : ""}
        ${showDate ? `<text x="${point.x}" y="${height - 10}" fill="var(--muted)" font-size="10" text-anchor="middle">${safe(point.row.date.slice(5))}</text>` : ""}`;
    }).join("");
    return `<div class="spark line-spark" style="height:148px;display:block;padding:8px;overflow-x:auto">
      <svg class="line-chart" viewBox="0 0 ${width} ${height}" style="display:block;height:132px;min-width:100%" role="img" aria-label="${safe(ariaLabel)}">
        <line x1="${padX}" y1="${top}" x2="${width - padX}" y2="${top}" stroke="rgba(255,255,255,.11)" stroke-width="1"></line>
        <line x1="${padX}" y1="${top + chartHeight}" x2="${width - padX}" y2="${top + chartHeight}" stroke="rgba(255,255,255,.11)" stroke-width="1"></line>
        ${segments}
        ${markers}
      </svg>
    </div>`;
  }

  function indexBadge(index) {
    return `<span class="trend ${index.className}">IP ${index.score}/100 · ${safe(index.label)}</span>`;
  }

  function chartHtml(exerciseId, previewExercise = null) {
    const rows = historyForExercise(exerciseId, previewExercise);
    if (rows.length < 2) return `<div class="chart-title">Andamento</div><p class="small">Servono almeno due salvataggi per il grafico.</p>`;
    const latestTrend = trendInfo(rows);
    const latestProgression = progressionInfo(rows, rows.length - 1);
    const index = progressIndex(rows);
    return `<div class="chart-title">Andamento volume <span class="trend ${latestTrend.className}">${latestTrend.symbol} ${latestTrend.label}</span>${latestProgression ? `<span class="trend warn">! serie/carico aumentato</span>` : ""}${indexBadge(index)}</div>
      ${lineChartSvg(rows, `Andamento volume ${exerciseId}`)}
      <div class="legend"><span style="color:var(--ok)">● migliora</span> · <span style="color:var(--warn)">● stasi</span> · <span style="color:var(--danger)">● peggiora</span> · <span style="color:var(--warn);font-weight:800">!</span> serie/carico aumentato</div>
      <div class="small">${safe(index.advice)}</div>`;
  }

  function renderOverallChart() {
    const node = $("overallChart");
    if (!node) return;
    const rows = globalHistoryRows();
    if (rows.length < 2) {
      node.innerHTML = `<h2>Andamento generale</h2><p class="small">Servono almeno due salvataggi per il grafico generale.</p>`;
      return;
    }
    const latestTrend = trendInfo(rows);
    const latestProgression = progressionInfo(rows, rows.length - 1);
    const progress = progressIndex(rows);
    const calories = calorieSignal(rows);
    node.innerHTML = `<h2>Andamento generale</h2>
      <div class="chart-title">Volume totale ${safe(activeDay)} <span class="trend ${latestTrend.className}">${latestTrend.symbol} ${latestTrend.label}</span>${latestProgression ? `<span class="trend warn">! serie/carico aumentato</span>` : ""}${indexBadge(progress)} <span class="trend ${calories.className}">${safe(calories.label)}</span></div>
      ${lineChartSvg(rows, `Andamento generale ${activeDay}`)}
      <div class="legend"><span style="color:var(--ok)">● migliora</span> · <span style="color:var(--warn)">● stasi</span> · <span style="color:var(--danger)">● peggiora</span> · <span style="color:var(--warn);font-weight:800">!</span> serie/carico aumentato</div>
      <p class="small"><strong>Indice globale:</strong> ${progress.score}/100. ${safe(calories.advice)}</p>`;
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
    renderOverallChart();
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
