# Brain Mapping

Documento progressivo di apprendimento sul brain mapping, costruito per passare dalle basi elettrofisiologiche alla comprensione autonoma degli esperimenti di stimolazione e registrazione intraoperatoria.

## Obiettivo generale

Sviluppare competenza nell'individualized multimodal brain mapping applicato alla neuro-oncologia, integrando progressivamente:

- elettrofisiologia intraoperatoria;
- ECoG;
- SCEP/CCEP e potenziali evocati;
- stimolazione corticale e sottocorticale;
- anatomia e tractography patient-specific;
- lesion e disconnection mapping;
- neuropsicologia e outcome;
- analisi quantitativa e modellistica statistica.

## Obiettivo immediato

Nel prossimo mese la priorità è comprendere in profondità l'esperimento SCEP e riuscire a discutere criticamente i dati.

Il percorso non segue l'ordine in cui gli argomenti emergono nelle riunioni. Segue invece una costruzione a strati:

**elettrofisiologia di base → segnale ECoG → stimolazione → reclutamento delle fibre → anatomia funzionale → potenziali evocati → metodologia sperimentale → analisi trial-level → inferenza fisiologica**

## Catena completa da padroneggiare

**parametri impostati → stimolo realmente erogato → campo elettrico → popolazione di fibre reclutata → propagazione → risposta ECoG → preprocessing → misura quantitativa → inferenza fisiologica**

L'obiettivo finale è essere in grado di identificare, per ogni passaggio, cosa è noto, cosa è misurato, cosa è inferito e quali possibili artefatti o confondenti possono intervenire.

---

# LIVELLO 1 — Fondamenti neurofisiologici

## 1. Fondamenti di neurofisiologia elettrica

### Da comprendere
- potenziale di membrana;
- potenziale d'azione;
- depolarizzazione e iperpolarizzazione;
- soglia;
- periodi refrattari;
- propagazione assonale;
- mielina;
- nodi di Ranvier.

### Obiettivo
Distinguere l'attività elettrica del singolo neurone dai potenziali di campo prodotti da popolazioni neuronali.

### Stato
- [ ] Da studiare

---

## 2. Come nasce un segnale ECoG

### Da comprendere
- cosa misura fisicamente un elettrodo sulla superficie corticale;
- ECoG vs EEG;
- ECoG vs LFP;
- registrazione intracellulare vs extracellulare;
- sorgenti e sink di corrente;
- sommazione spaziale e temporale;
- riferimento elettrico;
- common average reference;
- derivazioni bipolari;
- impedenza;
- sampling rate;
- filtri;
- rumore.

### Domanda di padronanza
**Che cosa rappresenta fisicamente una deflessione osservata nella traccia ECoG?**

### Stato
- [ ] Da studiare

---

## 3. Stimolazione elettrica del tessuto nervoso

### Da comprendere
- distribuzione del campo elettrico;
- polarizzazione della membrana;
- soglia di attivazione;
- generazione del potenziale d'azione;
- propagazione della risposta;
- reclutamento preferenziale degli assoni.

### Punto chiave
La stimolazione elettrica non equivale semplicemente ad "attivare la corteccia sotto l'elettrodo". Gli assoni possono essere elementi particolarmente eccitabili.

### Stato
- [ ] Da studiare

---

## 4. Parametri fondamentali dello stimolo

### Da padroneggiare
- intensità della corrente;
- pulse width;
- frequenza;
- intervallo interstimolo;
- numero di impulsi;
- stimolazione monofasica vs bifasica;
- polarità.

### Obiettivo
Essere in grado di leggere un protocollo e ricostruire esattamente quale stimolo elettrico è stato erogato.

### Stato
- [ ] Da studiare

---

## 5. Carica elettrica e charge density

### Concetto fondamentale

**Q = I × t**

dove:
- Q = carica;
- I = corrente;
- t = durata dell'impulso.

### Da comprendere
- charge per phase;
- charge density;
- energia;
- relazione tra efficacia e sicurezza;
- perché la stessa carica non implica necessariamente lo stesso effetto fisiologico.

### Stato
- [ ] Da studiare

---

## 6. Strength–duration relationship

### Da comprendere
- curva intensità-durata;
- rheobase;
- chronaxie;
- relazione tra pulse width e soglia di attivazione.

### Obiettivo
Capire perché stimoli da 250 μs, 500 μs e 800 μs non possono essere confrontati guardando soltanto l'intensità in mA.

### Stato
- [ ] Da studiare

---

## 7. Quali fibre vengono reclutate

### Variabili rilevanti
- diametro assonale;
- mielinizzazione;
- orientamento rispetto al campo elettrico;
- distanza dall'elettrodo;
- geometria del fascio;
- posizione relativa rispetto a catodo/anodo.

### Domanda di padronanza
**Perché lo stesso stimolo elettrico applicato in due regioni differenti non rappresenta necessariamente lo stesso input fisiologico?**

### Stato
- [ ] Da studiare

---

## 8. Volume di tessuto attivato e geometria della stimolazione

### Da comprendere
- forma dell'elettrodo;
- dimensione dell'elettrodo;
- distanza elettrodo-tessuto;
- conduttività;
- anisotropia della sostanza bianca;
- geometria del campo elettrico;
- current spread;
- focalità.

### Stato
- [ ] Da studiare

---

# LIVELLO 2 — Dal tessuto stimolato alla risposta evocata

## 9. Stimolazione corticale vs sottocorticale

### Da comprendere
- direct cortical stimulation;
- subcortical stimulation;
- elementi neurali prevalentemente reclutati;
- uso nel mapping intraoperatorio;
- differenze interpretative tra sito corticale e sottocorticale;
- inferenze anatomiche legittime e non legittime.

### Stato
- [ ] Da studiare

---

## 10. Potenziali evocati cortico-corticali e subcortico-corticali

### Da comprendere
- principio "stimolo in A → registro in B";
- CCEP;
- SCEP;
- latenza;
- ampiezza;
- morfologia;
- averaging;
- variabilità trial-to-trial;
- componenti precoci;
- componenti tardive.

### Obiettivo
Comprendere cosa significa confrontare potenziali ottenuti con parametri di stimolazione differenti.

### Stato
- [ ] Da studiare

---

## 11. Connettività anatomica vs connettività funzionale ed eccitabilità

### Distinzioni fondamentali
Una risposta evocata non dimostra automaticamente che:

- esiste una connessione anatomica monosynaptica;
- la risposta percorre un singolo fascio;
- la connessione osservata è fisiologicamente attiva nelle normali condizioni;
- ampiezza del potenziale = "forza" della connessione.

### Da distinguere
- anatomia;
- eccitabilità;
- reclutamento elettrico;
- propagazione;
- risposta del target;
- funzione.

### Stato
- [ ] Da studiare

---

## 12. Disconnessione, resezione e degenerazione assonale

### Da comprendere
- disconnessione funzionale immediata;
- persistenza temporanea dell'eccitabilità assonale;
- degenerazione walleriana;
- dinamica temporale della degenerazione;
- circuito fisiologicamente funzionante vs assone ancora eccitabile.

### Punto chiave
**"L'assone è ancora elettricamente eccitabile" non equivale a "l'assone appartiene ancora a un circuito fisiologicamente funzionante".**

### Stato
- [ ] Da studiare

---

## 13. Interpretazione della stimolazione durante la resezione

### Domanda centrale
**Che cosa dimostra una risposta ottenuta stimolando una struttura dopo che parte del circuito è stata resecata?**

### Obiettivo
Separare:
- osservazione sperimentale;
- inferenza anatomica;
- inferenza fisiologica;
- inferenza funzionale;
- interpretazioni alternative.

### Stato
- [ ] Da studiare

---

# LIVELLO 3 — Disegno e analisi dell'esperimento SCEP

## 14. Dose–response elettrofisiologica

### Da analizzare
Relazione tra:
- intensità;
- pulse width;
- carica;
- ampiezza della risposta;
- latenza;
- probabilità di risposta;
- morfologia.

### Obiettivo
Trasformare il confronto 250–500–800 μs da confronto descrittivo a vero esperimento dose–response.

### Stato
- [ ] Da studiare

---

## 15. Sincronizzazione e dispersione temporale

### Da comprendere
- conduction velocity;
- temporal dispersion;
- sincronizzazione della popolazione assonale;
- jitter;
- allargamento della waveform;
- variazioni della morfologia.

### Domanda di padronanza
Se aumentando la pulse width il potenziale diventa più largo o meno sincronizzato, quali meccanismi potrebbero spiegarlo e quali interpretazioni alternative esistono?

### Stato
- [ ] Da studiare

---

## 16. Variabilità trial-to-trial

### Misure da conoscere
Su circa 20 trial o più:
- media;
- mediana;
- varianza;
- reliability;
- probabilità di risposta;
- jitter della latenza;
- distribuzione delle ampiezze;
- SNR;
- outlier.

### Punto chiave
Non basta confrontare due waveform medie.

### Stato
- [ ] Da studiare

---

## 17. Artefatto di stimolazione

### Da comprendere
- artefatto diretto dello stimolatore;
- saturazione dell'amplificatore;
- recovery;
- blanking;
- interpolation;
- ringing;
- filtering artifacts;
- distorsioni introdotte dal preprocessing.

### Domanda di padronanza
**La differenza osservata fra 250 e 800 μs è fisiologica o potrebbe essere almeno in parte strumentale?**

### Stato
- [ ] Da studiare

---

## 18. Timing reale degli stimoli

### Da comprendere
- trigger;
- timestamp;
- sampling;
- sample index;
- jitter;
- frequenza nominale vs frequenza effettiva;
- intervallo interstimolo reale.

### Punto chiave
Un valore impostato come 1,1 Hz non deve essere assunto automaticamente come il timing realmente presente nei dati.

### Stato
- [ ] Da studiare

---

## 19. Sincronizzazione stimolatore–ECoG

### Da comprendere
- trigger hardware;
- trigger software;
- event markers;
- sample index;
- clock differenti;
- drift;
- latenza di trasmissione del trigger.

### Obiettivo
Per ogni trial poter affermare:

**questo impulso, con questi parametri, è avvenuto esattamente in questo punto della registrazione.**

### Stato
- [ ] Da studiare

---

## 20. Metadati della macchina e raw data

### Da distinguere
- parametro visualizzato nell'interfaccia;
- parametro impostato;
- parametro annotato manualmente;
- parametro realmente salvato;
- stimolo effettivamente erogato.

### Da conoscere
- formati proprietari;
- header;
- metadata;
- log degli eventi;
- identificatori;
- struttura dei file.

### Stato
- [ ] Da studiare

---

## 21. Validazione della pipeline

### Requisiti
Uno script che estrae automaticamente parametri e trial deve essere verificato.

### Controlli
- associazione uno-a-uno stimolo/trial;
- confronto con raw data;
- confronto con log originali;
- missing values;
- mismatch;
- duplicati;
- anomalie temporali;
- validazione manuale su un sottocampione.

### Stato
- [ ] Da studiare

---

# LIVELLO 4 — Dataset e inferenza quantitativa

## 22. Dataset finale trial-level

### Unità fondamentale
**Una riga = uno stimolo/trial.**

### Variabili minime
- paziente;
- sessione;
- sito di stimolazione;
- coordinate del sito;
- sede di registrazione;
- contatto;
- timestamp;
- sample index;
- intensità;
- pulse width;
- frequenza/intervallo precedente;
- polarità/forma dell'impulso;
- numero di impulso;
- caratteristiche anatomiche pertinenti;
- qualità del trial;
- ampiezza della risposta;
- latenza;
- morfologia;
- presenza/assenza della risposta;
- eventuali outcome fisiologici o clinici.

### Stato
- [ ] Da costruire

---

## 23. Statistica del problema

### Struttura dei dati
I trial non sono indipendenti:

**trial → sito → paziente**

Quindi 1.000 stimoli non equivalgono a 1.000 osservazioni indipendenti.

### Da comprendere
- repeated measures;
- dati gerarchici;
- pseudoreplication;
- mixed-effects models;
- random intercept;
- random slope;
- curve dose–response;
- covariate tecniche;
- covariate anatomiche;
- interazioni;
- controllo della variabilità tra pazienti.

### Stato
- [ ] Da studiare

---

# Parametri sperimentali del nostro setup

Questa sezione verrà compilata progressivamente sulla base del protocollo reale.

- **Sistema di registrazione:** da identificare
- **Sampling rate:** da identificare
- **Grid:** da identificare
- **Reference:** da identificare
- **Intensità di stimolazione ACEP:** partenza da 20 mA, progressiva riduzione fino alla response threshold
- **Response threshold ACEP:** 2–5 mA
- **Pulse width:** 0,5 ms
- **Stimolo mono/bifasico:** da identificare
- **Frequenza/intervallo interstimolo:** 1,1 Hz
- **Numero di trial:** da identificare
- **Trigger/event marker:** da identificare
- **Formato raw:** da identificare
- **Filtri online:** da identificare
- **Gestione artifact:** da identificare

---

# Metodo di studio

Procedere **un concetto alla volta**.

Per ogni argomento:

1. definizione;
2. meccanismo fisiologico/fisico;
3. esempio semplice;
4. applicazione diretta al nostro esperimento;
5. errore interpretativo tipico;
6. domanda di verifica;
7. solo dopo, passaggio all'argomento successivo.

Un argomento viene considerato acquisito quando è possibile spiegarlo senza appunti e applicarlo correttamente a un caso reale.

---

# Criteri finali di padronanza SCEP

Davanti a una waveform o a un risultato sperimentale, essere in grado di rispondere autonomamente:

1. **Che cosa sto misurando?**
2. **Come è stato generato fisicamente il segnale?**
3. **Quale popolazione neurale potrebbe essere stata reclutata?**
4. **Come è stato acquisito il dato?**
5. **Quali preprocessing sono stati applicati?**
6. **Quali artefatti potrebbero spiegare il risultato?**
7. **La differenza osservata è fisiologica, strumentale o entrambe?**
8. **Quali variabili confondenti esistono?**
9. **Quale conclusione fisiologica è supportata?**
10. **Quale conclusione sarebbe invece eccessiva?**

---

# Sviluppi successivi

Dopo aver consolidato gli SCEP:

1. localizzazione anatomica di grid e siti di stimolazione;
2. MRI coregistration;
3. tractography patient-specific;
4. CCEP ed ECoG avanzata;
5. lesion-symptom mapping;
6. disconnection mapping;
7. integrazione multimodale con neuropsicologia e outcome clinici.

---

# Diario di apprendimento

Questa sezione verrà aggiornata con i concetti effettivamente acquisiti, dubbi emersi, errori corretti e collegamenti con i dati reali.

## Punto di partenza

Priorità attuale: **Livello 1, punto 1 — Fondamenti di neurofisiologia elettrica.**

# Congresso ISIN 2026 — Master checklist: 148 domande

## Obiettivo

Per considerare completa la preparazione congressuale, devo essere in grado di rispondere a tutte le 148 domande seguenti a tre livelli:

- **30 secondi:** risposta congressuale chiara e precisa;
- **2 minuti:** spiegazione tecnica;
- **controdomanda:** capacità di difendere limiti, alternative e dettagli del setup.

### Legenda delle fonti

- **[A1]** Abstract ISIN 2026 su hand-object manipulation.
- **[A2]** Abstract ISIN 2026 su visuospatial attention: lavoro da presentare.
- **[PROTO]** Informazione fornita direttamente sul protocollo corrente.
- **[G1]** Puglisi et al., 2026, *Nature Communications*, “Convergent causal mapping unravels distinct frontal networks for visuospatial selective attention”.
- **[G2]** Viganò et al., 2022, *Brain*, “Stimulation of frontal pathways disrupts hand muscle control during object manipulation”.
- **[G3]** Fornia et al., 2022, *NeuroImage*, “Motor impairment evoked by direct electrical stimulation of human parietal cortex during object manipulation”.
- **[G4]** Fornia et al., 2020, *Cerebral Cortex*, “Direct Electrical Stimulation of Premotor Areas: Different Effects on Hand Muscle Activity during Object Manipulation”.
- **[G5]** Fornia, Puglisi et al., 2020, *Nature Communications*, “Direct electrical stimulation of the premotor cortex shuts down awareness of voluntary actions”.
- **[G6]** Puglisi et al., 2019, *Brain*, right frontal white-matter pathways and executive function.
- **[G7]** Rossi et al., 2019, *Journal of Neurosurgery*, praxis circuit / hand manipulation mapping.
- **[G8]** Viganò et al., 2022, *Frontiers in Oncology*, transcranial vs direct electrical stimulation for intraoperative MEP monitoring.
- **[G9]** Viganò et al., 2019, *Cortex*, human hand-knob electrophysiology.

### Legenda dello stato

- **✅** risposta già sostenuta direttamente dal nostro materiale;
- **⚠️** risposta parziale: il principio è chiaro ma il dettaglio del setup ACEP corrente va verificato;
- **📚** tema teorico non documentato in modo sufficiente nel corpus del gruppo: da integrare con letteratura generale.

---

## A. Fondamenti ACEP e significato fisiologico

### 1. Che cos'è un axono-cortical evoked potential?
**Risposta:** È una risposta corticale time-locked evocata stimolando elettricamente un sito sottocorticale di sostanza bianca. Nel nostro studio lo stimolo viene applicato a siti iVSAT-positivi e la risposta viene registrata con uno strip sul superior frontal gyrus/lateral pre-SMA. Non è “il segnale del fascio”, ma una risposta corticale evocata dal reclutamento elettrico di fibre sottocorticali. **Stato: ✅ [A2].**

### 2. Che cosa stiamo misurando fisicamente con l'elettrodo corticale?
**Risposta:** Una differenza di potenziale extracellulare generata dall'attività sincronizzata di popolazioni neuronali corticali e dipendente dal riferimento di registrazione. Il corpus del gruppo descrive l'ECoG intraoperatorio, ma non sviluppa in dettaglio la biogenesi dei field potentials. **Stato: 📚; setup ECoG storico in [G4, G5].**

### 3. Perché stimolando sostanza bianca posso ottenere una risposta corticale distante?
**Risposta:** L'interpretazione del paradigma è che lo stimolo recluti fibre assonali vicine al probe e che l'attività propagata raggiunga la corteccia connessa, generando una risposta registrabile. Il meccanismo bi-fisico dell'attivazione extracellulare dell'assone va approfondito con letteratura generale. **Stato: ✅ per il paradigma [A1, A2], 📚 per il meccanismo.**

### 4. Perché si parla di “axono-cortical” e non semplicemente di “subcortico-cortical”?
**Risposta:** Il termine enfatizza che l'elemento eccitabile bersaglio della stimolazione sottocorticale è interpretato come assonale e che la risposta viene registrata corticalmente. Il nome è quindi fisiologico, non solo anatomico. **Stato: ✅ [A1, A2], con meccanismo da approfondire.**

### 5. Un ACEP dimostra che due regioni sono anatomicamente connesse?
**Risposta:** Supporta una relazione di connettività tra sito stimolato e corteccia registrata, soprattutto se la risposta è riproducibile, breve-latenza e topograficamente specifica. Da solo non identifica con certezza un singolo fascio né la precisa architettura anatomica attraversata. **Stato: ✅ come interpretazione prudente [A2, G1].**

### 6. Un ACEP dimostra una connessione monosynaptica?
**Risposta:** No. Una latenza breve è compatibile con propagazione rapida, ma non dimostra da sola che non esistano sinapsi intermedie o più vie coinvolte. **Stato: 📚; non dimostrato dal corpus del gruppo.**

### 7. Cosa significa che la risposta è “task-independent”?
**Risposta:** Dopo che il sito funzionale è stato identificato con il compito comportamentale, l'ACEP può essere evocato e registrato senza richiedere che il paziente continui a eseguire il task durante ogni stimolo. **Stato: ✅ [A1, A2].**

### 8. Qual è il vantaggio potenziale rispetto al solo behavioural mapping?
**Risposta:** Fornisce un marker elettrofisiologico riproducibile della relazione tra sito sottocorticale e target corticale, complementare alla risposta comportamentale e potenzialmente utilizzabile quando la performance attiva del paziente non è disponibile. **Stato: ✅ [A1, A2].**

### 9. Perché gli ACEP potrebbero essere utili in asleep surgery?
**Risposta:** Perché non richiedono necessariamente una risposta comportamentale attiva durante l'acquisizione; l'abstract propone esplicitamente la futura applicazione in procedure asleep. Questa applicazione non è ancora validata nel campione presentato. **Stato: ✅ [A1, A2].**

### 10. Qual è la differenza fra ACEP/SCEP e CCEP?
**Risposta:** Nel paradigma ACEP/SCEP si stimola la sostanza bianca e si registra dalla corteccia; nei CCEP si stimola un sito corticale e si registra una risposta in un altro sito corticale. Il confronto sistematico richiede letteratura generale specifica. **Stato: 📚.**

---

## B. Stimolatore, probe e waveform dello stimolo

### 11. Quale stimolatore utilizzate per generare gli ACEP?
**Risposta:** Non è specificato nell'abstract ACEP. Nei lavori precedenti del gruppo, la LF-DES usa un **OSIRIS-NeuroStimulator, Inomed, integrato nel sistema ISIS**, ma non va automaticamente assunto che sia lo stesso generatore ACEP. **Stato: ⚠️ [G3, G4].**

### 12. Lo stimolatore ACEP è constant-current o constant-voltage?
**Risposta:** Non è dichiarato nell'abstract. I protocolli LF-DES e HF-DES storici del gruppo sono descritti come **constant current**; per gli ACEP correnti va verificato direttamente sulla macchina/protocollo. **Stato: ⚠️ [G3, G4, G8].**

### 13. Quale elettrodo/probe viene usato per la stimolazione sottocorticale ACEP?
**Risposta:** L'abstract non specifica modello, diametro e geometria. L'iVSAT viene mappato con un probe bipolare con 5 mm di distanza inter-tip; nei lavori precedenti il probe LF-DES ha due ball tips da 2 mm separate di 5 mm. Verificare se lo stesso probe viene usato per ACEP. **Stato: ⚠️ [G1, G3, G4].**

### 14. La stimolazione ACEP è monopolare o bipolare?
**Risposta:** “Biphasic pulse” descrive la forma temporale dell'impulso, non la configurazione spaziale monopolar/bipolar. Il mapping iVSAT è bipolare, ma l'abstract ACEP non dice esplicitamente se il single-pulse ACEP sia erogato con la stessa configurazione. **Stato: ⚠️ [A2, G1].**

### 15. Cosa significa esattamente “biphasic pulse”?
**Risposta:** Un impulso composto da due fasi di polarità opposta. Nel corpus LF-DES del gruppo si parla esplicitamente di biphasic square-wave pulses; per ACEP sono riportati single biphasic pulses. **Stato: ✅ [A2, G3, G4].**

### 16. 0,5 ms significa 0,5 ms per fase o durata totale dell'impulso ACEP?
**Risposta:** L'abstract ACEP dice solo “pulse width 0.5 ms” e quindi è ambiguo. Nei protocolli LF-DES precedenti del gruppo è scritto esplicitamente **0.5 ms each phase**. Non trasferire questa informazione agli ACEP senza verifica. **Stato: ⚠️ [A2, G3, G4].**

### 17. Le due fasi sono simmetriche?
**Risposta:** Non documentato per il protocollo ACEP. “Biphasic” da solo non garantisce identica ampiezza e durata delle due fasi. **Stato: ⚠️.**

### 18. Qual è la polarità della prima fase?
**Risposta:** Non documentata nell'abstract o nei materiali ACEP disponibili. Va ricavata dalle impostazioni dello stimolatore o dal manuale della macchina. **Stato: ⚠️.**

### 19. Perché utilizzate impulsi bifasici?
**Risposta:** Il corpus descrive il loro uso ma non fornisce il razionale elettrochimico completo. Il razionale generale riguarda il bilanciamento della carica e la riduzione della polarizzazione netta all'interfaccia elettrodo-tessuto. **Stato: 📚.**

### 20. Perché è stata scelta una pulse width di 0,5 ms?
**Risposta:** È coerente con il paradigma di stimolazione intraoperatoria del gruppo, dove 0,5 ms è ricorrente in LF-DES e HF-DES. L'abstract ACEP non fornisce però una giustificazione specifica basata su strength-duration. **Stato: ⚠️ [G1, G3, G4, G8].**

### 21. Perché utilizzate 1,1 Hz?
**Risposta:** L'abstract riporta 1,1 Hz ma non ne esplicita il razionale. Va verificato se deriva dal generatore, da convenzioni tecniche o da esigenze di separazione tra risposte successive. **Stato: ⚠️ [A1, A2].**

### 22. 1,1 Hz è il valore impostato o è stato verificato nei dati?
**Risposta:** Non è specificato. Per essere tecnicamente solidi dobbiamo distinguere frequenza nominale dello stimolatore da intervallo interstimolo misurato dai trigger nel raw. **Stato: ⚠️.**

### 23. Perché single pulses invece di un train di stimoli?
**Risposta:** Il protocollo ACEP usa single pulses per ottenere una risposta evocata temporalmente interpretabile dopo ogni stimolo; il mapping comportamentale iVSAT usa invece train a 60 Hz per interferire transitoriamente con la funzione. Il razionale dettagliato va completato. **Stato: ✅ per la distinzione [A2, G1], 📚 per la fisiologia.**

### 24. Perché partite da 20 mA e poi scendete?
**Risposta:** Il protocollo dichiara una partenza da 20 mA con riduzione progressiva fino alla response threshold. Il razionale operativo plausibile è identificare una risposta e poi stimarne la soglia minima, ma l'abstract non lo formalizza. **Stato: ⚠️ [A2].**

### 25. Con quali step diminuite la corrente?
**Risposta:** Non documentato nell'abstract ACEP. Nel lavoro sul mapping sottocorticale della manipolazione la soglia LF-DES veniva rivalutata diminuendo la corrente in step di **0,5 mA**, ma non va assunto per ACEP. **Stato: ⚠️ [G2].**

### 26. Come definite esattamente la response threshold ACEP?
**Risposta:** Sappiamo che il range nel nostro campione è **2–5 mA**, ma non è ancora documentato il criterio operativo: numero di risposte richieste, ampiezza minima, riproducibilità o SNR. Questa è una priorità da recuperare. **Stato: ⚠️ [PROTO].**

### 27. Quanti trial devono mostrare la risposta perché la consideriate presente?
**Risposta:** Non specificato per ACEP. Nei paradigmi comportamentali del gruppo un sito è spesso considerato eloquente se l'errore compare in **tre trial non consecutivi**, ma questo criterio non può essere trasferito automaticamente alla risposta elettrofisiologica. **Stato: ⚠️ [G1, G6, G7].**

### 28. Quanti impulsi vengono acquisiti per ogni condizione ACEP?
**Risposta:** Non documentato nell'abstract. Va recuperato dal protocollo/raw perché determina precisione dell'average, SNR e affidabilità trial-to-trial. **Stato: ⚠️.**

### 29. Quanto tempo intercorre tra condizioni o serie diverse?
**Risposta:** Non documentato per ACEP. Nei task LF-DES del gruppo si mantengono spesso 3–4 secondi tra stimolazioni per evitare dragging effects, ma non è automaticamente il protocollo ACEP. **Stato: ⚠️ [G3, G7, G9].**

### 30. Qual è la carica per fase del nostro stimolo?
**Risposta:** Serve chiarire se 0,5 ms sia **per fase**. Se lo fosse, \(Q=I\times t\): a 2–5 mA la carica sarebbe **1–2,5 µC per fase**; a 20 mA sarebbe **10 µC per fase**. Se 0,5 ms è durata totale bifasica, questi valori cambiano. **Stato: ⚠️ [PROTO, A2].**

### 31. Qual è la charge density all'interfaccia elettrodo-tessuto?
**Risposta:** Non calcolabile finché non conosciamo area effettiva del contatto e definizione esatta della pulse width. Va recuperata la geometria del probe ACEP. **Stato: ⚠️.**

### 32. Perché la stessa corrente non significa lo stesso recruitment in due siti?
**Risposta:** Il gruppo riconosce che il DES può avere spread verso tessuto vicino/remoto e che anatomia e geometria del sito contano. Il recruitment dipende inoltre da distanza e orientamento delle fibre e proprietà del tessuto. **Stato: ✅ per il limite generale [G1], 📚 per la biofisica completa.**

### 33. Perché la stessa carica non significa necessariamente lo stesso effetto fisiologico?
**Risposta:** Perché corrente e durata influenzano la probabilità di attivazione secondo proprietà temporali della membrana; due impulsi con uguale carica possono avere differenti combinazioni intensità-durata e quindi differente efficacia. **Stato: 📚.**

### 34. Come influenzano diametro, mielina e orientamento assonale la soglia?
**Risposta:** È un tema di eccitabilità assonale extracellulare non sviluppato nei lavori del gruppo forniti. Va studiato con letteratura neurofisiologica specifica. **Stato: 📚.**

### 35. Che cos'è il volume of tissue activated?
**Risposta:** È il volume di tessuto nel quale il campo prodotto dalla stimolazione raggiunge condizioni sufficienti a reclutare elementi neurali; non coincide semplicemente con la posizione geometrica del tip. **Stato: 📚.**

### 36. Da cosa dipende la focalità della stimolazione?
**Risposta:** Il gruppo descrive la stimolazione bipolare come relativamente focale e usa probe con tip a distanza definita; la focalità dipende comunque da geometria, distanza, conduttività e anisotropia del tessuto. **Stato: ✅/📚 [G4, G5].**

---

## C. Sistema di registrazione ECoG

### 37. Quale sistema usate per registrare l'ECoG ACEP?
**Risposta:** Non specificato nell'abstract ACEP. Nei lavori storici del gruppo il monitoraggio ECoG viene descritto con sistemi **Comet/Grass**, mentre EMG/MEP usa ISIS-IOM/Inomed. Non bisogna assumere che il sistema ACEP sia identico. **Stato: ⚠️ [G4, G5].**

### 38. Qual è il sampling rate dell'ACEP?
**Risposta:** Non documentato. È uno dei dati tecnici prioritari da recuperare perché influenza la precisione delle latenze <15 ms. **Stato: ⚠️.**

### 39. Qual è la risoluzione temporale corrispondente?
**Risposta:** È \(1/F_s\). Non può essere calcolata finché non conosciamo il sampling rate ACEP. **Stato: ⚠️.**

### 40. Qual è la frequenza di Nyquist?
**Risposta:** È \(F_s/2\). Anche questa dipende dal sampling rate effettivo del sistema ACEP. **Stato: ⚠️.**

### 41. Come è fatto lo strip: numero, diametro e spacing dei contatti?
**Risposta:** L'abstract dice “strip electrode” ma non specifica geometria. Nei lavori storici vengono usati strip 4–8 contatti per ECoG e 4/6 contatti per MEP monitoring, ma il modello ACEP va verificato. **Stato: ⚠️ [G4, G5, G8].**

### 42. Dove viene posizionato esattamente lo strip nel nostro studio?
**Risposta:** Sul **superior frontal gyrus esposto**, in corrispondenza della **lateral pre-SMA**; un ulteriore recording sul precentral gyrus funge da controllo corticale. **Stato: ✅ [A2].**

### 43. Come viene localizzato il lateral pre-SMA?
**Risposta:** L'abstract non descrive la procedura di localizzazione dello strip. Il lavoro [G1] identifica causalmente la regione di interesse alla transizione SMA/pre-SMA e registra siti con neuronavigazione, ma il metodo specifico di posizionamento ACEP va recuperato. **Stato: ⚠️ [G1].**

### 44. Qual è il reference usato per l'ACEP?
**Risposta:** Non documentato. È un'informazione essenziale perché ampiezza e polarità dipendono dal riferimento. **Stato: ⚠️.**

### 45. Dove si trova il ground?
**Risposta:** Non documentato per ACEP. Nei protocolli HF-DES storici reference/ground è descritto sullo scalpo o cranio sopra il solco centrale, ma è un circuito diverso dalla registrazione ACEP. **Stato: ⚠️ [G4, G8].**

### 46. Perché il reference può cambiare ampiezza, polarità e morfologia?
**Risposta:** Perché ogni canale registra una differenza di potenziale rispetto al riferimento. Cambiare reference modifica la componente comune sottratta e quindi la forma apparente del segnale. **Stato: 📚.**

### 47. Usate common reference, common average o bipolar derivations?
**Risposta:** Non documentato per ACEP. Nei lavori storici l'ECoG di monitoraggio è descritto come **monopolar array referred to a mid-frontal electrode**. Non trasferire automaticamente questo schema all'ACEP. **Stato: ⚠️ [G4, G5].**

### 48. Cosa significa nell'abstract “recorded unfiltered”?
**Risposta:** Significa che non viene dichiarato un band-pass software applicato durante l'acquisizione e che il filtraggio 1–300 Hz è fatto in postprocessing. Non implica necessariamente assenza assoluta di filtri analogici/anti-aliasing hardware. **Stato: ✅/⚠️ [A2].**

### 49. È veramente privo di filtri o esistono filtri hardware?
**Risposta:** Non sappiamo ancora quali filtri analogici, anti-aliasing o limiti di banda siano incorporati nell'amplificatore. Va verificato nel manuale/setup. **Stato: ⚠️.**

### 50. Qual è il range dinamico dell'amplificatore?
**Risposta:** Non documentato. È importante per capire se lo stimulation artifact possa saturare l'ingresso. **Stato: ⚠️.**

### 51. Quanto rapidamente recupera l'amplificatore dopo lo stimulation artifact?
**Risposta:** Non documentato. Questa informazione è critica soprattutto per interpretare P0/N0 entro 15 ms. **Stato: ⚠️.**

---

## D. Sincronizzazione stimolatore–ECoG

### 52. Come viene sincronizzato lo stimolatore con l'ECoG?
**Risposta:** Non documentato nei materiali disponibili. Dobbiamo identificare esattamente il percorso del trigger. **Stato: ⚠️.**

### 53. Esiste un TTL hardware?
**Risposta:** Non documentato. Verificare cablaggio e canali di acquisizione. **Stato: ⚠️.**

### 54. Oppure il marker viene generato via software?
**Risposta:** Non documentato. Va distinto da un trigger hardware perché può avere latenza/jitter differenti. **Stato: ⚠️.**

### 55. Come definite precisamente \(t=0\)?
**Risposta:** Non documentato. Idealmente \(t=0\) deve corrispondere al sample associato all'impulso effettivamente erogato, non solo al comando software. **Stato: ⚠️.**

### 56. Qual è il jitter temporale del trigger?
**Risposta:** Non documentato. Va misurato o ricavato dalle specifiche se le latenze vengono interpretate nell'ordine dei millisecondi. **Stato: ⚠️.**

### 57. Il trigger rappresenta il comando o l'impulso effettivamente erogato?
**Risposta:** Non documentato. È una distinzione fondamentale per la misura della latenza. **Stato: ⚠️.**

### 58. Stimolatore ed ECoG condividono lo stesso clock?
**Risposta:** Non documentato. **Stato: ⚠️.**

### 59. Può esserci drift tra i sistemi?
**Risposta:** In linea teorica sì se usano clock indipendenti; non sappiamo se accada nel nostro setup. **Stato: ⚠️/📚.**

### 60. Potete associare ogni singolo impulso al relativo sample ECoG?
**Risposta:** Questo deve diventare un requisito della pipeline. Non è documentato nell'abstract se l'associazione sia già ricostruita trial-by-trial. **Stato: ⚠️.**

---

## E. Artefatto, preprocessing e qualità del segnale

### 61. Come gestite lo stimulation artifact?
**Risposta:** Non descritto nell'abstract. È uno dei punti tecnici più urgenti da chiarire. **Stato: ⚠️.**

### 62. L'amplificatore va in saturazione?
**Risposta:** Non documentato. Va verificato sui raw e nelle specifiche hardware. **Stato: ⚠️.**

### 63. Quanti millisecondi dopo lo stimolo sono contaminati?
**Risposta:** Non documentato. La finestra contaminata deve essere stabilita sui dati reali prima di interpretare P0/N0. **Stato: ⚠️.**

### 64. Utilizzate blanking, interpolation, template subtraction o altro?
**Risposta:** Non documentato. **Stato: ⚠️.**

### 65. Come distinguete una P0/N0 precoce dall'artefatto residuo?
**Risposta:** Il disegno fornisce indizi importanti: riproducibilità, latenza post-stimolo, presenza sui siti attention-positive, assenza sui siti negativi a corrente matched e attenuazione/assenza sul precentrale. Tuttavia serve conoscere anche la gestione tecnica dell'artefatto. **Stato: ✅/⚠️ [A2].**

### 66. Il filtro può produrre ringing?
**Risposta:** Sì, un transiente molto rapido può generare oscillazioni dovute alla risposta del filtro. Il corpus ACEP non descrive come questo rischio sia stato controllato. **Stato: 📚/⚠️.**

### 67. Un filtro può generare attività apparente prima o subito dopo lo stimolo?
**Risposta:** Sì, soprattutto con filtri non causali/zero-phase, che possono distribuire temporalmente l'effetto del transiente. Serve conoscere il filtro effettivamente usato. **Stato: 📚/⚠️.**

### 68. Perché avete scelto 1–300 Hz?
**Risposta:** L'abstract riporta il band-pass 1–300 Hz ma non ne fornisce il razionale. **Stato: ⚠️ [A2].**

### 69. Quale tipo di filtro avete usato: FIR o IIR?
**Risposta:** Non documentato. **Stato: ⚠️.**

### 70. Quale ordine/transition bandwidth?
**Risposta:** Non documentato. **Stato: ⚠️.**

### 71. Il filtro è causale o zero-phase?
**Risposta:** Non documentato. È cruciale se si interpretano latenze precoci. **Stato: ⚠️.**

### 72. Fate baseline correction?
**Risposta:** Non documentato. **Stato: ⚠️.**

### 73. Qual è la finestra temporale delle epoche?
**Risposta:** Non documentato. **Stato: ⚠️.**

### 74. Come eliminate trial rumorosi/patologici?
**Risposta:** Non documentato. Va esplicitato criterio per artefatti, saturazione, movimenti ed eventuali scariche epilettiformi. **Stato: ⚠️.**

### 75. Guardate anche i single trials o solo l'average?
**Risposta:** L'abstract parla di risposte riproducibili ma non chiarisce come sia valutata la riproducibilità trial-to-trial. Per una discussione tecnica solida dobbiamo poter mostrare/valutare anche i singoli trial. **Stato: ⚠️ [A2].**

### 76. Quanto migliora il SNR con l'averaging?
**Risposta:** Se il rumore è indipendente e non time-locked, l'errore casuale tende a ridursi approssimativamente con \(1/\sqrt{N}\). La validità di questa approssimazione dipende dalle proprietà reali del rumore. **Stato: 📚.**

---

## F. Componenti P0/N0, P1/N1 e misure quantitative

### 77. Come definite P0/N0 e P1/N1?
**Risposta:** Nel nostro abstract P0/N0 è la componente precoce entro **15 ms** e P1/N1 la successiva entro **50 ms**; il segno P/N indica la polarità osservata. Il criterio algoritmico esatto di identificazione del peak non è descritto. **Stato: ✅/⚠️ [A2].**

### 78. Cosa significa P rispetto a N?
**Risposta:** Indica una deflessione positiva o negativa rispetto al riferimento e alla convenzione di plotting. Non equivale automaticamente a eccitazione/inibizione. **Stato: 📚.**

### 79. La polarità ha un significato fisiologico semplice?
**Risposta:** No. Dipende da geometria delle sorgenti, orientamento, reference e posizione degli elettrodi. **Stato: 📚.**

### 80. Il peak viene identificato automaticamente o manualmente?
**Risposta:** Non documentato. **Stato: ⚠️.**

### 81. Misurate peak latency o onset latency?
**Risposta:** L'abstract riporta finestre temporali delle componenti, ma non chiarisce se i valori siano onset o peak latency. **Stato: ⚠️.**

### 82. Come definite l'onset?
**Risposta:** Non documentato. Deve essere formalizzato con una regola riproducibile se viene usato come outcome. **Stato: ⚠️.**

### 83. Come misurate l'ampiezza?
**Risposta:** Non documentato se si usa peak, peak-to-peak o media su finestra. **Stato: ⚠️.**

### 84. Qual è il SNR minimo per chiamare una risposta?
**Risposta:** Non documentato. **Stato: ⚠️.**

### 85. Perché una componente entro 15 ms viene considerata “early”?
**Risposta:** Perché emerge molto vicino allo stimolo e precede componenti successive entro 50 ms; questo è compatibile con una via di propagazione relativamente rapida. La latenza breve da sola non identifica il percorso. **Stato: ✅/📚 [A2].**

### 86. Cosa potrebbe produrre P0/N0?
**Risposta:** L'ipotesi coerente con il paradigma è una risposta corticale precoce conseguente al reclutamento di fibre sottocorticali; il meccanismo preciso e il numero di sinapsi non sono dimostrati dall'abstract. **Stato: ⚠️ [A2].**

### 87. Cosa potrebbe produrre P1/N1?
**Risposta:** Potrebbe riflettere componenti corticali/network successive alla risposta precoce, ma questa interpretazione richiede letteratura e analisi fisiologica dedicate. **Stato: 📚.**

### 88. Possiamo ricavare la conduction velocity dalla latenza?
**Risposta:** Non direttamente dalla sola latenza registrata. Servono almeno stima del path length e comprensione dei ritardi di attivazione/sinaptici. **Stato: 📚.**

### 89. Quali assunzioni servirebbero per stimare conduction velocity?
**Risposta:** Distanza effettiva lungo il percorso, punto di origine dello spike, target corticale reale, eventuali sinapsi intermedie e accuratezza del timing. **Stato: 📚.**

### 90. Una maggiore ampiezza significa più fibre reclutate?
**Risposta:** Non necessariamente. L'ampiezza dipende anche da sincronizzazione, geometria, riferimento, distanza e caratteristiche del target corticale. **Stato: 📚.**

### 91. Perché “ampiezza = forza della connessione” è troppo semplice?
**Risposta:** Perché l'ampiezza è un prodotto congiunto di stimolazione, recruitment, propagazione, sincronizzazione, volume conduction e montaggio di registrazione. **Stato: 📚.**

### 92. Cosa può significare se aumentando la corrente diminuisce la latenza?
**Risposta:** Può essere compatibile con recruitment più efficace/rapido o maggiore sincronizzazione, ma bisogna escludere bias di detection e artefatti. **Stato: 📚.**

### 93. Cosa può significare se aumentando la corrente aumenta l'ampiezza?
**Risposta:** È compatibile con maggiore recruitment della popolazione attivata, ma non è una relazione univoca e può saturare o essere confusa da geometria/artefatto. **Stato: 📚.**

### 94. Cosa significa se cambia la morfologia della waveform?
**Risposta:** Può indicare che cambiano le popolazioni reclutate, la sincronizzazione o i contributi corticali, ma può anche derivare da preprocessing o artefatti. **Stato: 📚.**

### 95. Cosa significa maggiore temporal dispersion?
**Risposta:** Arrivi meno sincroni della risposta possono allargare il potenziale; le cause possono includere differenze di velocità di conduzione, percorsi multipli o variabilità del recruitment. **Stato: 📚.**

---

## G. iVSAT, mapping comportamentale e neuroanatomia

### 96. Come vengono identificati i siti attention-positive?
**Risposta:** Durante iVSAT, la LF-DES viene applicata corticalmente e sottocorticalmente. Un sito è considerato positivo quando la stimolazione induce un errore riproducibile di omissione target. **Stato: ✅ [G1].**

### 97. Quale errore deve comparire perché il sito sia positivo?
**Risposta:** Un target “H” viene omesso durante l'esplorazione della stringa di lettere. Per l'analisi neglect-like viene considerata anche la lateralizzazione spaziale dell'omissione. **Stato: ✅ [G1].**

### 98. Quante stimolazioni positive servono?
**Risposta:** Nel protocollo iVSAT il sito è positivo quando l'errore si verifica in **tre trial di stimolazione non consecutivi**. **Stato: ✅ [G1].**

### 99. Quale stimolazione viene usata durante iVSAT?
**Risposta:** **LF-DES: biphasic square-wave pulses, pulse width 0,5 ms, 60 Hz, train 1–4 s, probe bipolare con 5 mm di distanza inter-tip.** La corrente è individualizzata. **Stato: ✅ [G1].**

### 100. Perché la DES iVSAT è diversa dalla stimolazione ACEP?
**Risposta:** La DES iVSAT usa un train a 60 Hz per interferire transitoriamente con la funzione durante il task; l'ACEP usa single pulses a 1,1 Hz per evocare una risposta elettrofisiologica separabile temporalmente. **Stato: ✅ [A2, G1].**

### 101. Come viene scelta la corrente della DES iVSAT?
**Risposta:** È la più bassa corrente testata sulla corteccia premotoria ventrale che produce in modo consistente errori durante un task linguistico; la stessa corrente viene mantenuta per il successivo mapping iVSAT corticale e sottocorticale nel paziente. **Stato: ✅ [G1].**

### 102. Dove sono localizzati i siti attention-positive?
**Risposta:** Nel lavoro [G1] i siti sono nella sostanza bianca sotto SFG, MFG e IFG; la probabilità più alta di errori neglect-like converge nella regione sotto la transizione **SMA/pre-SMA**, con coinvolgimento del mid-cingulate. **Stato: ✅ [G1].**

### 103. Quali fasci potrebbero essere coinvolti?
**Risposta:** [G1] mostra una rete strutturale frontale e connessioni associate ai siti eloquenti, ma l'abstract ACEP non identifica un unico fascio specifico come generatore della risposta. Va distinguere “regione di sostanza bianca stimolata” da “fascio dimostrato”. **Stato: ✅/⚠️ [G1, A2].**

### 104. Quanto possiamo identificare un fascio senza tractography?
**Risposta:** Con neuronavigazione e anatomia possiamo localizzare il sito; senza tractography o altri dati convergenti è più prudente parlare di regione/percorso compatibile che assegnare la risposta a un singolo fascio. **Stato: ✅ come cautela metodologica [G1].**

### 105. Perché registrate dal superior frontal gyrus/lateral pre-SMA?
**Risposta:** Perché il lavoro causale del gruppo identifica la regione SFG/SMA-preSMA e la relativa sostanza bianca come nodo cruciale per errori attentivi neglect-like; l'ACEP testa se i siti sottocorticali iVSAT-positivi hanno una firma corticale su questa regione. **Stato: ✅ [G1, A2].**

### 106. Qual è il ruolo della lateral pre-SMA nell'attenzione visuospaziale?
**Risposta:** Nel dataset [G1], stimolazioni sotto SFG alla transizione SMA/pre-SMA sono associate con alta probabilità a errori contralesionali/neglect-like; lesione-symptom mapping e DES convergono sulla rilevanza causale di questa regione e connettività. **Stato: ✅ [G1].**

### 107. Perché il nostro studio ACEP riguarda tumori frontali destri?
**Risposta:** [G1] conferma la rilevanza particolare del network frontale destro per bias contralesionali: nella coorte prospettica, la DES destra produce omissioni iVSAT, mentre la stimolazione sinistra non produce omissioni selettive analoghe. **Stato: ✅ [G1].**

### 108. Qual è la relazione fra neglect e network attentivo frontale?
**Risposta:** [G1] integra lesion-symptom mapping, DES e tractography mostrando convergenza su una rete frontale destra, soprattutto dorsomediale, la cui lesione/stimolazione altera l'allocazione attentiva contralesionale. **Stato: ✅ [G1].**

### 109. Come si collega il nostro risultato ai modelli DAN/VAN?
**Risposta:** [G1] discute il modello classico VAN/DAN e mostra che territori frontali dorsomediali, spesso sottorappresentati negli studi stroke, hanno un ruolo causale. L'ACEP aggiunge una misura elettrofisiologica, ma non basta ancora per assegnare la risposta a DAN o VAN in modo esclusivo. **Stato: ✅/⚠️ [G1, A2].**

---

## H. Controlli sperimentali e specificità

### 110. Perché i siti attention-negative sono un controllo importante?
**Risposta:** Perché testano se la risposta corticale compaia genericamente stimolando qualunque sito vicino o sia associata ai siti funzionalmente identificati. Nel nostro abstract non emergono risposte riproducibili dai siti negativi. **Stato: ✅ [A2].**

### 111. Perché devono essere stimolati a corrente matched?
**Risposta:** Per evitare che l'assenza di risposta dipenda semplicemente da una dose elettrica inferiore. Il nostro abstract specifica che i siti negativi sono stimolati a intensità matched. **Stato: ✅ [A2].**

### 112. Cosa esclude e cosa non esclude l'assenza di risposta nei siti negativi?
**Risposta:** Riduce la probabilità che l'ACEP sia un effetto aspecifico della corrente o un artefatto identico in ogni sito. Non elimina differenze anatomiche, distanza, orientamento delle fibre o altre differenze locali. **Stato: ✅/📚 [A2].**

### 113. Perché registrare anche dal precentral gyrus?
**Risposta:** È un controllo corticale di topografia: testa se la risposta sia diffusa su cortex vicino o preferenzialmente espressa nel target frontale superiore/lateral pre-SMA. **Stato: ✅ [A2].**

### 114. Cosa significa che sul precentrale la risposta è assente o attenuata?
**Risposta:** Supporta la specificità topografica della risposta verso il superior frontal gyrus rispetto a un'altra sede corticale. **Stato: ✅ [A2].**

### 115. Questo esclude completamente volume conduction?
**Risposta:** No. Rafforza l'argomento contro un segnale puramente diffuso, ma una dimostrazione completa richiede considerare timing, geometria, reference, distanze e caratteristiche spaziali del segnale. **Stato: 📚.**

### 116. Come distingui volume conduction da propagazione fisiologica?
**Risposta:** Si usa convergenza di evidenze: latenza non istantanea, riproducibilità, distribuzione topografica, controlli corticali/sottocorticali, comportamento al variare dello stimolo e analisi dell'artefatto. Il nostro abstract fornisce parte di questi controlli, non tutti. **Stato: ✅/📚 [A2].**

### 117. Quali altri controlli rafforzerebbero il risultato?
**Risposta:** Controlli distance-matched, analisi single-trial, caratterizzazione esplicita dello stimulation artifact, replicazione a differenti intensità, localizzazione anatomica precisa e, idealmente, convergenza con tractography. **Stato: 📚.**

### 118. La distanza tra stimolazione e contatti può spiegare differenze?
**Risposta:** Sì, è un potenziale confondente geometrico e va registrato/controllato. **Stato: 📚.**

### 119. L'impedenza può spiegare differenze di ampiezza?
**Risposta:** Può contribuire alla qualità e ampiezza del segnale registrato; vanno documentate le condizioni dei contatti. **Stato: 📚/⚠️.**

### 120. Il brain shift può influenzare la localizzazione?
**Risposta:** Sì. [G1] registra i siti con neuronavigazione alla fine del mapping sottocorticale **prima del tumour debulking** per ridurre l'impatto dello shift e usa video/anatomia per conferma. Per ACEP va verificato il timing esatto della registrazione. **Stato: ✅/⚠️ [G1].**

---

## I. Resezione, disconnessione e integrità del circuito

### 121. Quando registrate ACEP rispetto alla resezione?
**Risposta:** Non è specificato nell'abstract ACEP con sufficiente precisione. Va definito se la misura avviene prima, durante o dopo una specifica fase di disconnessione. **Stato: ⚠️.**

### 122. Il sito stimolato è intatto, parzialmente disconnesso o isolato?
**Risposta:** Non documentato per ciascuna registrazione ACEP. È un'informazione necessaria per interpretare la risposta fisiologica. **Stato: ⚠️.**

### 123. Cosa accade all'eccitabilità di un assone subito dopo la disconnessione?
**Risposta:** Il corpus del gruppo fornito non affronta direttamente questo punto neurofisiologico. **Stato: 📚.**

### 124. Cos'è la degenerazione walleriana e su quale scala temporale avviene?
**Risposta:** Tema non trattato direttamente nei lavori forniti; va studiato con letteratura neurobiologica specifica. **Stato: 📚.**

### 125. Una fibra disconnessa può essere ancora elettricamente eccitabile?
**Risposta:** È possibile che eccitabilità elettrica e integrità funzionale del circuito non coincidano immediatamente; la dinamica precisa va documentata con letteratura specifica. **Stato: 📚.**

### 126. Una risposta post-resection dimostra un circuito fisiologicamente integro?
**Risposta:** No, non necessariamente. Una risposta evocabile dimostra eccitabilità/propagazione sufficiente a generare un segnale, non automaticamente un circuito fisiologico normale e funzionalmente integro. **Stato: 📚.**

### 127. Come distinguere “fibre eccitabili” da “network funzionale”?
**Risposta:** Serve convergenza con comportamento, anatomia, stato della resezione, eventuali outcome e altre misure funzionali; il solo evoked potential non basta. **Stato: 📚.**

---

## J. Statistica, struttura dei dati e dose-response

### 128. Perché 20 pazienti non diventano migliaia di osservazioni indipendenti?
**Risposta:** Perché trial e siti sono annidati negli stessi pazienti e condividono molte fonti di variabilità. L'unità di informazione non coincide con il numero totale di impulsi. **Stato: 📚.**

### 129. Perché i trial dello stesso paziente non sono indipendenti?
**Risposta:** Condividono anatomia, hardware, riferimento, stato fisiologico, anestesia, sito e molte altre caratteristiche. **Stato: 📚.**

### 130. Qual è l'unità statistica corretta: trial, sito o paziente?
**Risposta:** Dipende dall'ipotesi, ma trial e siti devono essere trattati come livelli gerarchici e non come repliche indipendenti del paziente. **Stato: 📚.**

### 131. Come gestire molti trial per sito e molti siti per paziente?
**Risposta:** Con modelli gerarchici/mixed-effects o strategie equivalenti che rappresentino dipendenze entro sito e paziente. **Stato: 📚.**

### 132. Come confrontereste threshold, latency e amplitude?
**Risposta:** Definendo outcome a priori e usando modelli coerenti con la distribuzione e la struttura gerarchica dei dati; per esempio effetti fissi della dose e random effects di paziente/sito. **Stato: 📚.**

### 133. Come costruireste una dose-response curve?
**Risposta:** Per ogni combinazione sito/condizione si associano corrente, pulse width o carica con probabilità di risposta, ampiezza, latenza e/o morfologia, modellando la dipendenza intra-soggetto. **Stato: 📚.**

### 134. Quali covariate tecniche andrebbero controllate?
**Risposta:** Corrente, pulse width, numero di trial, posizione/contatto, reference, impedenza, distanza, ordine temporale, qualità del segnale e artifact burden. **Stato: 📚.**

### 135. Quali covariate anatomiche andrebbero controllate?
**Risposta:** Sito di stimolazione, target corticale, distanza, pathway plausibile, rapporto con tumore/edema/resezione e possibile brain shift. **Stato: 📚.**

### 136. Come quantificare trial-to-trial variability?
**Risposta:** Distribuzione di ampiezze e latenze, varianza/SD, jitter, probabilità di risposta, coefficienti di reliability e SNR, oltre all'ispezione dei singoli trial. **Stato: 📚.**

### 137. Come distinguere un effetto paziente da un effetto stimolazione?
**Risposta:** Con una struttura statistica che includa il paziente come livello gerarchico/random effect e le caratteristiche dello stimolo come predittori. **Stato: 📚.**

---

## K. Critica, inferenza e domande difficili da congresso

### 138. Qual è il principale limite della nostra interpretazione?
**Risposta:** L'ACEP supporta una relazione funzionale/eletrofisiologica tra sito sottocorticale e cortex, ma l'attribuzione a una connessione “diretta” specifica richiede cautela. Inoltre la coorte è awake e l'applicabilità asleep è ancora prospettica. **Stato: ✅ [A2].**

### 139. Quanto possiamo usare la parola “direct connectivity”?
**Risposta:** L'abstract conclude che gli ACEP **may identify direct** connectivity. Conviene mantenere questa formulazione probabilistica e non trasformarla in una dimostrazione anatomica definitiva. **Stato: ✅ [A2].**

### 140. La breve latenza è sufficiente per dire “direct”?
**Risposta:** No. È un elemento compatibile, non una prova autonoma. **Stato: 📚.**

### 141. Potrebbero esserci sinapsi intermedie?
**Risposta:** Sì, non sono escluse dal solo dato di latenza. **Stato: 📚.**

### 142. Potrebbe essere coinvolto più di un fascio?
**Risposta:** Sì. Il sito di stimolazione è una regione di sostanza bianca e il current spread può reclutare più popolazioni; l'identificazione di un singolo fascio richiede evidenza anatomica convergente. **Stato: ✅/📚 [G1].**

### 143. Il tumore può alterare connettività ed eccitabilità?
**Risposta:** Il gruppo documenta che i tumori distorcono l'anatomia e usa tractography patient-specific per tenerne conto; l'effetto specifico su eccitabilità ACEP va studiato separatamente. **Stato: ✅/📚 [G2, G1].**

### 144. Edema e infiltrazione possono modificare current spread?
**Risposta:** È biologicamente plausibile, ma non è quantificato nei materiali forniti per il nostro ACEP. **Stato: 📚.**

### 145. Il brain shift può alterare l'interpretazione anatomica?
**Risposta:** Sì. Per questo [G1] registra coordinate dei siti prima del debulking e verifica localizzazione con anatomia/video. Il nostro protocollo ACEP deve documentare un'analoga strategia. **Stato: ✅/⚠️ [G1].**

### 146. Il campione permette di generalizzare all'asleep surgery?
**Risposta:** No. Lo studio attuale è in awake surgery; l'asleep è una potenziale applicazione futura. **Stato: ✅ [A2].**

### 147. Perché serve validazione ulteriore?
**Risposta:** Per verificare replicabilità, standardizzazione, relazione anatomica e utilità clinica in coorti più ampie e durante asleep surgery. È esplicitamente indicato nelle conclusioni degli abstract. **Stato: ✅ [A1, A2].**

### 148. Qual è l'esperimento successivo ideale?
**Risposta:** Una validazione prospettica più ampia, con protocollo tecnico standardizzato, definizione quantitativa della response threshold, controllo dell'artefatto, single-trial analysis, localizzazione anatomica/tractography e acquisizione durante asleep surgery. **Stato: ✅ per la direzione clinica [A1, A2]; parte metodologica da progettare.**

---

# Informazioni tecniche già ricavate dal corpus del gruppo

## Mapping iVSAT attuale
Da [G1]:

- LF-DES con **biphasic square-wave pulses**;
- pulse width **0,5 ms**;
- frequenza **60 Hz**;
- train **1–4 s**;
- probe **bipolare**, distanza inter-tip **5 mm**;
- corrente individualizzata sulla soglia più bassa che produce errori durante il mapping linguistico sulla corteccia premotoria ventrale;
- stessa corrente mantenuta durante mapping corticale e sottocorticale iVSAT;
- sito positivo: errore in **3 trial non consecutivi**;
- siti controllati anche con naming e praxis;
- coordinate registrate con **Curve, Brainlab** prima del tumour debulking;
- siti modellati come ROI sferiche di **5 mm** considerando la risoluzione del probe.

## Standard LF-DES storico del gruppo
Da [G3, G4, G5]:

- stimolatore **OSIRIS-NeuroStimulator, Inomed**, integrato nel sistema **ISIS**;
- constant-current;
- probe bipolare con **2 ball tips da 2 mm**, separazione **5 mm**;
- biphasic square wave;
- **0,5 ms per fase**;
- **60 Hz**, ISI 16,6 ms;
- train tipicamente **2–5 s**;
- range di intensità frequentemente **2–6 mA**.

**Nota critica:** questi dettagli descrivono LF-DES storica e non devono essere attribuiti automaticamente al single-pulse ACEP finché non verificati.

## ECoG di monitoraggio storico
Da [G4, G5]:

- sistemi riportati: **Comet / Grass**;
- strip subdurale **4–8 contatti**;
- array monopolare riferito a elettrodo mid-frontal;
- band-pass **1–100 Hz** per il monitoraggio ECoG;
- scopo principale: attività basale, after-discharges e seizures.

**Nota critica:** questo non è necessariamente il sistema con cui vengono acquisiti gli ACEP.

## Protocollo ACEP del nostro abstract
Da [A2] + [PROTO]:

- siti: subcorticali **attention-positive** identificati con iVSAT;
- single **biphasic pulses**;
- **1,1 Hz**;
- pulse width **0,5 ms**;
- partenza da **20 mA** e riduzione progressiva;
- response threshold nel nostro campione: **2–5 mA**;
- registrazione **unfiltered** da strip sul **superior frontal gyrus/lateral pre-SMA**;
- postprocessing **1–300 Hz**;
- controllo corticale: **precentral gyrus**;
- controllo sottocorticale: siti **attention-negative** a corrente matched;
- P0/N0: **entro 15 ms**;
- P1/N1: **entro 50 ms**;
- risposta non riproducibile nei siti negativi e assente/marcamente attenuata sul precentrale.

---

# Gap tecnici prioritari da chiudere prima del congresso

Questi sono i dati che non risultano ancora documentati nei materiali esaminati e che vanno recuperati direttamente dal setup o dalla pipeline ACEP:

1. modello esatto dello stimolatore ACEP;
2. constant-current vs constant-voltage nel protocollo ACEP;
3. modello/geometria del probe ACEP;
4. monopolare vs bipolare come configurazione spaziale ACEP;
5. significato preciso di **0,5 ms**: per fase o totale;
6. polarità della prima fase e simmetria delle due fasi;
7. step di riduzione da 20 mA alla soglia;
8. definizione operativa di **response threshold**;
9. numero di impulsi/trial per condizione;
10. sistema di registrazione ACEP;
11. sampling rate;
12. geometria completa dello strip;
13. reference e ground;
14. filtri hardware/anti-aliasing;
15. range dinamico e recovery dell'amplificatore;
16. modalità di trigger e definizione di \(t=0\);
17. verifica dell'effettivo 1,1 Hz sui timestamp;
18. gestione dello stimulation artifact;
19. epoch window e baseline;
20. tipo/ordine/modalità del filtro 1–300 Hz;
21. rejection dei trial;
22. metodo di averaging;
23. criterio di definizione dei peak P0/N0 e P1/N1;
24. misura di amplitude e latency;
25. timing ACEP rispetto alla resezione;
26. localizzazione esatta dei contatti e del sito stimolato.

Questa lista dei gap è il prossimo obiettivo operativo: una volta recuperati questi dati, la maggior parte delle domande tecniche più pericolose da congresso diventa difendibile.
