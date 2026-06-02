const STORE_KEY = "life-tracker-state-v1";
const DATA_FILE_DB = "life-tracker-data-file-db";
const DATA_FILE_STORE = "handles";
const DATA_FILE_HANDLE_ID = "main";
const DATA_FILE_NAME = "memoria.json";
const MEMORY_API_CONFIG_KEY = "life-tracker-memory-api-v1";
const MEMORY_API_PATH = "/api/memoria";
const CLOUD_LAST_SYNC_KEY = "life-tracker-supabase-last-sync-v1";
const CLOUD_LOCAL_CHANGED_KEY = "life-tracker-supabase-local-changed-v1";
const CLOUD_AUTO_SYNC_MIN_INTERVAL = 15000;
const CLOUD_AUTO_SYNC_INTERVAL = 60000;
const TIMER_DURATION_KEY = "life-tracker-timer-duration-v1";
const INVESTMENT_TAX_RATE = 0.26;
const SUPABASE_URL = "https://kujyowhezihjambhpahe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3";
const TODO_LISTS = [
  { id: "today", title: "Da fare oggi" },
  { id: "urgent", title: "Urgenti" },
  { id: "later", title: "Non urgenti" },
];
const todoSeed = [
  ["today", "verifica esami giugno"],
  ["today", "Rispondi a studenti"],
  ["today", "Rispondi a studentessa pescatori"],
  ["today", "Invia materiali studenti anatomo"],
  ["today", "rispondi lorusso"],
  ["today", "rispondi relazione RTDA"],
  ["today", "colloquio phd student 16.30?"],
  ["urgent", "inserire terze missioni"],
  ["urgent", "verifica scadenza firma digitale"],
  ["urgent", "ISIN"],
  ["urgent", "rispondi nature"],
  ["later", "scrivi service microfono"],
].map(([list, title], index) => ({
  id: `todo-seed-${index + 1}`,
  title,
  list,
  completed: false,
  createdAt: `2026-05-19T08:${String(index).padStart(2, "0")}:00.000Z`,
  updatedAt: `2026-05-19T08:${String(index).padStart(2, "0")}:00.000Z`,
  completedAt: "",
}));
const SCREENS = [
  { id: "todo", title: "Todo", icon: "✓", text: "Liste rapide" },
  { id: "dashboard", title: "Oggi", icon: "⌂", text: "Riepilogo giornaliero" },
  { id: "workout", title: "Workout", icon: "↥", text: "Serie, note e timer" },
  { id: "nutrition", title: "Cibo", icon: "◫", text: "Pasti e macro" },
  { id: "investments", title: "Investimenti", icon: "€", text: "Movimenti e strategie" },
  { id: "links", title: "Link", icon: "↗", text: "Pulsanti web" },
  { id: "foods", title: "Alimenti", icon: "≡", text: "Tabella nutrizionale" },
  { id: "diary", title: "Diario", icon: "#", text: "Note e tag" },
  { id: "relationships", title: "Relazioni", icon: "@", text: "Contatti e promemoria" },
  { id: "data", title: "Dati", icon: "⚙", text: "Backup e obiettivi" },
  { id: "charts", title: "Grafici", icon: "⌁", text: "Trend e correlazioni" },
];
const todayISO = () => new Date().toISOString().slice(0, 10);
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const number = (value, fallback = 0) => {
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const foodSeed = [
  ["fiocchi-avena", "Fiocchi d'avena", "g", 389, 16.9, 66.3, 6.9],
  ["latte-proteico", "Latte proteico", "ml", 50, 10, 4.8, 0.2],
  ["riso", "Riso", "g", 360, 7, 78, 0.7],
  ["pasta", "Pasta", "g", 353, 12, 71, 1.5],
  ["pane-5-cereali", "Pane 5 cereali", "g", 250, 9, 45, 4],
  ["pollo", "Pollo", "g", 165, 31, 0, 3.6],
  ["carne-magra", "Carne magra", "g", 170, 27, 0, 7],
  ["pesce-bianco", "Pesce bianco", "g", 120, 23, 0, 2],
  ["fesa-tacchino", "Fesa di tacchino", "g", 110, 18, 1, 2],
  ["salmone", "Salmone", "g", 208, 20, 0, 13],
  ["verdure", "Verdure miste", "g", 30, 2, 5, 0.3],
  ["olio-evo", "Olio EVO", "g", 884, 0, 0, 100],
  ["uovo", "Uovo intero", "g", 143, 13, 1.1, 10],
  ["albumi", "Albumi", "ml", 52, 11, 0.7, 0.2],
  ["farina-avena", "Farina d'avena", "g", 389, 16.9, 66.3, 6.9],
  ["barretta-proteica", "Barretta proteica", "g", 350, 33, 35, 10],
  ["avocado", "Avocado", "g", 160, 2, 8.5, 14.7],
].map(([id, name, unit, kcal, protein, carbs, fat]) => ({ id, name, unit, kcal, protein, carbs, fat }));

const workoutTemplateSeed = [
  { id: "bulgarian-split-squat", name: "Bulgarian split squat", note: "Carico totale", sets: [{ kg: 6, reps: 12 }, { kg: 6, reps: 12 }, { kg: 6, reps: 12 }] },
  { id: "panca-inclinata", name: "Panca inclinata", note: "Manubri/macchina", sets: [{ kg: 9, reps: 12 }, { kg: 8, reps: 11 }, { kg: 8, reps: 6 }] },
  { id: "trazioni", name: "Trazioni", note: "Peso corporeo", sets: [{ kg: 0, reps: 6 }, { kg: 0, reps: 6 }, { kg: 0, reps: 6 }, { kg: 0, reps: 3 }] },
  { id: "rematore", name: "Rematore", note: "Carico per mano/macchina", sets: [{ kg: 11, reps: 12 }, { kg: 10, reps: 10 }, { kg: 10, reps: 9 }] },
  { id: "alzate-laterali", name: "Alzate laterali", note: "Manubri", sets: [{ kg: 4, reps: 9 }, { kg: 4, reps: 7 }, { kg: 3, reps: 11 }] },
  { id: "tricipiti", name: "Tricipiti", note: "Esercizio corrente", sets: [{ kg: 5, reps: 9 }] },
  { id: "bicipiti", name: "Bicipiti", note: "Esercizio corrente", sets: [{ kg: 7, reps: 14 }] },
];

const mealTemplates = [
  {
    name: "Colazione attuale",
    meal: "Colazione",
    items: [
      { foodId: "fiocchi-avena", qty: 80 },
      { foodId: "latte-proteico", qty: 300 },
    ],
  },
  {
    name: "Pranzo riso + pollo",
    meal: "Pranzo",
    items: [
      { foodId: "riso", qty: 70 },
      { foodId: "pollo", qty: 90 },
      { foodId: "verdure", qty: 250 },
      { foodId: "olio-evo", qty: 10 },
    ],
  },
  {
    name: "Pranzo pane + pesce",
    meal: "Pranzo",
    items: [
      { foodId: "pane-5-cereali", qty: 60 },
      { foodId: "pesce-bianco", qty: 150 },
      { foodId: "verdure", qty: 250 },
    ],
  },
  {
    name: "Merenda standard",
    meal: "Merenda",
    items: [
      { foodId: "uovo", qty: 60 },
      { foodId: "albumi", qty: 150 },
    ],
  },
  {
    name: "Merenda sostanziosa",
    meal: "Merenda",
    items: [
      { foodId: "uovo", qty: 120 },
      { foodId: "albumi", qty: 200 },
      { foodId: "farina-avena", qty: 40 },
    ],
  },
  {
    name: "Barretta proteica",
    meal: "Merenda",
    items: [{ foodId: "barretta-proteica", qty: 55 }],
  },
  {
    name: "Cena training",
    meal: "Cena",
    items: [
      { foodId: "pollo", qty: 200 },
      { foodId: "riso", qty: 70 },
      { foodId: "verdure", qty: 250 },
      { foodId: "avocado", qty: 70 },
    ],
  },
  {
    name: "Cena off low-carb",
    meal: "Cena",
    items: [
      { foodId: "fesa-tacchino", qty: 200 },
      { foodId: "verdure", qty: 300 },
      { foodId: "avocado", qty: 40 },
    ],
  },
  {
    name: "Cena salmone",
    meal: "Cena",
    items: [
      { foodId: "salmone", qty: 150 },
      { foodId: "verdure", qty: 250 },
    ],
  },
];

const quickAddSeed = mealTemplates.map((template, index) => ({
  id: `combo-${index + 1}`,
  name: template.name,
  meal: template.meal,
  items: template.items.map(item => ({ ...item })),
}));

const investmentThemeColors = {
  blue: "#457b9d",
  emerald: "#3e8f75",
  orange: "#e76f51",
  purple: "#8f5da8",
  pink: "#c65f8a",
  cyan: "#3b8ea5",
  yellow: "#e9c46a",
  red: "#d65a45",
};

const investmentThemeOrder = ["blue", "emerald", "orange", "purple", "pink", "cyan", "yellow", "red"];
const rawInvestmentSeed = typeof window !== "undefined" && window.INVESTMENT_SEED ? window.INVESTMENT_SEED : { blocks: [], entries: [], notes: [] };
const investmentSeed = normalizeInvestments(rawInvestmentSeed);

const createInitialWorkout = () => ({
  id: uid(),
  date: todayISO(),
  exercises: workoutTemplateSeed.map(ex => ({
    id: ex.id,
    name: ex.name,
    note: ex.note,
    userNote: "",
    sets: ex.sets.map(set => ({ ...set })),
  })),
});

const initialState = () => ({
  schemaVersion: 6,
  createdAt: new Date().toISOString(),
  settings: {
    dayType: "training",
    kcalTrainingMin: 1900,
    kcalTrainingMax: 2100,
    kcalOffMin: 1600,
    kcalOffMax: 1900,
    proteinMin: 140,
    proteinMax: 160,
    carbsTarget: 180,
    fatTarget: 60,
    waterNormal: 2.5,
    waterTraining: 3,
  },
  foods: foodSeed,
  quickAdds: quickAddSeed,
  workoutTemplate: workoutTemplateSeed,
  workouts: [createInitialWorkout()],
  mealsByDate: {},
  bodyMetrics: [],
  diary: [],
  relationships: [],
  todos: todoSeed.map(todo => ({ ...todo })),
  links: [],
  investments: cloneInvestments(investmentSeed),
});

let state = loadState();
let selectedDate = todayISO();
let draftWorkout = cloneWorkout(findWorkoutForDate(selectedDate) || createWorkoutFromTemplate(selectedDate));
let diaryFilter = "";
let comboDraft = cloneCombo(state.quickAdds[0] || emptyCombo());
let currentScreen = "home";
let bodyMetricDate = selectedDate;
let nutritionChartKeys = ["kcal", "protein", "carbs", "fat"];
let selectedRelationshipId = "";
let todoUndoSnapshot = null;
let draggedTodoId = "";
let pointerTodoDrag = null;
let selectedTodoListId = TODO_LISTS[0].id;
let investmentFormMode = "trade";
let investmentTransactionType = "update";
let investmentTradeSide = "buy";
let editingInvestmentEntryId = "";
let editingInvestmentNoteId = "";
let editingInvestmentAssetId = "";
let editingInvestmentTradeId = "";
let visibleInvestmentBlockIds = (state.investments?.blocks || []).map(block => block.id);
let visibleInvestmentAssetIds = [];
let showClosedInvestmentAssetsInTrend = false;
let visibleInvestmentMetricIds = ["portfolioValue", "netContributedCapital", "totalGross", "totalNet", "grossReturnPct", "netReturnPct", "irr", "twr", "realizedGross", "unrealizedGross", "openAssetValue", "openCost"];
let investmentRedoSnapshot = null;
let investmentUndoSnapshot = null;
let memoryApiConfig = loadMemoryApiConfig();
let memoryApiSync = {
  connected: false,
  lastSync: "",
  busy: false,
  message: "",
};
let supabaseClient = null;
let cloudUser = null;
let cloudSyncTimer = null;
let cloudAutoSyncTimer = null;
let cloudLastAutoSyncAttempt = 0;
let cloudSyncHydrating = false;
let cloudLocalChangedAt = localStorage.getItem(CLOUD_LOCAL_CHANGED_KEY) || "";
let cloudSync = {
  ready: false,
  busy: false,
  lastSync: localStorage.getItem(CLOUD_LAST_SYNC_KEY) || "",
  message: "",
};
let dataFileHandle = null;
let dataFileWriteTimer = null;
let dataFileWriteQueue = Promise.resolve();
let dataFileSync = {
  supported: false,
  native: false,
  connected: false,
  name: "",
  lastSync: "",
  busy: false,
  message: "",
};
let workoutTimerDuration = loadTimerDuration();
let workoutTimerRemaining = workoutTimerDuration;
let workoutTimerRunning = false;
let workoutTimerId = null;

function ensureDomShell() {
  const shell = document.querySelector(".app-shell") || document.body;
  let main = document.querySelector("main");
  if (!main) {
    main = document.createElement("main");
    shell.appendChild(main);
  }

  document.querySelectorAll(".bottom-nav").forEach(nav => nav.remove());

  const orderedScreens = ["home", "todo", "dashboard", "workout", "nutrition", "investments", "links", "foods", "diary", "relationships", "data", "charts"];
  orderedScreens.forEach((screen, index) => {
    let panel = document.querySelector(`[data-screen-panel="${screen}"]`);
    if (!panel) {
      panel = document.createElement("section");
      panel.id = `screen-${screen}`;
      panel.dataset.screenPanel = screen;
      panel.className = "screen";
      if (screen === "home" && index === 0) panel.classList.add("active");
      main.insertBefore(panel, main.children[index] || null);
    }
  });

  const topbar = document.querySelector(".topbar");
  if (topbar && !document.getElementById("homeButton")) {
    const exportButton = document.getElementById("exportQuick");
    const actions = document.createElement("div");
    actions.className = "top-actions";
    actions.innerHTML = `
      <button class="secondary top-home" id="homeButton" data-screen="home">Home</button>
      <button class="secondary top-sync" id="cloudSyncQuick" title="Scarica gli ultimi dati dal cloud" aria-label="Sincronizza dal cloud">Sync</button>
    `;
    if (exportButton) actions.appendChild(exportButton);
    topbar.appendChild(actions);
  } else if (topbar && !document.getElementById("cloudSyncQuick")) {
    const homeButton = document.getElementById("homeButton");
    const syncButton = document.createElement("button");
    syncButton.className = "secondary top-sync";
    syncButton.id = "cloudSyncQuick";
    syncButton.title = "Scarica gli ultimi dati dal cloud";
    syncButton.setAttribute("aria-label", "Sincronizza dal cloud");
    syncButton.textContent = "Sync";
    homeButton?.insertAdjacentElement("afterend", syncButton);
  }
}

function clearLegacyCaches() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then(registrations => registrations.forEach(registration => registration.unregister()))
      .catch(() => {});
  }
  if ("caches" in window) {
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .catch(() => {});
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw);
    const migrated = migrateState(parsed);
    if (!parsed.investments && investmentSeed.blocks.length) {
      localStorage.setItem(CLOUD_LOCAL_CHANGED_KEY, new Date().toISOString());
    }
    return migrated;
  } catch {
    return initialState();
  }
}

function migrateState(candidate) {
  const fresh = initialState();
  const migratedWorkouts = Array.isArray(candidate.workouts)
    ? candidate.workouts.map(normalizeWorkout)
    : fresh.workouts;
  return {
    ...fresh,
    ...candidate,
    schemaVersion: 6,
    settings: { ...fresh.settings, ...(candidate.settings || {}) },
    foods: Array.isArray(candidate.foods) && candidate.foods.length ? candidate.foods : fresh.foods,
    quickAdds: Array.isArray(candidate.quickAdds) && candidate.quickAdds.length
      ? candidate.quickAdds.map(normalizeCombo)
      : fresh.quickAdds,
    workoutTemplate: Array.isArray(candidate.workoutTemplate) ? candidate.workoutTemplate : fresh.workoutTemplate,
    workouts: migratedWorkouts,
    mealsByDate: candidate.mealsByDate || {},
    bodyMetrics: Array.isArray(candidate.bodyMetrics) ? candidate.bodyMetrics.map(normalizeBodyMetric) : [],
    diary: Array.isArray(candidate.diary) ? candidate.diary.map(normalizeDiaryEntry) : [],
    relationships: Array.isArray(candidate.relationships) ? candidate.relationships.map(normalizeRelationship) : [],
    todos: mergeTodoSeed(Array.isArray(candidate.todos) ? candidate.todos.map(normalizeTodo) : []),
    links: Array.isArray(candidate.links) ? candidate.links.map(normalizeLink).filter(link => link.url) : [],
    investments: normalizeInvestments(candidate.investments || fresh.investments),
  };
}

function mergeTodoSeed(todos) {
  const existingKeys = new Set((todos || []).map(todo => `${todo.list}:${todo.title.trim().toLowerCase()}`));
  const missing = todoSeed
    .filter(todo => !existingKeys.has(`${todo.list}:${todo.title.trim().toLowerCase()}`))
    .map(todo => ({ ...todo }));
  return [...(todos || []), ...missing];
}

function saveState(options = {}) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    toast("Spazio salvataggio insufficiente");
  }
  if (!options.skipDataFileSync) queueDataFileSave();
  if (!options.skipCloudSync) {
    if (cloudUser) rememberCloudLocalChange();
    queueCloudSync();
  }
}

function statePayload() {
  return {
    exportedAt: new Date().toISOString(),
    app: "Life Tracker",
    ...state,
  };
}

function loadMemoryApiConfig() {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_API_CONFIG_KEY)) || { url: "" };
  } catch {
    return { url: "" };
  }
}

function loadTimerDuration() {
  try {
    return clamp(number(localStorage.getItem(TIMER_DURATION_KEY), 60), 5, 3600);
  } catch {
    return 60;
  }
}

function saveTimerDuration() {
  try {
    localStorage.setItem(TIMER_DURATION_KEY, String(workoutTimerDuration));
  } catch {}
}

function saveMemoryApiConfig() {
  try {
    localStorage.setItem(MEMORY_API_CONFIG_KEY, JSON.stringify(memoryApiConfig));
  } catch {}
}

function resetStateContext() {
  selectedDate = todayISO();
  bodyMetricDate = selectedDate;
  draftWorkout = cloneWorkout(findWorkoutForDate(selectedDate) || createWorkoutFromTemplate(selectedDate));
  comboDraft = cloneCombo(state.quickAdds[0] || emptyCombo());
  selectedRelationshipId = state.relationships.some(item => item.id === selectedRelationshipId) ? selectedRelationshipId : "";
  todoUndoSnapshot = null;
  selectedTodoListId = TODO_LISTS.some(list => list.id === selectedTodoListId) ? selectedTodoListId : TODO_LISTS[0].id;
  visibleInvestmentBlockIds = (state.investments?.blocks || []).map(block => block.id);
  visibleInvestmentAssetIds = (state.investments?.assets || []).map(asset => asset.id);
  editingInvestmentEntryId = "";
  editingInvestmentNoteId = "";
  editingInvestmentAssetId = "";
  editingInvestmentTradeId = "";
  investmentFormMode = "trade";
  investmentTradeSide = "buy";
}

function applyImportedState(candidate, options = {}) {
  state = migrateState(candidate);
  resetStateContext();
  saveState({ skipDataFileSync: Boolean(options.skipDataFileSync) });
  render();
}

function dataFileSupported() {
  return Boolean(window.AndroidMemoria) || ("showOpenFilePicker" in window && "showSaveFilePicker" in window && "indexedDB" in window);
}

function hasNativeMemoria() {
  return Boolean(window.AndroidMemoria);
}

function parseNativeMemoriaResult(raw) {
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return { ok: false, message: "Risposta memoria non valida." };
  }
}

function encodeBase64Utf8(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function decodeBase64Utf8(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new TextDecoder().decode(bytes);
}

function nativeMemoriaStatus() {
  if (!hasNativeMemoria()) return { ok: false, connected: false };
  return parseNativeMemoriaResult(window.AndroidMemoria.status());
}

function dataFileStatusText() {
  if (memoryApiSync.busy) return "Sincronizzazione server memoria...";
  if (memoryApiSync.connected) {
    const when = memoryApiSync.lastSync ? ` Ultimo scambio: ${new Date(memoryApiSync.lastSync).toLocaleString("it-IT")}.` : "";
    return `Server memoria collegato.${when}`;
  }
  if (memoryApiSync.message) return memoryApiSync.message;
  if (!dataFileSync.supported) return "Memoria non disponibile in questo browser.";
  if (dataFileSync.busy) return "Sincronizzazione memoria...";
  if (dataFileSync.connected) {
    const when = dataFileSync.lastSync ? ` Ultimo salvataggio: ${new Date(dataFileSync.lastSync).toLocaleString("it-IT")}.` : "";
    return `Memoria collegata: ${dataFileSync.name || DATA_FILE_NAME}.${when}`;
  }
  return dataFileSync.message || "Nessuna memoria collegata.";
}

function refreshDataPanel() {
  if (document.getElementById("screen-data")) renderData();
}

function rememberCloudLocalChange() {
  if (cloudSyncHydrating) return;
  cloudLocalChangedAt = new Date().toISOString();
  try {
    localStorage.setItem(CLOUD_LOCAL_CHANGED_KEY, cloudLocalChangedAt);
  } catch {}
}

function clearCloudLocalChange() {
  cloudLocalChangedAt = "";
  try {
    localStorage.removeItem(CLOUD_LOCAL_CHANGED_KEY);
  } catch {}
}

function hasPendingLocalCloudChanges() {
  return Boolean(cloudLocalChangedAt && (!cloudSync.lastSync || cloudLocalChangedAt > cloudSync.lastSync));
}

function latestCloudUpdatedAt(rows) {
  const values = Object.values(rows || {})
    .flatMap(items => Array.isArray(items) ? items : [items])
    .map(item => item?.updated_at || item?.created_at || "")
    .filter(Boolean)
    .sort();
  return values.at(-1) || "";
}

function cloudStatusText() {
  if (!cloudSync.ready) return cloudSync.message || "Supabase non caricato. La modalita locale resta disponibile.";
  if (cloudSync.busy) return "Sincronizzazione Supabase in corso...";
  if (!cloudUser) return "Non collegato. Accedi per usare lo stesso database da telefono e browser.";
  const when = cloudSync.lastSync ? ` Ultima sincronizzazione: ${new Date(cloudSync.lastSync).toLocaleString("it-IT")}.` : "";
  const pending = hasPendingLocalCloudChanges() ? " Modifiche locali in attesa di sync." : "";
  return `Collegato come ${cloudUser.email || "utente Life Tracker"}.${when}${pending}`;
}

function renderSupabasePanel() {
  return `
    <div class="cloud-box">
      <div class="data-file-status">
        <strong>Cloud Supabase</strong>
        <span>${escapeHtml(cloudStatusText())}</span>
      </div>
      ${cloudUser ? `
        <div class="row-actions">
          <button class="primary" id="cloudUpload" ${cloudSync.busy ? "disabled" : ""}>Carica locale su cloud</button>
          <button class="secondary" id="cloudDownload" ${cloudSync.busy ? "disabled" : ""}>Scarica cloud</button>
          <button class="secondary" id="cloudSignOut" ${cloudSync.busy ? "disabled" : ""}>Esci</button>
        </div>
        <p class="hint">Dopo l'accesso, i pulsanti Salva aggiornano Supabase. L'app controlla il cloud quando si apre, torna attiva o torna online; Sync forza subito il controllo.</p>
      ` : `
        <div class="form-grid cols">
          <div class="field">
            <label for="cloudEmail">Email</label>
            <input id="cloudEmail" type="email" autocomplete="email" placeholder="nome@email.it">
          </div>
          <div class="field">
            <label for="cloudPassword">Password</label>
            <input id="cloudPassword" type="password" autocomplete="current-password" placeholder="Minimo 6 caratteri">
          </div>
        </div>
        <div class="row-actions">
          <button class="primary" id="cloudSignIn" ${cloudSync.ready ? "" : "disabled"}>Accedi</button>
          <button class="secondary" id="cloudSignUp" ${cloudSync.ready ? "" : "disabled"}>Registrati</button>
        </div>
      `}
    </div>
  `;
}

function setCloudMessage(message = "") {
  cloudSync.message = message;
  refreshDataPanel();
}

function setCloudBusy(busy, message = "") {
  cloudSync.busy = busy;
  if (message) cloudSync.message = message;
  refreshDataPanel();
}

function markCloudSynced(message = "Supabase sincronizzato") {
  cloudSync.lastSync = new Date().toISOString();
  cloudSync.message = message;
  clearCloudLocalChange();
  try {
    localStorage.setItem(CLOUD_LAST_SYNC_KEY, cloudSync.lastSync);
  } catch {}
  refreshDataPanel();
}

function setCloudUser(user) {
  cloudUser = user || null;
  if (cloudUser) {
    cloudSync.message = cloudSync.message || "Accesso Supabase attivo.";
    ensureCloudProfile().catch(error => setCloudMessage(error?.message || "Profilo Supabase non aggiornato."));
    scheduleSmartCloudSync("login", { delay: 900, force: true });
  } else if (cloudSync.ready) {
    cloudSync.message = "Accedi per attivare il database cloud.";
  }
  refreshDataPanel();
}

async function initSupabase() {
  if (!window.supabase?.createClient) {
    cloudSync.ready = false;
    cloudSync.message = "Libreria Supabase non caricata: controlla la connessione internet.";
    refreshDataPanel();
    return;
  }
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  cloudSync.ready = true;
  cloudSync.message = "Supabase pronto.";
  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    setCloudUser(data.session?.user || null);
  } catch (error) {
    setCloudMessage(error?.message || "Sessione Supabase non letta.");
  }
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    setCloudUser(session?.user || null);
  });
}

function cloudCredentials() {
  const email = document.getElementById("cloudEmail")?.value.trim() || "";
  const password = document.getElementById("cloudPassword")?.value || "";
  if (!email || !password) throw new Error("Inserisci email e password.");
  if (password.length < 6) throw new Error("La password deve avere almeno 6 caratteri.");
  return { email, password };
}

async function cloudSignIn() {
  if (!supabaseClient) return toast("Supabase non pronto");
  try {
    const credentials = cloudCredentials();
    setCloudBusy(true, "Accesso Supabase...");
    const { data, error } = await supabaseClient.auth.signInWithPassword(credentials);
    if (error) throw error;
    setCloudUser(data.session?.user || null);
    toast("Accesso effettuato");
  } catch (error) {
    toast(error?.message || "Accesso non riuscito");
    setCloudMessage(error?.message || "Accesso non riuscito.");
  } finally {
    setCloudBusy(false);
  }
}

async function cloudSignUp() {
  if (!supabaseClient) return toast("Supabase non pronto");
  try {
    const credentials = cloudCredentials();
    setCloudBusy(true, "Registrazione Supabase...");
    const { data, error } = await supabaseClient.auth.signUp(credentials);
    if (error) throw error;
    setCloudUser(data.session?.user || null);
    const needsEmail = data.user && !data.session;
    toast(needsEmail ? "Controlla l'email per confermare" : "Registrazione effettuata");
    setCloudMessage(needsEmail ? "Registrazione creata: conferma l'email, poi accedi." : "Registrazione effettuata.");
  } catch (error) {
    toast(error?.message || "Registrazione non riuscita");
    setCloudMessage(error?.message || "Registrazione non riuscita.");
  } finally {
    setCloudBusy(false);
  }
}

async function cloudSignOut() {
  if (!supabaseClient) return;
  setCloudBusy(true, "Uscita da Supabase...");
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    setCloudUser(null);
    toast("Disconnesso da Supabase");
  } catch (error) {
    toast(error?.message || "Uscita non riuscita");
  } finally {
    setCloudBusy(false);
  }
}

async function ensureCloudProfile() {
  if (!supabaseClient || !cloudUser) return;
  const { error } = await supabaseClient
    .from("profiles")
    .upsert({
      user_id: cloudUser.id,
      display_name: cloudUser.email || "Life Tracker",
    }, { onConflict: "user_id" });
  if (error) throw error;
}

function queueCloudSync() {
  if (!supabaseClient || !cloudUser || cloudSyncHydrating || cloudSync.busy) return;
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = window.setTimeout(() => {
    syncStateToCloud({ silent: true }).catch(error => {
      cloudSync.message = error?.message || "Supabase non sincronizzato.";
      refreshDataPanel();
    });
  }, 900);
}

function scheduleSmartCloudSync(reason = "auto", options = {}) {
  if (!supabaseClient || !cloudUser || cloudSyncHydrating || cloudSync.busy) return;
  if (navigator.onLine === false) {
    setCloudMessage("Offline: la sincronizzazione riparte quando torna la rete.");
    return;
  }
  const now = Date.now();
  if (!options.force && now - cloudLastAutoSyncAttempt < CLOUD_AUTO_SYNC_MIN_INTERVAL) return;
  clearTimeout(cloudAutoSyncTimer);
  cloudAutoSyncTimer = window.setTimeout(() => {
    runSmartCloudSync({ silent: true, reason }).catch(error => {
      setCloudMessage(error?.message || "Sync Supabase non completato.");
    });
  }, options.delay ?? 500);
}

function assertCloudReady() {
  if (!supabaseClient || !cloudSync.ready) throw new Error("Supabase non e pronto.");
  if (!cloudUser) throw new Error("Accedi a Supabase prima di sincronizzare.");
}

async function pushCurrentStateToCloud(message = "Dati locali caricati su Supabase.") {
  const rows = cloudRowsFromState(cloudUser.id);
  await ensureCloudProfile();
  await replaceCloudRows(rows);
  markCloudSynced(message);
}

function applyCloudRows(rows, message = "Dati scaricati da Supabase.") {
  const nextState = stateFromCloudRows(rows);
  cloudSyncHydrating = true;
  state = migrateState(nextState);
  resetStateContext();
  saveState({ skipDataFileSync: true, skipCloudSync: true });
  cloudSyncHydrating = false;
  markCloudSynced(message);
  render();
}

async function runSmartCloudSync(options = {}) {
  assertCloudReady();
  if (cloudSync.busy || cloudSyncHydrating) return;
  if (navigator.onLine === false) {
    setCloudMessage("Offline: la sincronizzazione riparte quando torna la rete.");
    return;
  }
  cloudLastAutoSyncAttempt = Date.now();
  setCloudBusy(true, options.silent ? "Controllo Supabase..." : "Sincronizzazione Supabase...");
  try {
    const rows = await fetchCloudRows();
    const remoteHasData = cloudRowsHaveData(rows);
    const remoteUpdatedAt = latestCloudUpdatedAt(rows);
    const remoteNewer = remoteUpdatedAt && (!cloudSync.lastSync || remoteUpdatedAt > cloudSync.lastSync);
    const localPending = hasPendingLocalCloudChanges();

    if (localPending) {
      await pushCurrentStateToCloud("Modifiche locali inviate a Supabase.");
      if (!options.silent) toast("Modifiche inviate a Supabase");
      return;
    }

    if (remoteHasData && remoteNewer) {
      applyCloudRows(rows, "Dati aggiornati da Supabase.");
      if (!options.silent) toast("Dati aggiornati da Supabase");
      return;
    }

    if (!remoteHasData && userDataCount(state) > 0) {
      await pushCurrentStateToCloud("Cloud inizializzato con i dati locali.");
      if (!options.silent) toast("Cloud inizializzato");
      return;
    }

    setCloudMessage("Gia sincronizzato.");
    if (!options.silent) toast("Gia sincronizzato");
  } catch (error) {
    const message = error?.message || "Sync Supabase non completato.";
    setCloudMessage(message);
    if (!options.silent) toast(message);
    throw error;
  } finally {
    setCloudBusy(false);
  }
}

async function syncStateToCloud(options = {}) {
  assertCloudReady();
  if (cloudSync.busy) return;
  setCloudBusy(true, options.silent ? "Salvataggio su Supabase..." : "Caricamento dati locali su Supabase...");
  try {
    await pushCurrentStateToCloud("Dati locali caricati su Supabase.");
    if (!options.silent) toast("Dati caricati su Supabase");
  } catch (error) {
    const message = error?.message || "Supabase non sincronizzato.";
    setCloudMessage(message);
    if (!options.silent) toast(message);
    throw error;
  } finally {
    setCloudBusy(false);
  }
}

async function loadStateFromCloud() {
  assertCloudReady();
  if (cloudSync.busy) return;
  setCloudBusy(true, "Scaricamento dati da Supabase...");
  try {
    const rows = await fetchCloudRows();
    if (!cloudRowsHaveData(rows)) {
      toast("Cloud vuoto");
      setCloudMessage("Cloud vuoto: usa Carica locale su cloud per inizializzarlo.");
      return;
    }
    applyCloudRows(rows, "Dati scaricati da Supabase.");
    toast("Dati scaricati da Supabase");
  } catch (error) {
    cloudSyncHydrating = false;
    const message = error?.message || "Download Supabase non riuscito.";
    setCloudMessage(message);
    toast(message);
  } finally {
    setCloudBusy(false);
  }
}

async function quickCloudSync() {
  if (!cloudSync.ready || !supabaseClient) {
    toast("Supabase non pronto");
    switchScreen("data");
    return;
  }
  if (!cloudUser) {
    toast("Accedi a Supabase nella sezione Dati");
    switchScreen("data");
    return;
  }
  await runSmartCloudSync({ silent: false, reason: "manual", force: true });
}

async function upsertCloudRows(table, rows) {
  if (!rows.length) return;
  for (let index = 0; index < rows.length; index += 500) {
    const { error } = await supabaseClient
      .from(table)
      .upsert(rows.slice(index, index + 500), { onConflict: "user_id,id" });
    if (error) throw error;
  }
}

async function deleteMissingCloudRows(table, rows) {
  const keepIds = new Set(rows.map(row => row.id));
  const { data, error } = await supabaseClient.from(table).select("id").eq("user_id", cloudUser.id);
  if (error) throw error;
  const staleIds = (data || []).map(row => row.id).filter(id => !keepIds.has(id));
  for (let index = 0; index < staleIds.length; index += 500) {
    const { error: deleteError } = await supabaseClient
      .from(table)
      .delete()
      .eq("user_id", cloudUser.id)
      .in("id", staleIds.slice(index, index + 500));
    if (deleteError) throw deleteError;
  }
}

async function replaceCloudRows(rows) {
  await supabaseClient.from("app_settings").upsert(rows.app_settings, { onConflict: "user_id" }).then(({ error }) => {
    if (error) throw error;
  });

  const upsertOrder = [
    "foods",
    "quick_adds",
    "quick_add_items",
    "workouts",
    "workout_exercises",
    "workout_sets",
    "meals",
    "meal_items",
    "diary_entries",
    "body_metrics",
    "relationships",
    "todos",
    "investment_blocks",
    "investment_assets",
    "investment_trades",
    "investment_cash_flows",
    "investment_entries",
    "investment_notes",
  ];
  for (const table of upsertOrder) await upsertCloudRows(table, rows[table]);

  const deleteStaleOrder = [
    "quick_add_items",
    "workout_sets",
    "workout_exercises",
    "meal_items",
    "quick_adds",
    "workouts",
    "meals",
    "foods",
    "diary_entries",
    "body_metrics",
    "relationships",
    "todos",
    "investment_notes",
    "investment_entries",
    "investment_cash_flows",
    "investment_trades",
    "investment_assets",
    "investment_blocks",
  ];
  for (const table of deleteStaleOrder) await deleteMissingCloudRows(table, rows[table]);
}

async function fetchCloudRows() {
  const tables = [
    "app_settings",
    "foods",
    "quick_adds",
    "quick_add_items",
    "workouts",
    "workout_exercises",
    "workout_sets",
    "meals",
    "meal_items",
    "diary_entries",
    "body_metrics",
    "relationships",
    "todos",
    "investment_blocks",
    "investment_assets",
    "investment_trades",
    "investment_cash_flows",
    "investment_entries",
    "investment_notes",
  ];
  const pairs = await Promise.all(tables.map(async table => {
    const { data, error } = await supabaseClient.from(table).select("*").eq("user_id", cloudUser.id);
    if (error) throw error;
    return [table, data || []];
  }));
  return Object.fromEntries(pairs);
}

function cloudRowsHaveData(rows) {
  return [
    rows.foods,
    rows.quick_adds,
    rows.workouts,
    rows.meal_items,
    rows.diary_entries,
    rows.body_metrics,
    rows.relationships,
    rows.todos,
    rows.investment_blocks,
    rows.investment_assets,
    rows.investment_trades,
    rows.investment_cash_flows,
    rows.investment_entries,
    rows.investment_notes,
  ].some(items => Array.isArray(items) && items.length);
}

function nullableDate(value) {
  return String(value || "").trim() || null;
}

function nullableTimestamp(value) {
  return String(value || "").trim() || null;
}

function cloudMealId(date, meal) {
  return `meal-${date}-${slugify(meal || "extra")}`;
}

function cloudRowsFromState(userId) {
  const cloudSyncStamp = new Date().toISOString();
  const rows = {
    app_settings: {
      user_id: userId,
      day_type: state.settings.dayType,
      kcal_training_min: number(state.settings.kcalTrainingMin),
      kcal_training_max: number(state.settings.kcalTrainingMax),
      kcal_off_min: number(state.settings.kcalOffMin),
      kcal_off_max: number(state.settings.kcalOffMax),
      protein_min: number(state.settings.proteinMin),
      protein_max: number(state.settings.proteinMax),
      carbs_target: number(state.settings.carbsTarget),
      fat_target: number(state.settings.fatTarget),
      water_normal: number(state.settings.waterNormal),
      water_training: number(state.settings.waterTraining),
      updated_at: cloudSyncStamp,
    },
    foods: [],
    quick_adds: [],
    quick_add_items: [],
    workouts: [],
    workout_exercises: [],
    workout_sets: [],
    meals: [],
    meal_items: [],
    diary_entries: [],
    body_metrics: [],
    relationships: [],
    todos: [],
    investment_blocks: [],
    investment_assets: [],
    investment_trades: [],
    investment_entries: [],
    investment_notes: [],
    investment_cash_flows: [],
  };

  rows.foods = (state.foods || []).map(food => ({
    user_id: userId,
    id: String(food.id),
    name: food.name || "Alimento",
    unit: food.unit || "g",
    kcal: number(food.kcal),
    protein: number(food.protein),
    carbs: number(food.carbs),
    fat: number(food.fat),
  }));

  (state.quickAdds || []).map(normalizeCombo).forEach(combo => {
    const comboId = combo.id || `combo-${uid()}`;
    rows.quick_adds.push({
      user_id: userId,
      id: comboId,
      name: combo.name,
      meal: combo.meal,
    });
    combo.items.forEach((item, index) => {
      rows.quick_add_items.push({
        user_id: userId,
        id: `${comboId}:${index}`,
        quick_add_id: comboId,
        food_id: item.foodId,
        qty: number(item.qty, 100),
        sort_order: index,
      });
    });
  });

  (state.workouts || []).map(normalizeWorkout).forEach(workout => {
    rows.workouts.push({
      user_id: userId,
      id: workout.id,
      date: workout.date,
    });
    workout.exercises.forEach((exercise, exerciseIndex) => {
      const exerciseRowId = `${workout.id}:${exercise.id}`;
      rows.workout_exercises.push({
        user_id: userId,
        id: exerciseRowId,
        workout_id: workout.id,
        exercise_id: exercise.id,
        name: exercise.name,
        note: exercise.note || "",
        user_note: exercise.userNote || "",
        sort_order: exerciseIndex,
      });
      exercise.sets.forEach((set, setIndex) => {
        rows.workout_sets.push({
          user_id: userId,
          id: `${exerciseRowId}:${setIndex}`,
          exercise_row_id: exerciseRowId,
          kg: number(set.kg),
          reps: number(set.reps),
          sort_order: setIndex,
        });
      });
    });
  });

  const meals = new Map();
  Object.entries(state.mealsByDate || {}).forEach(([dateKey, items]) => {
    (items || []).forEach(item => {
      const date = item.date || dateKey;
      const meal = item.meal || "Extra";
      const mealId = cloudMealId(date, meal);
      if (!meals.has(mealId)) meals.set(mealId, { user_id: userId, id: mealId, date, name: meal });
      rows.meal_items.push({
        user_id: userId,
        id: item.id || `${mealId}:${rows.meal_items.length}`,
        meal_id: mealId,
        date,
        meal,
        food_id: item.foodId,
        qty: number(item.qty, 100),
      });
    });
  });
  rows.meals = Array.from(meals.values());

  rows.diary_entries = (state.diary || []).map(normalizeDiaryEntry).map(entry => ({
    user_id: userId,
    id: entry.id,
    date: entry.date,
    text: entry.text,
    tags: entry.tags || [],
    created_at: nullableTimestamp(entry.createdAt),
    updated_at: nullableTimestamp(entry.updatedAt),
  }));

  rows.body_metrics = (state.bodyMetrics || []).map(normalizeBodyMetric).map(metric => ({
    user_id: userId,
    id: metric.id,
    date: metric.date,
    weight: number(metric.weight),
    waist: number(metric.waist),
    energy: number(metric.energy),
    note: metric.note || "",
  }));

  rows.relationships = (state.relationships || []).map(normalizeRelationship).map(person => ({
    user_id: userId,
    id: person.id,
    name: person.name || "Contatto senza nome",
    birthday: nullableDate(person.birthday),
    recurrences: person.recurrences || "",
    notes: person.notes || "",
    contact_frequency_days: Math.max(1, number(person.contactFrequencyDays, 30)),
    reminder_days_before: Math.max(0, number(person.reminderDaysBefore, 7)),
    last_contact_date: nullableDate(person.lastContactDate),
  }));

  rows.todos = (state.todos || []).map(normalizeTodo).map(todo => ({
    user_id: userId,
    id: todo.id,
    title: todo.title,
    list: todo.list,
    completed: Boolean(todo.completed),
    created_at: nullableTimestamp(todo.createdAt),
    updated_at: nullableTimestamp(todo.updatedAt),
    completed_at: nullableTimestamp(todo.completedAt),
  }));

  const investments = normalizeInvestments(state.investments || investmentSeed);
  rows.investment_blocks = investments.blocks.map((block, index) => ({
    user_id: userId,
    id: block.id,
    title: block.title,
    name: block.name,
    description: block.description || "",
    strategy: block.strategy || "",
    theme: block.theme || "blue",
    sort_order: index,
    updated_at: cloudSyncStamp,
  }));

  rows.investment_assets = investments.assets.map(asset => ({
    user_id: userId,
    id: asset.id,
    block_id: asset.blockId || "",
    name: asset.name,
    ticker: asset.ticker || "",
    isin: asset.isin || "",
    category: asset.category || "Altro",
    broker: asset.broker || "Altro",
    description: asset.description || "",
    currency: asset.currency || "EUR",
    current_price: number(asset.currentPrice, 0),
    current_price_date: nullableDate(asset.currentPriceDate),
    notes: asset.notes || "",
    created_at: nullableTimestamp(asset.createdAt),
    updated_at: cloudSyncStamp,
  }));

  rows.investment_cash_flows = (investments.cashFlows || []).map(flow => ({
    user_id: userId,
    id: flow.id,
    date: flow.date,
    flow_type: flow.type,
    broker: flow.broker || "Altro",
    amount: number(flow.amount, 0),
    note: flow.note || "",
    created_at: nullableTimestamp(flow.createdAt),
    updated_at: cloudSyncStamp,
  }));

  rows.investment_trades = investments.trades.map(trade => ({
    user_id: userId,
    id: trade.id,
    asset_id: trade.assetId,
    date: trade.date,
    side: trade.side === "sell" ? "sell" : "buy",
    quantity: number(trade.quantity, 0),
    price: number(trade.price, 0),
    amount: number(trade.amount, number(trade.quantity, 0) * number(trade.price, 0)),
    note: trade.note || "",
    created_at: nullableTimestamp(trade.createdAt),
    updated_at: cloudSyncStamp,
  }));

  rows.investment_entries = investments.entries.map(entry => ({
    user_id: userId,
    id: entry.id,
    date: entry.date,
    characteristic: entry.characteristic || "",
    number_value: number(entry.numberValue, 0),
    purchase_price: number(entry.purchasePrice, 0),
    current_price: number(entry.currentPrice, 0),
    current_value: number(entry.currentValue, 0),
    cash_value: number(entry.cashValue, 0),
    text_value: entry.textValue || "",
    generic_option: entry.genericOption,
    transaction_type: entry.transactionType === "update" ? "update" : "buy",
    ath: number(entry.ath, 0),
    created_at_ms: Math.trunc(number(entry.createdAt, Date.now())),
    updated_at: cloudSyncStamp,
  }));

  rows.investment_notes = investments.notes.map(note => ({
    user_id: userId,
    id: note.id,
    date: note.date,
    block_id: note.blockId || "",
    text: note.text || "",
    created_at_ms: Math.trunc(number(note.createdAt, Date.now())),
    updated_at_ms: note.updatedAt ? Math.trunc(number(note.updatedAt, Date.now())) : null,
    updated_at: cloudSyncStamp,
  }));

  return rows;
}

function stateFromCloudRows(rows) {
  const fresh = initialState();
  const settingsRow = rows.app_settings?.[0] || {};
  const quickItems = new Map();
  (rows.quick_add_items || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).forEach(item => {
    if (!quickItems.has(item.quick_add_id)) quickItems.set(item.quick_add_id, []);
    quickItems.get(item.quick_add_id).push({ foodId: item.food_id, qty: number(item.qty, 100) });
  });
  const quickAdds = (rows.quick_adds || [])
    .sort((a, b) => (a.name || "").localeCompare(b.name || "", "it", { sensitivity: "base" }))
    .map(combo => normalizeCombo({
      id: combo.id,
      name: combo.name,
      meal: combo.meal,
      items: quickItems.get(combo.id) || [],
    }));

  const workoutsById = new Map();
  (rows.workouts || []).forEach(workout => {
    workoutsById.set(workout.id, { id: workout.id, date: workout.date, exercises: [] });
  });
  const exercisesByRowId = new Map();
  (rows.workout_exercises || [])
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .forEach(row => {
      const exercise = {
        id: row.exercise_id || row.id,
        name: row.name || "Esercizio",
        note: row.note || "",
        userNote: row.user_note || "",
        sets: [],
      };
      exercisesByRowId.set(row.id, exercise);
      workoutsById.get(row.workout_id)?.exercises.push(exercise);
    });
  (rows.workout_sets || [])
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .forEach(row => {
      exercisesByRowId.get(row.exercise_row_id)?.sets.push({ kg: number(row.kg), reps: number(row.reps) });
    });
  const workouts = Array.from(workoutsById.values())
    .map(workout => normalizeWorkout(workout))
    .sort((a, b) => a.date.localeCompare(b.date));
  const newestWorkout = workouts.at(-1);

  const mealsByDate = {};
  (rows.meal_items || [])
    .sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.created_at || "").localeCompare(String(b.created_at || "")))
    .forEach(item => {
      const date = item.date || todayISO();
      if (!mealsByDate[date]) mealsByDate[date] = [];
      mealsByDate[date].push({
        id: item.id,
        date,
        meal: item.meal || "Extra",
        foodId: item.food_id,
        qty: number(item.qty, 100),
      });
    });

  const investments = normalizeInvestments({
    legacyLedgerImported: true,
    blocks: (rows.investment_blocks || [])
      .sort((a, b) => number(a.sort_order, 0) - number(b.sort_order, 0))
      .map(block => ({
        id: block.id,
        title: block.title,
        name: block.name,
        description: block.description || "",
        strategy: block.strategy || "",
        theme: block.theme || "blue",
      })),
    assets: (rows.investment_assets || []).map(asset => ({
      id: asset.id,
      blockId: asset.block_id || "",
      name: asset.name,
      ticker: asset.ticker || "",
      isin: asset.isin || "",
      category: asset.category || asset.asset_category || "Altro",
      broker: asset.broker || "Altro",
      description: asset.description || "",
      currency: asset.currency || "EUR",
      currentPrice: asset.current_price,
      currentPriceDate: asset.current_price_date || "",
      notes: asset.notes || "",
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
    })),
    trades: (rows.investment_trades || []).map(trade => ({
      id: trade.id,
      assetId: trade.asset_id,
      date: trade.date,
      side: trade.side || "buy",
      quantity: trade.quantity,
      price: trade.price,
      amount: trade.amount,
      note: trade.note || "",
      createdAt: trade.created_at,
      updatedAt: trade.updated_at,
    })),
    cashFlows: (rows.investment_cash_flows || []).map(flow => ({
      id: flow.id,
      date: flow.date,
      type: flow.flow_type || flow.type,
      broker: flow.broker || "Altro",
      amount: flow.amount,
      note: flow.note || "",
      createdAt: flow.created_at,
      updatedAt: flow.updated_at,
    })),
    entries: (rows.investment_entries || []).map(entry => ({
      id: entry.id,
      date: entry.date,
      characteristic: entry.characteristic || "",
      numberValue: entry.number_value,
      purchasePrice: entry.purchase_price,
      currentPrice: entry.current_price,
      currentValue: entry.current_value,
      cashValue: entry.cash_value,
      textValue: entry.text_value || "",
      genericOption: entry.generic_option,
      transactionType: entry.transaction_type || "buy",
      ath: entry.ath,
      createdAt: entry.created_at_ms || 0,
    })),
    notes: (rows.investment_notes || []).map(note => ({
      id: note.id,
      date: note.date,
      blockId: note.block_id || "",
      text: note.text || "",
      createdAt: note.created_at_ms || 0,
      updatedAt: note.updated_at_ms || 0,
    })),
  }, { importLegacyLedger: false });

  return {
    ...fresh,
    settings: {
      ...fresh.settings,
      dayType: settingsRow.day_type || fresh.settings.dayType,
      kcalTrainingMin: number(settingsRow.kcal_training_min, fresh.settings.kcalTrainingMin),
      kcalTrainingMax: number(settingsRow.kcal_training_max, fresh.settings.kcalTrainingMax),
      kcalOffMin: number(settingsRow.kcal_off_min, fresh.settings.kcalOffMin),
      kcalOffMax: number(settingsRow.kcal_off_max, fresh.settings.kcalOffMax),
      proteinMin: number(settingsRow.protein_min, fresh.settings.proteinMin),
      proteinMax: number(settingsRow.protein_max, fresh.settings.proteinMax),
      carbsTarget: number(settingsRow.carbs_target, fresh.settings.carbsTarget),
      fatTarget: number(settingsRow.fat_target, fresh.settings.fatTarget),
      waterNormal: number(settingsRow.water_normal, fresh.settings.waterNormal),
      waterTraining: number(settingsRow.water_training, fresh.settings.waterTraining),
    },
    foods: (rows.foods || []).map(food => ({
      id: food.id,
      name: food.name,
      unit: food.unit || "g",
      kcal: number(food.kcal),
      protein: number(food.protein),
      carbs: number(food.carbs),
      fat: number(food.fat),
    })),
    quickAdds,
    workoutTemplate: newestWorkout?.exercises?.length
      ? newestWorkout.exercises.map(exercise => ({
          id: exercise.id,
          name: exercise.name,
          note: exercise.note,
          userNote: exercise.userNote || "",
          sets: exercise.sets.map(set => ({ ...set })),
        }))
      : fresh.workoutTemplate,
    workouts,
    mealsByDate,
    bodyMetrics: (rows.body_metrics || []).map(metric => normalizeBodyMetric({
      id: metric.id,
      date: metric.date,
      weight: metric.weight,
      waist: metric.waist,
      energy: metric.energy,
      note: metric.note,
    })),
    diary: (rows.diary_entries || []).map(entry => normalizeDiaryEntry({
      id: entry.id,
      date: entry.date,
      text: entry.text,
      tags: entry.tags || [],
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
    })),
    relationships: (rows.relationships || []).map(person => normalizeRelationship({
      id: person.id,
      name: person.name,
      birthday: person.birthday || "",
      recurrences: person.recurrences || "",
      notes: person.notes || "",
      contactFrequencyDays: person.contact_frequency_days,
      reminderDaysBefore: person.reminder_days_before,
      lastContactDate: person.last_contact_date || "",
    })),
    todos: (rows.todos || []).map(todo => normalizeTodo({
      id: todo.id,
      title: todo.title,
      list: todo.list,
      completed: todo.completed,
      createdAt: todo.created_at,
      updatedAt: todo.updated_at,
      completedAt: todo.completed_at || "",
    })),
    links: Array.isArray(state.links) ? state.links.map(normalizeLink).filter(link => link.url) : [],
    investments,
  };
}

function defaultMemoryApiUrl() {
  if (!["http:", "https:"].includes(window.location.protocol)) return "";
  return new URL(MEMORY_API_PATH, window.location.href).href;
}

function memoryApiUrl() {
  return (memoryApiConfig.url || "").trim() || defaultMemoryApiUrl();
}

function hasMemoryApiTarget() {
  return Boolean(memoryApiUrl());
}

async function memoryApiFetch(method = "GET", body = null) {
  const url = memoryApiUrl();
  if (!url) throw new Error("Server memoria non configurato.");
  const response = await fetch(url, {
    method,
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body,
  });
  if (!response.ok) throw new Error(`Server memoria non disponibile (${response.status}).`);
  return response;
}

async function readMemoryApi(options = {}) {
  const url = memoryApiUrl();
  if (!url) return false;
  memoryApiSync.busy = Boolean(options.feedback);
  if (options.feedback) refreshDataPanel();
  try {
    const response = await memoryApiFetch("GET");
    const text = await response.text();
    let parsed;
    try {
      parsed = parseMemoryText(text);
    } catch {
      throw new Error("Memoria server non valida.");
    }
    if (!parsed) {
      memoryApiSync = {
        ...memoryApiSync,
        connected: true,
        busy: false,
        message: "Server memoria vuoto: premi Salva memoria.",
      };
      if (options.feedback) toast("Server memoria vuoto: premi Salva memoria");
      refreshDataPanel();
      return true;
    }
    if (userDataCount(parsed) === 0 && userDataCount(state) > 0) {
      memoryApiSync = {
        ...memoryApiSync,
        connected: true,
        busy: false,
        message: "Server memoria senza dati: premi Salva memoria per copiarci i dati attuali.",
      };
      if (options.feedback) toast("Server memoria senza dati: premi Salva memoria");
      refreshDataPanel();
      return true;
    }
    applyImportedState(parsed, { skipDataFileSync: true });
    memoryApiSync = {
      connected: true,
      lastSync: new Date().toISOString(),
      busy: false,
      message: "",
    };
    if (options.feedback) toast("Memoria caricata dal server");
    refreshDataPanel();
    return true;
  } catch (error) {
    memoryApiSync = {
      ...memoryApiSync,
      connected: false,
      busy: false,
      message: error?.message || "Server memoria non disponibile. Avvia memoria_server.py.",
    };
    if (options.feedback) toast(memoryApiSync.message);
    refreshDataPanel();
    return false;
  }
}

async function writeMemoryApi(options = {}) {
  const url = memoryApiUrl();
  if (!url) return false;
  memoryApiSync.busy = Boolean(options.feedback);
  if (options.feedback) refreshDataPanel();
  try {
    await memoryApiFetch("POST", JSON.stringify(statePayload()));
    memoryApiSync = {
      connected: true,
      lastSync: new Date().toISOString(),
      busy: false,
      message: "",
    };
    if (options.feedback) toast("Memoria salvata sul server");
    refreshDataPanel();
    return true;
  } catch (error) {
    memoryApiSync = {
      ...memoryApiSync,
      connected: false,
      busy: false,
      message: error?.message || "Server memoria non disponibile. Avvia memoria_server.py.",
    };
    if (options.feedback) toast(memoryApiSync.message);
    refreshDataPanel();
    return false;
  }
}

function openDataFileDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATA_FILE_DB, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(DATA_FILE_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function storedDataFileHandle() {
  if (!dataFileSupported()) return null;
  try {
    const db = await openDataFileDb();
    return await new Promise(resolve => {
      const request = db.transaction(DATA_FILE_STORE, "readonly").objectStore(DATA_FILE_STORE).get(DATA_FILE_HANDLE_ID);
      request.onsuccess = () => resolve(request.result?.handle || null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function rememberDataFileHandle(handle) {
  if (!dataFileSupported()) return;
  try {
    const db = await openDataFileDb();
    await new Promise((resolve, reject) => {
      const request = db
        .transaction(DATA_FILE_STORE, "readwrite")
        .objectStore(DATA_FILE_STORE)
        .put({ id: DATA_FILE_HANDLE_ID, handle });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {}
}

async function ensureDataFilePermission(handle, options = {}) {
  if (!handle) return false;
  const permission = { mode: options.mode || "read" };
  try {
    if (await handle.queryPermission?.(permission) === "granted") return true;
    if (options.request && await handle.requestPermission?.(permission) === "granted") return true;
  } catch {
    return false;
  }
  return false;
}

function isPermissionError(error) {
  return ["NotAllowedError", "SecurityError"].includes(error?.name);
}

function parseMemoryText(text) {
  const clean = String(text || "").replace(/^\uFEFF/, "").trim();
  if (!clean) return null;
  return JSON.parse(clean);
}

function userDataCount(candidate) {
  const mealsCount = Object.values(candidate.mealsByDate || {}).reduce((sum, items) => sum + (Array.isArray(items) ? items.length : 0), 0);
  const workoutsCount = Array.isArray(candidate.workouts)
    ? candidate.workouts.filter(workout => workout.date !== candidate.createdAt?.slice?.(0, 10)).length
    : 0;
  const investmentCount = (candidate.investments?.blocks?.length || 0)
    + (candidate.investments?.entries?.length || 0)
    + (candidate.investments?.notes?.length || 0)
    + (candidate.investments?.assets?.length || 0)
    + (candidate.investments?.trades?.length || 0);
  return [
    candidate.todos,
    candidate.diary,
    candidate.relationships,
    candidate.bodyMetrics,
    candidate.links,
  ].reduce((sum, items) => sum + (Array.isArray(items) ? items.length : 0), 0) + mealsCount + workoutsCount + investmentCount;
}

async function getFileFromHandle(handle, options = {}) {
  try {
    return await handle.getFile();
  } catch (error) {
    if (!isPermissionError(error)) throw error;
    const allowed = await ensureDataFilePermission(handle, { mode: "read", request: Boolean(options.feedback) });
    if (!allowed) throw error;
    return handle.getFile();
  }
}

async function createWritableFromHandle(handle, options = {}) {
  try {
    return await handle.createWritable();
  } catch (error) {
    if (!isPermissionError(error)) throw error;
    const allowed = await ensureDataFilePermission(handle, { mode: "readwrite", request: Boolean(options.feedback) });
    if (!allowed) throw error;
    return handle.createWritable();
  }
}

function setDataFileHandle(handle) {
  dataFileHandle = handle;
  dataFileSync = {
    ...dataFileSync,
    supported: dataFileSupported(),
    native: false,
    connected: Boolean(handle),
    name: handle?.name || DATA_FILE_NAME,
    message: "",
  };
  refreshDataPanel();
}

function queueDataFileSave() {
  if (memoryApiSync.connected || memoryApiConfig.url) {
    clearTimeout(dataFileWriteTimer);
    dataFileWriteTimer = window.setTimeout(() => {
      dataFileWriteQueue = dataFileWriteQueue
        .catch(() => {})
        .then(() => writeMemoryApi());
    }, 350);
    return;
  }
  if (!dataFileHandle && !(hasNativeMemoria() && dataFileSync.connected)) return;
  clearTimeout(dataFileWriteTimer);
  dataFileWriteTimer = window.setTimeout(() => {
    dataFileWriteQueue = dataFileWriteQueue
      .catch(() => {})
      .then(() => writeDataFile());
  }, 350);
}

async function writeDataFile(options = {}) {
  if (hasMemoryApiTarget()) {
    const saved = await writeMemoryApi(options);
    if (saved || hasMemoryApiTarget()) return;
  }
  if (hasNativeMemoria()) {
    await writeNativeMemoria(options);
    return;
  }
  if (!dataFileHandle) {
    if (options.feedback) toast("Collega prima una memoria");
    return;
  }
  dataFileSync.busy = Boolean(options.feedback);
  if (options.feedback) refreshDataPanel();
  try {
    const writable = await createWritableFromHandle(dataFileHandle, options);
    await writable.write(JSON.stringify(statePayload(), null, 2));
    await writable.close();
    dataFileSync = {
      ...dataFileSync,
      connected: true,
      name: dataFileHandle.name || DATA_FILE_NAME,
      lastSync: new Date().toISOString(),
      message: "",
    };
    if (options.feedback) toast("Memoria salvata");
  } catch {
    dataFileSync.message = "Memoria non salvata.";
    if (options.feedback) toast("Memoria non salvata");
  } finally {
    dataFileSync.busy = false;
    if (options.feedback || currentScreen === "data") refreshDataPanel();
  }
}

async function readDataFile(options = {}) {
  if (hasMemoryApiTarget()) {
    const loaded = await readMemoryApi(options);
    if (loaded || hasMemoryApiTarget()) return;
  }
  if (hasNativeMemoria()) {
    await readNativeMemoria(options);
    return;
  }
  if (!dataFileHandle) {
    if (options.feedback) toast("Collega prima una memoria");
    return;
  }
  dataFileSync.busy = true;
  refreshDataPanel();
  try {
    const file = await getFileFromHandle(dataFileHandle, options);
    const text = await file.text();
    const parsed = parseMemoryText(text);
    if (!parsed) {
      dataFileSync = {
        ...dataFileSync,
        connected: true,
        name: file.name || dataFileHandle.name || DATA_FILE_NAME,
        message: "Memoria vuota: premi Salva memoria per inizializzarla.",
      };
      if (options.feedback) toast("Memoria vuota: premi Salva memoria");
      return;
    }
    if (userDataCount(parsed) === 0 && userDataCount(state) > 0) {
      dataFileSync = {
        ...dataFileSync,
        connected: true,
        name: file.name || dataFileHandle.name || DATA_FILE_NAME,
        message: "Memoria senza dati: premi Salva memoria per copiarci i dati attuali.",
      };
      if (options.feedback) toast("Memoria senza dati: premi Salva memoria");
      return;
    }
    applyImportedState(parsed, { skipDataFileSync: true });
    dataFileSync = {
      ...dataFileSync,
      connected: true,
      name: file.name || dataFileHandle.name || DATA_FILE_NAME,
      lastSync: new Date().toISOString(),
      message: "",
    };
    if (options.feedback) toast("Memoria caricata");
  } catch (error) {
    const permissionError = isPermissionError(error);
    dataFileSync.message = permissionError
      ? "Permesso file non concesso."
      : "Memoria non valida: seleziona un JSON esportato da Life Tracker.";
    if (options.feedback) toast(dataFileSync.message);
  } finally {
    dataFileSync.busy = false;
    refreshDataPanel();
  }
}

async function openSharedDataFile() {
  if (await readMemoryApi({ feedback: true }) || hasMemoryApiTarget()) return;
  if (hasNativeMemoria()) {
    const result = parseNativeMemoriaResult(window.AndroidMemoria.open());
    if (result.ok) {
      dataFileSync.busy = true;
      dataFileSync.message = "Scegli il file memoria...";
      refreshDataPanel();
      toast("Scegli il file memoria");
    } else {
      toast(result.message || "Memoria non aperta");
    }
    return;
  }
  if (!dataFileSupported()) {
    toast("Memoria non supportata qui");
    return;
  }
  try {
    const [handle] = await window.showOpenFilePicker({
      multiple: false,
      types: [{ description: "Life Tracker JSON", accept: { "application/json": [".json"] } }],
    });
    setDataFileHandle(handle);
    await readDataFile({ feedback: true });
    await rememberDataFileHandle(handle);
  } catch (error) {
    if (error?.name !== "AbortError") toast("Memoria non aperta");
  }
}

async function createSharedDataFile() {
  if (await writeMemoryApi({ feedback: true }) || hasMemoryApiTarget()) return;
  if (hasNativeMemoria()) {
    const result = parseNativeMemoriaResult(window.AndroidMemoria.create());
    if (result.ok) {
      dataFileSync.busy = true;
      dataFileSync.message = "Crea o scegli dove salvare la memoria...";
      refreshDataPanel();
      toast("Crea il file memoria");
    } else {
      toast(result.message || "Memoria non creata");
    }
    return;
  }
  if (!dataFileSupported()) {
    toast("Memoria non supportata qui");
    return;
  }
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: DATA_FILE_NAME,
      types: [{ description: "Life Tracker JSON", accept: { "application/json": [".json"] } }],
    });
    setDataFileHandle(handle);
    await rememberDataFileHandle(handle);
    await writeDataFile({ feedback: true });
  } catch (error) {
    if (error?.name !== "AbortError") toast("Memoria non creata");
  }
}

async function initDataFileSync() {
  window.addEventListener("android-memoria-result", async event => {
    const detail = event.detail || {};
    dataFileSync.busy = false;
    if (!detail.ok) {
      dataFileSync.message = detail.message || "Memoria non collegata.";
      refreshDataPanel();
      toast(dataFileSync.message);
      return;
    }
    dataFileSync = {
      ...dataFileSync,
      supported: true,
      native: true,
      connected: true,
      name: detail.name || DATA_FILE_NAME,
      message: "",
    };
    if (detail.action === "create") await writeNativeMemoria({ feedback: true });
    else await readNativeMemoria({ feedback: true });
  });

  if (await readMemoryApi()) return;

  if (hasNativeMemoria()) {
    const status = nativeMemoriaStatus();
    dataFileSync = {
      ...dataFileSync,
      supported: true,
      native: true,
      connected: Boolean(status.connected),
      name: status.name || DATA_FILE_NAME,
      message: status.connected ? "" : "Collega una memoria: Apri memoria o Crea memoria.",
    };
    refreshDataPanel();
    if (status.connected) await readNativeMemoria();
    return;
  }

  dataFileSync.supported = dataFileSupported();
  if (!dataFileSync.supported) {
    dataFileSync.message = "Usa importa/esporta backup JSON.";
    refreshDataPanel();
    return;
  }
  const handle = await storedDataFileHandle();
  if (!handle) {
    refreshDataPanel();
    return;
  }
  setDataFileHandle(handle);
  if (await ensureDataFilePermission(handle, { mode: "read" })) {
    await readDataFile();
  } else {
    dataFileSync.message = "Memoria collegata: autorizza l'accesso quando vuoi sincronizzare.";
    refreshDataPanel();
  }
}

async function readNativeMemoria(options = {}) {
  if (!hasNativeMemoria()) return;
  dataFileSync.busy = Boolean(options.feedback);
  if (options.feedback) refreshDataPanel();
  const result = parseNativeMemoriaResult(window.AndroidMemoria.read());
  if (!result.ok) {
    dataFileSync = {
      ...dataFileSync,
      connected: Boolean(result.connected),
      name: result.name || dataFileSync.name,
      message: result.message || "Memoria non letta.",
      busy: false,
    };
    if (options.feedback) toast(dataFileSync.message);
    refreshDataPanel();
    return;
  }
  try {
    const text = decodeBase64Utf8(result.contentBase64 || "");
    const parsed = parseMemoryText(text);
    if (!parsed) {
      dataFileSync = {
        ...dataFileSync,
        connected: true,
        name: result.name || dataFileSync.name,
        busy: false,
        message: "Memoria vuota: premi Salva memoria per inizializzarla.",
      };
      if (options.feedback) toast("Memoria vuota: premi Salva memoria");
      refreshDataPanel();
      return;
    }
    if (userDataCount(parsed) === 0 && userDataCount(state) > 0) {
      dataFileSync = {
        ...dataFileSync,
        connected: true,
        name: result.name || dataFileSync.name,
        busy: false,
        message: "Memoria senza dati: premi Salva memoria per copiarci i dati attuali.",
      };
      if (options.feedback) toast("Memoria senza dati: premi Salva memoria");
      refreshDataPanel();
      return;
    }
    applyImportedState(parsed, { skipDataFileSync: true });
    dataFileSync = {
      ...dataFileSync,
      supported: true,
      native: true,
      connected: true,
      name: result.name || DATA_FILE_NAME,
      lastSync: new Date().toISOString(),
      busy: false,
      message: "",
    };
    if (options.feedback) toast("Memoria caricata");
  } catch {
    dataFileSync = {
      ...dataFileSync,
      connected: true,
      name: result.name || dataFileSync.name,
      busy: false,
      message: "Memoria non valida: seleziona un JSON esportato da Life Tracker.",
    };
    if (options.feedback) toast(dataFileSync.message);
  }
  refreshDataPanel();
}

async function writeNativeMemoria(options = {}) {
  if (!hasNativeMemoria()) return;
  const payload = JSON.stringify(statePayload(), null, 2);
  const result = parseNativeMemoriaResult(window.AndroidMemoria.write(encodeBase64Utf8(payload)));
  if (result.ok) {
    dataFileSync = {
      ...dataFileSync,
      supported: true,
      native: true,
      connected: true,
      name: result.name || DATA_FILE_NAME,
      lastSync: new Date().toISOString(),
      busy: false,
      message: "",
    };
    if (options.feedback) toast("Memoria salvata");
  } else {
    dataFileSync = {
      ...dataFileSync,
      connected: Boolean(result.connected),
      name: result.name || dataFileSync.name,
      busy: false,
      message: result.message || "Memoria non salvata.",
    };
    if (options.feedback) toast(dataFileSync.message);
  }
  refreshDataPanel();
}

function cloneWorkout(workout) {
  return JSON.parse(JSON.stringify(workout));
}

function normalizeWorkout(workout) {
  return {
    id: workout.id || uid(),
    date: workout.date || todayISO(),
    exercises: Array.isArray(workout.exercises) ? workout.exercises.map(ex => ({
      id: ex.id || slugify(ex.name || "esercizio"),
      name: ex.name || "Esercizio",
      note: ex.note || "",
      userNote: ex.userNote || "",
      sets: Array.isArray(ex.sets) && ex.sets.length
        ? ex.sets.map(set => ({ kg: number(set.kg), reps: number(set.reps) }))
        : [{ kg: 0, reps: 0 }],
    })) : [],
  };
}

function normalizeDiaryEntry(entry) {
  const text = entry.text || "";
  return {
    id: entry.id || uid(),
    date: entry.date || todayISO(),
    text,
    tags: Array.isArray(entry.tags) ? entry.tags : extractTags(text),
    createdAt: entry.createdAt || new Date().toISOString(),
    updatedAt: entry.updatedAt || entry.createdAt || new Date().toISOString(),
  };
}

function normalizeBodyMetric(metric) {
  return {
    id: metric.id || uid(),
    date: metric.date || todayISO(),
    weight: number(metric.weight, 0),
    waist: number(metric.waist, 0),
    energy: number(metric.energy, 0),
    note: metric.note || "",
  };
}

function normalizeRelationship(person) {
  const notes = Array.isArray(person.notes)
    ? person.notes.map(note => typeof note === "string" ? note : note.text || "").filter(Boolean).join("\n")
    : person.notes || "";
  const recurrences = Array.isArray(person.recurrences)
    ? person.recurrences.map(item => typeof item === "string" ? item : `${item.date || ""} ${item.label || ""}`.trim()).filter(Boolean).join("\n")
    : person.recurrences || person.recurrencesText || "";
  return {
    id: person.id || uid(),
    name: person.name || "",
    birthday: person.birthday || "",
    recurrences,
    notes,
    contactFrequencyDays: Math.max(1, number(person.contactFrequencyDays, 30)),
    reminderDaysBefore: Math.max(0, number(person.reminderDaysBefore, 7)),
    lastContactDate: person.lastContactDate || "",
  };
}

function normalizeTodo(todo) {
  const listIds = TODO_LISTS.map(list => list.id);
  return {
    id: todo.id || uid(),
    title: String(todo.title || todo.text || "").trim() || "Elemento senza titolo",
    list: listIds.includes(todo.list) ? todo.list : "today",
    completed: Boolean(todo.completed),
    createdAt: todo.createdAt || new Date().toISOString(),
    updatedAt: todo.updatedAt || todo.createdAt || new Date().toISOString(),
    completedAt: todo.completedAt || "",
  };
}

function normalizeWebUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(withProtocol);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.href;
  } catch {
    return "";
  }
}

function titleFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "") || "Link";
  } catch {
    return "Link";
  }
}

function normalizeLink(link) {
  const url = normalizeWebUrl(link?.url || link?.href || link?.address);
  const title = String(link?.title || link?.name || "").trim() || titleFromUrl(url);
  const createdAt = link?.createdAt || new Date().toISOString();
  return {
    id: link?.id || uid(),
    title,
    url,
    createdAt,
    updatedAt: link?.updatedAt || createdAt,
  };
}

function normalizeInvestmentBlock(block, index = 0) {
  return {
    id: String(block?.id || `investment-block-${uid()}`),
    title: String(block?.title || `Blocco ${index + 1}`),
    name: String(block?.name || "Nuovo blocco"),
    description: String(block?.description || ""),
    strategy: String(block?.strategy || ""),
    theme: investmentThemeColors[block?.theme] ? block.theme : investmentThemeOrder[index % investmentThemeOrder.length],
  };
}

function normalizeInvestmentEntry(entry) {
  const transactionType = entry?.transactionType === "update" ? "update" : "buy";
  const createdAt = number(entry?.createdAt, Date.now());
  return {
    id: String(entry?.id || uid()),
    date: entry?.date || todayISO(),
    characteristic: String(entry?.characteristic || ""),
    numberValue: number(entry?.numberValue, 0),
    purchasePrice: number(entry?.purchasePrice, 0),
    currentPrice: number(entry?.currentPrice, 0),
    currentValue: number(entry?.currentValue, 0),
    cashValue: number(entry?.cashValue, 0),
    textValue: String(entry?.textValue || ""),
    genericOption: String(entry?.genericOption || ""),
    transactionType,
    ath: number(entry?.ath, 0),
    createdAt,
  };
}

function normalizeInvestmentNote(note) {
  return {
    id: String(note?.id || uid()),
    date: note?.date || todayISO(),
    blockId: String(note?.blockId || ""),
    text: String(note?.text || ""),
    createdAt: number(note?.createdAt, Date.now()),
    updatedAt: note?.updatedAt ? number(note.updatedAt, Date.now()) : 0,
  };
}

function normalizeInvestmentAsset(asset, index = 0) {
  const createdAt = asset?.createdAt || new Date().toISOString();
  const ticker = String(asset?.ticker || "").trim().toUpperCase();
  const isin = String(asset?.isin || "").trim().toUpperCase();
  const name = String(asset?.name || ticker || isin || `Strumento ${index + 1}`).trim();
  return {
    id: String(asset?.id || `investment-asset-${uid()}`),
    blockId: String(asset?.blockId || asset?.block_id || ""),
    name,
    ticker,
    isin,
    category: String(asset?.category || asset?.asset_category || "Altro").trim() || "Altro",
    broker: String(asset?.broker || "Altro").trim() || "Altro",
    description: String(asset?.description || ""),
    currency: String(asset?.currency || "EUR").trim().toUpperCase() || "EUR",
    currentPrice: number(asset?.currentPrice ?? asset?.current_price, 0),
    currentPriceDate: asset?.currentPriceDate || asset?.current_price_date || "",
    notes: String(asset?.notes || ""),
    createdAt,
    updatedAt: asset?.updatedAt || createdAt,
  };
}

function normalizeInvestmentTrade(trade) {
  const quantity = Math.max(0, number(trade?.quantity, 0));
  const price = Math.max(0, number(trade?.price, 0));
  const amount = quantity * price;
  const createdAt = trade?.createdAt || new Date().toISOString();
  return {
    id: String(trade?.id || `investment-trade-${uid()}`),
    assetId: String(trade?.assetId || trade?.asset_id || ""),
    date: trade?.date || todayISO(),
    side: trade?.side === "sell" ? "sell" : "buy",
    quantity,
    price,
    amount,
    note: String(trade?.note || ""),
    createdAt,
    updatedAt: trade?.updatedAt || createdAt,
  };
}

function normalizeInvestmentCashFlow(flow) {
  const type = flow?.type === "withdraw_external" || flow?.flowType === "withdraw_external" ? "withdraw_external" : "deposit_external";
  const createdAt = flow?.createdAt || flow?.created_at || new Date().toISOString();
  return {
    id: String(flow?.id || `investment-cash-flow-${uid()}`),
    date: flow?.date || todayISO(),
    type,
    broker: String(flow?.broker || "Altro").trim() || "Altro",
    amount: Math.max(0, number(flow?.amount, 0)),
    note: String(flow?.note || ""),
    createdAt,
    updatedAt: flow?.updatedAt || flow?.updated_at || createdAt,
  };
}

function legacyInvestmentLedgerFromEntries(blocks, entries) {
  const blockById = new Map(blocks.map(block => [block.id, block]));
  const byBlock = new Map();
  entries.forEach(entry => {
    if (!blockById.has(entry.genericOption)) return;
    if (!byBlock.has(entry.genericOption)) byBlock.set(entry.genericOption, []);
    byBlock.get(entry.genericOption).push(entry);
  });

  const toTimestamp = value => {
    if (!value) return new Date().toISOString();
    if (typeof value === "number") return new Date(value).toISOString();
    const numeric = Number(value);
    if (Number.isFinite(numeric) && String(value).length >= 10) return new Date(numeric).toISOString();
    return String(value);
  };

  const assets = [];
  const trades = [];
  byBlock.forEach((blockEntries, blockId) => {
    const ordered = [...blockEntries].sort((a, b) => a.date.localeCompare(b.date) || number(a.createdAt, 0) - number(b.createdAt, 0));
    const block = blockById.get(blockId);
    const assetId = `legacy-asset-${blockId}`;
    let previousInvested = 0;
    let totalQuantity = 0;
    let firstCreatedAt = "";
    const latestPricedSnapshot = [...ordered]
      .reverse()
      .find(entry => number(entry.currentPrice, 0) > 0 && number(entry.currentValue, 0) > 0);

    ordered.forEach(entry => {
      const invested = number(entry.numberValue, 0);
      if (entry.transactionType === "buy" && invested > 0) {
        let amount = previousInvested > 0 ? invested - previousInvested : invested;
        if (amount <= 0) amount = invested;
        const inferredQuantity = latestPricedSnapshot
          ? number(latestPricedSnapshot.currentValue, 0) / number(latestPricedSnapshot.currentPrice, 1)
          : 0;
        const allocationRatio = amount / Math.max(invested, amount);
        const allocatedInferredQuantity = inferredQuantity * allocationRatio;
        const inferredPrice = allocatedInferredQuantity > 0
          ? amount / allocatedInferredQuantity
          : 1;
        const price = number(entry.purchasePrice, 0) > 0 ? number(entry.purchasePrice, 0) : inferredPrice;
        const quantity = amount / price;
        if (amount > 0 && quantity > 0) {
          const createdAt = toTimestamp(entry.createdAt);
          if (!firstCreatedAt) firstCreatedAt = createdAt;
          totalQuantity += quantity;
          trades.push(normalizeInvestmentTrade({
            id: `legacy-trade-${entry.id}`,
            assetId,
            date: entry.date,
            side: "buy",
            quantity,
            price,
            amount,
            note: entry.textValue || "Importato dai vecchi movimenti investimento",
            createdAt,
            updatedAt: createdAt,
          }));
        }
      }
      if (invested > 0) previousInvested = invested;
    });

    if (!totalQuantity) return;
    const latest = ordered.at(-1);
    const latestValue = number(latest?.currentValue, 0);
    const latestPrice = number(latest?.currentPrice, 0) > 0
      ? number(latest.currentPrice, 0)
      : latestValue > 0 ? latestValue / totalQuantity : number(latest?.purchasePrice, 0);
    assets.push(normalizeInvestmentAsset({
      id: assetId,
      blockId,
      name: block?.name || "Strumento importato",
      ticker: "",
      isin: "",
      currency: "EUR",
      currentPrice: latestPrice,
      currentPriceDate: latest?.date || todayISO(),
      notes: `Creato automaticamente dai vecchi movimenti del blocco ${block?.name || blockId}.`,
      createdAt: firstCreatedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, assets.length));
  });

  return { assets, trades };
}

function normalizeInvestments(investments, options = {}) {
  const blocks = Array.isArray(investments?.blocks) ? investments.blocks.map(normalizeInvestmentBlock) : [];
  const validBlockIds = new Set(blocks.map(block => block.id));
  const entries = (Array.isArray(investments?.entries) ? investments.entries : [])
    .map(normalizeInvestmentEntry)
    .filter(entry => validBlockIds.has(entry.genericOption));
  const notes = (Array.isArray(investments?.notes) ? investments.notes : [])
    .map(normalizeInvestmentNote)
    .filter(note => note.text.trim());
  const hasLedgerData = Boolean((Array.isArray(investments?.assets) && investments.assets.length)
    || (Array.isArray(investments?.trades) && investments.trades.length));
  const legacyLedgerImported = Boolean(investments?.legacyLedgerImported);
  const shouldImportLegacyLedger = options.importLegacyLedger !== false && !legacyLedgerImported && !hasLedgerData;
  const legacyLedger = shouldImportLegacyLedger ? legacyInvestmentLedgerFromEntries(blocks, entries) : { assets: [], trades: [] };
  const rawAssets = Array.isArray(investments?.assets) && investments.assets.length ? investments.assets : legacyLedger.assets;
  const rawTrades = Array.isArray(investments?.trades) && investments.trades.length ? investments.trades : legacyLedger.trades;
  const assets = rawAssets
    .map((asset, index) => normalizeInvestmentAsset(asset, index))
    .map(asset => ({
      ...asset,
      blockId: validBlockIds.has(asset.blockId) ? asset.blockId : "",
    }));
  const validAssetIds = new Set(assets.map(asset => asset.id));
  const trades = rawTrades
    .map(normalizeInvestmentTrade)
    .filter(trade => validAssetIds.has(trade.assetId) && trade.quantity > 0);
  const cashFlows = (Array.isArray(investments?.cashFlows) ? investments.cashFlows : [])
    .map(normalizeInvestmentCashFlow)
    .filter(flow => flow.amount > 0);
  return {
    blocks,
    entries,
    notes,
    assets,
    trades,
    cashFlows,
    legacyLedgerImported: legacyLedgerImported || hasLedgerData || Boolean(legacyLedger.assets.length || legacyLedger.trades.length),
  };
}

function cloneInvestments(investments) {
  return JSON.parse(JSON.stringify(normalizeInvestments(investments)));
}

function investmentUiSnapshot() {
  return {
    investments: cloneInvestments(state.investments || investmentSeed),
    visibleBlockIds: [...visibleInvestmentBlockIds],
    visibleAssetIds: [...visibleInvestmentAssetIds],
    visibleMetricIds: [...visibleInvestmentMetricIds],
    showClosedAssetsInTrend: showClosedInvestmentAssetsInTrend,
  };
}

function applyInvestmentSnapshot(snapshot) {
  if (!snapshot) return;
  state.investments = cloneInvestments(snapshot.investments);
  visibleInvestmentBlockIds = [...(snapshot.visibleBlockIds || [])];
  visibleInvestmentAssetIds = [...(snapshot.visibleAssetIds || [])];
  visibleInvestmentMetricIds = [...(snapshot.visibleMetricIds || visibleInvestmentMetricIds)];
  showClosedInvestmentAssetsInTrend = Boolean(snapshot.showClosedAssetsInTrend);
}

function rememberInvestmentUndo() {
  investmentUndoSnapshot = investmentUiSnapshot();
  investmentRedoSnapshot = null;
}

function restoreInvestmentUndo() {
  if (!investmentUndoSnapshot) return;
  investmentRedoSnapshot = investmentUiSnapshot();
  applyInvestmentSnapshot(investmentUndoSnapshot);
  investmentUndoSnapshot = null;
  editingInvestmentEntryId = "";
  editingInvestmentNoteId = "";
  editingInvestmentAssetId = "";
  editingInvestmentTradeId = "";
  investmentFormMode = "trade";
  investmentTransactionType = "update";
  investmentTradeSide = "buy";
  saveState();
  toast("Ultima modifica investimenti annullata");
  render();
  switchScreen("investments");
}

function restoreInvestmentRedo() {
  if (!investmentRedoSnapshot) return;
  investmentUndoSnapshot = investmentUiSnapshot();
  applyInvestmentSnapshot(investmentRedoSnapshot);
  investmentRedoSnapshot = null;
  saveState();
  toast("Modifica investimenti ripetuta");
  render();
  switchScreen("investments");
}

function emptyInvestmentBlock() {
  return normalizeInvestmentBlock({ id: `investment-block-${uid()}` }, state.investments?.blocks?.length || 0);
}

function emptyInvestmentEntry() {
  return normalizeInvestmentEntry({
    date: todayISO(),
    genericOption: state.investments?.blocks?.[0]?.id || "",
    transactionType: "update",
  });
}

function emptyRelationship() {
  return normalizeRelationship({
    name: "",
    birthday: "",
    recurrences: "",
    notes: "",
    contactFrequencyDays: 30,
    reminderDaysBefore: 7,
    lastContactDate: "",
  });
}

function emptyCombo() {
  return {
    id: "",
    name: "Nuova combo",
    meal: "Colazione",
    items: [{ foodId: state?.foods?.[0]?.id || foodSeed[0].id, qty: 100 }],
  };
}

function cloneCombo(combo) {
  return JSON.parse(JSON.stringify(normalizeCombo(combo)));
}

function normalizeCombo(combo) {
  return {
    id: combo?.id || "",
    name: combo?.name || "Nuova combo",
    meal: combo?.meal || "Extra",
    items: Array.isArray(combo?.items) && combo.items.length
      ? combo.items.map(item => ({ foodId: item.foodId, qty: number(item.qty, 100) }))
      : [{ foodId: foodSeed[0].id, qty: 100 }],
  };
}

function createWorkoutFromTemplate(date) {
  return {
    id: uid(),
    date,
    exercises: state.workoutTemplate.map(ex => ({
      id: ex.id,
      name: ex.name,
      note: ex.note,
      userNote: ex.userNote || "",
      sets: ex.sets.map(set => ({ ...set })),
    })),
  };
}

function findWorkoutForDate(date) {
  return state.workouts.find(workout => workout.date === date);
}

function foodById(id) {
  return state.foods.find(food => food.id === id);
}

function investmentBlockById(id) {
  return state.investments?.blocks?.find(block => block.id === id);
}

function investmentEntries() {
  return state.investments?.entries || [];
}

function investmentEntriesForBlock(blockId) {
  return investmentEntries().filter(entry => entry.genericOption === blockId);
}

function investmentAssets() {
  return state.investments?.assets || [];
}

function investmentTrades() {
  return state.investments?.trades || [];
}

function investmentAssetById(id) {
  return investmentAssets().find(asset => asset.id === id);
}

function investmentTradesForAsset(assetId) {
  return investmentTrades().filter(trade => trade.assetId === assetId);
}

function investmentCashFlows() {
  return state.investments?.cashFlows || [];
}

function investmentCashFlowsUntil(dateLimit = "") {
  return investmentCashFlows().filter(flow => !dateLimit || flow.date <= dateLimit);
}

function investmentNetContributedCapital(dateLimit = "") {
  return investmentCashFlowsUntil(dateLimit).reduce((sum, flow) => {
    return sum + (flow.type === "withdraw_external" ? -number(flow.amount, 0) : number(flow.amount, 0));
  }, 0);
}

function investmentCashFlowTotals(dateLimit = "") {
  const flows = investmentCashFlowsUntil(dateLimit);
  const deposits = flows.filter(flow => flow.type === "deposit_external").reduce((sum, flow) => sum + number(flow.amount, 0), 0);
  const withdrawals = flows.filter(flow => flow.type === "withdraw_external").reduce((sum, flow) => sum + number(flow.amount, 0), 0);
  return { flows, deposits, withdrawals, netContributedCapital: deposits - withdrawals };
}

function investmentAssetLabel(asset) {
  if (!asset) return "Strumento rimosso";
  const code = asset.ticker || asset.isin;
  return code ? `${asset.name} (${code})` : asset.name;
}

function latestInvestmentEntry(blockId, dateLimit = "") {
  const entries = investmentEntriesForBlock(blockId)
    .filter(entry => !dateLimit || entry.date <= dateLimit)
    .sort((a, b) => b.date.localeCompare(a.date) || number(b.createdAt) - number(a.createdAt));
  return entries[0] || null;
}

function investmentMonthsPassed() {
  const start = new Date("2025-08-15T12:00:00");
  const now = new Date();
  return Math.max(0, (now - start) / (1000 * 60 * 60 * 24 * 30.44));
}

function investmentTotals(dateLimit = "") {
  const latest = (state.investments?.blocks || []).map(block => latestInvestmentEntry(block.id, dateLimit)).filter(Boolean);
  const totalInvested = latest.reduce((sum, entry) => sum + number(entry.numberValue), 0);
  const totalValue = latest.reduce((sum, entry) => sum + number(entry.currentValue), 0);
  const cashValue = latest.reduce((sum, entry) => sum + number(entry.cashValue), 0);
  const grossProfit = totalValue - totalInvested;
  const tax = grossProfit > 0 ? grossProfit * INVESTMENT_TAX_RATE : 0;
  const netProfit = grossProfit - tax;
  const netYield = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;
  const grossYield = totalInvested > 0 ? (grossProfit / totalInvested) * 100 : 0;
  const months = investmentMonthsPassed();
  const avgMonthlyGross = months > 0 ? grossProfit / months : 0;
  const avgMonthlyNet = months > 0 ? netProfit / months : 0;
  return { totalInvested, totalValue, cashValue, grossProfit, tax, netProfit, grossYield, netYield, avgMonthlyGross, avgMonthlyNet, months };
}

function investmentTaxOnPositive(value) {
  return Math.max(0, number(value, 0) * INVESTMENT_TAX_RATE);
}

function investmentProfitClass(value) {
  if (number(value) > 0) return "positive";
  if (number(value) < 0) return "negative";
  return "stable";
}

function investmentThemeColor(theme) {
  return investmentThemeColors[theme] || investmentThemeColors.blue;
}

function investmentChartDates() {
  return Array.from(new Set([
    ...investmentEntries().map(entry => entry.date),
    ...investmentTrades().map(trade => trade.date),
    ...investmentCashFlows().map(flow => flow.date),
    ...investmentAssets().map(asset => asset.currentPriceDate),
    todayISO(),
  ].filter(Boolean))).sort().slice(-24);
}

function investmentDashboardTotalsAt(dateLimit = "") {
  return investmentDashboardTotals(investmentTotals(dateLimit), investmentLedgerTotals(dateLimit));
}

function investmentPortfolioTrendSeries() {
  const dates = investmentChartDates();
  const values = dates.map(date => Number(investmentDashboardTotalsAt(date).yieldPct.toFixed(2)));
  return { dates, values };
}

function investmentAllocationRows() {
  const assetRows = investmentAssets()
    .map(asset => {
      const ledger = investmentLedgerForAsset(asset.id);
      return { asset, block: investmentBlockById(asset.blockId) || { name: asset.name, theme: "blue" }, value: ledger.marketValue, quantity: ledger.quantity };
    })
    .filter(row => row.quantity > 0 && row.value > 0);
  const rows = investmentAssets().length ? assetRows : (state.investments?.blocks || []).map(block => {
    const latest = latestInvestmentEntry(block.id);
    return { block, value: number(latest?.currentValue, 0), invested: number(latest?.numberValue, 0), cash: number(latest?.cashValue, 0) };
  }).filter(row => row.value > 0 || row.invested > 0 || row.cash > 0);
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return rows.map(row => ({ ...row, pct: total > 0 ? (row.value / total) * 100 : 0 }));
}

function latestInvestmentSnapshotForAsset(asset, dateLimit = "") {
  if (!asset?.blockId) return null;
  const latest = latestInvestmentEntry(asset.blockId, dateLimit);
  if (!latest || number(latest.currentValue, 0) <= 0) return null;
  return latest;
}

function investmentLedgerForAsset(assetId, options = {}) {
  const asset = investmentAssetById(assetId);
  const trades = investmentTradesForAsset(assetId)
    .filter(trade => trade.id !== options.excludeTradeId)
    .filter(trade => !options.dateLimit || trade.date <= options.dateLimit)
    .sort((a, b) => a.date.localeCompare(b.date) || String(a.createdAt).localeCompare(String(b.createdAt)));
  let quantity = 0;
  let costBasis = 0;
  let realizedGain = 0;
  let boughtAmount = 0;
  let soldAmount = 0;
  let boughtQuantity = 0;
  let soldQuantity = 0;
  trades.forEach(trade => {
    const qty = Math.max(0, number(trade.quantity, 0));
    const amount = Math.max(0, qty * number(trade.price, 0));
    if (!qty || !amount) return;
    if (trade.side === "sell") {
      const avgCost = quantity > 0 ? costBasis / quantity : 0;
      const matchedQty = Math.min(qty, quantity);
      const removedCost = avgCost * matchedQty;
      realizedGain += amount - removedCost;
      quantity = Math.max(0, quantity - qty);
      costBasis = Math.max(0, costBasis - removedCost);
      soldAmount += amount;
      soldQuantity += qty;
      return;
    }
    quantity += qty;
    costBasis += amount;
    boughtAmount += amount;
    boughtQuantity += qty;
  });
  const latestSnapshot = latestInvestmentSnapshotForAsset(asset, options.dateLimit || "");
  const currentPrice = number(latestSnapshot?.currentPrice, 0) > 0
    ? number(latestSnapshot.currentPrice, 0)
    : number(asset?.currentPrice, 0);
  const snapshotMarketValue = number(latestSnapshot?.currentValue, 0);
  const hasSell = trades.some(trade => trade.side === "sell");
  const marketValue = quantity <= 0
    ? 0
    : hasSell || options.forceMarketPrice
      ? quantity * currentPrice
      : snapshotMarketValue > 0 ? snapshotMarketValue : quantity * currentPrice;
  const unrealizedGain = marketValue - costBasis;
  const totalGain = realizedGain + unrealizedGain;
  const avgCost = quantity > 0 ? costBasis / quantity : 0;
  const returnPct = costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0;
  return {
    asset,
    trades,
    quantity,
    costBasis,
    avgCost,
    currentPrice,
    marketValue,
    realizedGain,
    unrealizedGain,
    totalGain,
    returnPct,
    boughtAmount,
    soldAmount,
    boughtQuantity,
    soldQuantity,
    hasSell,
    netInvested: boughtAmount - soldAmount,
  };
}

function investmentLedgerForBlock(blockId, options = {}) {
  const ledgers = investmentAssets()
    .filter(asset => asset.blockId === blockId)
    .map(asset => investmentLedgerForAsset(asset.id, options));
  return ledgers.reduce((acc, ledger) => {
    acc.quantity += ledger.quantity;
    acc.costBasis += ledger.costBasis;
    acc.marketValue += ledger.marketValue;
    acc.realizedGain += ledger.realizedGain;
    acc.unrealizedGain += ledger.unrealizedGain;
    acc.totalGain += ledger.totalGain;
    return acc;
  }, { quantity: 0, costBasis: 0, marketValue: 0, realizedGain: 0, unrealizedGain: 0, totalGain: 0 });
}

function investmentRealizedGainForTrade(trade) {
  if (!trade || trade.side !== "sell") return null;
  const ordered = investmentTradesForAsset(trade.assetId)
    .sort((a, b) => a.date.localeCompare(b.date) || String(a.createdAt).localeCompare(String(b.createdAt)));
  let quantity = 0;
  let costBasis = 0;
  for (const item of ordered) {
    if (item.id === trade.id) {
      const qty = Math.max(0, number(item.quantity, 0));
      const amount = Math.max(0, number(item.amount, qty * number(item.price, 0)));
      const matchedQty = Math.min(qty, quantity);
      const removedCost = quantity > 0 ? (costBasis / quantity) * matchedQty : 0;
      return amount - removedCost;
    }
    const qty = Math.max(0, number(item.quantity, 0));
    const amount = Math.max(0, number(item.amount, qty * number(item.price, 0)));
    if (!qty || !amount) continue;
    if (item.side === "sell") {
      const matchedQty = Math.min(qty, quantity);
      const removedCost = quantity > 0 ? (costBasis / quantity) * matchedQty : 0;
      quantity = Math.max(0, quantity - qty);
      costBasis = Math.max(0, costBasis - removedCost);
    } else {
      quantity += qty;
      costBasis += amount;
    }
  }
  return null;
}

function investmentLedgerTotals(dateLimit = "", options = {}) {
  const ledgers = investmentAssets().map(asset => investmentLedgerForAsset(asset.id, { dateLimit }));
  const cashFlowTotals = investmentCashFlowTotals(dateLimit);
  const tradeDates = ledgers.flatMap(row => row.trades.map(trade => trade.date)).filter(Boolean).sort();
  const flowDates = cashFlowTotals.flows.map(flow => flow.date).filter(Boolean).sort();
  const totals = ledgers.reduce((acc, row) => {
    acc.boughtAmount += row.boughtAmount;
    acc.soldAmount += row.soldAmount;
    acc.costBasis += row.costBasis;
    acc.marketValue += row.marketValue;
    acc.realizedGain += row.realizedGain;
    acc.unrealizedGain += row.unrealizedGain;
    acc.totalGain += row.totalGain;
    if (row.quantity > 0) acc.openPositions += 1;
    return acc;
  }, {
    boughtAmount: 0,
    soldAmount: 0,
    costBasis: 0,
    marketValue: 0,
    realizedGain: 0,
    unrealizedGain: 0,
    totalGain: 0,
    openPositions: 0,
  });
  totals.assetsCount = ledgers.length;
  totals.netInvested = totals.boughtAmount - totals.soldAmount;
  totals.deposits = cashFlowTotals.deposits;
  totals.withdrawals = cashFlowTotals.withdrawals;
  totals.netContributedCapitalRaw = cashFlowTotals.netContributedCapital;
  totals.netContributedCapital = totals.netContributedCapitalRaw > 0 ? totals.netContributedCapitalRaw : totals.boughtAmount;
  totals.netContributedCapitalSource = totals.netContributedCapitalRaw > 0 ? "external" : "fallback_buys";
  totals.portfolioValue = totals.marketValue + Math.max(0, totals.soldAmount - totals.boughtAmount + totals.netContributedCapitalRaw);
  if (!cashFlowTotals.flows.length) totals.portfolioValue = totals.marketValue;
  totals.returnPct = totals.netContributedCapital > 0 ? (totals.totalGain / totals.netContributedCapital) * 100 : 0;
  totals.taxRate = INVESTMENT_TAX_RATE;
  totals.estimatedTax = investmentTaxOnPositive(totals.totalGain);
  totals.realizedTax = 0;
  totals.unrealizedTax = 0;
  totals.realizedNetGain = totals.realizedGain;
  totals.unrealizedNetGain = totals.unrealizedGain;
  totals.netGainAfterTax = totals.totalGain - totals.estimatedTax;
  totals.netReturnPct = totals.netContributedCapital > 0 ? (totals.netGainAfterTax / totals.netContributedCapital) * 100 : 0;
  totals.firstTradeDate = [...tradeDates, ...flowDates].filter(Boolean).sort()[0] || "";
  totals.monthsTracked = investmentMonthsTracked(totals.firstTradeDate, dateLimit || todayISO());
  totals.monthlyGrossGain = totals.monthsTracked > 0 ? totals.totalGain / totals.monthsTracked : totals.totalGain;
  totals.monthlyNetGain = totals.monthsTracked > 0 ? totals.netGainAfterTax / totals.monthsTracked : totals.netGainAfterTax;
  totals.monthlyRealizedNetGain = totals.monthsTracked > 0 ? totals.realizedGain / totals.monthsTracked : totals.realizedGain;
  totals.annualGrossPct = totals.monthsTracked > 0 ? totals.returnPct * (12 / totals.monthsTracked) : totals.returnPct;
  totals.annualNetPct = totals.monthsTracked > 0 ? totals.netReturnPct * (12 / totals.monthsTracked) : totals.netReturnPct;
  if (options.skipDerived) {
    totals.irrPct = 0;
    totals.twrPct = 0;
    return totals;
  }
  totals.irrPct = investmentEstimatedIrr(dateLimit, totals);
  totals.twrPct = investmentEstimatedTwr(dateLimit);
  return totals;
}

function investmentEstimatedIrr(dateLimit = "", precomputedTotals = null) {
  const totals = precomputedTotals || investmentLedgerTotals(dateLimit);
  const flows = investmentCashFlowsUntil(dateLimit).map(flow => ({
    date: flow.date,
    amount: flow.type === "deposit_external" ? -number(flow.amount, 0) : number(flow.amount, 0),
  })).filter(flow => flow.amount !== 0);
  const finalDate = dateLimit || todayISO();
  const finalValue = totals.marketValue;
  if (finalValue <= 0) return 0;
  if (!flows.length) {
    const months = totals.monthsTracked || 1;
    return totals.netContributedCapital > 0 ? (Math.pow(finalValue / totals.netContributedCapital, 12 / months) - 1) * 100 : 0;
  }
  flows.push({ date: finalDate, amount: finalValue });
  const baseDate = new Date(`${flows[0].date}T12:00:00`);
  const npv = rate => flows.reduce((sum, flow) => {
    const days = (new Date(`${flow.date}T12:00:00`) - baseDate) / 86400000;
    return sum + flow.amount / Math.pow(1 + rate, days / 365.25);
  }, 0);
  let low = -0.95;
  let high = 10;
  let fLow = npv(low);
  let fHigh = npv(high);
  if (!Number.isFinite(fLow) || !Number.isFinite(fHigh) || fLow * fHigh > 0) return 0;
  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2;
    const fMid = npv(mid);
    if (Math.abs(fMid) < 0.000001) return mid * 100;
    if (fLow * fMid <= 0) { high = mid; fHigh = fMid; }
    else { low = mid; fLow = fMid; }
  }
  return ((low + high) / 2) * 100;
}

function investmentEstimatedTwr(dateLimit = "") {
  const dates = investmentChartDates().filter(date => !dateLimit || date <= dateLimit);
  if (dates.length < 2) return 0;
  let cumulative = 1;
  let previousValue = investmentLedgerTotals(dates[0], { skipDerived: true }).marketValue;
  for (let i = 1; i < dates.length; i += 1) {
    const date = dates[i];
    const currentValue = investmentLedgerTotals(date, { skipDerived: true }).marketValue;
    const externalFlow = investmentCashFlowsUntil(date)
      .filter(flow => flow.date > dates[i - 1] && flow.date <= date)
      .reduce((sum, flow) => sum + (flow.type === "deposit_external" ? number(flow.amount, 0) : -number(flow.amount, 0)), 0);
    if (previousValue > 0) {
      cumulative *= 1 + ((currentValue - externalFlow) - previousValue) / previousValue;
    }
    previousValue = Math.max(0, currentValue);
  }
  return (cumulative - 1) * 100;
}

function investmentDashboardTotals(snapshotTotals, ledgerTotals) {
  const totalGross = ledgerTotals.realizedGain + ledgerTotals.unrealizedGain;
  const tax = investmentTaxOnPositive(totalGross);
  const totalNet = totalGross - tax;
  return {
    portfolioValue: ledgerTotals.marketValue,
    openValue: ledgerTotals.marketValue || snapshotTotals.totalValue,
    openCost: ledgerTotals.costBasis || snapshotTotals.totalInvested,
    cashInternal: Math.max(0, ledgerTotals.netContributedCapitalRaw - ledgerTotals.costBasis),
    netContributedCapital: ledgerTotals.netContributedCapital,
    netContributedCapitalSource: ledgerTotals.netContributedCapitalSource,
    deposits: ledgerTotals.deposits,
    withdrawals: ledgerTotals.withdrawals,
    realizedGross: ledgerTotals.realizedGain,
    unrealizedGross: ledgerTotals.unrealizedGain || snapshotTotals.grossProfit,
    totalGross: totalGross || snapshotTotals.grossProfit,
    realizedNet: ledgerTotals.realizedGain,
    unrealizedNet: ledgerTotals.unrealizedGain,
    totalNet: totalNet || snapshotTotals.netProfit,
    tax: totalGross ? tax : snapshotTotals.tax,
    grossReturnPct: ledgerTotals.netContributedCapital > 0 ? (totalGross / ledgerTotals.netContributedCapital) * 100 : snapshotTotals.grossYield,
    netReturnPct: ledgerTotals.netContributedCapital > 0 ? (totalNet / ledgerTotals.netContributedCapital) * 100 : snapshotTotals.netYield,
    yieldPct: ledgerTotals.netContributedCapital > 0 ? (totalGross / ledgerTotals.netContributedCapital) * 100 : snapshotTotals.grossYield,
    openReturnPct: ledgerTotals.costBasis > 0 ? (ledgerTotals.unrealizedGain / ledgerTotals.costBasis) * 100 : snapshotTotals.grossYield,
    annualGrossPct: ledgerTotals.annualGrossPct,
    annualNetPct: ledgerTotals.annualNetPct,
    irrPct: ledgerTotals.irrPct,
    twrPct: ledgerTotals.twrPct,
    months: ledgerTotals.monthsTracked || snapshotTotals.months,
    monthlyRealizedNet: ledgerTotals.monthlyRealizedNetGain,
    monthlyTotalNet: ledgerTotals.monthlyNetGain || snapshotTotals.avgMonthlyNet,
  };
}

function investmentMonthsTracked(startDate, endDate = todayISO()) {
  if (!startDate) return 0;
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return 1;
  const days = Math.max(1, (end - start) / 86400000);
  return Math.max(1, days / 30.4375);
}

function upsertByDate(collection, entry) {
  const index = collection.findIndex(item => item.date === entry.date);
  if (index >= 0) collection[index] = entry;
  else collection.push(entry);
}

function persistDraftWorkout({ renderHistory = false } = {}) {
  draftWorkout = normalizeWorkout(draftWorkout);
  selectedDate = draftWorkout.date || selectedDate;
  upsertByDate(state.workouts, cloneWorkout(draftWorkout));
  state.workoutTemplate = draftWorkout.exercises.map(ex => ({
    id: ex.id,
    name: ex.name,
    note: ex.note,
    userNote: ex.userNote || "",
    sets: ex.sets.map(set => ({ ...set })),
  }));
  saveState();
  if (renderHistory) renderWorkout();
}

function bodyMetricForDate(date = selectedDate) {
  return state.bodyMetrics.find(metric => metric.date === date);
}

function upsertBodyMetric(metric) {
  const clean = normalizeBodyMetric(metric);
  const existingIndex = state.bodyMetrics.findIndex(item => item.date === clean.date);
  if (existingIndex >= 0) state.bodyMetrics[existingIndex] = clean;
  else state.bodyMetrics.push(clean);
}

function mealsForDate(date = selectedDate) {
  if (!state.mealsByDate[date]) state.mealsByDate[date] = [];
  return state.mealsByDate[date];
}

function calcItem(item) {
  const food = foodById(item.foodId);
  if (!food) return { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  const factor = number(item.qty) / 100;
  return {
    kcal: food.kcal * factor,
    protein: food.protein * factor,
    carbs: food.carbs * factor,
    fat: food.fat * factor,
  };
}

function nutritionTotals(date = selectedDate) {
  return mealsForDate(date).reduce((acc, item) => {
    const next = calcItem(item);
    acc.kcal += next.kcal;
    acc.protein += next.protein;
    acc.carbs += next.carbs;
    acc.fat += next.fat;
    return acc;
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}

function nutritionTotalsReadOnly(date) {
  return (state.mealsByDate[date] || []).reduce((acc, item) => {
    const next = calcItem(item);
    acc.kcal += next.kcal;
    acc.protein += next.protein;
    acc.carbs += next.carbs;
    acc.fat += next.fat;
    return acc;
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}

function trackedDates() {
  return Array.from(new Set([
    selectedDate,
    ...Object.keys(state.mealsByDate || {}),
    ...state.workouts.map(workout => workout.date),
    ...state.diary.map(entry => entry.date),
    ...state.bodyMetrics.map(metric => metric.date),
    ...investmentEntries().map(entry => entry.date),
    ...investmentTrades().map(trade => trade.date),
  ])).sort();
}

function currentKcalRange() {
  const isTraining = state.settings.dayType === "training";
  return {
    min: isTraining ? state.settings.kcalTrainingMin : state.settings.kcalOffMin,
    max: isTraining ? state.settings.kcalTrainingMax : state.settings.kcalOffMax,
  };
}

function workoutVolume(workout, exerciseId) {
  const exercise = workout.exercises.find(ex => ex.id === exerciseId);
  if (!exercise) return 0;
  return exerciseVolume(exercise);
}

function exerciseVolume(exercise) {
  return exercise.sets.reduce((sum, set) => {
    const kg = number(set.kg);
    const reps = number(set.reps);
    return sum + (kg > 0 ? kg * reps : reps);
  }, 0);
}

function exerciseVolumeLabel(exercise) {
  const hasWeight = exercise.sets.some(set => number(set.kg) > 0);
  return hasWeight ? `${fmt(exerciseVolume(exercise))}` : `${fmt(exerciseVolume(exercise))} rep`;
}

function trendFor(values) {
  const clean = values.filter(value => Number.isFinite(value));
  if (clean.length < 2) return "stable";
  const first = clean[0];
  const last = clean[clean.length - 1];
  const tolerance = Math.max(1, Math.abs(first) * 0.03);
  if (last > first + tolerance) return "up";
  if (last < first - tolerance) return "down";
  return "stable";
}

function trendColor(values) {
  const trend = trendFor(values);
  if (trend === "up") return "#3e8f75";
  if (trend === "down") return "#e76f51";
  return "#e9c46a";
}

function trendLabel(values) {
  const trend = trendFor(values);
  if (trend === "up") return "aumenta";
  if (trend === "down") return "diminuisce";
  return "stabile";
}

function normalizeValues(values) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (!Number.isFinite(max) || max === min) return values.map(() => 50);
  return values.map(value => ((value - min) / (max - min)) * 100);
}

function compareValues(previous, current, tolerance = 0.001) {
  if (current > previous + tolerance) return "up";
  if (current < previous - tolerance) return "down";
  return "stable";
}

function segmentColor(previous, current) {
  const trend = compareValues(previous, current);
  if (trend === "up") return "#3e8f75";
  if (trend === "down") return "#e76f51";
  return "#e9c46a";
}

function segmentLabel(previous, current) {
  const trend = compareValues(previous, current);
  if (trend === "up") return "miglioramento";
  if (trend === "down") return "peggioramento";
  return "stasi";
}

function parseISODate(date) {
  return date ? new Date(`${date}T12:00:00`) : null;
}

function dayDiff(fromDate, toDate) {
  const from = parseISODate(fromDate);
  const to = parseISODate(toDate);
  if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
  return Math.floor((to - from) / 86400000);
}

function daysUntilMonthDay(dateText, fromDate = todayISO()) {
  const match = String(dateText || "").match(/(?:\d{4}-)?(\d{2})-(\d{2})/);
  if (!match) return null;
  const today = parseISODate(fromDate);
  if (!today || Number.isNaN(today.getTime())) return null;
  const month = Number(match[1]) - 1;
  const day = Number(match[2]);
  let target = new Date(today.getFullYear(), month, day, 12, 0, 0);
  if (target < today) target = new Date(today.getFullYear() + 1, month, day, 12, 0, 0);
  return Math.ceil((target - today) / 86400000);
}

function relationshipReminderItems(person, fromDate = todayISO()) {
  const reminderDays = Math.max(0, number(person.reminderDaysBefore, 7));
  const reminders = [];
  const birthdayDays = daysUntilMonthDay(person.birthday, fromDate);
  if (birthdayDays !== null && birthdayDays <= reminderDays) {
    reminders.push({
      type: "birthday",
      message: birthdayDays === 0 ? `${person.name} compie gli anni oggi.` : `Compleanno di ${person.name} tra ${birthdayDays} giorni.`,
      person,
    });
  }

  String(person.recurrences || "").split("\n").map(line => line.trim()).filter(Boolean).forEach(line => {
    const days = daysUntilMonthDay(line, fromDate);
    if (days !== null && days <= reminderDays) {
      const label = line.replace(/(?:\d{4}-)?\d{2}-\d{2}\s*-?\s*/, "").trim() || "ricorrenza";
      reminders.push({
        type: "recurrence",
        message: days === 0 ? `${label} di ${person.name} oggi.` : `${label} di ${person.name} tra ${days} giorni.`,
        person,
      });
    }
  });

  const frequency = Math.max(1, number(person.contactFrequencyDays, 30));
  const daysSinceContact = dayDiff(person.lastContactDate, fromDate);
  if (daysSinceContact !== null && daysSinceContact >= frequency) {
    reminders.push({
      type: "contact",
      message: `È da ${daysSinceContact} giorni che non senti ${person.name}. Vuoi scrivergli?`,
      person,
    });
  }

  return reminders;
}

function allRelationshipReminders() {
  return (state.relationships || []).flatMap(person => relationshipReminderItems(person));
}

function notesPreview(text) {
  const lines = String(text || "").split("\n").map(line => line.trim()).filter(Boolean);
  return lines.slice(-3).join(" · ");
}

function extractTags(text) {
  return Array.from(new Set((text.match(/#[\p{L}\p{N}_-]+/gu) || []).map(tag => tag.toLowerCase())));
}

function fmt(value, digits = 0) {
  return number(value).toLocaleString("it-IT", { maximumFractionDigits: digits });
}

function prettyDate(date) {
  return new Intl.DateTimeFormat("it-IT", { weekday: "short", day: "2-digit", month: "short" }).format(new Date(`${date}T12:00:00`));
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => el.classList.remove("show"), 2200);
}

function renderTimerFace() {
  const face = document.getElementById("timerFace");
  if (face) face.textContent = workoutTimerRemaining;
}

function setWorkoutTimerDuration(value) {
  workoutTimerDuration = clamp(Math.round(number(value, 60)), 5, 3600);
  saveTimerDuration();
  const input = document.getElementById("timerDuration");
  if (input) input.value = workoutTimerDuration;
  if (!workoutTimerRunning) {
    workoutTimerRemaining = workoutTimerDuration;
    renderTimerFace();
  }
}

function startWorkoutTimer() {
  if (workoutTimerRemaining <= 0) workoutTimerRemaining = workoutTimerDuration;
  renderTimerFace();
  if (workoutTimerRunning) return;
  workoutTimerRunning = true;
  workoutTimerId = window.setInterval(() => {
    workoutTimerRemaining = Math.max(0, workoutTimerRemaining - 1);
    renderTimerFace();
    if (workoutTimerRemaining === 0) {
      pauseWorkoutTimer();
      playTimerSound();
      toast("Recupero finito");
    }
  }, 1000);
}

function pauseWorkoutTimer() {
  workoutTimerRunning = false;
  if (workoutTimerId) window.clearInterval(workoutTimerId);
  workoutTimerId = null;
}

function resetWorkoutTimer() {
  pauseWorkoutTimer();
  workoutTimerRemaining = workoutTimerDuration;
  renderTimerFace();
}

function playTimerSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.frequency.value = 880;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.6);
  } catch {
    // Audio is best-effort: browsers may block it until the user interacts.
  }
}

function render() {
  document.getElementById("todayLabel").textContent = prettyDate(selectedDate);
  renderHome();
  renderTodo();
  renderDashboard();
  renderWorkout();
  renderNutrition();
  renderInvestments();
  renderLinks();
  renderFoods();
  renderDiary();
  renderRelationships();
  renderData();
  renderCharts();
  switchScreen(currentScreen, { silent: true });
}

function activeTodos() {
  return (state.todos || [])
    .filter(todo => !todo.completed)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function cloneTodos() {
  return (state.todos || []).map(todo => ({ ...todo }));
}

function rememberTodoUndo() {
  todoUndoSnapshot = cloneTodos();
}

function autosaveTodos(message = "") {
  saveState();
  renderTodo();
  renderHome();
  if (message) toast(message);
}

function renderTodo() {
  const panel = document.getElementById("screen-todo");
  if (!panel) return;
  if (!TODO_LISTS.some(list => list.id === selectedTodoListId)) selectedTodoListId = TODO_LISTS[0].id;
  panel.innerHTML = `
    <div class="panel todo-add-panel">
      <div class="section-head">
        <div>
          <h2>Todo</h2>
        </div>
        <button class="secondary" id="undoTodo" ${todoUndoSnapshot ? "" : "disabled"}>Annulla</button>
      </div>
      <div class="form-grid cols">
        <div class="field">
          <label for="todoTitle">Nuovo elemento</label>
          <input id="todoTitle" placeholder="Cosa devi fare?">
        </div>
        <div class="field">
          <label for="todoList">Lista</label>
          <select id="todoList">
            ${TODO_LISTS.map(list => `<option value="${list.id}" ${list.id === selectedTodoListId ? "selected" : ""}>${list.title}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>&nbsp;</label>
          <button class="primary" id="addTodo">Aggiungi</button>
        </div>
      </div>
    </div>
    <div class="todo-board">
      ${TODO_LISTS.map(renderTodoColumn).join("")}
    </div>
  `;
}

function addTodoFromForm() {
  const input = document.getElementById("todoTitle");
  const select = document.getElementById("todoList");
  const title = input?.value.trim();
  selectedTodoListId = TODO_LISTS.some(list => list.id === select?.value) ? select.value : selectedTodoListId;
  if (!title) {
    toast("Scrivi un elemento");
    return;
  }
  rememberTodoUndo();
  state.todos.push(normalizeTodo({
    id: uid(),
    title,
    list: selectedTodoListId,
    createdAt: new Date().toISOString(),
  }));
  autosaveTodos("Elemento aggiunto");
  switchScreen("todo");
  requestAnimationFrame(() => document.getElementById("todoTitle")?.focus());
}

function renderTodoColumn(list) {
  const items = activeTodos().filter(todo => todo.list === list.id);
  return `
    <section class="todo-column" data-todo-list="${list.id}">
      <div class="todo-column-head">
        <h3>${list.title}</h3>
        <span>${items.length}</span>
      </div>
      <div class="todo-items">
        ${items.length ? items.map(renderTodoCard).join("") : `<p class="hint todo-empty">Vuoto.</p>`}
      </div>
    </section>
  `;
}

function renderTodoCard(todo) {
  return `
    <article class="todo-card" data-todo-id="${todo.id}" draggable="true">
      <button class="todo-check" data-complete-todo="${todo.id}" aria-label="Spunta ${escapeHtml(todo.title)}">✓</button>
      <p>${escapeHtml(todo.title)}</p>
      <button class="todo-drag-handle" data-todo-drag="${todo.id}" aria-label="Sposta ${escapeHtml(todo.title)}">↕</button>
    </article>
  `;
}

function moveTodoToList(todoId, listId) {
  const todo = state.todos.find(item => item.id === todoId);
  if (!todo || todo.list === listId || !TODO_LISTS.some(list => list.id === listId)) return false;
  rememberTodoUndo();
  todo.list = listId;
  todo.updatedAt = new Date().toISOString();
  autosaveTodos("Elemento spostato");
  return true;
}

function renderHome() {
  const totals = nutritionTotals();
  const workout = findWorkoutForDate(selectedDate);
  document.getElementById("screen-home").innerHTML = `
		<div class="home-hero">
		  <h2>Life Tracker 2.0</h2>
		  <p>Monitoraggio personale di todo, allenamento, alimentazione, investimenti, diario, relazioni e trend. La Todo salva automaticamente; le altre sezioni restano manuali.</p>
		</div>
    <div class="grid two home-summary" style="margin-bottom:12px;">
	      ${metric("Calorie giorno", `${fmt(totals.kcal)} kcal`, "alimentazione", totals.kcal / currentKcalRange().max)}
      ${metric("Workout", workout ? `${workout.exercises.length} esercizi` : "non registrato", workout ? prettyDate(workout.date) : "oggi", workout ? 1 : 0)}
    </div>
    <div class="home-grid">
      ${SCREENS.map(screen => `
        <button class="home-card" data-screen="${screen.id}">
          <span aria-hidden="true">${screen.icon}</span>
          <div>
            <strong>${screen.title}</strong>
            <small>${screen.text}</small>
          </div>
        </button>
      `).join("")}
    </div>
  `;
}

function renderInvestments() {
  const panel = document.getElementById("screen-investments");
  if (!panel) return;
  state.investments = normalizeInvestments(state.investments || investmentSeed);
  const ledgerTotals = investmentLedgerTotals();
  const snapshotTotals = investmentTotals();
  const dashboardTotals = investmentDashboardTotals(snapshotTotals, ledgerTotals);
  const hasBlocks = state.investments.blocks.length > 0;
  const formTitle = investmentFormMode === "asset"
    ? (editingInvestmentAssetId ? "Modifica strumento" : "Nuovo strumento")
    : investmentFormMode === "block"
      ? "Nuovo blocco"
      : investmentFormMode === "entry"
        ? (editingInvestmentEntryId ? "Modifica snapshot" : "Aggiorna valore snapshot")
        : (editingInvestmentTradeId ? "Modifica movimento" : "Nuovo movimento");
  panel.innerHTML = `
    <div class="wide-layout">
      <div>
        <div class="panel">
	          <div class="section-head">
	            <div>
	              <h2>Investimenti</h2>
	              <p class="hint">Registro unico per acquisti e vendite long-term. Commissioni, cedole e dividendi non sono considerati.</p>
	            </div>
	            <div class="row-actions"><button class="secondary" id="undoInvestmentChange" ${investmentUndoSnapshot ? "" : "disabled"}>Annulla</button><button class="secondary" id="redoInvestmentChange" ${investmentRedoSnapshot ? "" : "disabled"}>Ripeti</button></div>
	          </div>
          ${renderInvestmentMetricFilter()}
          <div class="grid two investment-summary">
            ${renderInvestmentDashboardMetrics(dashboardTotals, ledgerTotals)}
          </div>
        </div>

        <div class="panel">
          <div class="section-head">
            <div>
              <h2>${formTitle}</h2>
              <p class="hint">Ogni movimento resta nello storico e serve a calcolare utile realizzato, utile aperto e guadagno cumulato.</p>
            </div>
          </div>
          <div class="chips investment-form-tabs">
            <button class="chip ${investmentFormMode === "trade" ? "active" : ""}" id="showInvestmentTradeForm">Movimento</button>
            <button class="chip ${investmentFormMode === "asset" ? "active" : ""}" id="showInvestmentAssetForm">Strumento</button>
            <button class="chip ${investmentFormMode === "block" ? "active" : ""}" id="showInvestmentBlockForm">Blocco</button>
            <button class="chip ${investmentFormMode === "entry" ? "active" : ""}" id="showInvestmentEntryForm">Snapshot</button>
          </div>
          ${renderInvestmentPrimaryForm()}
        </div>

        <div class="panel">
          <h2>Note investimento</h2>
          ${renderInvestmentNoteForm()}
          <div class="investment-notes">
            ${renderInvestmentNotes()}
          </div>
        </div>
      </div>

      <div>
        <div class="panel">
          <h2>Posizioni</h2>
          ${renderInvestmentPositions()}
        </div>

        <div class="panel">
          <h2>Log movimenti asset</h2>
          ${renderInvestmentTradeLog()}
        </div>

        <div class="panel">
          <h2>Andamento</h2>
          ${renderInvestmentChartToggles()}
          <div class="chart">${renderInvestmentPerformanceChart()}</div>
        </div>

        <div class="panel">
          <h2>Allocazione attuale</h2>
          ${renderInvestmentAllocation()}
        </div>

        <div class="panel">
          <h2>Blocchi portafoglio</h2>
          ${hasBlocks ? renderInvestmentBlocks() : `<p class="hint">Nessun blocco presente. Creane uno per iniziare.</p>`}
        </div>

        <div class="panel">
          <h2>Log movimenti</h2>
          ${renderInvestmentLog()}
        </div>
      </div>
    </div>
  `;
}


function investmentMetricDefinitions(dashboardTotals, ledgerTotals) {
  return [
    { id: "portfolioValue", title: "Valore totale portafoglio", value: `€ ${fmt(dashboardTotals.portfolioValue, 2)}`, note: "asset aperti + cash interno stimato", progress: dashboardTotals.portfolioValue / Math.max(dashboardTotals.netContributedCapital, 1) },
    { id: "netContributedCapital", title: "Capitale netto conferito", value: `€ ${fmt(dashboardTotals.netContributedCapital, 2)}`, note: dashboardTotals.netContributedCapitalSource === "external" ? "depositi - prelievi" : "fallback: acquisti storici", progress: dashboardTotals.netContributedCapital / Math.max(dashboardTotals.netContributedCapital + 1, 1) },
    { id: "totalGross", title: "Utile totale lordo", value: `€ ${fmt(dashboardTotals.totalGross, 2)}`, note: `realizzato € ${fmt(dashboardTotals.realizedGross, 2)} + aperto € ${fmt(dashboardTotals.unrealizedGross, 2)}`, progress: Math.abs(dashboardTotals.totalGross) / Math.max(dashboardTotals.netContributedCapital * 0.25, 1), negative: dashboardTotals.totalGross < 0 },
    { id: "totalNet", title: "Utile totale netto stimato", value: `€ ${fmt(dashboardTotals.totalNet, 2)}`, note: `tasse stimate 26%: € ${fmt(dashboardTotals.tax, 2)}`, progress: Math.abs(dashboardTotals.totalNet) / Math.max(dashboardTotals.netContributedCapital * 0.25, 1), negative: dashboardTotals.totalNet < 0 },
    { id: "grossReturnPct", title: "Rendimento totale lordo", value: `${fmt(dashboardTotals.grossReturnPct, 2)}%`, note: "su capitale conferito", progress: Math.abs(dashboardTotals.grossReturnPct) / 25, negative: dashboardTotals.grossReturnPct < 0 },
    { id: "netReturnPct", title: "Rendimento totale netto", value: `${fmt(dashboardTotals.netReturnPct, 2)}%`, note: "su capitale conferito", progress: Math.abs(dashboardTotals.netReturnPct) / 25, negative: dashboardTotals.netReturnPct < 0 },
    { id: "annualGrossPct", title: "Media annua lorda", value: `${fmt(dashboardTotals.annualGrossPct, 2)}%`, note: `${fmt(dashboardTotals.months, 1)} mesi tracciati`, progress: Math.abs(dashboardTotals.annualGrossPct) / 25, negative: dashboardTotals.annualGrossPct < 0 },
    { id: "annualNetPct", title: "Media annua netta", value: `${fmt(dashboardTotals.annualNetPct, 2)}%`, note: `${fmt(dashboardTotals.months, 1)} mesi tracciati`, progress: Math.abs(dashboardTotals.annualNetPct) / 25, negative: dashboardTotals.annualNetPct < 0 },
    { id: "irr", title: "TIR / IRR stimato", value: `${fmt(dashboardTotals.irrPct, 2)}%`, note: "money-weighted annuo", progress: Math.abs(dashboardTotals.irrPct) / 25, negative: dashboardTotals.irrPct < 0 },
    { id: "twr", title: "TWR stimato", value: `${fmt(dashboardTotals.twrPct, 2)}%`, note: "time-weighted", progress: Math.abs(dashboardTotals.twrPct) / 25, negative: dashboardTotals.twrPct < 0 },
    { id: "realizedGross", title: "Utile realizzato", value: `€ ${fmt(dashboardTotals.realizedGross, 2)}`, note: `vendite € ${fmt(ledgerTotals.soldAmount, 2)}`, progress: Math.abs(dashboardTotals.realizedGross) / Math.max(ledgerTotals.boughtAmount, 1), negative: dashboardTotals.realizedGross < 0 },
    { id: "unrealizedGross", title: "Utile non realizzato", value: `€ ${fmt(dashboardTotals.unrealizedGross, 2)}`, note: "posizioni aperte", progress: Math.abs(dashboardTotals.unrealizedGross) / Math.max(dashboardTotals.openCost, 1), negative: dashboardTotals.unrealizedGross < 0 },
    { id: "openAssetValue", title: "Valore aperto asset", value: `€ ${fmt(dashboardTotals.openValue, 2)}`, note: `${ledgerTotals.openPositions} posizioni aperte`, progress: dashboardTotals.openValue / Math.max(dashboardTotals.netContributedCapital, 1) },
    { id: "openCost", title: "Capitale ancora investito", value: `€ ${fmt(dashboardTotals.openCost, 2)}`, note: "cost basis aperto", progress: dashboardTotals.openCost / Math.max(dashboardTotals.netContributedCapital, 1) },
    { id: "cashInternal", title: "Cash interno stimato", value: `€ ${fmt(dashboardTotals.cashInternal, 2)}`, note: "liquidità nel sistema", progress: dashboardTotals.cashInternal / Math.max(dashboardTotals.netContributedCapital, 1) },
    { id: "openReturnPct", title: "Rendimento aperto", value: `${fmt(dashboardTotals.openReturnPct, 2)}%`, note: "solo posizioni aperte", progress: Math.abs(dashboardTotals.openReturnPct) / 25, negative: dashboardTotals.openReturnPct < 0 },
  ];
}

function renderInvestmentDashboardMetrics(dashboardTotals, ledgerTotals) {
  const definitions = investmentMetricDefinitions(dashboardTotals, ledgerTotals);
  return definitions
    .filter(item => visibleInvestmentMetricIds.includes(item.id))
    .map(item => metric(item.title, item.value, item.note, item.progress, item.negative))
    .join("") || `<p class="hint">Nessun parametro selezionato.</p>`;
}

function renderInvestmentMetricFilter() {
  const definitions = investmentMetricDefinitions(investmentDashboardTotals(investmentTotals(), investmentLedgerTotals()), investmentLedgerTotals());
  return `
    <details class="filter-box investment-metric-filter">
      <summary>Parametri dashboard</summary>
      <div class="chips">
        <button class="chip" data-investment-metric-preset="all">Tutti</button>
        <button class="chip" data-investment-metric-preset="essential">Essenziali</button>
        <button class="chip" data-investment-metric-preset="none">Nessuno</button>
      </div>
      <div class="filter-grid">
        ${definitions.map(item => `
          <label class="check-row">
            <input type="checkbox" data-investment-metric-toggle="${item.id}" ${visibleInvestmentMetricIds.includes(item.id) ? "checked" : ""}>
            <span>${escapeHtml(item.title)}</span>
          </label>
        `).join("")}
      </div>
    </details>
  `;
}

function renderInvestmentPrimaryForm() {
  if (investmentFormMode === "asset") return renderInvestmentAssetForm();
  if (investmentFormMode === "block") return renderInvestmentBlockForm();
  if (investmentFormMode === "entry") return renderInvestmentEntryForm();
  return renderInvestmentTradeForm();
}

function renderInvestmentTradeForm() {
  const trade = editingInvestmentTradeId
    ? state.investments.trades.find(item => item.id === editingInvestmentTradeId)
    : null;
  const selectedAssetId = trade?.assetId || state.investments.assets[0]?.id || "";
  const side = trade?.side || investmentTradeSide;
  const isCashFlow = side === "deposit_external" || side === "withdraw_external";
  if (isCashFlow) {
    return `
      <div class="segmented investment-type-switch" data-action="investment-trade-side">
        <button class="${side === "buy" ? "active" : ""}" data-investment-trade-side="buy">Acquisto</button>
        <button class="${side === "sell" ? "active" : ""}" data-investment-trade-side="sell">Vendita</button>
        <button class="${side === "deposit_external" ? "active" : ""}" data-investment-trade-side="deposit_external">Deposito esterno</button>
        <button class="${side === "withdraw_external" ? "active" : ""}" data-investment-trade-side="withdraw_external">Prelievo esterno</button>
      </div>
      <div class="form-grid cols">
        <div class="field"><label for="investmentCashFlowDate">Data</label><input id="investmentCashFlowDate" type="date" value="${todayISO()}"></div>
        <div class="field"><label for="investmentCashFlowBroker">Broker</label><input id="investmentCashFlowBroker" value="Altro" placeholder="Scalable, Trade Republic..."></div>
        <div class="field"><label for="investmentCashFlowAmount">Importo</label><input id="investmentCashFlowAmount" inputmode="decimal" placeholder="Importo €"></div>
        <div class="field"><label for="investmentCashFlowNote">Nota</label><input id="investmentCashFlowNote" placeholder="Nuovi fondi / prelievo"></div>
        <div class="row-actions" style="grid-column:1 / -1;"><button class="primary" id="saveInvestmentTrade">${side === "deposit_external" ? "Registra deposito" : "Registra prelievo"}</button></div>
      </div>
    `;
  }
  if (!state.investments.assets.length) return `<p class="hint">Prima crea almeno uno strumento.</p>`;
  const assetOptions = state.investments.assets.map(asset => `
    <option value="${asset.id}" ${asset.id === selectedAssetId ? "selected" : ""}>${escapeHtml(investmentAssetLabel(asset))}</option>
  `).join("");
  const quantity = trade ? trade.quantity : "";
  const price = trade ? trade.price : "";
  return `
    <div class="segmented investment-type-switch" data-action="investment-trade-side">
      <button class="${side === "buy" ? "active" : ""}" data-investment-trade-side="buy">Acquisto</button>
      <button class="${side === "sell" ? "active" : ""}" data-investment-trade-side="sell">Vendita</button>
      <button class="${side === "deposit_external" ? "active" : ""}" data-investment-trade-side="deposit_external">Deposito esterno</button>
      <button class="${side === "withdraw_external" ? "active" : ""}" data-investment-trade-side="withdraw_external">Prelievo esterno</button>
    </div>
    <div class="form-grid cols">
      <div class="field"><label for="investmentTradeDate">Data</label><input id="investmentTradeDate" type="date" value="${trade?.date || todayISO()}"></div>
      <div class="field"><label for="investmentTradeAsset">Strumento</label><select id="investmentTradeAsset">${assetOptions}</select></div>
      ${side === "sell" ? `<label class="check-row" style="grid-column:1 / -1;"><input type="checkbox" id="investmentTradeSellAll"> <span>Vendi tutta la posizione disponibile</span></label>` : ""}
      <div class="field"><label for="investmentTradeQuantity">Quantità</label><input id="investmentTradeQuantity" inputmode="decimal" value="${quantity}" placeholder="Numero unità"></div>
      <div class="field"><label for="investmentTradePrice">Prezzo unitario</label><input id="investmentTradePrice" inputmode="decimal" value="${price}" placeholder="Prezzo"></div>
      <div class="field"><label>Valore calcolato</label><output id="investmentTradeComputedAmount" class="computed-output">€ 0,00</output></div>
      <div class="field"><label for="investmentTradeNote">Nota</label><input id="investmentTradeNote" value="${escapeHtml(trade?.note || "")}" placeholder="PAC, ingresso, ribilanciamento..."></div>
      <div class="row-actions" style="grid-column:1 / -1;">
        ${trade ? `<button class="secondary" id="cancelInvestmentTradeEdit">Annulla</button>` : ""}
        <button class="primary" id="saveInvestmentTrade">${trade ? "Salva movimento" : side === "sell" ? "Registra vendita" : "Registra acquisto"}</button>
      </div>
    </div>
  `;
}

function renderInvestmentAssetForm() {
  const asset = editingInvestmentAssetId
    ? state.investments.assets.find(item => item.id === editingInvestmentAssetId)
    : null;
  const blockOptions = state.investments.blocks.map(block => `
    <option value="${block.id}" ${block.id === asset?.blockId ? "selected" : ""}>${escapeHtml(block.name)}</option>
  `).join("");
  const categoryOptions = ["ETF / Azionario", "Crypto", "Oro / Commodity", "Quasi-cash", "Cash-like", "Altro"]
    .map(item => `<option value="${item}" ${item === (asset?.category || "Altro") ? "selected" : ""}>${item}</option>`).join("");
  const brokerOptions = ["Scalable Capital", "Trade Republic", "Altro"]
    .map(item => `<option value="${item}" ${item === (asset?.broker || "Altro") ? "selected" : ""}>${item}</option>`).join("");
  return `
    <div class="form-grid cols">
      <div class="field"><label for="investmentAssetName">Nome</label><input id="investmentAssetName" value="${escapeHtml(asset?.name || "")}" placeholder="Es. Vanguard S&P 500"></div>
      <div class="field"><label for="investmentAssetCategory">Categoria</label><select id="investmentAssetCategory">${categoryOptions}</select></div>
      <div class="field"><label for="investmentAssetBroker">Broker</label><select id="investmentAssetBroker">${brokerOptions}</select></div>
      <div class="field"><label for="investmentAssetTicker">Ticker</label><input id="investmentAssetTicker" value="${escapeHtml(asset?.ticker || "")}" placeholder="Opzionale"></div>
      <div class="field"><label for="investmentAssetIsin">ISIN</label><input id="investmentAssetIsin" value="${escapeHtml(asset?.isin || "")}" placeholder="Opzionale"></div>
      <div class="field"><label for="investmentAssetBlock">Blocco</label><select id="investmentAssetBlock"><option value="">Nessun blocco</option>${blockOptions}</select></div>
      <div class="field"><label for="investmentAssetCurrency">Valuta</label><input id="investmentAssetCurrency" value="${escapeHtml(asset?.currency || "EUR")}"></div>
      <div class="field"><label for="investmentAssetPrice">Prezzo attuale</label><input id="investmentAssetPrice" inputmode="decimal" value="${asset?.currentPrice || ""}" placeholder="Prezzo unitario"></div>
      <div class="field"><label for="investmentAssetPriceDate">Data prezzo</label><input id="investmentAssetPriceDate" type="date" value="${asset?.currentPriceDate || todayISO()}"></div>
      <div class="field" style="grid-column:1 / -1;"><label for="investmentAssetDescription">Descrizione</label><input id="investmentAssetDescription" value="${escapeHtml(asset?.description || "")}" placeholder="Caratteristiche asset"></div>
      <div class="field" style="grid-column:1 / -1;"><label for="investmentAssetNotes">Note</label><textarea id="investmentAssetNotes" rows="2">${escapeHtml(asset?.notes || "")}</textarea></div>
      <div class="row-actions" style="grid-column:1 / -1;">
        ${asset ? `<button class="secondary" id="cancelInvestmentAssetEdit">Annulla</button>` : ""}
        <button class="primary" id="saveInvestmentAsset">${asset ? "Salva strumento" : "Crea strumento"}</button>
      </div>
    </div>
  `;
}

function renderInvestmentEntryForm() {
  const entry = editingInvestmentEntryId
    ? state.investments.entries.find(item => item.id === editingInvestmentEntryId)
    : null;
  const selectedBlockId = entry?.genericOption || state.investments.blocks[0]?.id || "";
  const isLegacyBuy = entry?.transactionType === "buy";
  const isUpdate = !isLegacyBuy;
  const blockOptions = state.investments.blocks.map(block => (
    `<option value="${block.id}" ${block.id === selectedBlockId ? "selected" : ""}>${escapeHtml(block.title)}: ${escapeHtml(block.name)}</option>`
  )).join("");
  if (!state.investments.blocks.length) return `<p class="hint">Prima crea almeno un blocco portafoglio.</p>`;
  const lastAth = selectedBlockId ? investmentLastAth(selectedBlockId) : "";
  return `
    <p class="hint">${isLegacyBuy ? "Acquisto legacy mantenuto per storico. Per nuovi acquisti usa Movimento -> Acquisto." : "Snapshot aggiorna prezzo, valore posizione, ATH e note senza registrare nuovi acquisti."}</p>
    <div class="form-grid cols">
      <div class="field">
        <label for="investmentDate">Data</label>
        <input id="investmentDate" type="date" value="${entry?.date || todayISO()}">
      </div>
      <div class="field">
        <label for="investmentBlock">Blocco</label>
        <select id="investmentBlock">${blockOptions}</select>
      </div>
      ${!isUpdate ? `
        <div class="field">
          <label for="investmentAmount">Capitale investito</label>
          <input id="investmentAmount" inputmode="decimal" value="${entry ? entry.numberValue : ""}" placeholder="Importo in euro">
        </div>
        <div class="field">
          <label for="investmentPurchasePrice">Prezzo acquisto</label>
          <input id="investmentPurchasePrice" inputmode="decimal" value="${entry ? entry.purchasePrice : ""}" placeholder="Prezzo unitario">
        </div>
      ` : `
        <div class="field">
          <label for="investmentCurrentPrice">Prezzo attuale</label>
          <input id="investmentCurrentPrice" inputmode="decimal" value="${entry ? entry.currentPrice : ""}" placeholder="Prezzo unitario">
        </div>
        <div class="field">
          <label for="investmentAth">ATH</label>
          <input id="investmentAth" inputmode="decimal" value="${entry?.ath || lastAth || ""}" placeholder="Massimo storico">
        </div>
      `}
      <div class="field">
        <label for="investmentCurrentValue">Valore mercato</label>
        <input id="investmentCurrentValue" inputmode="decimal" value="${entry ? entry.currentValue : ""}" placeholder="Valore posizione">
      </div>
      ${!isUpdate ? `
        <div class="field">
          <label for="investmentCash">Cash residuo / allocato</label>
          <input id="investmentCash" inputmode="decimal" value="${entry ? entry.cashValue : "0"}">
        </div>
      ` : ""}
      <div class="field" style="grid-column:1 / -1;">
        <label for="investmentText">Nota</label>
        <textarea id="investmentText" rows="3" placeholder="Ribilanciamento, prezzo, decisione...">${escapeHtml(entry?.textValue || "")}</textarea>
      </div>
      <div class="row-actions" style="grid-column:1 / -1;">
        ${entry ? `<button class="secondary" id="cancelInvestmentEdit">Annulla</button>` : ""}
        <button class="primary" id="saveInvestmentEntry">${entry ? "Salva modifiche" : "Aggiorna valore"}</button>
      </div>
    </div>
  `;
}

function renderInvestmentBlockForm() {
  return `
    <div class="form-grid">
      <div class="field">
        <label for="investmentBlockName">Nome blocco</label>
        <input id="investmentBlockName" placeholder="Es. Crypto, Obbligazioni, Real assets">
      </div>
      <div class="field">
        <label for="investmentBlockDescription">Descrizione</label>
        <textarea id="investmentBlockDescription" rows="2" placeholder="Area, obiettivo, rischio..."></textarea>
      </div>
      <div class="field">
        <label for="investmentBlockStrategy">Strategia</label>
        <textarea id="investmentBlockStrategy" rows="5" placeholder="Regole di ingresso, drawdown, target..."></textarea>
      </div>
      <button class="primary" id="saveInvestmentBlock">Crea blocco</button>
    </div>
  `;
}

function renderInvestmentNoteForm() {
  const blockOptions = state.investments.blocks.map(block => `<option value="${block.id}">${escapeHtml(block.name)}</option>`).join("");
  return `
    <div class="form-grid cols">
      <div class="field">
        <label for="investmentNoteDate">Data</label>
        <input id="investmentNoteDate" type="date" value="${todayISO()}">
      </div>
      <div class="field">
        <label for="investmentNoteBlock">Blocco</label>
        <select id="investmentNoteBlock">
          <option value="">Nota generale</option>
          ${blockOptions}
        </select>
      </div>
      <div class="field" style="grid-column:1 / -1;">
        <label for="investmentNoteText">Nota</label>
        <textarea id="investmentNoteText" rows="3" placeholder="Idea, rischio, decisione da ricordare..."></textarea>
      </div>
      <button class="secondary" id="saveInvestmentNote" style="grid-column:1 / -1;">Salva nota</button>
    </div>
  `;
}

function renderInvestmentChartToggles() {
  const assets = investmentAssets();
  if (!assets.length) return "";
  if (!visibleInvestmentAssetIds.length) visibleInvestmentAssetIds = assets.map(asset => asset.id);
  const visibleSet = new Set(visibleInvestmentAssetIds);
  return `
    <div class="chips investment-chart-toggles">
      <button class="chip" data-investment-asset-filter="all">Tutti asset</button>
      <button class="chip" data-investment-asset-filter="none">Nessuno</button>
      <button class="chip ${showClosedInvestmentAssetsInTrend ? "active" : ""}" data-investment-show-closed="true">Asset chiusi</button>
      ${assets.map(asset => {
        const ledger = investmentLedgerForAsset(asset.id);
        const isClosed = ledger.quantity <= 0;
        if (isClosed && !showClosedInvestmentAssetsInTrend) return "";
        return `<button class="chip ${visibleSet.has(asset.id) ? "active" : ""}" data-investment-toggle-asset="${asset.id}">${escapeHtml(investmentAssetLabel(asset))}${isClosed ? " · chiuso" : ""}</button>`;
      }).join("")}
    </div>
  `;
}

function renderInvestmentPerformanceChart() {
  const dates = investmentChartDates();
  if (dates.length < 2) return `<p class="hint">Servono almeno due date per vedere l'andamento.</p>`;
  const portfolio = investmentPortfolioTrendSeries();
  const series = [{ label: "Portafoglio totale", values: portfolio.values, color: trendColor(portfolio.values) }];
  const visibleSet = new Set(visibleInvestmentAssetIds.length ? visibleInvestmentAssetIds : investmentAssets().map(asset => asset.id));
  investmentAssets().forEach(asset => {
    const fullLedger = investmentLedgerForAsset(asset.id);
    if (fullLedger.quantity <= 0 && !showClosedInvestmentAssetsInTrend) return;
    if (!visibleSet.has(asset.id)) return;
    const values = dates.map(date => {
      const ledger = investmentLedgerForAsset(asset.id, { dateLimit: date });
      const base = ledger.costBasis + Math.max(0, ledger.realizedGain);
      if (base <= 0) return 0;
      return Number(((ledger.realizedGain + ledger.unrealizedGain) / base * 100).toFixed(2));
    });
    const block = investmentBlockById(asset.blockId);
    series.push({ label: investmentAssetLabel(asset), values, color: investmentThemeColor(block?.theme || "blue") });
  });
  return renderLineChart(series, { labels: dates, label: "Andamento investimenti", minZero: false, height: 210 });
}

function renderInvestmentAllocation() {
  const rows = investmentAllocationRows();
  if (!rows.length) return `<p class="hint">Nessuna posizione valorizzata.</p>`;
  return `
    <div class="investment-allocation-list">
      ${rows.map(row => `
        <div class="investment-allocation-row">
          <div>
            <strong>${escapeHtml(row.asset ? investmentAssetLabel(row.asset) : row.block.name)}</strong>
            <small>${row.asset ? `${escapeHtml(row.asset.category)} · ${escapeHtml(row.asset.broker)} · ` : ""}€ ${fmt(row.value, 2)} · ${fmt(row.pct, 1)}%</small>
          </div>
          <div class="investment-allocation-bar"><span style="width:${clamp(row.pct, 0, 100)}%; background:${investmentThemeColor(row.block.theme)}"></span></div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderInvestmentPositions() {
  const assets = [...investmentAssets()]
    .filter(asset => investmentLedgerForAsset(asset.id).quantity > 0)
    .sort((a, b) => investmentAssetLabel(a).localeCompare(investmentAssetLabel(b), "it", { sensitivity: "base" }));
  if (!assets.length) return `<p class="hint">Nessuno strumento registrato.</p>`;
	  return `
	    <div class="investment-positions">
	      ${assets.map(asset => {
	        const ledger = investmentLedgerForAsset(asset.id);
	        const block = investmentBlockById(asset.blockId);
	        const latestSnapshot = latestInvestmentSnapshotForAsset(asset);
	        const snapshotInvested = number(latestSnapshot?.numberValue, 0);
	        const displayGain = ledger.unrealizedGain;
	        return `
	          <article class="investment-position-card">
	            <div class="section-head">
	              <div>
	                <h3>${escapeHtml(investmentAssetLabel(asset))}</h3>
	                <p class="hint">${escapeHtml(asset.category || "Altro")} · ${escapeHtml(asset.broker || "Altro")}${block ? ` · ${escapeHtml(block.name)}` : ""}${asset.currentPriceDate ? ` · prezzo ${asset.currentPriceDate}` : ""}</p>
	              </div>
	              <div class="row-actions">
	                <button class="chip" data-sell-all-investment-asset="${asset.id}">Vendi tutto</button>
	                <button class="chip" data-edit-investment-asset="${asset.id}">Modifica</button>
	                <button class="danger" data-delete-investment-asset="${asset.id}">Elimina</button>
	              </div>
            </div>
            <div class="grid two investment-mini-metrics">
              <div><span>Quantità</span><strong>${fmt(ledger.quantity, 4)}</strong></div>
              <div><span>Costo medio</span><strong>€ ${fmt(ledger.avgCost, 4)}</strong></div>
              <div><span>Valore aperto</span><strong>€ ${fmt(ledger.marketValue, 2)}</strong></div>
              <div class="${investmentProfitClass(displayGain)}"><span>Guadagno</span><strong>${displayGain >= 0 ? "+" : ""}€ ${fmt(displayGain, 2)}</strong></div>
            </div>
            <div class="investment-price-row">
              <div class="field">
                <label>Prezzo attuale</label>
                <input inputmode="decimal" data-investment-asset-price="${asset.id}" value="${asset.currentPrice || ""}">
              </div>
              <div class="field">
                <label>Data</label>
                <input type="date" data-investment-asset-price-date="${asset.id}" value="${asset.currentPriceDate || todayISO()}">
              </div>
              <button class="secondary" data-save-investment-asset-price="${asset.id}">Salva prezzo</button>
            </div>
	            <small class="hint">Realizzato € ${fmt(ledger.realizedGain, 2)} · aperto € ${fmt(ledger.unrealizedGain, 2)} · costo residuo € ${fmt(ledger.costBasis, 2)}${snapshotInvested ? ` · capitale snapshot € ${fmt(snapshotInvested, 2)}` : ""}</small>
	          </article>
	        `;
	      }).join("")}
    </div>
  `;
}

function renderInvestmentTradeLog() {
  const trades = [...investmentTrades()].sort((a, b) => b.date.localeCompare(a.date) || String(b.createdAt).localeCompare(String(a.createdAt)));
  if (!trades.length) return `<p class="hint">Nessun acquisto o vendita registrato.</p>`;
  return `
    <div class="investment-log">
      ${trades.slice(0, 80).map(trade => {
	        const asset = investmentAssetById(trade.assetId);
	        const isSell = trade.side === "sell";
	        const realizedGain = investmentRealizedGainForTrade(trade);
	        return `
	          <article class="history-item investment-log-item">
	            <div>
	              <strong>${trade.date} · ${isSell ? "Vendita" : "Acquisto"} · ${escapeHtml(investmentAssetLabel(asset))}</strong>
	              <small>${fmt(trade.quantity, 4)} x € ${fmt(trade.price, 4)} · controvalore € ${fmt(trade.amount, 2)}${realizedGain === null ? "" : ` · utile realizzato ${realizedGain >= 0 ? "+" : ""}€ ${fmt(realizedGain, 2)}`}</small>
	              ${trade.note ? `<p>${escapeHtml(trade.note)}</p>` : ""}
	            </div>
            <div class="row-actions">
              <button class="chip" data-edit-investment-trade="${trade.id}">Modifica</button>
              <button class="danger" data-delete-investment-trade="${trade.id}">Elimina</button>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderInvestmentBlocks() {
  return `<div class="investment-blocks">${state.investments.blocks.map(renderInvestmentBlockCard).join("")}</div>`;
}

function renderInvestmentBlockCard(block) {
  const latest = latestInvestmentEntry(block.id);
  const entries = investmentEntriesForBlock(block.id);
  const invested = number(latest?.numberValue, 0);
  const current = number(latest?.currentValue, 0);
  const cash = number(latest?.cashValue, 0);
  const price = number(latest?.currentPrice || latest?.purchasePrice, 0);
  const profit = current - invested;
  const pct = invested > 0 ? (profit / invested) * 100 : 0;
  const ath = latest?.ath || investmentLastAth(block.id);
  const drawdown = ath > 0 && price > 0 ? ((price - ath) / ath) * 100 : 0;
  return `
    <article class="investment-block-card" style="--block-color:${investmentThemeColor(block.theme)}">
      <div class="section-head">
        <div>
          <h3>${escapeHtml(block.title)}: ${escapeHtml(block.name)}</h3>
          <p class="hint">${escapeHtml(block.description || "Nessuna descrizione")}</p>
        </div>
        <button class="danger" data-delete-investment-block="${block.id}">Elimina</button>
      </div>
      <div class="grid two investment-mini-metrics">
        <div><span>Investito</span><strong>€ ${fmt(invested, 2)}</strong></div>
        <div><span>Mercato</span><strong>€ ${fmt(current, 2)}</strong></div>
        <div><span>Cash</span><strong>€ ${fmt(cash, 2)}</strong></div>
        <div class="${investmentProfitClass(profit)}"><span>Profitto</span><strong>${profit >= 0 ? "+" : ""}€ ${fmt(profit, 2)}</strong></div>
        <div><span>Prezzo</span><strong>€ ${fmt(price, 2)}</strong></div>
        <div class="${drawdown < -0.1 ? "negative" : "positive"}"><span>Dal top</span><strong>${ath ? `${fmt(drawdown, 2)}%` : "n/d"}</strong></div>
      </div>
      <details class="investment-strategy">
        <summary>Strategia e drawdown</summary>
        <textarea rows="7" data-investment-strategy="${block.id}">${escapeHtml(block.strategy || "")}</textarea>
        <button class="secondary" data-save-investment-strategy="${block.id}">Salva strategia</button>
      </details>
      <small class="hint">${entries.length} movimenti registrati · rendimento lordo ${fmt(pct, 2)}%</small>
    </article>
  `;
}

function renderInvestmentLog() {
  const entries = [...investmentEntries()].sort((a, b) => b.date.localeCompare(a.date) || number(b.createdAt) - number(a.createdAt));
  if (!entries.length) return `<p class="hint">Nessun movimento registrato.</p>`;
  return `
    <div class="investment-log">
      ${entries.slice(0, 40).map(entry => {
        const block = investmentBlockById(entry.genericOption);
        const isUpdate = entry.transactionType === "update";
        return `
          <article class="history-item investment-log-item">
            <div>
              <strong>${entry.date} · ${escapeHtml(block?.name || entry.characteristic || "Blocco rimosso")}</strong>
              <small>${isUpdate ? "Aggiornamento" : "Acquisto"} · investito € ${fmt(entry.numberValue, 2)} · valore € ${fmt(entry.currentValue, 2)}${entry.currentPrice ? ` · prezzo € ${fmt(entry.currentPrice, 2)}` : ""}</small>
              ${entry.textValue ? `<p>${escapeHtml(entry.textValue)}</p>` : ""}
            </div>
            <div class="row-actions">
              <button class="chip" data-edit-investment-entry="${entry.id}">Modifica</button>
              <button class="danger" data-delete-investment-entry="${entry.id}">Elimina</button>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderInvestmentNotes() {
  const notes = [...(state.investments?.notes || [])].sort((a, b) => b.date.localeCompare(a.date) || number(b.createdAt) - number(a.createdAt));
  if (!notes.length) return `<p class="hint">Nessuna nota investimento.</p>`;
  return notes.slice(0, 20).map(note => {
    const block = investmentBlockById(note.blockId);
    if (editingInvestmentNoteId === note.id) {
      return `
        <article class="diary-entry" data-investment-note-card="${note.id}">
          <div class="form-grid">
            <div class="field">
              <label>Data</label>
              <input type="date" data-investment-note-field="date" value="${note.date}">
            </div>
            <div class="field">
              <label>Testo</label>
              <textarea rows="5" data-investment-note-field="text">${escapeHtml(note.text)}</textarea>
            </div>
            <div class="row-actions">
              <button class="secondary" data-cancel-investment-note="${note.id}">Annulla</button>
              <button class="primary" data-save-investment-note-edit="${note.id}">Salva nota</button>
            </div>
          </div>
        </article>
      `;
    }
    return `
      <article class="diary-entry">
        <small>${note.date} · ${escapeHtml(block?.name || "Generale")}</small>
        <p>${escapeHtml(note.text)}</p>
        <div class="row-actions">
          <button class="chip" data-edit-investment-note="${note.id}">Modifica</button>
          <button class="danger" data-delete-investment-note="${note.id}">Elimina</button>
        </div>
      </article>
    `;
  }).join("");
}

function investmentLastAth(blockId) {
  const prices = investmentEntriesForBlock(blockId)
    .flatMap(entry => [number(entry.ath, 0), number(entry.currentPrice, 0), number(entry.purchasePrice, 0)])
    .filter(value => value > 0);
  return prices.length ? Math.max(...prices) : 0;
}

function renderLinks() {
  const panel = document.getElementById("screen-links");
  if (!panel) return;
  const links = (state.links || []).map(normalizeLink).filter(link => link.url);
  panel.innerHTML = `
    <div class="panel">
      <div class="section-head">
        <div>
          <h2>Link</h2>
        </div>
      </div>
      <div class="form-grid cols">
        <div class="field">
          <label for="linkTitle">Nome</label>
          <input id="linkTitle" placeholder="Es. Portale universita">
        </div>
        <div class="field">
          <label for="linkUrl">Indirizzo web</label>
          <input id="linkUrl" type="url" inputmode="url" autocomplete="url" placeholder="https://...">
        </div>
        <div class="field">
          <label>&nbsp;</label>
          <button class="primary" id="addLink">Aggiungi link</button>
        </div>
      </div>
    </div>
    <div class="link-grid">
      ${links.length ? links.map(renderLinkCard).join("") : `<p class="hint">Nessun link salvato.</p>`}
    </div>
  `;
}

function renderLinkCard(link) {
  return `
    <article class="link-card">
      <button class="link-open" data-open-link="${escapeHtml(link.id)}">
        <span aria-hidden="true">↗</span>
        <strong>${escapeHtml(link.title)}</strong>
        <small>${escapeHtml(link.url)}</small>
      </button>
      <button class="danger" data-delete-link="${escapeHtml(link.id)}">Elimina</button>
    </article>
  `;
}

function addLinkFromForm() {
  const titleInput = document.getElementById("linkTitle");
  const urlInput = document.getElementById("linkUrl");
  const link = normalizeLink({
    title: titleInput?.value,
    url: urlInput?.value,
    createdAt: new Date().toISOString(),
  });
  if (!link.url) {
    toast("Indirizzo link non valido");
    return;
  }
  state.links = [...(state.links || []), link];
  saveState();
  renderLinks();
  renderHome();
  toast("Link aggiunto");
  requestAnimationFrame(() => document.getElementById("linkUrl")?.focus());
}

function openSavedLink(linkId) {
  const link = (state.links || []).map(normalizeLink).find(item => item.id === linkId);
  if (!link?.url) {
    toast("Link non valido");
    return;
  }
  const opened = window.open(link.url, "_blank");
  if (opened) {
    try {
      opened.opener = null;
    } catch {}
  } else {
    window.location.href = link.url;
  }
}

function renderDashboard() {
  const totals = nutritionTotals();
  const range = currentKcalRange();
  const proteinMid = (state.settings.proteinMin + state.settings.proteinMax) / 2;
  const workouts = [...state.workouts].sort((a, b) => b.date.localeCompare(a.date));
  const lastWorkout = workouts[0];
  const deficit = Math.round(((range.min + range.max) / 2) - totals.kcal);
  document.getElementById("screen-dashboard").innerHTML = `
    <div class="dashboard-layout">
      <div>
	        <div class="panel">
	          <div class="segmented" data-action="day-type">
	            <button class="${state.settings.dayType === "training" ? "active" : ""}" data-value="training">Allenamento</button>
	            <button class="${state.settings.dayType === "off" ? "active" : ""}" data-value="off">Giorno off</button>
	          </div>
	          <p class="hint manual-note">Il tipo giornata resta in memoria finche premi Salva.</p>
	          <button class="primary" id="saveDashboard">Salva giornata</button>
	        </div>
        <div class="grid two">
          ${metric("Calorie", `${fmt(totals.kcal)} kcal`, `${range.min}-${range.max} kcal`, totals.kcal / range.max)}
          ${metric("Proteine", `${fmt(totals.protein)} g`, `${state.settings.proteinMin}-${state.settings.proteinMax} g`, totals.protein / proteinMid)}
          ${metric("Carboidrati", `${fmt(totals.carbs)} g`, `${state.settings.carbsTarget} g target`, totals.carbs / state.settings.carbsTarget)}
          ${metric("Grassi", `${fmt(totals.fat)} g`, `${state.settings.fatTarget} g target`, totals.fat / state.settings.fatTarget)}
          ${metric("Deficit stimato", `${deficit > 0 ? fmt(deficit) : "0"} kcal`, deficit >= 0 ? "restanti oggi" : `${fmt(Math.abs(deficit))} kcal oltre`, deficit >= 0 ? 0.35 : 1, deficit < 0)}
        </div>
      </div>
      <div>
        <div class="panel">
          <h2>Prossime azioni</h2>
          <div class="chips">
            <button class="chip" data-jump="workout">Registra workout</button>
	          <button class="chip" data-jump="nutrition">Salva pasto</button>
            <button class="chip" data-jump="foods">Tabella alimenti</button>
            <button class="chip" data-jump="diary">Scrivi diario</button>
            <button class="chip" data-jump="charts">Grafici</button>
          </div>
        </div>
        <div class="panel">
          <h2>Ultimo workout</h2>
          ${lastWorkout ? `<p><strong>${prettyDate(lastWorkout.date)}</strong></p>${miniWorkout(lastWorkout)}` : `<p class="hint">Nessun workout registrato.</p>`}
        </div>
      </div>
    </div>
  `;
}

function metric(label, value, hint, ratio, warn = false) {
  return `
    <article class="metric">
      <span class="label">${label}</span>
      <strong>${value}</strong>
      <small>${hint}</small>
      <div class="bar ${warn ? "warn" : ""}"><span style="width:${clamp(ratio * 100, 0, 100)}%"></span></div>
    </article>
  `;
}

function miniWorkout(workout) {
  return workout.exercises.slice(0, 4).map(ex => {
    const text = ex.sets.map(set => `${fmt(set.kg)}kg x ${fmt(set.reps)}`).join(" · ");
    return `<div class="history-item"><strong>${ex.name}</strong><br><small>${text}</small></div>`;
  }).join("");
}

function renderWorkout() {
  const selectedExercise = draftWorkout.exercises[0]?.id;
  document.getElementById("screen-workout").innerHTML = `
    <div class="wide-layout">
      <div>
        <div class="panel">
          <div class="form-grid cols">
            <div class="field">
              <label for="workoutDate">Data workout</label>
              <input id="workoutDate" type="date" value="${draftWorkout.date}">
	            </div>
	            <div class="field">
	              <label>&nbsp;</label>
	              <button class="primary" id="saveWorkout">Salva workout</button>
	            </div>
	          </div>
	          <p class="hint manual-note">Serie, pesi, ripetizioni e note esercizio vengono scritti nello storico solo quando premi Salva workout.</p>
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
        <div id="exerciseList">
          ${draftWorkout.exercises.map(renderExerciseCard).join("")}
        </div>
      </div>
      <div>
        <div class="panel">
          <h2>Andamento</h2>
          <div class="field">
            <label for="chartExercise">Esercizio</label>
            <select id="chartExercise">${state.workoutTemplate.map(ex => `<option value="${ex.id}" ${ex.id === selectedExercise ? "selected" : ""}>${ex.name}</option>`).join("")}</select>
          </div>
          <div class="chart" id="workoutChart">${renderWorkoutChart(selectedExercise)}</div>
        </div>
        <div class="panel">
          <h2>Log workout salvati</h2>
          <div id="workoutHistory">${renderWorkoutHistory()}</div>
        </div>
      </div>
    </div>
  `;
}

function renderExerciseCard(exercise) {
  return `
    <article class="exercise-card" data-exercise-id="${exercise.id}">
      <div class="exercise-head">
        <div>
          <h3>${exercise.name}</h3>
          <small>${exercise.note}</small>
        </div>
        <div class="exercise-actions">
          <div class="volume-pill" data-volume-for="${exercise.id}">
            <span>Volume attuale</span>
            <strong>${exerciseVolumeLabel(exercise)}</strong>
          </div>
          <button class="secondary" data-add-set="${exercise.id}">+ serie</button>
        </div>
      </div>
      <div class="sets">
        ${exercise.sets.map((set, index) => `
          <div class="set-row" data-set-index="${index}">
            <span>${index + 1}</span>
            <input inputmode="decimal" aria-label="Kg ${exercise.name} serie ${index + 1}" data-field="kg" value="${set.kg}">
            <input inputmode="numeric" aria-label="Ripetizioni ${exercise.name} serie ${index + 1}" data-field="reps" value="${set.reps}">
            <button aria-label="Elimina serie" data-remove-set="${exercise.id}:${index}">×</button>
          </div>
        `).join("")}
      </div>
      <div class="field exercise-note">
        <label>Note esercizio</label>
        <textarea rows="3" data-exercise-note="${exercise.id}" placeholder="Sensazioni, tecnica, dolore, RIR, variante...">${escapeHtml(exercise.userNote || "")}</textarea>
      </div>
    </article>
  `;
}

function renderWorkoutChart(exerciseId) {
  const points = [...state.workouts]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(workout => ({ date: workout.date, value: workoutVolume(workout, exerciseId), workout }))
    .filter(point => point.value > 0)
    .slice(-8);
  if (!points.length) return `<p class="hint">Salva almeno un workout per vedere il grafico.</p>`;
  const max = Math.max(...points.map(point => point.value), 1);
  const width = 320;
  const height = 170;
  const left = 34;
  const bottom = 136;
  const step = points.length > 1 ? (width - left - 14) / (points.length - 1) : 0;
  const coords = points.map((point, index) => ({
    ...point,
    x: left + step * index,
    y: bottom - (point.value / max) * 108,
  }));
  const segments = coords.slice(1).map((point, index) => {
    const previous = coords[index];
    const color = segmentColor(previous.value, point.value);
    return `<line x1="${previous.x.toFixed(1)}" y1="${previous.y.toFixed(1)}" x2="${point.x.toFixed(1)}" y2="${point.y.toFixed(1)}" stroke="${color}" stroke-width="3" stroke-linecap="round"><title>${point.date}: ${segmentLabel(previous.value, point.value)}</title></line>`;
  }).join("");
  const markers = coords.map((point, index) => {
    if (index === 0 || !hasLoadIncrease(point.workout, coords[index - 1].workout, exerciseId)) return "";
    return `<text class="load-marker" x="${point.x - 4}" y="${Math.max(14, point.y - 10).toFixed(1)}">!</text>`;
  }).join("");
  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Grafico andamento workout">
      <line x1="${left}" y1="20" x2="${left}" y2="${bottom}" stroke="#d8d6cf"/>
      <line x1="${left}" y1="${bottom}" x2="${width - 8}" y2="${bottom}" stroke="#d8d6cf"/>
      ${segments}
      ${coords.map(point => `<circle cx="${point.x}" cy="${point.y}" r="4" fill="#101820"><title>${point.date}: ${fmt(point.value)}</title></circle>`).join("")}
      ${markers}
      ${coords.map(point => `<text x="${point.x - 18}" y="158">${point.date.slice(5)}</text>`).join("")}
      <text x="0" y="24">${fmt(max)}</text>
      <text x="0" y="${bottom}">0</text>
    </svg>
    <div class="chart-legend">
      <span class="legend-item"><span class="legend-dot" style="background:#3e8f75"></span>Migliora</span>
      <span class="legend-item"><span class="legend-dot" style="background:#e9c46a"></span>Stasi</span>
      <span class="legend-item"><span class="legend-dot" style="background:#e76f51"></span>Peggiora</span>
      <span class="legend-item"><strong>!</strong> carico aumentato</span>
    </div>
  `;
}

function hasLoadIncrease(currentWorkout, previousWorkout, exerciseId) {
  const current = currentWorkout?.exercises.find(ex => ex.id === exerciseId);
  const previous = previousWorkout?.exercises.find(ex => ex.id === exerciseId);
  if (!current || !previous) return false;
  const maxLength = Math.max(current.sets.length, previous.sets.length);
  for (let index = 0; index < maxLength; index += 1) {
    const currentKg = number(current.sets[index]?.kg, 0);
    const previousKg = number(previous.sets[index]?.kg, 0);
    if (currentKg > previousKg + 0.001) return true;
  }
  const currentMax = Math.max(...current.sets.map(set => number(set.kg, 0)), 0);
  const previousMax = Math.max(...previous.sets.map(set => number(set.kg, 0)), 0);
  return currentMax > previousMax + 0.001;
}

function renderLineChart(series, options = {}) {
  const visibleSeries = series.filter(item => item.values.some(value => number(value) !== 0));
  if (!visibleSeries.length) return `<p class="hint">Servono piu dati salvati per vedere il grafico.</p>`;
  const width = 340;
  const height = options.height || 190;
  const left = 34;
  const right = 12;
  const top = 18;
  const bottom = height - 34;
  const allValues = visibleSeries.flatMap(item => item.values);
  const max = Math.max(...allValues, 1);
  const min = options.minZero === false ? Math.min(...allValues) : 0;
  const range = max === min ? 1 : max - min;
  const count = Math.max(...visibleSeries.map(item => item.values.length), 1);
  const step = count > 1 ? (width - left - right) / (count - 1) : 0;
  const paths = visibleSeries.map(item => {
    const points = item.values.map((value, index) => {
      const x = left + step * index;
      const y = bottom - ((value - min) / range) * (bottom - top);
      return { x, y, value };
    });
    const coords = points.map((point, index) => {
      const { x, y } = point;
      return `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
    const color = item.color || trendColor(item.values);
    return `<path d="${coords}" fill="none" stroke="${color}" stroke-width="3"><title>${item.label}: ${trendLabel(item.values)}</title></path>${points.map(point => `<circle cx="${point.x}" cy="${point.y}" r="3.5" fill="${color}"></circle>`).join("")}`;
  }).join("");
  const labels = options.labels || [];
  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${options.label || "Grafico temporale"}">
      <line x1="${left}" y1="${top}" x2="${left}" y2="${bottom}" stroke="#d8d6cf"/>
      <line x1="${left}" y1="${bottom}" x2="${width - right}" y2="${bottom}" stroke="#d8d6cf"/>
      ${paths}
      <text x="0" y="${top + 4}">${fmt(max)}</text>
      <text x="0" y="${bottom}">${fmt(min)}</text>
      ${labels.map((label, index) => {
        if (index !== 0 && index !== labels.length - 1) return "";
        const x = left + step * index - 16;
        return `<text x="${x}" y="${height - 8}">${label.slice(5)}</text>`;
      }).join("")}
    </svg>
    <div class="chart-legend">
      ${visibleSeries.map(item => {
        const color = item.color || trendColor(item.values);
        return `<span class="legend-item"><span class="legend-dot" style="background:${color}"></span>${item.label} · ${trendLabel(item.values)}</span>`;
      }).join("")}
    </div>
  `;
}

function renderWorkoutHistory() {
  const workouts = [...state.workouts].sort((a, b) => b.date.localeCompare(a.date));
  if (!workouts.length) return `<p class="hint">Ancora vuoto.</p>`;
  return workouts.map(workout => `
    <div class="history-item">
      <strong>${prettyDate(workout.date)}</strong>
      <small>${workout.exercises.length} esercizi · volume totale ${fmt(workout.exercises.reduce((sum, exercise) => sum + exerciseVolume(exercise), 0))}</small>
      <div class="row-actions">
        <button class="chip" data-load-workout="${workout.date}">Apri</button>
        <button class="danger" data-delete-workout="${workout.date}">Elimina</button>
      </div>
    </div>
  `).join("");
}

function renderNutrition() {
  const totals = nutritionTotals();
  const range = currentKcalRange();
  const dayMeals = mealsForDate();
  document.getElementById("screen-nutrition").innerHTML = `
	    <div class="panel">
	      <h2>Dashboard nutrizionale</h2>
	      <div class="form-grid cols date-picker-row">
	        <div class="field">
	          <label for="nutritionDate">Data pasti</label>
	          <input id="nutritionDate" type="date" value="${selectedDate}">
	        </div>
	        <div class="field">
	          <label>&nbsp;</label>
	          <button class="secondary" data-load-meal-day="${todayISO()}">Oggi</button>
	        </div>
	      </div>
	      <div class="grid two">
	        ${metric("Calorie", `${fmt(totals.kcal)} kcal`, `${range.min}-${range.max} kcal`, totals.kcal / range.max)}
        ${metric("Proteine", `${fmt(totals.protein)} g`, `${state.settings.proteinMin}-${state.settings.proteinMax} g`, totals.protein / ((state.settings.proteinMin + state.settings.proteinMax) / 2))}
        ${metric("Carboidrati", `${fmt(totals.carbs)} g`, `${state.settings.carbsTarget} g target`, totals.carbs / state.settings.carbsTarget)}
        ${metric("Grassi", `${fmt(totals.fat)} g`, `${state.settings.fatTarget} g target`, totals.fat / state.settings.fatTarget)}
      </div>
    </div>
    <div class="panel">
      <h2>Aggiunta rapida</h2>
      <div class="chips">${state.quickAdds.map(combo => `<button class="chip" data-quick-add="${combo.id}">${combo.name}</button>`).join("")}</div>
      <p class="hint" style="margin:10px 0 0;">Le combo sono modificabili nel pannello Combo pasti.</p>
    </div>
	    <div class="panel">
	      <h2>Aggiungi alimento</h2>
	      <p class="hint">Il nuovo alimento verra salvato nel giorno selezionato: <strong>${prettyDate(selectedDate)}</strong>.</p>
	      <div class="form-grid cols">
        <div class="field">
          <label for="mealName">Pasto</label>
          <select id="mealName">
            ${["Colazione", "Pranzo", "Merenda", "Cena", "Extra"].map(meal => `<option>${meal}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="foodSelect">Alimento</label>
          <select id="foodSelect">${state.foods.map(food => `<option value="${food.id}">${food.name}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label for="foodQty">Quantità</label>
          <input id="foodQty" inputmode="decimal" value="100">
        </div>
        <div class="field">
          <label>&nbsp;</label>
	          <button class="primary" id="addFood">Salva alimento</button>
        </div>
      </div>
	    </div>
		    <div class="panel">
		      <div class="section-head">
		        <div>
		          <h2>Pasti del giorno</h2>
		          <p class="hint">${prettyDate(selectedDate)}${selectedDate !== todayISO() ? " · giorno passato" : ""}</p>
		        </div>
		        ${selectedDate !== todayISO() ? `<button class="secondary" data-load-meal-day="${todayISO()}">Torna a oggi</button>` : ""}
		      </div>
		      ${renderMealRows()}
		      ${dayMeals.length ? `<div class="row-actions save-row"><button class="primary" id="saveMeals">Salva pasti del giorno</button></div>` : ""}
		      <p class="hint manual-note">Le quantita modificate nei pasti vengono registrate solo con Salva pasti del giorno.</p>
		    </div>
	    <div class="panel">
	      <h2>Log pasti salvati</h2>
	      ${renderMealHistory()}
	    </div>
	    ${renderComboEditor()}
    <div class="panel">
      <h2>Grafici alimentari</h2>
      <div class="chips">
        ${nutritionToggle("kcal", "Calorie")}
        ${nutritionToggle("protein", "Proteine")}
        ${nutritionToggle("carbs", "Carboidrati")}
        ${nutritionToggle("fat", "Grassi")}
      </div>
      <div class="chart" id="nutritionTrendChart">${renderNutritionTrendChart()}</div>
    </div>
  `;
}

function nutritionToggle(key, label) {
  return `<button class="chip ${nutritionChartKeys.includes(key) ? "active" : ""}" data-nutrition-toggle="${key}">${label}</button>`;
}

function renderMealRows() {
  const rows = mealsForDate();
  if (!rows.length) return `<p class="hint">Nessun alimento registrato per questo giorno.</p>`;
  return rows.map(item => {
    const food = foodById(item.foodId);
    const calc = calcItem(item);
    return `
      <div class="food-row" data-meal-item="${item.id}">
        <div>
          <p>${food?.name || "Alimento rimosso"}</p>
          <small>${item.meal} · ${fmt(calc.kcal)} kcal · P ${fmt(calc.protein)} C ${fmt(calc.carbs)} F ${fmt(calc.fat)}</small>
        </div>
        <input inputmode="decimal" aria-label="Quantità ${food?.name || ""}" value="${item.qty}" data-meal-qty="${item.id}">
        <button aria-label="Rimuovi alimento" data-remove-meal="${item.id}">×</button>
      </div>
    `;
  }).join("");
}

function renderMealHistory() {
  const dates = Object.keys(state.mealsByDate || {})
    .filter(date => (state.mealsByDate[date] || []).length)
    .sort((a, b) => b.localeCompare(a));
  if (!dates.length) return `<p class="hint">Ancora nessun pasto salvato.</p>`;
  return dates.map(date => {
    const totals = nutritionTotalsReadOnly(date);
    const items = state.mealsByDate[date] || [];
    const meals = Array.from(new Set(items.map(item => item.meal))).join(", ");
    return `
      <div class="history-item ${date === selectedDate ? "active-history" : ""}">
        <strong>${prettyDate(date)}</strong>
        <small>${items.length} alimenti · ${meals || "pasti"} · ${fmt(totals.kcal)} kcal · P ${fmt(totals.protein)} C ${fmt(totals.carbs)} F ${fmt(totals.fat)}</small>
        <div class="row-actions">
          <button class="chip" data-load-meal-day="${date}">${date === selectedDate ? "Aperto" : "Apri"}</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderNutritionTrendChart() {
  const dates = trackedDates().filter(date => (state.mealsByDate[date] || []).length).slice(-14);
  const labels = {
    kcal: "Calorie",
    protein: "Proteine",
    carbs: "Carboidrati",
    fat: "Grassi",
  };
  const series = nutritionChartKeys.map(key => ({
    label: labels[key],
    values: dates.map(date => nutritionTotalsReadOnly(date)[key]),
  }));
  return renderLineChart(series, { labels: dates, label: "Andamento alimentare", minZero: true });
}

function renderComboEditor() {
  const selectedId = comboDraft.id;
  return `
    <div class="panel">
      <h2>Combo pasti</h2>
      <div class="form-grid">
        <div class="field">
          <label for="comboSelect">Combo salvata</label>
          <select id="comboSelect">
            ${state.quickAdds.map(combo => `<option value="${combo.id}" ${combo.id === selectedId ? "selected" : ""}>${combo.name}</option>`).join("")}
          </select>
        </div>
        <div class="row-actions">
          <button class="secondary" id="loadCombo">Carica</button>
          <button class="secondary" id="newCombo">Nuova</button>
          <button class="danger" id="deleteCombo">Elimina</button>
        </div>
        <div class="form-grid cols">
          <div class="field">
            <label for="comboName">Nome combo</label>
            <input id="comboName" value="${escapeHtml(comboDraft.name)}">
          </div>
          <div class="field">
            <label for="comboMeal">Pasto</label>
            <select id="comboMeal">
              ${["Colazione", "Pranzo", "Merenda", "Cena", "Extra"].map(meal => `<option ${meal === comboDraft.meal ? "selected" : ""}>${meal}</option>`).join("")}
            </select>
          </div>
        </div>
        <div>
          ${comboDraft.items.map((item, index) => `
            <div class="combo-row" data-combo-index="${index}">
              <select data-combo-food="${index}">${foodOptions(item.foodId)}</select>
              <input inputmode="decimal" aria-label="Quantità combo" data-combo-qty="${index}" value="${item.qty}">
              <button aria-label="Rimuovi alimento combo" data-remove-combo-item="${index}">×</button>
            </div>
          `).join("")}
        </div>
        <div class="row-actions">
          <button class="secondary" id="addComboItem">+ alimento</button>
	          <button class="primary" id="saveCombo">Salva combo</button>
          <button class="secondary" id="saveTodayAsCombo">Salva pasti di oggi come combo</button>
        </div>
      </div>
    </div>
  `;
}

function foodOptions(selectedFoodId = "") {
  return state.foods.map(food => `<option value="${food.id}" ${food.id === selectedFoodId ? "selected" : ""}>${food.name}</option>`).join("");
}

function renderFoods() {
  document.getElementById("screen-foods").innerHTML = `
    <div class="panel">
      <h2>Tabella alimenti</h2>
      <div class="form-grid cols">
        <div class="field">
          <label for="newFoodName">Nome</label>
          <input id="newFoodName" placeholder="Es. Yogurt greco">
        </div>
        <div class="field">
          <label for="newFoodUnit">Unità</label>
          <select id="newFoodUnit">
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="pz">pz</option>
          </select>
        </div>
        <div class="field">
          <label for="newFoodKcal">Kcal / 100</label>
          <input id="newFoodKcal" inputmode="decimal" value="0">
        </div>
        <div class="field">
          <label for="newFoodProtein">Proteine / 100</label>
          <input id="newFoodProtein" inputmode="decimal" value="0">
        </div>
        <div class="field">
          <label for="newFoodCarbs">Carboidrati / 100</label>
          <input id="newFoodCarbs" inputmode="decimal" value="0">
        </div>
        <div class="field">
          <label for="newFoodFat">Grassi / 100</label>
          <input id="newFoodFat" inputmode="decimal" value="0">
        </div>
      </div>
      <div class="row-actions" style="margin-top:10px;">
	        <button class="primary" id="addFoodToTable">Salva nuovo alimento</button>
      </div>
    </div>
	    <div class="panel">
	      <div class="table-wrap">
        <table>
          <thead><tr><th>Alimento</th><th>Unità</th><th>Kcal/100</th><th>Prot</th><th>Carbo</th><th>Grassi</th><th></th></tr></thead>
          <tbody>
            ${state.foods.map(food => `
              <tr data-food-row="${food.id}">
                <td><input data-food-field="name" value="${escapeHtml(food.name)}"></td>
                <td><input data-food-field="unit" value="${food.unit}"></td>
                <td><input data-food-field="kcal" value="${food.kcal}"></td>
                <td><input data-food-field="protein" value="${food.protein}"></td>
                <td><input data-food-field="carbs" value="${food.carbs}"></td>
                <td><input data-food-field="fat" value="${food.fat}"></td>
                <td><button class="danger" data-delete-food="${food.id}">Elimina</button></td>
              </tr>
            `).join("")}
          </tbody>
	        </table>
	      </div>
	      <div class="row-actions save-row">
	        <button class="primary" id="saveFoodsTable">Salva tabella alimenti</button>
	      </div>
	      <p class="hint manual-note">Le modifiche agli alimenti esistenti vengono registrate solo con Salva tabella alimenti.</p>
	    </div>
	  `;
}

function renderDiary() {
  const tags = Array.from(new Set(state.diary.flatMap(entry => entry.tags))).sort();
  const entries = state.diary
    .filter(entry => !diaryFilter || entry.tags.includes(diaryFilter))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  document.getElementById("screen-diary").innerHTML = `
    <div class="wide-layout">
        <div class="panel">
          <h2>Diario giornaliero</h2>
          <div class="form-grid">
            <div class="field">
              <label for="diaryText">Nota</label>
              <textarea id="diaryText" rows="8" placeholder="Allenamento buono, fame gestibile, #energia alta"></textarea>
            </div>
	          <button class="primary" id="saveDiary">Salva nota</button>
        </div>
      </div>
      <div>
        <div class="panel">
          <h2>Tag</h2>
          <div class="chips">
            <button class="chip ${diaryFilter === "" ? "active" : ""}" data-tag-filter="">Tutti</button>
            ${tags.map(tag => `<button class="chip ${diaryFilter === tag ? "active" : ""}" data-tag-filter="${tag}">${tag}</button>`).join("")}
          </div>
        </div>
        <div class="panel">
	          <h2>Storico diario</h2>
	          ${entries.length ? entries.map(entry => `
	            <article class="diary-entry">
	              <small>${prettyDate(entry.date)} · ${entry.tags.join(" ") || "senza tag"}</small>
	              <textarea rows="4" data-edit-diary="${entry.id}" aria-label="Modifica nota diario">${escapeHtml(entry.text)}</textarea>
	              <div class="row-actions">
	                <button class="primary" data-save-diary-edit="${entry.id}">Salva nota</button>
	                <button class="danger" data-delete-diary="${entry.id}">Elimina</button>
	              </div>
	            </article>
	          `).join("") : `<p class="hint">Nessuna nota trovata.</p>`}
        </div>
      </div>
    </div>
  `;
}

function renderRelationships() {
  const relationships = sortedRelationships();
  const selectedRelationship = relationships.find(person => person.id === selectedRelationshipId);
  if (selectedRelationshipId && !selectedRelationship) selectedRelationshipId = "";
  document.getElementById("screen-relationships").innerHTML = `
    <div class="wide-layout">
      <div>
        <div class="panel">
          <h2>Relazioni & Promemoria</h2>
          <p class="hint">Tieni traccia delle persone importanti, delle ricorrenze e della frequenza con cui vuoi sentirle.</p>
          <div class="row-actions">
            <button class="secondary" id="enableRelationshipNotifications">Attiva notifiche</button>
          </div>
        </div>
        <div class="panel">
          <h2>Nuovo contatto</h2>
          <div class="form-grid cols">
            <div class="field">
              <label for="newRelationshipName">Nome</label>
              <input id="newRelationshipName" placeholder="Nome persona">
            </div>
            <div class="field">
              <label for="newRelationshipBirthday">Compleanno</label>
              <input id="newRelationshipBirthday" type="date">
            </div>
            <div class="field">
              <label for="newRelationshipFrequency">Frequenza contatto giorni</label>
              <input id="newRelationshipFrequency" inputmode="numeric" value="30">
            </div>
            <div class="field">
              <label for="newRelationshipReminderDays">Avviso giorni prima</label>
              <input id="newRelationshipReminderDays" inputmode="numeric" value="7">
            </div>
            <div class="field">
              <label for="newRelationshipLastContact">Ultimo contatto</label>
              <input id="newRelationshipLastContact" type="date">
            </div>
          </div>
          <div class="field stacked-field">
            <label for="newRelationshipRecurrences">Altre ricorrenze</label>
            <textarea id="newRelationshipRecurrences" rows="3" placeholder="05-28 - anniversario&#10;2026-07-10 - evento speciale"></textarea>
          </div>
          <div class="field stacked-field">
            <label for="newRelationshipNotes">Note</label>
            <textarea id="newRelationshipNotes" rows="4" placeholder="Sta preparando un esame, ha cambiato lavoro..."></textarea>
          </div>
          <div class="row-actions save-row">
            <button class="primary" id="saveNewRelationship">Salva contatto</button>
          </div>
        </div>
      </div>
      <div>
        <div class="panel">
          <h2>Promemoria attivi</h2>
          ${renderRelationshipReminders()}
        </div>
	        <div class="panel">
	          <h2>Persone da coltivare</h2>
	          ${renderRelationshipList(relationships)}
	        </div>
	        <div class="panel">
	          <h2>Scheda contatto</h2>
	          ${selectedRelationship ? renderRelationshipCard(selectedRelationship) : `<p class="hint">Seleziona una persona dalla lista per aprire la sua sezione.</p>`}
	        </div>
	      </div>
	    </div>
	  `;
}

function sortedRelationships() {
  return [...(state.relationships || [])].sort((a, b) => {
    const aName = (a.name || "Contatto senza nome").trim();
    const bName = (b.name || "Contatto senza nome").trim();
    return aName.localeCompare(bName, "it", { sensitivity: "base" });
  });
}

function renderRelationshipList(relationships) {
  if (!relationships.length) return `<p class="hint">Nessun contatto salvato.</p>`;
  return `<div class="relationship-list">${relationships.map(person => {
    const reminders = relationshipReminderItems(person);
    const isActive = person.id === selectedRelationshipId;
    return `
      <button class="relationship-list-item ${isActive ? "active" : ""}" data-open-relationship="${person.id}">
        <span>
          <strong>${escapeHtml(person.name || "Contatto senza nome")}</strong>
          <small>${person.lastContactDate ? `Ultimo contatto: ${prettyDate(person.lastContactDate)}` : "Ultimo contatto non indicato"}</small>
        </span>
        ${reminders.length ? `<em>${reminders.length}</em>` : ""}
      </button>
    `;
  }).join("")}</div>`;
}

function renderRelationshipReminders() {
  const reminders = allRelationshipReminders();
  if (!reminders.length) return `<p class="hint">Nessun promemoria urgente in questo momento.</p>`;
  return `<div class="reminder-list">${reminders.map(item => `
    <article class="reminder-card ${item.type === "contact" ? "attention" : ""}">
      <strong>${item.message}</strong>
      ${notesPreview(item.person.notes) ? `<small>Ultime note: ${escapeHtml(notesPreview(item.person.notes))}</small>` : `<small>Nessuna nota recente.</small>`}
    </article>
  `).join("")}</div>`;
}

function renderRelationshipCard(person) {
  const reminders = relationshipReminderItems(person);
  return `
    <article class="relationship-card" data-relationship-id="${person.id}">
      <div class="exercise-head">
        <div>
          <h3>${escapeHtml(person.name || "Contatto senza nome")}</h3>
          <small>${person.lastContactDate ? `Ultimo contatto: ${prettyDate(person.lastContactDate)}` : "Ultimo contatto non indicato"}</small>
        </div>
        ${reminders.length ? `<span class="reminder-badge">${reminders.length} promemoria</span>` : ""}
      </div>
      <div class="form-grid cols">
        <div class="field">
          <label>Nome</label>
          <input data-relationship-field="name" value="${escapeHtml(person.name)}">
        </div>
        <div class="field">
          <label>Compleanno</label>
          <input data-relationship-field="birthday" type="date" value="${person.birthday}">
        </div>
        <div class="field">
          <label>Frequenza contatto giorni</label>
          <input data-relationship-field="contactFrequencyDays" inputmode="numeric" value="${person.contactFrequencyDays}">
        </div>
        <div class="field">
          <label>Avviso giorni prima</label>
          <input data-relationship-field="reminderDaysBefore" inputmode="numeric" value="${person.reminderDaysBefore}">
        </div>
        <div class="field">
          <label>Ultimo contatto</label>
          <input data-relationship-field="lastContactDate" type="date" value="${person.lastContactDate}">
        </div>
      </div>
      <div class="field stacked-field">
        <label>Altre ricorrenze</label>
        <textarea data-relationship-field="recurrences" rows="3">${escapeHtml(person.recurrences)}</textarea>
      </div>
      <div class="field stacked-field">
        <label>Note</label>
        <textarea data-relationship-field="notes" rows="4">${escapeHtml(person.notes)}</textarea>
      </div>
      <div class="row-actions">
        <button class="primary" data-save-relationship="${person.id}">Salva</button>
        <button class="secondary" data-contact-today="${person.id}">Ho scritto oggi</button>
        <button class="danger" data-delete-relationship="${person.id}">Elimina</button>
      </div>
    </article>
  `;
}

function renderData() {
  const bodyMetric = bodyMetricForDate(bodyMetricDate) || { date: bodyMetricDate, weight: "", waist: "", energy: "", note: "" };
  document.getElementById("screen-data").innerHTML = `
    <div class="wide-layout">
      <div>
        <div class="panel">
          <h2>Obiettivi</h2>
	          <div class="form-grid cols">
	            ${settingInput("kcalTrainingMin", "Kcal training min")}
            ${settingInput("kcalTrainingMax", "Kcal training max")}
            ${settingInput("kcalOffMin", "Kcal off min")}
            ${settingInput("kcalOffMax", "Kcal off max")}
            ${settingInput("proteinMin", "Proteine min g")}
            ${settingInput("proteinMax", "Proteine max g")}
            ${settingInput("carbsTarget", "Carboidrati target g")}
            ${settingInput("fatTarget", "Grassi target g")}
            ${settingInput("waterNormal", "Acqua giorni normali L")}
	            ${settingInput("waterTraining", "Acqua allenamento L")}
	          </div>
	          <div class="row-actions save-row">
	            <button class="primary" id="saveSettings">Salva obiettivi</button>
	          </div>
	        </div>
        <div class="panel">
          <h2>Parametri corporei</h2>
          <div class="form-grid cols">
            <div class="field">
              <label for="bodyDate">Data</label>
              <input id="bodyDate" type="date" value="${bodyMetric.date || selectedDate}">
            </div>
            <div class="field">
              <label for="bodyWeight">Peso kg</label>
              <input id="bodyWeight" data-body-field="weight" inputmode="decimal" value="${bodyMetric.weight || ""}">
            </div>
            <div class="field">
              <label for="bodyWaist">Vita cm</label>
              <input id="bodyWaist" data-body-field="waist" inputmode="decimal" value="${bodyMetric.waist || ""}">
            </div>
            <div class="field">
              <label for="bodyEnergy">Energia 1-10</label>
              <input id="bodyEnergy" data-body-field="energy" inputmode="decimal" value="${bodyMetric.energy || ""}">
            </div>
          </div>
	          <div class="field" style="margin-top:10px;">
	            <label for="bodyNote">Nota parametri</label>
	            <textarea id="bodyNote" data-body-field="note" rows="3">${escapeHtml(bodyMetric.note || "")}</textarea>
	          </div>
	          <div class="row-actions save-row">
	            <button class="primary" id="saveBodyMetric">Salva parametri</button>
	          </div>
	        </div>
      </div>
      <div>
        <div class="panel">
          <h2>Backup</h2>
          ${renderSupabasePanel()}
          <h2>Backup manuale</h2>
          <p class="hint">Supabase e il sistema principale. Il backup JSON resta una copia di sicurezza manuale per esportare, ripristinare o far analizzare i dati a una AI.</p>
          <div class="row-actions">
            <button class="primary" id="exportBackup">Esporta backup</button>
            <button class="secondary" id="exportReport">Esporta report AI</button>
            <label class="secondary" for="importBackup" style="display:inline-grid;place-items:center;min-height:40px;padding:10px 12px;border-radius:8px;font-weight:800;cursor:pointer;">Importa backup</label>
            <input id="importBackup" type="file" accept="application/json,.json" hidden>
          </div>
        </div>
        <div class="panel">
          <h2>Base dati</h2>
	          <p><strong>Schema:</strong> v${state.schemaVersion}</p>
	          <p><strong>Todo attive:</strong> ${activeTodos().length}</p>
	          <p><strong>Workout:</strong> ${state.workouts.length}</p>
	          <p><strong>Note diario:</strong> ${state.diary.length}</p>
	          <p><strong>Relazioni:</strong> ${(state.relationships || []).length}</p>
	          <p><strong>Link:</strong> ${(state.links || []).length}</p>
	          <p><strong>Blocchi investimento:</strong> ${(state.investments?.blocks || []).length}</p>
	          <p><strong>Movimenti investimento:</strong> ${(state.investments?.entries || []).length}</p>
	          <p><strong>Alimenti:</strong> ${state.foods.length}</p>
	          <p><strong>Combo pasti:</strong> ${state.quickAdds.length}</p>
        </div>
      </div>
    </div>
  `;
}

function workoutTotalVolume(workout) {
  return workout.exercises.reduce((sum, exercise) => sum + exerciseVolume(exercise), 0);
}

function workoutVolumeByDate(date) {
  const workout = findWorkoutForDate(date);
  return workout ? workoutTotalVolume(workout) : 0;
}

function renderCharts() {
  document.getElementById("screen-charts").innerHTML = `
    <div class="panel">
      <h2>Alimentazione</h2>
      <div class="chart">${renderNutritionTrendChart()}</div>
    </div>
    <div class="panel">
      <h2>Workout</h2>
      <div class="chart">${renderWorkoutGlobalChart()}</div>
    </div>
    <div class="panel">
      <h2>Investimenti</h2>
      <div class="chart">${renderInvestmentPerformanceChart()}</div>
    </div>
    <div class="panel">
      <h2>Confronto normalizzato</h2>
      <p class="hint">Ogni parametro viene scalato 0-100 per confrontare trend diversi nello stesso grafico.</p>
      <div class="chart">${renderNormalizedGlobalChart()}</div>
    </div>
  `;
}

function renderWorkoutGlobalChart() {
  const dates = trackedDates().filter(date => workoutVolumeByDate(date) > 0).slice(-14);
  const series = [{
    label: "Volume workout",
    values: dates.map(date => workoutVolumeByDate(date)),
  }];
  return renderLineChart(series, { labels: dates, label: "Volume workout", minZero: true });
}

function renderNormalizedGlobalChart() {
  const dates = trackedDates().slice(-21);
  if (dates.length < 2) return `<p class="hint">Servono almeno due giorni di dati per confrontare i trend.</p>`;
  const rawSeries = [
    { label: "Calorie", values: dates.map(date => nutritionTotalsReadOnly(date).kcal) },
    { label: "Proteine", values: dates.map(date => nutritionTotalsReadOnly(date).protein) },
    { label: "Workout", values: dates.map(date => workoutVolumeByDate(date)) },
    { label: "Investimenti", values: dates.map(date => investmentDashboardTotalsAt(date).yieldPct) },
    { label: "Peso", values: dates.map(date => bodyMetricForDate(date)?.weight || 0) },
    { label: "Energia", values: dates.map(date => bodyMetricForDate(date)?.energy || 0) },
  ].filter(item => item.values.some(value => value > 0));
  const normalized = rawSeries.map(item => ({
    label: item.label,
    values: normalizeValues(item.values),
    color: trendColor(item.values),
  }));
  return renderLineChart(normalized, { labels: dates, label: "Parametri normalizzati", minZero: true });
}

function settingInput(key, label) {
  return `
    <div class="field">
      <label for="setting-${key}">${label}</label>
      <input id="setting-${key}" data-setting="${key}" inputmode="decimal" value="${state.settings[key]}">
    </div>
  `;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugify(text) {
  const base = String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `alimento-${uid()}`;
}

function switchScreen(name, options = {}) {
  currentScreen = name || "home";
  document.querySelectorAll("[data-screen-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.screenPanel === currentScreen));
  document.querySelectorAll("[data-screen]").forEach(button => button.classList.toggle("active", button.dataset.screen === currentScreen));
  document.body.classList.toggle("on-home", currentScreen === "home");
  if (!options.silent) window.scrollTo({ top: 0, behavior: "smooth" });
}

function exportBackup() {
  downloadText(`life-tracker-backup-${todayISO()}.json`, JSON.stringify(statePayload(), null, 2), "application/json");
  toast("Backup esportato");
}

function downloadText(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportDetailedReport() {
  downloadText(`life-tracker-report-ai-${todayISO()}.md`, buildDetailedReport(), "text/markdown");
  toast("Report AI esportato");
}

function buildDetailedReport() {
  const dates = Array.from(new Set([
    ...Object.keys(state.mealsByDate || {}),
    ...state.workouts.map(workout => workout.date),
    ...state.diary.map(entry => entry.date),
  ])).sort();
  const range = currentKcalRange();
  const todayTotals = nutritionTotals(selectedDate);
  const recentWorkouts = [...state.workouts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
  const recentDiary = [...state.diary].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 20);
  const relationships = state.relationships || [];
  const investmentTotal = investmentTotals();
  const ledgerTotal = investmentLedgerTotals();
  const dashboardInvestmentTotal = investmentDashboardTotals(investmentTotal, ledgerTotal);
  const ledgerRows = investmentAssets().map(asset => investmentLedgerForAsset(asset.id));
  const investmentBlocks = state.investments?.blocks || [];
  const dayLines = dates.slice(-30).map(date => {
    const totals = nutritionTotals(date);
    const workout = findWorkoutForDate(date);
    const notes = state.diary.filter(entry => entry.date === date);
    return `- ${date}: ${fmt(totals.kcal)} kcal, P ${fmt(totals.protein)}g, C ${fmt(totals.carbs)}g, F ${fmt(totals.fat)}g${workout ? `, workout ${workout.exercises.length} esercizi` : ""}${notes.length ? `, note ${notes.length}` : ""}`;
  }).join("\n") || "- Nessun dato giornaliero registrato.";

  return `# Report Life Tracker per valutazione AI

Generato: ${new Date().toLocaleString("it-IT")}
Periodo dati: ${dates[0] || "n/d"} - ${dates[dates.length - 1] || "n/d"}

## Obiettivi correnti

- Tipo giornata selezionata: ${state.settings.dayType === "training" ? "allenamento" : "off"}
- Calorie training: ${state.settings.kcalTrainingMin}-${state.settings.kcalTrainingMax} kcal
- Calorie off: ${state.settings.kcalOffMin}-${state.settings.kcalOffMax} kcal
- Proteine: ${state.settings.proteinMin}-${state.settings.proteinMax} g
- Carboidrati target: ${state.settings.carbsTarget} g
- Grassi target: ${state.settings.fatTarget} g
- Idratazione: ${state.settings.waterNormal} L normale, ${state.settings.waterTraining} L allenamento

## Stato di oggi (${selectedDate})

- Calorie: ${fmt(todayTotals.kcal)} kcal su range ${range.min}-${range.max}
- Proteine: ${fmt(todayTotals.protein)} g
- Carboidrati: ${fmt(todayTotals.carbs)} g
- Grassi: ${fmt(todayTotals.fat)} g
- Deficit stimato rispetto al centro range: ${fmt(((range.min + range.max) / 2) - todayTotals.kcal)} kcal

## Riepilogo ultimi 30 giorni

${dayLines}

## Workout recenti

${recentWorkouts.length ? recentWorkouts.map(workout => `### ${workout.date}
${workout.exercises.map(exercise => `- ${exercise.name}: ${exercise.sets.map(set => `${fmt(set.kg)}kg x ${fmt(set.reps)}`).join(", ")} | volume ${fmt(workoutVolume(workout, exercise.id))}`).join("\n")}`).join("\n\n") : "Nessun workout registrato."}

## Pasti registrati

${dates.slice(-14).map(date => {
    const items = state.mealsByDate[date] || [];
    if (!items.length) return `### ${date}\n- Nessun pasto registrato.`;
    return `### ${date}
${items.map(item => {
      const food = foodById(item.foodId);
      const calc = calcItem(item);
      return `- ${item.meal}: ${food?.name || "alimento rimosso"} ${fmt(item.qty)}${food?.unit || ""} | ${fmt(calc.kcal)} kcal, P ${fmt(calc.protein)}g, C ${fmt(calc.carbs)}g, F ${fmt(calc.fat)}g`;
    }).join("\n")}`;
  }).join("\n\n")}

## Diario recente

${recentDiary.length ? recentDiary.map(entry => `- ${entry.date} ${entry.tags.join(" ")}: ${entry.text.replace(/\n/g, " ")}`).join("\n") : "Nessuna nota diario registrata."}

## Relazioni e promemoria

${relationships.length ? relationships.map(person => {
    const reminders = relationshipReminderItems(person).map(item => item.message).join("; ") || "nessun promemoria attivo";
    return `- ${person.name}: compleanno ${person.birthday || "n/d"}, ultimo contatto ${person.lastContactDate || "n/d"}, frequenza ${person.contactFrequencyDays} giorni, promemoria: ${reminders}, note: ${(person.notes || "").replace(/\n/g, " ") || "n/d"}`;
  }).join("\n") : "Nessun contatto registrato."}

## Investimenti

- Utile totale lordo: € ${fmt(dashboardInvestmentTotal.totalGross, 2)} (${fmt(dashboardInvestmentTotal.yieldPct, 2)}%)
- Utile totale netto stimato dopo tasse 26%: € ${fmt(dashboardInvestmentTotal.totalNet, 2)} (tasse stimate € ${fmt(dashboardInvestmentTotal.tax, 2)})
- Utile realizzato: € ${fmt(dashboardInvestmentTotal.realizedGross, 2)}
- Utile non realizzato: € ${fmt(dashboardInvestmentTotal.unrealizedGross, 2)}
- Media mensile realizzata netta: € ${fmt(dashboardInvestmentTotal.monthlyRealizedNet, 2)}
- Media mensile totale netta stimata: € ${fmt(dashboardInvestmentTotal.monthlyTotalNet, 2)}
- Acquisti storici: € ${fmt(ledgerTotal.boughtAmount, 2)}
- Vendite incassate: € ${fmt(ledgerTotal.soldAmount, 2)}
- Valore attuale posizioni aperte: € ${fmt(dashboardInvestmentTotal.openValue, 2)}

${ledgerRows.length ? ledgerRows.map(row => `- ${investmentAssetLabel(row.asset)}: quantita ${fmt(row.quantity, 4)}, costo residuo € ${fmt(row.costBasis, 2)}, valore € ${fmt(row.marketValue, 2)}, realizzato € ${fmt(row.realizedGain, 2)}, aperto € ${fmt(row.unrealizedGain, 2)}, totale € ${fmt(row.totalGain, 2)}`).join("\n") : "Nessun movimento azionario registrato."}

## Blocchi investimento e snapshot

- Investito totale: € ${fmt(investmentTotal.totalInvested, 2)}
- Valore mercato: € ${fmt(investmentTotal.totalValue, 2)}
- Utile netto stimato dopo 26%: € ${fmt(investmentTotal.netProfit, 2)} (${fmt(investmentTotal.netYield, 2)}%)
- Utile lordo stimato: € ${fmt(investmentTotal.grossProfit, 2)} (${fmt(investmentTotal.grossYield, 2)}%)
- Media mensile netta: € ${fmt(investmentTotal.avgMonthlyNet, 2)}
- Cash residuo/allocato: € ${fmt(investmentTotal.cashValue, 2)}

${investmentBlocks.length ? investmentBlocks.map(block => {
    const latest = latestInvestmentEntry(block.id);
    const profit = number(latest?.currentValue, 0) - number(latest?.numberValue, 0);
    return `- ${block.name}: investito € ${fmt(latest?.numberValue || 0, 2)}, valore € ${fmt(latest?.currentValue || 0, 2)}, cash € ${fmt(latest?.cashValue || 0, 2)}, profitto lordo € ${fmt(profit, 2)}, strategia: ${(block.strategy || "").replace(/\n/g, " ").slice(0, 500) || "n/d"}`;
  }).join("\n") : "Nessun blocco investimento registrato."}

## Link salvati

${(state.links || []).map(normalizeLink).filter(link => link.url).map(link => `- ${link.title}: ${link.url}`).join("\n") || "Nessun link salvato."}

## Tabella alimenti attuale

${state.foods.map(food => `- ${food.name}: ${food.kcal} kcal, P ${food.protein}g, C ${food.carbs}g, F ${food.fat}g per 100${food.unit}`).join("\n")}

## Richiesta per AI esterna

Valuta andamento, coerenza tra calorie/macronutrienti/workout, possibili segnali da osservare e suggerisci domande di follow-up. Considera che i valori nutrizionali sono stime medie inserite manualmente.`;
}

function saveInvestmentEntryFromForm() {
  state.investments = normalizeInvestments(state.investments || investmentSeed);
  const blockId = document.getElementById("investmentBlock")?.value || state.investments.blocks[0]?.id || "";
  if (!blockId) {
    toast("Crea prima un blocco investimento");
    return;
  }
  const existing = editingInvestmentEntryId
    ? state.investments.entries.find(entry => entry.id === editingInvestmentEntryId)
    : null;
  const type = existing?.transactionType === "buy" ? "buy" : "update";
  const date = document.getElementById("investmentDate")?.value || todayISO();
  const textValue = document.getElementById("investmentText")?.value || "";
  const currentValueInput = number(document.getElementById("investmentCurrentValue")?.value, 0);
  const currentPriceInput = number(document.getElementById("investmentCurrentPrice")?.value, 0);
  const previous = latestInvestmentEntry(blockId);
  let numberValue = number(existing?.numberValue, 0);
  let cashValue = number(existing?.cashValue, 0);
  let purchasePrice = number(existing?.purchasePrice, 0);
  let currentPrice = currentPriceInput;
  let currentValue = currentValueInput;
  let ath = number(document.getElementById("investmentAth")?.value, 0) || number(existing?.ath, 0) || investmentLastAth(blockId);

  if (type === "update") {
    numberValue = number(existing?.numberValue, previous?.numberValue || 0);
    cashValue = number(existing?.cashValue, previous?.cashValue || 0);
    purchasePrice = number(existing?.purchasePrice, previous?.purchasePrice || 0);
    currentPrice = currentPriceInput || purchasePrice;
    currentValue = currentValueInput || number(previous?.currentValue, 0);
    if (currentPrice > ath) ath = currentPrice;
  } else {
    const delta = number(document.getElementById("investmentAmount")?.value, 0);
    const cashInput = number(document.getElementById("investmentCash")?.value, 0);
    purchasePrice = number(document.getElementById("investmentPurchasePrice")?.value, 0);
    if (existing) {
      numberValue = delta || number(existing.numberValue, 0);
      cashValue = cashInput;
    } else {
      numberValue = number(previous?.numberValue, 0) + delta;
      cashValue = number(previous?.cashValue, 0) - delta + cashInput;
    }
    currentPrice = purchasePrice || number(previous?.currentPrice, 0);
    currentValue = currentValueInput || numberValue;
    if (currentPrice > ath) ath = currentPrice;
  }

  const entry = normalizeInvestmentEntry({
    id: existing?.id || uid(),
    date,
    characteristic: "",
    numberValue,
    purchasePrice,
    currentPrice,
    currentValue,
    cashValue,
    textValue,
    genericOption: blockId,
    transactionType: type,
    ath,
    createdAt: existing?.createdAt || Date.now(),
  });

  rememberInvestmentUndo();
  if (existing) {
    state.investments.entries = state.investments.entries.map(item => item.id === existing.id ? entry : item);
  } else {
    state.investments.entries.push(entry);
  }
  editingInvestmentEntryId = "";
  investmentTransactionType = "update";
  saveState();
  toast(existing ? "Snapshot aggiornato" : "Valore aggiornato");
  render();
  switchScreen("investments");
}

function saveInvestmentAssetFromForm() {
  state.investments = normalizeInvestments(state.investments || investmentSeed);
  const existing = editingInvestmentAssetId
    ? state.investments.assets.find(asset => asset.id === editingInvestmentAssetId)
    : null;
  const name = document.getElementById("investmentAssetName")?.value.trim() || "";
  const ticker = document.getElementById("investmentAssetTicker")?.value.trim().toUpperCase() || "";
  const isin = document.getElementById("investmentAssetIsin")?.value.trim().toUpperCase() || "";
  if (!name && !ticker && !isin) {
    toast("Inserisci nome, ticker o ISIN");
    return;
  }
  const now = new Date().toISOString();
  const asset = normalizeInvestmentAsset({
    id: existing?.id || `investment-asset-${uid()}`,
    blockId: document.getElementById("investmentAssetBlock")?.value || "",
    name: name || ticker || isin,
    ticker,
    isin,
    category: document.getElementById("investmentAssetCategory")?.value || "Altro",
    broker: document.getElementById("investmentAssetBroker")?.value || "Altro",
    description: document.getElementById("investmentAssetDescription")?.value || "",
    currency: document.getElementById("investmentAssetCurrency")?.value || "EUR",
    currentPrice: number(document.getElementById("investmentAssetPrice")?.value, 0),
    currentPriceDate: document.getElementById("investmentAssetPriceDate")?.value || todayISO(),
    notes: document.getElementById("investmentAssetNotes")?.value || "",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  }, state.investments.assets.length);
  rememberInvestmentUndo();
  if (existing) {
    state.investments.assets = state.investments.assets.map(item => item.id === existing.id ? asset : item);
  } else {
    state.investments.assets.push(asset);
  }
  editingInvestmentAssetId = "";
  investmentFormMode = "trade";
  saveState();
  toast(existing ? "Strumento aggiornato" : "Strumento creato");
  render();
  switchScreen("investments");
}

function updateInvestmentTradeComputedAmount() {
  const quantityInput = document.getElementById("investmentTradeQuantity");
  const priceInput = document.getElementById("investmentTradePrice");
  const output = document.getElementById("investmentTradeComputedAmount");
  if (!quantityInput || !priceInput || !output) return;
  const assetId = document.getElementById("investmentTradeAsset")?.value || "";
  const sellAll = Boolean(document.getElementById("investmentTradeSellAll")?.checked);
  if (sellAll && investmentTradeSide === "sell" && assetId) {
    const existing = editingInvestmentTradeId ? state.investments.trades.find(trade => trade.id === editingInvestmentTradeId) : null;
    const position = investmentLedgerForAsset(assetId, { excludeTradeId: existing?.id });
    quantityInput.value = String(Number(position.quantity.toFixed(8)));
    quantityInput.disabled = true;
  } else {
    quantityInput.disabled = false;
  }
  const quantity = number(quantityInput.value, 0);
  const price = number(priceInput.value, 0);
  output.textContent = `€ ${fmt(quantity * price, 2)}`;
}

function saveInvestmentTradeFromForm() {
  state.investments = normalizeInvestments(state.investments || investmentSeed);
  const side = ["sell", "deposit_external", "withdraw_external"].includes(investmentTradeSide) ? investmentTradeSide : "buy";
  if (side === "deposit_external" || side === "withdraw_external") {
    const amount = number(document.getElementById("investmentCashFlowAmount")?.value, 0);
    if (amount <= 0) { toast("Inserisci un importo valido"); return; }
    const now = new Date().toISOString();
    const flow = normalizeInvestmentCashFlow({
      id: `investment-cash-flow-${uid()}`,
      date: document.getElementById("investmentCashFlowDate")?.value || todayISO(),
      type: side,
      broker: document.getElementById("investmentCashFlowBroker")?.value || "Altro",
      amount,
      note: document.getElementById("investmentCashFlowNote")?.value || "",
      createdAt: now,
      updatedAt: now,
    });
    rememberInvestmentUndo();
    state.investments.cashFlows.push(flow);
    investmentTradeSide = "buy";
    saveState();
    toast(side === "deposit_external" ? "Deposito esterno registrato" : "Prelievo esterno registrato");
    render();
    switchScreen("investments");
    return;
  }
  const assetId = document.getElementById("investmentTradeAsset")?.value || "";
  if (!assetId) { toast("Crea prima uno strumento"); return; }
  const existing = editingInvestmentTradeId
    ? state.investments.trades.find(trade => trade.id === editingInvestmentTradeId)
    : null;
  let quantity = number(document.getElementById("investmentTradeQuantity")?.value, 0);
  const price = number(document.getElementById("investmentTradePrice")?.value, 0);
  const sellAll = Boolean(document.getElementById("investmentTradeSellAll")?.checked);
  const position = investmentLedgerForAsset(assetId, { excludeTradeId: existing?.id });
  if (side === "sell" && sellAll) quantity = position.quantity;
  const amount = quantity * price;
  if (quantity <= 0 || price <= 0 || amount <= 0) { toast("Inserisci quantità e prezzo validi"); return; }
  if (side === "sell" && quantity > position.quantity + 0.000001) {
    toast(`Quantità venduta superiore alla posizione attuale (${fmt(position.quantity, 4)})`);
    return;
  }
  const now = new Date().toISOString();
  const trade = normalizeInvestmentTrade({
    id: existing?.id || `investment-trade-${uid()}`,
    assetId,
    date: document.getElementById("investmentTradeDate")?.value || todayISO(),
    side,
    quantity,
    price,
    note: document.getElementById("investmentTradeNote")?.value || "",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  });
  rememberInvestmentUndo();
  if (existing) state.investments.trades = state.investments.trades.map(item => item.id === existing.id ? trade : item);
  else state.investments.trades.push(trade);
  const asset = investmentAssetById(assetId);
  if (asset) {
    asset.currentPrice = price;
    asset.currentPriceDate = trade.date;
    asset.updatedAt = now;
  }
  editingInvestmentTradeId = "";
  investmentTradeSide = "buy";
  investmentFormMode = "trade";
  saveState();
  toast(existing ? "Movimento aggiornato" : "Movimento registrato");
  render();
  switchScreen("investments");
}

function startSellAllInvestmentAsset(assetId) {
  const asset = investmentAssetById(assetId);
  if (!asset) return;
  const ledger = investmentLedgerForAsset(assetId);
  if (ledger.quantity <= 0) {
    toast("Posizione gia chiusa");
    return;
  }
  investmentFormMode = "trade";
  editingInvestmentTradeId = "";
  investmentTradeSide = "sell";
  renderInvestments();
  const assetSelect = document.getElementById("investmentTradeAsset");
  const quantityInput = document.getElementById("investmentTradeQuantity");
  const priceInput = document.getElementById("investmentTradePrice");
  const sellAllInput = document.getElementById("investmentTradeSellAll");
  const noteInput = document.getElementById("investmentTradeNote");
  if (assetSelect) assetSelect.value = assetId;
  if (sellAllInput) sellAllInput.checked = true;
  if (quantityInput) quantityInput.value = String(Number(ledger.quantity.toFixed(8)));
  if (priceInput) priceInput.value = String(ledger.currentPrice || asset.currentPrice || "");
  if (noteInput && !noteInput.value) noteInput.value = "Vendita totale posizione";
  switchScreen("investments");
}

function saveInvestmentAssetPrice(assetId) {
  const asset = investmentAssetById(assetId);
  if (!asset) return;
  const price = number(document.querySelector(`[data-investment-asset-price="${assetId}"]`)?.value, 0);
  if (price <= 0) {
    toast("Inserisci un prezzo valido");
    return;
  }
  rememberInvestmentUndo();
  asset.currentPrice = price;
  asset.currentPriceDate = document.querySelector(`[data-investment-asset-price-date="${assetId}"]`)?.value || todayISO();
  asset.updatedAt = new Date().toISOString();
  if (asset.blockId) {
    const block = investmentBlockById(asset.blockId);
    const blockLedger = investmentLedgerForBlock(asset.blockId, { forceMarketPrice: true });
    const previous = latestInvestmentEntry(asset.blockId);
    const currentValue = blockLedger.marketValue;
    const numberValue = blockLedger.costBasis || number(previous?.numberValue, 0);
    state.investments.entries.push(normalizeInvestmentEntry({
      id: uid(),
      date: asset.currentPriceDate,
      characteristic: block?.name || asset.name,
      numberValue,
      purchasePrice: blockLedger.quantity > 0 ? blockLedger.costBasis / blockLedger.quantity : number(previous?.purchasePrice, 0),
      currentPrice: price,
      currentValue,
      cashValue: number(previous?.cashValue, 0),
      textValue: `Aggiornamento prezzo ${investmentAssetLabel(asset)}`,
      genericOption: asset.blockId,
      transactionType: "update",
      ath: Math.max(number(previous?.ath, 0), price),
      createdAt: Date.now(),
    }));
  }
  saveState();
  toast(asset.blockId ? "Prezzo aggiornato e snapshot salvato" : "Prezzo aggiornato");
  renderInvestments();
  switchScreen("investments");
}

function deleteInvestmentTrade(tradeId) {
  rememberInvestmentUndo();
  state.investments.trades = state.investments.trades.filter(trade => trade.id !== tradeId);
  if (editingInvestmentTradeId === tradeId) editingInvestmentTradeId = "";
  saveState();
  toast("Movimento azionario eliminato");
  render();
  switchScreen("investments");
}

function deleteInvestmentAsset(assetId) {
  const asset = investmentAssetById(assetId);
  if (!asset) return;
  const tradeCount = investmentTradesForAsset(assetId).length;
  const message = tradeCount
    ? `Eliminare "${investmentAssetLabel(asset)}" e ${tradeCount} movimenti collegati?`
    : `Eliminare "${investmentAssetLabel(asset)}"?`;
  if (!window.confirm(message)) return;
  rememberInvestmentUndo();
  state.investments.assets = state.investments.assets.filter(item => item.id !== assetId);
  state.investments.trades = state.investments.trades.filter(trade => trade.assetId !== assetId);
  if (editingInvestmentAssetId === assetId) editingInvestmentAssetId = "";
  saveState();
  toast("Strumento eliminato");
  render();
  switchScreen("investments");
}

function saveInvestmentBlockFromForm() {
  const name = document.getElementById("investmentBlockName")?.value.trim();
  if (!name) {
    toast("Inserisci un nome blocco");
    return;
  }
  rememberInvestmentUndo();
  state.investments.blocks.push(normalizeInvestmentBlock({
    id: `investment-block-${uid()}`,
    title: `Blocco ${state.investments.blocks.length + 1}`,
    name,
    description: document.getElementById("investmentBlockDescription")?.value || "",
    strategy: document.getElementById("investmentBlockStrategy")?.value || "",
  }, state.investments.blocks.length));
  visibleInvestmentBlockIds = state.investments.blocks.map(block => block.id);
  investmentFormMode = "entry";
  saveState();
  toast("Blocco investimento creato");
  render();
  switchScreen("investments");
}

function saveInvestmentNoteFromForm() {
  const text = document.getElementById("investmentNoteText")?.value.trim();
  if (!text) {
    toast("Scrivi una nota");
    return;
  }
  rememberInvestmentUndo();
  state.investments.notes.unshift(normalizeInvestmentNote({
    id: uid(),
    date: document.getElementById("investmentNoteDate")?.value || todayISO(),
    blockId: document.getElementById("investmentNoteBlock")?.value || "",
    text,
    createdAt: Date.now(),
  }));
  saveState();
  toast("Nota investimento salvata");
  renderInvestments();
}

function saveInvestmentNoteEdit(noteId) {
  const card = Array.from(document.querySelectorAll("[data-investment-note-card]"))
    .find(element => element.dataset.investmentNoteCard === noteId);
  const note = state.investments.notes.find(item => item.id === noteId);
  if (!card || !note) return;
  const text = card.querySelector("[data-investment-note-field='text']")?.value.trim();
  if (!text) {
    toast("La nota non puo essere vuota");
    return;
  }
  rememberInvestmentUndo();
  note.date = card.querySelector("[data-investment-note-field='date']")?.value || note.date;
  note.text = text;
  note.updatedAt = Date.now();
  editingInvestmentNoteId = "";
  saveState();
  toast("Nota aggiornata");
  renderInvestments();
}

function deleteInvestmentEntry(entryId) {
  rememberInvestmentUndo();
  state.investments.entries = state.investments.entries.filter(entry => entry.id !== entryId);
  if (editingInvestmentEntryId === entryId) editingInvestmentEntryId = "";
  saveState();
  toast("Movimento eliminato");
  render();
  switchScreen("investments");
}

function deleteInvestmentBlock(blockId) {
  const block = investmentBlockById(blockId);
  if (!block) return;
  const entryCount = investmentEntriesForBlock(blockId).length;
  const message = entryCount
    ? `Eliminare "${block.name}" e ${entryCount} movimenti collegati? Le note resteranno come generali.`
    : `Eliminare "${block.name}"?`;
  if (!window.confirm(message)) return;
  rememberInvestmentUndo();
  state.investments.blocks = state.investments.blocks.filter(block => block.id !== blockId);
  state.investments.entries = state.investments.entries.filter(entry => entry.genericOption !== blockId);
  state.investments.notes = state.investments.notes.map(note => note.blockId === blockId ? { ...note, blockId: "" } : note);
  visibleInvestmentBlockIds = visibleInvestmentBlockIds.filter(id => id !== blockId);
  saveState();
  toast("Blocco eliminato");
  render();
  switchScreen("investments");
}

document.addEventListener("click", event => {
  const target = event.target.closest("button, label");
  if (!target) return;

  if (target.dataset.screen) switchScreen(target.dataset.screen);
  if (target.dataset.jump) switchScreen(target.dataset.jump);

  if (target.id === "addTodo") {
    addTodoFromForm();
  }

  if (target.id === "addLink") {
    addLinkFromForm();
  }

  if (target.dataset.openLink) {
    openSavedLink(target.dataset.openLink);
  }

  if (target.dataset.deleteLink) {
    state.links = (state.links || []).filter(link => link.id !== target.dataset.deleteLink);
    saveState();
    renderLinks();
    renderHome();
    toast("Link eliminato");
  }

  if (target.dataset.completeTodo) {
    const todo = state.todos.find(item => item.id === target.dataset.completeTodo);
    if (todo) {
      rememberTodoUndo();
      todo.completed = true;
      todo.completedAt = new Date().toISOString();
      todo.updatedAt = todo.completedAt;
      autosaveTodos("Elemento completato");
      switchScreen("todo");
    }
  }

  if (target.id === "undoTodo") {
    if (!todoUndoSnapshot) return;
    state.todos = todoUndoSnapshot.map(normalizeTodo);
    todoUndoSnapshot = null;
    autosaveTodos("Ultima modifica annullata");
    switchScreen("todo");
  }

  if (target.closest("[data-action='day-type']") && target.dataset.value) {
    state.settings.dayType = target.dataset.value;
    toast("Tipo giornata modificato: premi Salva giornata");
    render();
  }

  if (target.id === "saveDashboard") {
    saveState();
    toast("Giornata salvata");
    render();
  }

  if (target.id === "exportBackup" || target.id === "exportQuick") exportBackup();
  if (target.id === "exportReport") exportDetailedReport();
  if (target.id === "cloudSignIn") cloudSignIn();
  if (target.id === "cloudSignUp") cloudSignUp();
  if (target.id === "cloudSignOut") cloudSignOut();
  if (target.id === "cloudUpload") syncStateToCloud().catch(() => {});
  if (target.id === "cloudDownload") loadStateFromCloud().catch(() => {});
  if (target.id === "cloudSyncQuick") quickCloudSync().catch(() => {});
  if (target.id === "openDataFile") openSharedDataFile();
  if (target.id === "createDataFile") createSharedDataFile();
  if (target.id === "saveDataFile") writeDataFile({ feedback: true });
  if (target.id === "reloadDataFile") readDataFile({ feedback: true });

  if (target.id === "saveWorkout") {
    const dateInput = document.getElementById("workoutDate");
	    draftWorkout.date = dateInput.value || todayISO();
	    persistDraftWorkout();
	    toast("Workout salvato");
	    render();
	  }

  if (target.id === "timerStart") startWorkoutTimer();
  if (target.id === "timerPause") pauseWorkoutTimer();
  if (target.id === "timerReset") resetWorkoutTimer();

  if (target.dataset.addSet) {
	    const exercise = draftWorkout.exercises.find(ex => ex.id === target.dataset.addSet);
	    const last = exercise.sets.at(-1) || { kg: 0, reps: 0 };
	    exercise.sets.push({ ...last });
	    renderWorkout();
	  }

  if (target.dataset.removeSet) {
    const [exerciseId, index] = target.dataset.removeSet.split(":");
	    const exercise = draftWorkout.exercises.find(ex => ex.id === exerciseId);
	    if (exercise && exercise.sets.length > 1) exercise.sets.splice(Number(index), 1);
	    renderWorkout();
	  }

  if (target.dataset.loadWorkout) {
    selectedDate = target.dataset.loadWorkout;
    draftWorkout = cloneWorkout(findWorkoutForDate(selectedDate) || createWorkoutFromTemplate(selectedDate));
    render();
  }

  if (target.dataset.deleteWorkout) {
    const dateToDelete = target.dataset.deleteWorkout;
    state.workouts = state.workouts.filter(workout => workout.date !== dateToDelete);
    if (draftWorkout.date === dateToDelete) {
      selectedDate = todayISO();
      draftWorkout = cloneWorkout(findWorkoutForDate(selectedDate) || createWorkoutFromTemplate(selectedDate));
    }
    saveState();
    toast("Workout eliminato");
    render();
    switchScreen("workout");
  }

  if (target.id === "addFood") {
    mealsForDate().push({
      id: uid(),
      date: selectedDate,
      meal: document.getElementById("mealName").value,
      foodId: document.getElementById("foodSelect").value,
      qty: number(document.getElementById("foodQty").value, 100),
    });
    saveState();
    toast("Alimento aggiunto");
    render();
  }

  if (target.dataset.quickAdd) {
    const combo = state.quickAdds.find(item => item.id === target.dataset.quickAdd);
    combo?.items.forEach(item => {
      mealsForDate().push({ id: uid(), date: selectedDate, meal: combo.meal, ...item });
    });
    saveState();
    toast(`${combo?.name || "Combo"} aggiunta`);
    render();
  }

  if (target.dataset.nutritionToggle) {
    const key = target.dataset.nutritionToggle;
    nutritionChartKeys = nutritionChartKeys.includes(key)
      ? nutritionChartKeys.filter(item => item !== key)
      : [...nutritionChartKeys, key];
    if (!nutritionChartKeys.length) nutritionChartKeys = [key];
    renderNutrition();
  }

	  if (target.id === "saveMeals") {
	    saveState();
	    toast("Pasti salvati");
	    render();
	  }

  if (target.id === "showInvestmentTradeForm" || target.id === "cancelInvestmentTradeEdit") {
    investmentFormMode = "trade";
    editingInvestmentTradeId = "";
    investmentTradeSide = "buy";
    renderInvestments();
    switchScreen("investments");
  }

  if (target.id === "showInvestmentAssetForm" || target.id === "cancelInvestmentAssetEdit") {
    investmentFormMode = "asset";
    editingInvestmentAssetId = "";
    renderInvestments();
    switchScreen("investments");
  }

  if (target.id === "showInvestmentBlockForm") {
    investmentFormMode = "block";
    editingInvestmentEntryId = "";
    renderInvestments();
    switchScreen("investments");
  }

  if (target.id === "showInvestmentEntryForm" || target.id === "cancelInvestmentEdit") {
    investmentFormMode = "entry";
    editingInvestmentEntryId = "";
    investmentTransactionType = "update";
    renderInvestments();
    switchScreen("investments");
  }

  if (target.dataset.investmentTradeSide) {
    investmentTradeSide = target.dataset.investmentTradeSide;
    renderInvestments();
    switchScreen("investments");
  }

  if (target.dataset.investmentType) {
    investmentTransactionType = "update";
    renderInvestments();
    switchScreen("investments");
  }

	  if (target.id === "saveInvestmentTrade") saveInvestmentTradeFromForm();
	  if (target.id === "saveInvestmentAsset") saveInvestmentAssetFromForm();
	  if (target.id === "saveInvestmentEntry") saveInvestmentEntryFromForm();
	  if (target.id === "saveInvestmentBlock") saveInvestmentBlockFromForm();
	  if (target.id === "saveInvestmentNote") saveInvestmentNoteFromForm();
	  if (target.id === "undoInvestmentChange") restoreInvestmentUndo();
	  if (target.id === "redoInvestmentChange") restoreInvestmentRedo();

  if (target.dataset.investmentToggleAll) {
    const allIds = state.investments.blocks.map(block => block.id);
    visibleInvestmentBlockIds = visibleInvestmentBlockIds.length === allIds.length ? [] : allIds;
    renderInvestments();
    switchScreen("investments");
  }

  if (target.dataset.investmentToggleBlock) {
    const blockId = target.dataset.investmentToggleBlock;
    visibleInvestmentBlockIds = visibleInvestmentBlockIds.includes(blockId)
      ? visibleInvestmentBlockIds.filter(id => id !== blockId)
      : [...visibleInvestmentBlockIds, blockId];
    renderInvestments();
    switchScreen("investments");
  }

  if (target.dataset.investmentAssetFilter === "all") {
    visibleInvestmentAssetIds = investmentAssets().map(asset => asset.id);
    renderInvestments();
    switchScreen("investments");
  }

  if (target.dataset.investmentAssetFilter === "none") {
    visibleInvestmentAssetIds = [];
    renderInvestments();
    switchScreen("investments");
  }

  if (target.dataset.investmentShowClosed) {
    showClosedInvestmentAssetsInTrend = !showClosedInvestmentAssetsInTrend;
    renderInvestments();
    switchScreen("investments");
  }

  if (target.dataset.investmentToggleAsset) {
    const assetId = target.dataset.investmentToggleAsset;
    visibleInvestmentAssetIds = visibleInvestmentAssetIds.includes(assetId)
      ? visibleInvestmentAssetIds.filter(id => id !== assetId)
      : [...visibleInvestmentAssetIds, assetId];
    renderInvestments();
    switchScreen("investments");
  }

  if (target.dataset.investmentMetricPreset) {
    const definitions = investmentMetricDefinitions(investmentDashboardTotals(investmentTotals(), investmentLedgerTotals()), investmentLedgerTotals());
    if (target.dataset.investmentMetricPreset === "all") visibleInvestmentMetricIds = definitions.map(item => item.id);
    if (target.dataset.investmentMetricPreset === "none") visibleInvestmentMetricIds = [];
    if (target.dataset.investmentMetricPreset === "essential") visibleInvestmentMetricIds = ["portfolioValue", "netContributedCapital", "totalGross", "totalNet", "netReturnPct", "irr", "twr", "openAssetValue"];
    renderInvestments();
    switchScreen("investments");
  }

  if (target.dataset.investmentMetricToggle) {
    const id = target.dataset.investmentMetricToggle;
    visibleInvestmentMetricIds = visibleInvestmentMetricIds.includes(id)
      ? visibleInvestmentMetricIds.filter(item => item !== id)
      : [...visibleInvestmentMetricIds, id];
    renderInvestments();
    switchScreen("investments");
  }

  if (target.dataset.editInvestmentEntry) {
    const entry = state.investments.entries.find(item => item.id === target.dataset.editInvestmentEntry);
    if (entry) {
      editingInvestmentEntryId = entry.id;
      investmentFormMode = "entry";
      investmentTransactionType = entry.transactionType || "buy";
      renderInvestments();
      switchScreen("investments");
    }
  }

  if (target.dataset.editInvestmentTrade) {
    const trade = state.investments.trades.find(item => item.id === target.dataset.editInvestmentTrade);
    if (trade) {
      editingInvestmentTradeId = trade.id;
      investmentFormMode = "trade";
      investmentTradeSide = trade.side || "buy";
      renderInvestments();
      switchScreen("investments");
    }
  }

	  if (target.dataset.editInvestmentAsset) {
	    const asset = investmentAssetById(target.dataset.editInvestmentAsset);
	    if (asset) {
      editingInvestmentAssetId = asset.id;
      investmentFormMode = "asset";
      renderInvestments();
      switchScreen("investments");
	    }
	  }
	
	  if (target.dataset.sellAllInvestmentAsset) startSellAllInvestmentAsset(target.dataset.sellAllInvestmentAsset);
	  if (target.dataset.saveInvestmentAssetPrice) saveInvestmentAssetPrice(target.dataset.saveInvestmentAssetPrice);
	  if (target.dataset.deleteInvestmentTrade) deleteInvestmentTrade(target.dataset.deleteInvestmentTrade);
	  if (target.dataset.deleteInvestmentAsset) deleteInvestmentAsset(target.dataset.deleteInvestmentAsset);

  if (target.dataset.deleteInvestmentEntry) deleteInvestmentEntry(target.dataset.deleteInvestmentEntry);

  if (target.dataset.deleteInvestmentBlock) deleteInvestmentBlock(target.dataset.deleteInvestmentBlock);

  if (target.dataset.saveInvestmentStrategy) {
    const block = investmentBlockById(target.dataset.saveInvestmentStrategy);
	    const textarea = document.querySelector(`[data-investment-strategy="${target.dataset.saveInvestmentStrategy}"]`);
	    if (block && textarea) {
	      rememberInvestmentUndo();
	      block.strategy = textarea.value;
	      saveState();
      toast("Strategia salvata");
      renderInvestments();
      switchScreen("investments");
    }
  }

  if (target.dataset.editInvestmentNote) {
    editingInvestmentNoteId = target.dataset.editInvestmentNote;
    renderInvestments();
    switchScreen("investments");
  }

  if (target.dataset.cancelInvestmentNote) {
    editingInvestmentNoteId = "";
    renderInvestments();
    switchScreen("investments");
  }

  if (target.dataset.saveInvestmentNoteEdit) saveInvestmentNoteEdit(target.dataset.saveInvestmentNoteEdit);

	  if (target.dataset.deleteInvestmentNote) {
	    rememberInvestmentUndo();
	    state.investments.notes = state.investments.notes.filter(note => note.id !== target.dataset.deleteInvestmentNote);
    if (editingInvestmentNoteId === target.dataset.deleteInvestmentNote) editingInvestmentNoteId = "";
    saveState();
    toast("Nota eliminata");
    renderInvestments();
    switchScreen("investments");
  }

  if (target.dataset.loadMealDay) {
    selectedDate = target.dataset.loadMealDay;
    draftWorkout = cloneWorkout(findWorkoutForDate(selectedDate) || createWorkoutFromTemplate(selectedDate));
    bodyMetricDate = selectedDate;
    toast(`Pasti aperti: ${prettyDate(selectedDate)}`);
    render();
    switchScreen("nutrition");
  }

  if (target.id === "loadCombo") {
    const combo = state.quickAdds.find(item => item.id === document.getElementById("comboSelect").value);
    if (combo) comboDraft = cloneCombo(combo);
    renderNutrition();
  }

	  if (target.id === "newCombo") {
	    comboDraft = { ...emptyCombo(), id: `combo-${uid()}` };
	    toast("Nuova combo pronta: compila e premi Salva combo");
	    renderNutrition();
	  }

	  if (target.id === "addComboItem") {
	    comboDraft.items.push({ foodId: state.foods[0]?.id || foodSeed[0].id, qty: 100 });
	    renderNutrition();
	  }

	  if (target.dataset.removeComboItem !== undefined) {
	    if (comboDraft.items.length > 1) comboDraft.items.splice(Number(target.dataset.removeComboItem), 1);
	    renderNutrition();
	  }

  if (target.id === "saveCombo") {
    comboDraft.name = document.getElementById("comboName").value.trim() || "Combo senza nome";
    comboDraft.meal = document.getElementById("comboMeal").value;
    if (!comboDraft.id) comboDraft.id = `combo-${uid()}`;
    const existingIndex = state.quickAdds.findIndex(combo => combo.id === comboDraft.id);
    if (existingIndex >= 0) state.quickAdds[existingIndex] = cloneCombo(comboDraft);
    else state.quickAdds.push(cloneCombo(comboDraft));
    saveState();
    toast("Combo aggiornata");
    render();
  }

  if (target.id === "saveTodayAsCombo") {
    const rows = mealsForDate();
    if (!rows.length) {
      toast("Nessun pasto da salvare");
      return;
    }
    comboDraft = {
      id: `combo-${uid()}`,
      name: document.getElementById("comboName").value.trim() || `Combo ${prettyDate(selectedDate)}`,
      meal: document.getElementById("comboMeal").value,
      items: rows.map(item => ({ foodId: item.foodId, qty: item.qty })),
    };
    state.quickAdds.push(cloneCombo(comboDraft));
    saveState();
    toast("Combo creata dai pasti di oggi");
    render();
  }

  if (target.id === "deleteCombo") {
    if (!comboDraft.id) return;
    state.quickAdds = state.quickAdds.filter(combo => combo.id !== comboDraft.id);
    comboDraft = cloneCombo(state.quickAdds[0] || emptyCombo());
    saveState();
    toast("Combo eliminata");
    render();
  }

	  if (target.id === "addFoodToTable") {
    const name = document.getElementById("newFoodName").value.trim();
    if (!name) {
      toast("Inserisci un nome alimento");
      return;
    }
    const baseId = slugify(name);
    const id = state.foods.some(food => food.id === baseId) ? `${baseId}-${uid()}` : baseId;
    state.foods.push({
      id,
      name,
      unit: document.getElementById("newFoodUnit").value,
      kcal: number(document.getElementById("newFoodKcal").value),
      protein: number(document.getElementById("newFoodProtein").value),
      carbs: number(document.getElementById("newFoodCarbs").value),
      fat: number(document.getElementById("newFoodFat").value),
    });
    saveState();
    toast("Alimento aggiunto alla tabella");
    render();
	    switchScreen("foods");
	  }

  if (target.id === "saveFoodsTable") {
    saveState();
    toast("Tabella alimenti salvata");
    render();
    switchScreen("foods");
  }

  if (target.dataset.deleteFood) {
    if (state.foods.length <= 1) {
      toast("Deve restare almeno un alimento");
      return;
    }
    const deletedId = target.dataset.deleteFood;
    state.foods = state.foods.filter(food => food.id !== deletedId);
    state.quickAdds = state.quickAdds.map(combo => ({
      ...combo,
      items: combo.items.filter(item => item.foodId !== deletedId),
    })).filter(combo => combo.items.length);
    if (comboDraft.items.some(item => item.foodId === deletedId)) comboDraft = cloneCombo(state.quickAdds[0] || emptyCombo());
    saveState();
    toast("Alimento eliminato");
    render();
    switchScreen("foods");
  }

  if (target.dataset.removeMeal) {
    state.mealsByDate[selectedDate] = mealsForDate().filter(item => item.id !== target.dataset.removeMeal);
    saveState();
    toast("Alimento rimosso");
    render();
  }

  if (target.id === "saveDiary") {
    const text = document.getElementById("diaryText").value.trim();
    if (!text) return;
    state.diary.push({
      id: uid(),
      date: selectedDate,
      text,
      tags: extractTags(text),
      createdAt: new Date().toISOString(),
    });
    saveState();
    toast("Nota salvata");
    render();
  }

  if (target.dataset.tagFilter !== undefined) {
    diaryFilter = target.dataset.tagFilter;
    renderDiary();
  }

  if (target.dataset.deleteDiary) {
    state.diary = state.diary.filter(entry => entry.id !== target.dataset.deleteDiary);
    saveState();
    renderDiary();
  }

  if (target.dataset.saveDiaryEdit) {
    saveState();
    toast("Nota aggiornata");
    renderDiary();
  }

  if (target.id === "saveSettings") {
    saveState();
    toast("Obiettivi salvati");
    render();
    switchScreen("data");
  }

  if (target.id === "saveBodyMetric") {
    const date = document.getElementById("bodyDate")?.value || bodyMetricDate || selectedDate;
    const metric = {
      id: bodyMetricForDate(date)?.id || uid(),
      date,
      weight: number(document.getElementById("bodyWeight")?.value, 0),
      waist: number(document.getElementById("bodyWaist")?.value, 0),
      energy: number(document.getElementById("bodyEnergy")?.value, 0),
      note: document.getElementById("bodyNote")?.value || "",
    };
    bodyMetricDate = date;
    upsertBodyMetric(metric);
    saveState();
    toast("Parametri salvati");
    render();
    switchScreen("data");
  }

  if (target.id === "saveNewRelationship") {
    const name = document.getElementById("newRelationshipName")?.value.trim();
    if (!name) {
      toast("Inserisci un nome");
      return;
    }
    const newId = uid();
    state.relationships.push(normalizeRelationship({
      id: newId,
      name,
      birthday: document.getElementById("newRelationshipBirthday")?.value || "",
      contactFrequencyDays: number(document.getElementById("newRelationshipFrequency")?.value, 30),
      reminderDaysBefore: number(document.getElementById("newRelationshipReminderDays")?.value, 7),
      lastContactDate: document.getElementById("newRelationshipLastContact")?.value || "",
      recurrences: document.getElementById("newRelationshipRecurrences")?.value || "",
      notes: document.getElementById("newRelationshipNotes")?.value || "",
    }));
    selectedRelationshipId = newId;
    saveState();
    toast("Contatto salvato");
    render();
    switchScreen("relationships");
  }

  if (target.dataset.openRelationship) {
    selectedRelationshipId = target.dataset.openRelationship;
    renderRelationships();
  }

  if (target.dataset.saveRelationship) {
    const card = target.closest("[data-relationship-id]");
    const person = state.relationships.find(item => item.id === target.dataset.saveRelationship);
    if (person && card) {
      card.querySelectorAll("[data-relationship-field]").forEach(input => {
        person[input.dataset.relationshipField] = ["contactFrequencyDays", "reminderDaysBefore"].includes(input.dataset.relationshipField)
          ? Math.max(0, number(input.value, input.dataset.relationshipField === "contactFrequencyDays" ? 30 : 7))
          : input.value;
      });
      Object.assign(person, normalizeRelationship(person));
      saveState();
      toast("Contatto aggiornato");
      renderRelationships();
    }
  }

  if (target.dataset.contactToday) {
    const person = state.relationships.find(item => item.id === target.dataset.contactToday);
    if (person) {
      person.lastContactDate = todayISO();
      saveState();
      toast("Ultimo contatto aggiornato");
      renderRelationships();
    }
  }

  if (target.dataset.deleteRelationship) {
    state.relationships = state.relationships.filter(item => item.id !== target.dataset.deleteRelationship);
    if (selectedRelationshipId === target.dataset.deleteRelationship) selectedRelationshipId = "";
    saveState();
    toast("Contatto eliminato");
    renderRelationships();
  }

  if (target.id === "enableRelationshipNotifications") {
    enableRelationshipNotifications();
  }
});

document.addEventListener("dragstart", event => {
  const card = event.target.closest?.("[data-todo-id]");
  if (!card) return;
  draggedTodoId = card.dataset.todoId;
  card.classList.add("dragging");
  event.dataTransfer?.setData("text/plain", draggedTodoId);
});

document.addEventListener("dragover", event => {
  if (!draggedTodoId) return;
  const column = event.target.closest?.("[data-todo-list]");
  if (!column) return;
  event.preventDefault();
  clearTodoDropTargets();
  column.classList.add("drag-over");
});

document.addEventListener("drop", event => {
  if (!draggedTodoId) return;
  const column = event.target.closest?.("[data-todo-list]");
  clearTodoDropTargets();
  if (column) {
    event.preventDefault();
    moveTodoToList(draggedTodoId, column.dataset.todoList);
    switchScreen("todo");
  }
  draggedTodoId = "";
});

document.addEventListener("dragend", () => {
  draggedTodoId = "";
  clearTodoDropTargets();
});

document.addEventListener("pointerdown", event => {
  const handle = event.target.closest?.("[data-todo-drag]");
  if (!handle) return;
  pointerTodoDrag = { id: handle.dataset.todoDrag, list: "" };
  document.body.classList.add("todo-dragging");
  handle.closest("[data-todo-id]")?.classList.add("dragging");
  event.preventDefault();
});

document.addEventListener("pointermove", event => {
  if (!pointerTodoDrag) return;
  event.preventDefault();
  const element = document.elementFromPoint(event.clientX, event.clientY);
  const column = element?.closest?.("[data-todo-list]");
  clearTodoDropTargets();
  if (column) {
    column.classList.add("drag-over");
    pointerTodoDrag.list = column.dataset.todoList;
  } else {
    pointerTodoDrag.list = "";
  }
});

document.addEventListener("pointerup", () => {
  if (!pointerTodoDrag) return;
  const { id, list } = pointerTodoDrag;
  pointerTodoDrag = null;
  document.body.classList.remove("todo-dragging");
  clearTodoDropTargets();
  if (list) {
    moveTodoToList(id, list);
    switchScreen("todo");
  } else {
    renderTodo();
  }
});

function clearTodoDropTargets() {
  document.querySelectorAll(".todo-column.drag-over, .todo-card.dragging").forEach(element => {
    element.classList.remove("drag-over", "dragging");
  });
}

document.addEventListener("keydown", event => {
  if (event.key !== "Enter" || event.isComposing) return;
  if (event.target?.id === "todoTitle") {
    event.preventDefault();
    addTodoFromForm();
  }
  if (event.target?.id === "linkTitle" || event.target?.id === "linkUrl") {
    event.preventDefault();
    addLinkFromForm();
  }
});

document.addEventListener("input", event => {
  const target = event.target;

	  if (target.id === "workoutDate") {
	    const date = target.value || todayISO();
	    selectedDate = date;
	    draftWorkout = cloneWorkout(findWorkoutForDate(date) || { ...draftWorkout, date });
	    render();
	    switchScreen("workout");
	  }

  if (target.id === "nutritionDate") {
    selectedDate = target.value || todayISO();
    draftWorkout = cloneWorkout(findWorkoutForDate(selectedDate) || createWorkoutFromTemplate(selectedDate));
    bodyMetricDate = selectedDate;
    render();
    switchScreen("nutrition");
  }

  if (target.id === "timerDuration") {
    setWorkoutTimerDuration(target.value);
  }

  const exerciseCard = target.closest(".exercise-card");
  if (exerciseCard && target.dataset.field) {
    const exercise = draftWorkout.exercises.find(ex => ex.id === exerciseCard.dataset.exerciseId);
    const setRow = target.closest(".set-row");
    const set = exercise?.sets[Number(setRow.dataset.setIndex)];
	    if (set) {
	      set[target.dataset.field] = number(target.value);
	      updateExerciseVolume(exercise);
	      updateWorkoutChart();
	    }
	  }

	  if (target.dataset.exerciseNote) {
	    const exercise = draftWorkout.exercises.find(ex => ex.id === target.dataset.exerciseNote);
	    if (exercise) {
	      exercise.userNote = target.value;
	    }
	  }

	  if (target.dataset.mealQty) {
	    const item = mealsForDate().find(row => row.id === target.dataset.mealQty);
	    if (item) item.qty = number(target.value);
	    renderDashboard();
	    updateNutritionChart();
	  }

  if (target.dataset.editDiary) {
    const entry = state.diary.find(item => item.id === target.dataset.editDiary);
	    if (entry) {
	      entry.text = target.value;
	      entry.tags = extractTags(target.value);
	      entry.updatedAt = new Date().toISOString();
	    }
	  }

  const foodRow = target.closest("[data-food-row]");
  if (foodRow && target.dataset.foodField) {
    const food = foodById(foodRow.dataset.foodRow);
	    if (food) {
	      const field = target.dataset.foodField;
	      food[field] = ["kcal", "protein", "carbs", "fat"].includes(field) ? number(target.value) : target.value;
	    }
	  }

  syncComboTarget(target);

	  if (target.dataset.setting) {
	    state.settings[target.dataset.setting] = number(target.value);
	    renderDashboard();
	  }

  if (target.id === "bodyDate" || target.dataset.bodyField) {
    const date = document.getElementById("bodyDate")?.value || bodyMetricDate;
    bodyMetricDate = date;
    const existing = bodyMetricForDate(date) || { id: uid(), date, weight: 0, waist: 0, energy: 0, note: "" };
    if (target.dataset.bodyField) {
      const field = target.dataset.bodyField;
      existing[field] = field === "note" ? target.value : number(target.value, 0);
    }
	    existing.date = date;
	    upsertBodyMetric(existing);
	    renderCharts();
	  }

  const relationshipCard = target.closest("[data-relationship-id]");
  if (relationshipCard && target.dataset.relationshipField) {
    const person = state.relationships.find(item => item.id === relationshipCard.dataset.relationshipId);
    if (person) {
      const field = target.dataset.relationshipField;
      person[field] = ["contactFrequencyDays", "reminderDaysBefore"].includes(field) ? number(target.value, field === "contactFrequencyDays" ? 30 : 7) : target.value;
    }
  }

  if (target.id === "chartExercise") {
    document.getElementById("workoutChart").innerHTML = renderWorkoutChart(target.value);
  }
  if (target.id === "investmentTradeAsset" || target.id === "investmentTradeSellAll") updateInvestmentTradeComputedAmount();

  if (target.id === "investmentTradeQuantity" || target.id === "investmentTradePrice") updateInvestmentTradeComputedAmount();

  if (target.id === "memoryApiUrl") {
    memoryApiConfig.url = target.value.trim();
    saveMemoryApiConfig();
    memoryApiSync.connected = false;
    memoryApiSync.message = memoryApiConfig.url ? "URL server memoria aggiornato." : "";
  }
});

document.addEventListener("change", event => {
  const target = event.target;
  if (target.id === "todoList") selectedTodoListId = target.value;
  syncComboTarget(target);
  if (target.dataset.mealQty) render();
  if (target.dataset.editDiary) renderDiary();
  if (target.id === "comboName" || target.id === "comboMeal" || target.dataset.comboFood !== undefined || target.dataset.comboQty !== undefined) {
    renderNutrition();
  }
  if (target.dataset.bodyField || target.id === "bodyDate") renderData();
  if (target.id === "chartExercise") {
    document.getElementById("workoutChart").innerHTML = renderWorkoutChart(target.value);
  }
  if (target.id === "importBackup" && target.files?.[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        applyImportedState(JSON.parse(reader.result));
        toast("Backup importato");
      } catch {
        toast("Backup non valido");
      }
    };
    reader.readAsText(target.files[0]);
  }
});

window.addEventListener("online", () => {
  scheduleSmartCloudSync("online", { force: true, delay: 250 });
});

window.addEventListener("focus", () => {
  scheduleSmartCloudSync("focus");
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") scheduleSmartCloudSync("visible");
});

document.addEventListener("resume", () => {
  scheduleSmartCloudSync("resume", { force: true, delay: 250 });
});

window.setInterval(() => {
  if (document.visibilityState !== "hidden") scheduleSmartCloudSync("interval");
}, CLOUD_AUTO_SYNC_INTERVAL);

function syncComboTarget(target) {
  if (target.id === "comboName") comboDraft.name = target.value;
  if (target.id === "comboMeal") comboDraft.meal = target.value;
  if (target.dataset.comboFood !== undefined) {
    const item = comboDraft.items[Number(target.dataset.comboFood)];
    if (item) item.foodId = target.value;
  }
  if (target.dataset.comboQty !== undefined) {
    const item = comboDraft.items[Number(target.dataset.comboQty)];
    if (item) item.qty = number(target.value);
  }
}

function updateExerciseVolume(exercise) {
  const pill = document.querySelector(`[data-volume-for="${exercise.id}"] strong`);
  if (pill) pill.textContent = exerciseVolumeLabel(exercise);
}

function updateWorkoutChart() {
  const select = document.getElementById("chartExercise");
  const chart = document.getElementById("workoutChart");
  if (select && chart) chart.innerHTML = renderWorkoutChart(select.value);
  const history = document.getElementById("workoutHistory");
  if (history) history.innerHTML = renderWorkoutHistory();
}

function updateNutritionChart() {
  const chart = document.getElementById("nutritionTrendChart");
  if (chart) chart.innerHTML = renderNutritionTrendChart();
}

async function enableRelationshipNotifications() {
  if (!("Notification" in window)) {
    toast("Notifiche non supportate qui");
    return;
  }
  let permission = Notification.permission;
  if (permission === "default") permission = await Notification.requestPermission();
  if (permission !== "granted") {
    toast("Permesso notifiche non attivato");
    return;
  }
  const reminders = allRelationshipReminders();
  if (!reminders.length) {
    toast("Nessun promemoria attivo");
    return;
  }
  reminders.slice(0, 4).forEach(item => {
    const note = notesPreview(item.person.notes);
    new Notification("Life Tracker", {
      body: note ? `${item.message} Note: ${note}` : item.message,
    });
  });
  toast("Notifiche inviate per i promemoria attivi");
}

ensureDomShell();
clearLegacyCaches();
render();
initSupabase().catch(error => {
  cloudSync.ready = false;
  cloudSync.message = error?.message || "Supabase non inizializzato.";
  refreshDataPanel();
});
