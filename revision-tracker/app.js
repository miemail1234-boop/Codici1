const SUPABASE_URL = 'https://kujyowhezihjambhpahe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VBzZaA3NAIvqMxJcZZTwPg_4_GEi1a3';
var supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
var cloudUser = null;
var currentScreen = 'revisions';
let revisionScriptsLoaded = false;

const $ = id => document.getElementById(id);

function toast(message) {
  const node = $('toast');
  node.textContent = message;
  node.classList.add('show');
  setTimeout(() => node.classList.remove('show'), 2400);
}

function setAuthStatus(message) {
  $('authStatus').textContent = message;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Impossibile caricare ${src}`));
    document.body.appendChild(script);
  });
}

async function loadRevisionScripts() {
  if (revisionScriptsLoaded) return;
  await loadScript('revision_review_patch.js?v=2');
  await loadScript('revision_atlas_selection_fix.js?v=1');
  await loadScript('revision_editor_patch.js?v=1');
  await loadScript('revision_history_patch.js?v=1');
  await loadScript('revision_pdf_patch.js?v=1');
  revisionScriptsLoaded = true;
}

async function showSession(session) {
  cloudUser = session?.user || null;
  const signedIn = Boolean(cloudUser);
  $('authPanel').hidden = signedIn;
  $('screen-revisions').classList.toggle('locked', !signedIn);
  $('signOutBtn').hidden = !signedIn;
  $('userLabel').textContent = signedIn ? cloudUser.email || 'Account attivo' : '';
  if (signedIn) {
    await loadRevisionScripts();
    window.dispatchEvent(new Event('load'));
  }
}

async function initializeAuth() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) setAuthStatus(error.message);
  await showSession(data?.session || null);
  if (!data?.session) setAuthStatus('Inserisci le credenziali oppure richiedi un link magico.');
  supabaseClient.auth.onAuthStateChange((_event, session) => showSession(session));
}

$('loginBtn').addEventListener('click', async () => {
  const email = $('emailInput').value.trim();
  const password = $('passwordInput').value;
  if (!email || !password) return setAuthStatus('Inserisci email e password.');
  setAuthStatus('Accesso in corso...');
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) setAuthStatus(error.message);
});

$('magicBtn').addEventListener('click', async () => {
  const email = $('emailInput').value.trim();
  if (!email) return setAuthStatus('Inserisci la tua email.');
  setAuthStatus('Invio del link...');
  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href.split('#')[0] },
  });
  setAuthStatus(error ? error.message : 'Link inviato. Controlla la posta elettronica.');
});

$('signOutBtn').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  location.reload();
});

initializeAuth().catch(error => setAuthStatus(error.message));
