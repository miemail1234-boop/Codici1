/* Diario integrato calisthenics + pesi. Non altera il sync legacy dei workout. */
(() => {
  "use strict";
  const libraryTable = "training_exercise_library";
  const logTable = "training_logs";
  const PANEL_ID = "integrated-training-panel";
  let exercises = [];
  let logs = [];
  let accountId = "";
  let loadedAt = 0;
  let loading = false;
  let saving = false;
  let errorText = "";

  const esc = value => String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  const localDay = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };
  const getClient = () => typeof supabaseClient !== "undefined" ? supabaseClient : null;
  const getUser = () => typeof cloudUser !== "undefined" ? cloudUser : null;
  const currentId = () => getUser() && getUser().id ? getUser().id : "";
  const categoryName = kind => kind === "pesi" ? "Pesi" : kind === "calisthenics" ? "Calisthenics" : "Altro";
  const movementName = movement => ({ spinta: "Spinta", trazione: "Trazione", core: "Core", gambe: "Gambe", misto: "Misto", mobilita: "Mobilità" })[movement] || "Da classificare";
  const exerciseMap = () => Object.fromEntries(exercises.map(ex => [ex.id, ex]));
  const optionalNumber = raw => {
    const value = String(raw || "").trim().replace(",", ".");
    if (value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : NaN;
  };
  const prettyDate = value => {
    const parts = String(value || "").split("-");
    return parts.length === 3 ? parts[2] + "/" + parts[1] + "/" + parts[0] : String(value || "");
  };
  function status(message, isError) {
    const node = document.querySelector("#" + PANEL_ID + " .train-status");
    if (node) {
      node.textContent = message;
      node.style.color = isError ? "#b64036" : "";
    }
  }

  function styles() {
    if (document.getElementById("integrated-training-css")) return;
    const el = document.createElement("style");
    el.id = "integrated-training-css";
    el.textContent = [
      "#integrated-training-panel{margin:24px 0 45px;padding:20px;background:var(--surface,#fff);border-radius:18px;border:1px solid rgba(110,126,131,.28)}",
      "#integrated-training-panel h2{margin:0 0 8px;font-size:1.4rem}",
      "#integrated-training-panel h3{margin:16px 0 8px;font-size:1.1rem}",
      "#integrated-training-panel .train-sub{font-size:.9rem;opacity:.8;margin-bottom:12px}",
      "#integrated-training-panel .train-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:10px 0}",
      "#integrated-training-panel .train-field{display:flex;flex-direction:column;gap:5px;font-size:.9rem;min-width:0}",
      "#integrated-training-panel input,#integrated-training-panel textarea,#integrated-training-panel select{width:100%;box-sizing:border-box;padding:10px;border:1px solid #9aa8aa;border-radius:8px;background:var(--surface,#fff);color:inherit}",
      "#integrated-training-panel textarea{min-height:65px;resize:vertical}",
      "#integrated-training-panel button{padding:9px 13px;margin:4px 4px 4px 0;border:1px solid #759b98;border-radius:10px;cursor:pointer}",
      "#integrated-training-panel .train-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(255px,1fr));gap:10px}",
      "#integrated-training-panel .train-card{border:1px solid #a4b8b9;border-radius:12px;padding:12px;min-width:0;background:rgba(145,167,160,.06)}",
      "#integrated-training-panel .train-card strong{display:block;margin-bottom:5px}",
      "#integrated-training-panel .train-card small{line-height:1.5}",
      "#integrated-training-panel .train-status{min-height:20px;font-size:.9rem}",
      "#integrated-training-panel .train-history{display:grid;gap:8px;margin:10px 0}",
      "#integrated-training-panel .train-history-item{border-left:3px solid #739a8f;background:rgba(145,167,160,.06);padding:9px 12px;overflow-wrap:anywhere}",
      "#integrated-training-panel .train-history-item small{display:block;opacity:.85}",
      "#integrated-training-panel .train-pill{display:inline-block;border:1px solid #93aaa0;border-radius:20px;padding:3px 8px;margin:3px;font-size:.82rem}",
      "#integrated-training-panel .train-muted{opacity:.8;font-size:.87rem}",
      "#integrated-training-panel details{margin-top:14px}",
      "#integrated-training-panel summary{font-weight:700;cursor:pointer}",
      "#integrated-training-panel .train-danger{color:#ab3c36;border-color:#c08b86}",
      "@media(max-width:600px){#integrated-training-panel{padding:12px}.train-grid{grid-template-columns:1fr 1fr}}"
    ].join("");
    document.head.appendChild(el);
  }

  function ensurePanel() {
    const workout = document.getElementById("screen-workout");
    if (!workout || !workout.children.length) return;
    styles();
    if (!document.getElementById(PANEL_ID)) {
      const section = document.createElement("section");
      section.id = PANEL_ID;
      section.innerHTML = '<h2>Diario allenamenti · Calisthenics + Pesi</h2><p class="train-sub">Catalogo, skill, serie, tenute e storico. I workout con i pesi già registrati restano disponibili.</p><p class="train-status">Caricamento...</p><div class="train-content"></div>';
      workout.appendChild(section);
      renderContent();
    }
    if (currentId() && (!loadedAt || accountId !== currentId()) && !loading) loadData();
  }

  async function loadData(force) {
    const client = getClient();
    const id = currentId();
    if (!client || !id || loading) return;
    if (!force && accountId === id && loadedAt && Date.now() - loadedAt < 15000) return;
    loading = true;
    status("Sincronizzazione catalogo e allenamenti...", false);
    try {
      const results = await Promise.all([
        client.from(libraryTable).select("*").eq("user_id", id).order("name"),
        client.from(logTable).select("*").eq("user_id", id).order("training_date", { ascending: false }).limit(300)
      ]);
      if (results[0].error) throw results[0].error;
      if (results[1].error) throw results[1].error;
      if (currentId() !== id) return;
      exercises = results[0].data || [];
      logs = results[1].data || [];
      loadedAt = Date.now();
      accountId = id;
      errorText = "";
      renderContent();
      status("Catalogo e sedute sincronizzati con Supabase.", false);
    } catch (err) {
      errorText = err && err.message ? err.message : String(err);
      status("Errore caricamento: " + errorText, true);
    } finally {
      loading = false;
    }
  }

  function movementSummary() {
    const recent = logs.filter(l => l.training_date >= (() => {
      const d = new Date();
      d.setDate(d.getDate() - 13);
      return d.toISOString().slice(0, 10);
    })());
    const map = exerciseMap();
    const counts = { spinta: 0, trazione: 0, core: 0, gambe: 0 };
    recent.forEach(l => {
      const movement = map[l.exercise_id] && map[l.exercise_id].movement;
      if (Object.prototype.hasOwnProperty.call(counts, movement)) counts[movement]++;
    });
    return Object.entries(counts).map(pair => '<span class="train-pill">' + movementName(pair[0]) + ': ' + pair[1] + '</span>').join("");
  }

  function options() {
    const sorted = [...exercises].sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name, "it"));
    return sorted.map(ex => '<option value="' + esc(ex.id) + '">' + esc(categoryName(ex.kind)) + ' · ' + esc(ex.name) + '</option>').join("");
  }

  function libraryCards() {
    return [...exercises].sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name, "it")).map(ex => {
      const muscles = Array.isArray(ex.primary_muscles) ? ex.primary_muscles.join(", ") : "";
      return '<article class="train-card"><strong>' + esc(ex.name) + '</strong>' +
        '<small>' + esc(categoryName(ex.kind)) + ' · ' + esc(movementName(ex.movement)) +
        (muscles ? '<br>Muscoli: ' + esc(muscles) : '') +
        (ex.skill_target ? '<br>Skill: ' + esc(ex.skill_target) : '') +
        (ex.technique ? '<br>' + esc(ex.technique) : '') +
        (ex.confidence === "da_verificare" ? '<br><em>Identificazione da verificare</em>' : '') +
        '</small></article>';
    }).join("");
  }

  function logItem(log) {
    const ex = exerciseMap()[log.exercise_id] || { name: log.exercise_id, kind: "altro" };
    const pieces = [];
    if (log.sets != null) pieces.push(log.sets + " serie");
    if (log.reps != null) pieces.push(log.reps + " ripetizioni per serie");
    if (log.hold_seconds != null) pieces.push(log.hold_seconds + " s tenuta");
    if (log.load_kg != null) pieces.push(log.load_kg + " kg");
    if (log.assistance) pieces.push("Assistenza: " + log.assistance);
    if (log.effort) pieces.push("Sforzo: " + log.effort);
    return '<div class="train-history-item"><strong>' + esc(prettyDate(log.training_date)) + ' · ' + esc(ex.name) + '</strong>' +
      '<small>' + esc(categoryName(ex.kind)) + (pieces.length ? ' · ' + esc(pieces.join(" · ")) : ' · serie/ripetizioni non registrate') + '</small>' +
      (log.notes ? '<small>' + esc(log.notes) + '</small>' : '') +
      '<button type="button" class="train-danger" data-delete-training="' + esc(log.id) + '" aria-label="Elimina questa registrazione">Elimina</button></div>';
  }

  function legacyWorkoutItem(workout) {
    const all = Array.isArray(workout.exercises) ? workout.exercises : [];
    const label = all.map(ex => ex.name).filter(Boolean).join(", ");
    return '<div class="train-history-item"><strong>' + esc(prettyDate(workout.date)) + ' · Workout precedente (pesi)</strong>' +
      '<small>' + esc(all.length) + ' esercizi · ' + esc(label.slice(0, 240)) + (label.length > 240 ? "..." : "") + '</small>' +
      '<small>Gestito dalla sezione workout esistente; per modificare pesi e serie usa i comandi già presenti.</small></div>';
  }

  function history() {
    const legacy = typeof state !== "undefined" && state && Array.isArray(state.workouts)
      ? state.workouts.filter(w => w && w.date).map(w => ({ date: w.date, type: "old", data: w }))
      : [];
    const current = logs.map(l => ({ date: l.training_date, type: "new", data: l }));
    return [...legacy, ...current].sort((a, b) => b.date.localeCompare(a.date) || (a.type === "new" ? -1 : 1))
      .slice(0, 65).map(item => item.type === "new" ? logItem(item.data) : legacyWorkoutItem(item.data)).join("") ||
      '<p class="train-muted">Nessun allenamento registrato.</p>';
  }

  function renderContent() {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    const content = panel.querySelector(".train-content");
    if (!content) return;
    if (!currentId()) {
      content.innerHTML = '<p class="train-muted">Accedi al cloud Supabase da Life Tracker per visualizzare e registrare gli allenamenti.</p><button type="button" id="train-refresh">Riprova accesso</button>';
      return;
    }
    content.innerHTML =
      '<h3>Bilanciamento recente (14 giorni)</h3>' +
      '<div>' + movementSummary() + '</div>' +
      '<p class="train-muted">Conteggio di esercizi registrati nel nuovo diario, non misura di volume muscolare. Lo storico pesi precedente è mostrato sotto, ma non è incluso nei conteggi.</p>' +
      '<h3>Registra un esercizio · Calisthenics o pesi</h3>' +
      '<form id="train-log-form">' +
      '<div class="train-grid">' +
      '<label class="train-field">Data<input type="date" name="date" required value="' + esc(localDay()) + '"></label>' +
      '<label class="train-field">Esercizio<select name="exercise" required>' + options() + '</select></label>' +
      '<label class="train-field">Serie (facoltative)<input type="number" min="1" step="1" name="sets" placeholder="es. 3"></label>' +
      '<label class="train-field">Ripetizioni per serie (facoltative)<input type="number" min="0" step="1" name="reps" placeholder="es. 8"></label>' +
      '<label class="train-field">Tenuta in secondi (facoltativa)<input type="number" min="0" step="0.1" name="seconds" placeholder="es. 20"></label>' +
      '<label class="train-field">Carico aggiuntivo in kg (facoltativo)<input type="number" min="0" step="0.1" name="kg" placeholder="es. 5"></label>' +
      '<label class="train-field">Assistenza / variante<input name="assistance" maxlength="250" placeholder="es. piedi a terra"></label>' +
      '<label class="train-field">Sforzo percepito<input name="effort" maxlength="120" placeholder="es. impegnativo / RPE 8"></label></div>' +
      '<label class="train-field">Note tecniche<textarea name="notes" maxlength="2000" placeholder="Tecnica, sensazioni, miglioramenti..."></textarea></label>' +
      '<button type="submit">Salva esercizio nel diario</button><button type="button" id="train-refresh">Aggiorna dal cloud</button>' +
      '</form>' +
      '<details><summary>Aggiungi un nuovo esercizio al catalogo</summary>' +
      '<form id="train-exercise-form"><div class="train-grid">' +
      '<label class="train-field">Nome originale<input name="name" maxlength="120" required placeholder="es. Ring Rows"></label>' +
      '<label class="train-field">Tipo<select name="kind"><option value="calisthenics">Calisthenics</option><option value="pesi">Pesi</option><option value="altro">Altro</option></select></label>' +
      '<label class="train-field">Movimento<select name="movement"><option value="spinta">Spinta</option><option value="trazione">Trazione</option><option value="core">Core</option><option value="gambe">Gambe</option><option value="misto">Misto</option><option value="mobilita">Mobilità</option></select></label>' +
      '<label class="train-field">Skill obiettivo<input name="skill" maxlength="160" placeholder="es. Muscle-up"></label></div>' +
      '<label class="train-field">Tecnica / spiegazione<textarea name="technique" maxlength="1200"></textarea></label>' +
      '<button type="submit">Aggiungi al catalogo</button></form></details>' +
      '<details><summary>Catalogo esercizi (' + exercises.length + ')</summary><div class="train-cards">' + libraryCards() + '</div></details>' +
      '<h3>Storico integrato</h3><div class="train-history">' + history() + '</div>' +
      '<p class="train-muted">Le vecchie sedute con pesi sono preservate nel loro archivio originale. Le nuove registrazioni sono salvate su Supabase in tabelle dedicate e visibili accanto alle precedenti; nessun dato viene copiato o sovrascritto.</p>';
  }

  async function saveLog(form) {
    if (saving) return;
    const client = getClient();
    const id = currentId();
    if (!client || !id) return status("Effettua l'accesso a Supabase.", true);
    const data = new FormData(form);
    const exerciseId = String(data.get("exercise") || "");
    const date = String(data.get("date") || "");
    if (!date || !exercises.some(ex => ex.id === exerciseId)) return status("Seleziona data ed esercizio validi.", true);
    const sets = optionalNumber(data.get("sets"));
    const reps = optionalNumber(data.get("reps"));
    const seconds = optionalNumber(data.get("seconds"));
    const kg = optionalNumber(data.get("kg"));
    if ([sets, reps, seconds, kg].some(x => Number.isNaN(x)) ||
      (sets !== null && !Number.isInteger(sets)) || (reps !== null && !Number.isInteger(reps))) {
      return status("Inserisci solo valori numerici validi. Lascia vuoti i campi sconosciuti.", true);
    }
    saving = true;
    status("Salvataggio esercizio...", false);
    try {
      const { error } = await client.from(logTable).insert({
        user_id: id, training_date: date, exercise_id: exerciseId,
        sets, reps, hold_seconds: seconds, load_kg: kg,
        assistance: String(data.get("assistance") || "").trim() || null,
        effort: String(data.get("effort") || "").trim() || null,
        notes: String(data.get("notes") || "").trim() || null
      });
      if (error) throw error;
      await loadData(true);
      status("Esercizio registrato su Supabase.", false);
    } catch (err) {
      status("Salvataggio non riuscito: " + (err.message || String(err)), true);
    } finally {
      saving = false;
    }
  }

  async function saveExercise(form) {
    if (saving) return;
    const client = getClient();
    const id = currentId();
    if (!client || !id) return status("Effettua l'accesso a Supabase.", true);
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    if (!name) return status("Inserisci un nome per l'esercizio.", true);
    const exists = exercises.some(ex => ex.name.toLowerCase() === name.toLowerCase());
    if (exists) return status("Esercizio già presente nel catalogo.", true);
    saving = true;
    status("Aggiunta esercizio...", false);
    try {
      const { error } = await client.from(libraryTable).insert({
        user_id: id,
        id: "custom-" + (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)),
        name,
        kind: String(data.get("kind") || "calisthenics"),
        movement: String(data.get("movement") || "misto"),
        primary_muscles: [],
        skill_target: String(data.get("skill") || "").trim() || null,
        technique: String(data.get("technique") || "").trim() || null,
        confidence: "confermato"
      });
      if (error) throw error;
      await loadData(true);
      status("Nuovo esercizio aggiunto al catalogo.", false);
    } catch (err) {
      status("Aggiunta non riuscita: " + (err.message || String(err)), true);
    } finally {
      saving = false;
    }
  }

  async function deleteLog(logId) {
    if (saving || !window.confirm("Eliminare questa registrazione di allenamento?")) return;
    const id = currentId();
    const client = getClient();
    if (!id || !client) return;
    saving = true;
    status("Eliminazione registrazione...", false);
    try {
      const { error } = await client.from(logTable).delete().eq("user_id", id).eq("id", logId);
      if (error) throw error;
      await loadData(true);
      status("Registrazione eliminata.", false);
    } catch (err) {
      status("Eliminazione non riuscita: " + (err.message || String(err)), true);
    } finally {
      saving = false;
    }
  }

  document.addEventListener("submit", event => {
    if (event.target.id === "train-log-form") {
      event.preventDefault(); event.stopPropagation();
      saveLog(event.target);
    } else if (event.target.id === "train-exercise-form") {
      event.preventDefault(); event.stopPropagation();
      saveExercise(event.target);
    }
  }, true);
  document.addEventListener("click", event => {
    const button = event.target.closest && event.target.closest("#train-refresh,[data-delete-training]");
    if (!button) return;
    event.preventDefault(); event.stopPropagation();
    if (button.id === "train-refresh") {
      if (!getClient() || !currentId()) status("Attendi l'accesso al cloud Supabase.", true);
      else loadData(true);
    } else if (button.dataset.deleteTraining) {
      deleteLog(button.dataset.deleteTraining);
    }
  }, true);

  // renderWorkout() è già gestito dall'app originale e dalle sue patch.
  // Ci limitiamo ad aggiungere il pannello dopo ogni render, senza riscrivere
  // state.workouts, workoutTemplate o le tabelle soggette a sincronizzazione bulk.
  if (typeof renderWorkout === "function") {
    const previousRenderWorkout = renderWorkout;
    renderWorkout = function() {
      const value = previousRenderWorkout.apply(this, arguments);
      ensurePanel();
      return value;
    };
  }
  ensurePanel();
  window.addEventListener("load", ensurePanel);
  window.setInterval(() => {
    const screen = document.getElementById("screen-workout");
    if (!screen || !screen.classList.contains("active")) return;
    ensurePanel();
    if (currentId() && (currentId() !== accountId || Date.now() - loadedAt > 60000) && !loading && !saving) {
      loadData(true);
    }
  }, 3000);
})();
