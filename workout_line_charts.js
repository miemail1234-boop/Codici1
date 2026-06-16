(() => {
  const SUPABASE_URL = "https://kujyowhezihjambhpahe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3";
  const splits = {
    upper: ["panca-inclinata", "trazioni", "rematore", "alzate-laterali", "tricipiti", "bicipiti"],
    lower: ["bulgarian-split-squat", "back-extension", "addominali"],
  };
  splits.full = [...splits.upper, ...splits.lower];

  const chartClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_KEY);
  const num = value => {
    const parsed = Number(String(value ?? 0).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const fmt = value => new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 }).format(num(value));
  const safe = value => String(value ?? "").replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
  const today = () => new Date().toISOString().slice(0, 10);

  let workouts = [];
  let workoutExercises = [];
  let workoutSets = [];
  let userId = "";
  let isRendering = false;
  let renderTimer = 0;
  let fetchTimer = 0;
  let cloudRevision = 0;

  function injectStyles() {
    if (document.getElementById("workoutLineChartStyles")) return;
    const style = document.createElement("style");
    style.id = "workoutLineChartStyles";
    style.textContent = `
      .trend.flat{color:var(--warn)}
      .spark.line-spark{height:142px;display:block;align-items:initial;gap:0;padding:8px;overflow-x:auto}
      .line-chart{display:block;height:126px;min-width:100%}
      .legend-good{color:var(--ok)}.legend-flat{color:var(--warn)}.legend-bad{color:var(--danger)}.legend-warn{color:var(--warn);font-weight:800}
    `;
    document.head.appendChild(style);
  }

  async function fetchCloudForCharts() {
    if (!chartClient) return;
    const auth = await chartClient.auth.getSession();
    const session = auth.data.session;
    if (!session) return;
    userId = session.user.id;
    const [workoutRows, exerciseRows, setRows] = await Promise.all([
      chartClient.from("workouts").select("*").eq("user_id", userId).order("date", { ascending: false }),
      chartClient.from("workout_exercises").select("*").eq("user_id", userId),
      chartClient.from("workout_sets").select("*").eq("user_id", userId),
    ]);
    if (workoutRows.error || exerciseRows.error || setRows.error) return;
    workouts = workoutRows.data || [];
    workoutExercises = exerciseRows.data || [];
    workoutSets = setRows.data || [];
    cloudRevision += 1;
    scheduleRender();
  }

  function activeDay() {
    return document.querySelector("[data-day].active")?.dataset.day || "upper";
  }

  function currentDate() {
    return document.getElementById("dateInput")?.value || today();
  }

  function setVolume(exercise) {
    if (!exercise || !Array.isArray(exercise.sets)) return 0;
    if (exercise.id === "addominali") return exercise.sets.reduce((sum, set) => sum + num(set.kg), 0);
    const hasExternalLoad = exercise.sets.some(set => num(set.kg) > 0);
    if (!hasExternalLoad) return exercise.sets.reduce((sum, set) => sum + num(set.reps), 0);
    return exercise.sets.reduce((sum, set) => sum + num(set.kg) * num(set.reps), 0);
  }

  function maxLoad(exercise) {
    if (!exercise?.sets?.length) return 0;
    return Math.max(...exercise.sets.map(set => num(set.kg)));
  }

  function metrics(exercise) {
    return {
      volume: setVolume(exercise),
      load: maxLoad(exercise),
      setCount: Array.isArray(exercise?.sets) ? exercise.sets.length : 0,
    };
  }

  function savedExercises(workoutId) {
    return workoutExercises
      .filter(exercise => exercise.workout_id === workoutId)
      .sort((a, b) => num(a.sort_order) - num(b.sort_order))
      .map(exercise => ({
        id: exercise.exercise_id,
        sets: workoutSets
          .filter(set => set.exercise_row_id === exercise.id)
          .sort((a, b) => num(a.sort_order) - num(b.sort_order))
          .map(set => ({ kg: num(set.kg), reps: num(set.reps) })),
      }));
  }

  function draftExerciseFromDom(card, exerciseId, index) {
    const kgInputs = [...card.querySelectorAll(`input[data-kg^="${index}:"]`)];
    const sets = kgInputs.map(input => {
      const [, setIndex] = input.dataset.kg.split(":");
      const repsInput = card.querySelector(`input[data-reps="${index}:${setIndex}"]`);
      return { kg: num(input.value), reps: num(repsInput?.value) };
    });
    return { id: exerciseId, sets };
  }

  function chartSignature(exerciseId, previewExercise) {
    return JSON.stringify({
      cloudRevision,
      day: activeDay(),
      date: currentDate(),
      exerciseId,
      sets: (previewExercise?.sets || []).map(set => [num(set.kg), num(set.reps)]),
    });
  }

  function rowsForExercise(exerciseId, previewExercise) {
    const day = activeDay();
    const rows = workouts
      .filter(workout => (workout.workout_day || "full") === day)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map(workout => {
        const exercise = savedExercises(workout.id).find(item => item.id === exerciseId);
        if (!exercise) return null;
        return { date: workout.date, ...metrics(exercise) };
      })
      .filter(Boolean);

    if (previewExercise) {
      const preview = { date: currentDate(), ...metrics(previewExercise), preview: true };
      const existing = rows.findIndex(row => row.date === preview.date);
      if (existing >= 0) rows[existing] = preview;
      else rows.push(preview);
    }
    return rows.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }

  function pointTrend(rows, index) {
    if (index <= 0 || rows.length < 2) return { symbol: "·", label: "Baseline", key: "neutral", color: "var(--accent)" };
    const previous = rows[index - 1];
    const current = rows[index];
    const tolerance = Math.max(1, Math.abs(previous.volume) * 0.01);
    if (current.volume > previous.volume + tolerance) return { symbol: "↗", label: "Migliora", key: "good", color: "var(--ok)" };
    if (current.volume < previous.volume - tolerance) return { symbol: "↘", label: "Peggiora", key: "bad", color: "var(--danger)" };
    return { symbol: "→", label: "Stasi", key: "flat", color: "var(--warn)" };
  }

  function progression(rows, index) {
    if (index <= 0 || rows.length < 2) return false;
    const previous = rows[index - 1];
    const current = rows[index];
    return num(current.load) > num(previous.load) || num(current.setCount) > num(previous.setCount);
  }

  function chartHtml(exerciseId, previewExercise) {
    const rows = rowsForExercise(exerciseId, previewExercise);
    if (rows.length < 2) return `<div class="chart-title">Andamento</div><p class="small">Servono almeno due salvataggi per il grafico.</p>`;

    const width = Math.max(320, (rows.length - 1) * 58 + 56);
    const height = 126;
    const padX = 26;
    const top = 14;
    const chartH = 78;
    const volumes = rows.map(row => num(row.volume));
    const min = Math.min(...volumes);
    const max = Math.max(...volumes);
    const range = max - min || 1;
    const xFor = index => padX + index * ((width - padX * 2) / (rows.length - 1));
    const yFor = volume => top + ((max - volume) / range) * chartH;
    const points = rows.map((row, index) => ({
      row,
      index,
      trend: pointTrend(rows, index),
      x: Math.round(xFor(index) * 10) / 10,
      y: Math.round(yFor(num(row.volume)) * 10) / 10,
      progression: progression(rows, index),
    }));
    const latest = pointTrend(rows, rows.length - 1);
    const latestProgression = progression(rows, rows.length - 1);
    const labelStep = Math.max(1, Math.ceil(rows.length / 7));
    const segments = points.slice(1).map(point => {
      const previous = points[point.index - 1];
      const dash = point.row.preview ? " stroke-dasharray=\"5 5\"" : "";
      return `<line x1="${previous.x}" y1="${previous.y}" x2="${point.x}" y2="${point.y}" stroke="${point.trend.color}" stroke-width="3.5" stroke-linecap="round"${dash}></line>`;
    }).join("");
    const markers = points.map(point => {
      const row = point.row;
      const status = point.trend;
      const title = `${row.date}: ${fmt(row.volume)} · ${status.label}${point.progression ? " · aumento serie/carico" : ""}`;
      const showDate = rows.length <= 10 || point.index === 0 || point.index === points.length - 1 || point.index % labelStep === 0;
      return `<g>
          <title>${safe(title)}</title>
          <circle cx="${point.x}" cy="${point.y}" r="5" fill="${status.color}" stroke="#0b141d" stroke-width="${row.preview ? 3 : 2}"></circle>
        </g>
        ${point.progression ? `<text x="${point.x}" y="${Math.max(12, point.y - 9)}" fill="var(--warn)" font-size="16" font-weight="800" text-anchor="middle">!</text>` : ""}
        ${showDate ? `<text x="${point.x}" y="${height - 10}" fill="var(--muted)" font-size="10" text-anchor="middle">${safe(row.date.slice(5))}</text>` : ""}`;
    }).join("");

    return `<div class="chart-title">Andamento volume <span class="trend ${latest.key}">${latest.symbol} ${latest.label}</span>${latestProgression ? `<span class="trend warn">! serie/carico aumentato</span>` : ""}</div>
      <div class="spark line-spark"><svg class="line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Andamento volume ${safe(exerciseId)}">
        <line x1="${padX}" y1="${top}" x2="${width - padX}" y2="${top}" stroke="rgba(255,255,255,.11)" stroke-width="1"></line>
        <line x1="${padX}" y1="${top + chartH}" x2="${width - padX}" y2="${top + chartH}" stroke="rgba(255,255,255,.11)" stroke-width="1"></line>
        ${segments}
        ${markers}
      </svg></div>
      <div class="legend"><span class="legend-good">● migliora</span> · <span class="legend-flat">● stasi</span> · <span class="legend-bad">● peggiora</span> · <span class="legend-warn">!</span> serie/carico aumentato</div>`;
  }

  function renderCharts() {
    if (isRendering || !workouts.length) return;
    isRendering = true;
    try {
      const day = activeDay();
      const ids = splits[day] || splits.upper;
      [...document.querySelectorAll("#exerciseList .exercise")].forEach((card, index) => {
        const exerciseId = ids[index];
        const chart = card.querySelector(".mini-chart");
        if (!exerciseId || !chart) return;
        const previewExercise = draftExerciseFromDom(card, exerciseId, index);
        const signature = chartSignature(exerciseId, previewExercise);
        const alreadyLineChart = Boolean(chart.querySelector(".line-chart"));
        if (alreadyLineChart && chart.dataset.lineSignature === signature) return;
        chart.innerHTML = chartHtml(exerciseId, previewExercise);
        chart.dataset.lineSignature = signature;
      });
    } finally {
      isRendering = false;
    }
  }

  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderCharts, 60);
  }

  function scheduleFetch() {
    clearTimeout(fetchTimer);
    fetchTimer = setTimeout(() => fetchCloudForCharts().catch(() => {}), 700);
  }

  injectStyles();
  fetchCloudForCharts().catch(() => {});
  new MutationObserver(scheduleRender).observe(document.body, { childList: true, subtree: true });
  document.addEventListener("input", scheduleRender);
  document.addEventListener("change", scheduleRender);
  document.addEventListener("click", event => {
    if (event.target.closest("#saveBtn,#saveBtn2,#reloadBtn,[data-day],[data-open],[data-addset],[data-delset]")) {
      scheduleFetch();
      scheduleRender();
    }
  });
})();
