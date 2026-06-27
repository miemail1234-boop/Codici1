(() => {
  'use strict';

  const DONE = 'data-strategy-ready';

  function txt(node) { return String(node && node.textContent ? node.textContent : '').trim(); }
  function low(value) { return String(value || '').toLowerCase(); }
  function has(text, words) { const t = low(text); return words.some(w => t.indexOf(w) !== -1); }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  function model(name, context) {
    const t = low(`${name} ${context || ''}`);
    let out = {
      profile: 'ETF diversificato', risk: 'Medio', weight: '3-5%',
      role: 'Satellite o componente di diversificazione.',
      entry: 'Entrare a scaglioni su drawdown reali, senza usare tutto il capitale subito.',
      plan: ['Primo ingresso piccolo', 'Secondo ingresso solo su ulteriore drawdown', 'Ridurre se il recupero porta il peso oltre il target'],
      rules: ['2-3 ingressi progressivi', 'Peso coerente con volatilità', 'Stop agli acquisti se la tesi peggiora'],
      exit: 'Ribilanciare se il peso diventa eccessivo o se cambia la tesi.'
    };
    if (has(t, ['nasdaq', 'tech'])) out = { profile:'Growth USA / tecnologia', risk:'Alta', weight:'20-30% massimo', role:'Motore di crescita, sensibile a tassi e valutazioni.', entry:'Scaglioni su -15%, -25%, -35%.', plan:['Accumulo solo su correzioni importanti','Usare nuovo cash su altri blocchi se il Nasdaq è già molto pesante','Non vendere per rumore di breve periodo'], rules:['Non inseguire i massimi','Aumentare solo su correzioni vere','Bilanciare con asset difensivi'], exit:'Ribilanciare se domina troppo il portafoglio.' };
    else if (has(t, ['berkshire'])) out = { profile:'Quality compounder', risk:'Media', weight:'10-15%', role:'Blocco quality difensivo di lungo periodo.', entry:'Scaglioni su -10%, -18%, -25%.', plan:['Accumulo graduale nei ribassi','Tenere come blocco quality pluriennale','Ribilanciare solo se supera il target'], rules:['Orizzonte pluriennale','Non valutare su pochi mesi','Usare come contrappeso quality'], exit:'Ridurre solo per peso eccessivo o tesi cambiata.' };
    else if (has(t, ['india'])) out = { profile:'Emergente growth', risk:'Alta', weight:'5-8%', role:'Satellite strutturale ad alta crescita.', entry:'Scaglioni su -15%, -25%, -35%.', plan:['Entrare solo su debolezza significativa','Tenere anche con volatilità forte','Non superare il peso target perché le valutazioni possono restare care'], rules:['Accettare volatilità','Non inseguire valutazioni care','Tenere peso controllato'], exit:'Ridurre se supera 8-10% o se peggiora la tesi.' };
    else if (has(t, ['indonesia', 'eido'])) out = { profile:'Paese emergente contrarian / mean reversion', risk:'Molto alta', weight:'1-2,5%', role:'BTD tattico/ciclico, non core e non buy-and-hold permanente.', entry:'Primo ingresso piccolo su drawdown estremo; altri ingressi solo se il prezzo scende ancora o se migliorano dati, valuta, governance e rischio indice.', plan:['Ingresso 1: 1.000-1.500 euro circa, solo come prova piccola','Ingresso 2: solo se scende ancora di un altro 15-20% e la tesi non peggiora','Ingresso 3: solo con segnali di stabilizzazione su MSCI/indice, rupiah, deflussi o governance','Uscita parziale: ridurre se recupera +30/+50% dal prezzo medio','Uscita forte: vendere o quasi se torna vicino ai vecchi massimi o se il peso supera 2,5-3%','Stop tesi: bloccare nuovi acquisti se arrivano downgrade MSCI, valuta in caduta o peggioramento governance'], rules:['Operazione ciclica, non investimento per sempre','Prepararsi a ulteriore -30%','Non superare peso massimo','Non confondere prezzo basso con qualità sicura'], exit:'Ridurre sul recupero/normalizzazione. Uscire o congelare se peggiorano accesso indice, valuta, liquidità o governance.' };
    else if (has(t, ['brazil', 'brasile'])) out = { profile:'Emergente ciclico', risk:'Molto alta', weight:'1-3%', role:'Satellite value/ciclico legato a valuta, politica e commodities.', entry:'Scaglioni su -20%, -25%, -35%.', plan:['Ingresso piccolo sul primo segnale BTD','Secondo scaglione solo su capitolazione','Ridurre dopo rimbalzo forte o euforia ciclica'], rules:['Mai posizione grande','Non mediare automaticamente','Tenere solo se premio/rischio resta buono'], exit:'Ribilanciare su forte rimbalzo o rischio politico eccessivo.' };
    else if (has(t, ['saudi', 'arabia'])) out = { profile:'Paese emergente/geopolitico', risk:'Alta', weight:'1-2,5%', role:'Satellite opportunistico.', entry:'Scaglioni su -15%, -25%, -35%.', plan:['Entrata piccola','Aggiunta solo su drawdown maggiore','Uscita/riduzione dopo normalizzazione o rischio geopolitico alto'], rules:['Peso basso','Monitorare petrolio e geopolitica','Non usarlo come core EM'], exit:'Ridurre se il rischio specifico aumenta.' };
    else if (has(t, ['bitcoin', 'ethereum', 'crypto', 'btc', 'eth'])) out = { profile:'Crypto / venture', risk:'Estrema', weight:'1-5% crypto totale', role:'Componente opzionale ad altissima volatilità.', entry:'Solo scaglioni molto ampi: -30%, -50%, -70%.', plan:['Entrare solo con capitale ad alta tolleranza al rischio','Ribilanciare su rally parabolici','Non aumentare se il peso crypto è già al limite'], rules:['Non mediare per abitudine','Evitare FOMO','Peso massimo rigido'], exit:'Ribilanciare su euforia o peso eccessivo.' };
    else if (has(t, ['gold', 'oro'])) out = { profile:'Oro / copertura', risk:'Media', weight:'5-10%', role:'Assicurazione di portafoglio, non motore di rendimento.', entry:'Aumentare su debolezza o per bilanciare rischio azionario.', plan:['Tenere come assicurazione','Non inseguire rialzi verticali','Ribilanciare quando pesa troppo'], rules:['Non inseguire spike','Peso stabile','Funzione difensiva'], exit:'Ribilanciare oltre 10-12%.' };
    else if (has(t, ['healthcare'])) out = { profile:'Settore difensivo quality', risk:'Media', weight:'5-8%', role:'Diversificatore rispetto a tech e ciclici.', entry:'Scaglioni su -10%, -18%, -25%.', plan:['Accumulo su debolezza settoriale','Tenere come diversificatore','Ridurre se diventa troppo grande'], rules:['Comprare debolezza di settore','Non sovrappesare troppo','Tenere orizzonte lungo'], exit:'Ridurre se troppo caro o troppo pesante.' };
    else if (has(t, ['minimum volatility', 'min vol'])) out = { profile:'Globale difensivo', risk:'Medio-bassa', weight:'10-20%', role:'Core difensivo per ridurre volatilità.', entry:'Accumulo graduale anche su drawdown moderati.', plan:['Usare come stabilizzatore','Aumentare quando il portafoglio è troppo aggressivo','Non venderlo solo perché sottoperforma in bull market'], rules:['Accettare minor spinta nei bull market','Stabilizzatore','Non venderlo perché sale meno'], exit:'Ridurre se portafoglio troppo difensivo.' };
    else if (has(t, ['world', 'acwi', 'all-world', 'occidente', 'ex-usa'])) out = { profile:'Core globale', risk:'Media', weight:'20-50%', role:'Blocco centrale diversificato.', entry:'Accumulo regolare o su -10%, -20%, -30%.', plan:['Accumulo periodico o su ribassi','Priorità rispetto a satelliti rischiosi','Vendere raramente'], rules:['Priorità sui satelliti','Riduce concentrazione','Orizzonte lungo'], exit:'Vendere raramente, solo ribilanciamento.' };
    else if (has(t, ['japan', 'giappone', 'eunn'])) out = { profile:'Paese sviluppato', risk:'Media', weight:'3-6%', role:'Satellite geografico sviluppato.', entry:'Scaglioni su -12%, -20%, -30%.', plan:['Entrata su drawdown moderato/ampio','Monitorare yen e riforme corporate','Ridurre dopo forte recupero'], rules:['Monitorare yen','Peso moderato','Diversificazione'], exit:'Ribilanciare su forte recupero.' };
    else if (has(t, ['small cap', 'ftse 250', 'xxsc'])) out = { profile:'Small cap Europa/UK', risk:'Alta', weight:'2-5%', role:'Satellite ciclico di lungo periodo.', entry:'Scaglioni su -20%, -30%, -40%.', plan:['Entrare solo su drawdown profondo','Avere pazienza 3-5 anni','Ridurre dopo normalizzazione ciclica'], rules:['Serve pazienza','Non comprare rimbalzi piccoli','Peso contenuto'], exit:'Ridurre dopo normalizzazione forte.' };
    else if (has(t, ['dax', 'germany', 'germania', 'cac', 'france', 'ibex', 'smi', 'switzerland'])) out = { profile:'Europa sviluppata', risk:'Media', weight:'3-8%', role:'Diversificazione geografica e value/ciclica.', entry:'Scaglioni su -12%, -20%, -30%.', plan:['Entrare su pessimismo macro','Tenere come diversificazione','Ridurre dopo recupero ampio'], rules:['Comprare pessimismo macro','Non concentrare troppo Europa','Tenere lungo periodo'], exit:'Ribilanciare su recupero ampio.' };
    return out;
  }

  function modal() {
    let m = document.getElementById('strategyModal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'strategyModal';
    m.style.cssText = 'position:fixed;inset:0;z-index:9999;display:none;background:rgba(0,0,0,.62);padding:16px;overflow:auto;';
    m.innerHTML = '<div style="max-width:760px;margin:40px auto;background:#162331;border:1px solid rgba(255,255,255,.14);border-radius:22px;padding:18px;color:#eef6ff"><div style="display:flex;justify-content:space-between;gap:12px"><h2 id="strategyTitle" style="margin:0 0 8px">Strategia</h2><button class="btn" type="button" id="strategyClose">Chiudi</button></div><div id="strategyBody"></div></div>';
    document.body.appendChild(m);
    document.getElementById('strategyClose').onclick = () => { m.style.display = 'none'; };
    m.onclick = e => { if (e.target === m) m.style.display = 'none'; };
    return m;
  }

  function open(name, context) {
    const s = model(name, context);
    const m = modal();
    document.getElementById('strategyTitle').textContent = `Strategia: ${name}`;
    document.getElementById('strategyBody').innerHTML = `<div class="metrics"><span class="pill">Profilo: ${esc(s.profile)}</span><span class="pill">Rischio: ${esc(s.risk)}</span><span class="pill">Peso: ${esc(s.weight)}</span></div><div class="asset"><h3>Ruolo</h3><p>${esc(s.role)}</p></div><div class="asset"><h3>Ingresso</h3><p>${esc(s.entry)}</p></div><div class="asset"><h3>Piano pratico</h3><ul>${s.plan.map(r => `<li>${esc(r)}</li>`).join('')}</ul></div><div class="asset"><h3>Regole</h3><ul>${s.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ul></div><div class="asset"><h3>Riduzione / stop</h3><p>${esc(s.exit)}</p></div><p class="small">Schema operativo per il tracker: verifica sempre peso complessivo, volatilità, valuta, liquidità e coerenza col portafoglio.</p>`;
    m.style.display = 'block';
  }

  function addBtn(parent, name, context) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn primary';
    b.textContent = 'Strategia';
    b.setAttribute('data-strategy-name', name);
    b.setAttribute('data-strategy-context', context || '');
    parent.appendChild(b);
  }

  function patchPositions() {
    const cards = document.querySelectorAll('#positions .asset');
    for (let i = 0; i < cards.length; i += 1) {
      const c = cards[i];
      if (c.getAttribute(DONE) === '1') continue;
      const name = txt(c.getElementsByTagName('h3')[0]) || 'Posizione';
      const actions = c.querySelector('.asset-head .actions') || c;
      addBtn(actions, name, txt(c));
      c.setAttribute(DONE, '1');
    }
  }

  function patchBtd() {
    const rows = document.querySelectorAll('#etfDrawdownTable .etf-row');
    for (let i = 0; i < rows.length; i += 1) {
      const r = rows[i];
      if (r.getAttribute(DONE) === '1') continue;
      const n = txt(r.querySelector('.etf-name strong')) || 'Asset BTD';
      addBtn(r.querySelector('.etf-main') || r, n, txt(r));
      r.setAttribute(DONE, '1');
    }
  }

  function apply() { patchPositions(); patchBtd(); }

  document.addEventListener('click', e => {
    const t = e.target;
    if (!t || !t.getAttribute) return;
    const name = t.getAttribute('data-strategy-name');
    if (!name) return;
    e.preventDefault();
    e.stopPropagation();
    open(name, t.getAttribute('data-strategy-context') || '');
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
  else apply();

  setInterval(apply, 1200);
})();
