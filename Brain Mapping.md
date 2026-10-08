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

# ISIN 2026 Congress — Master Checklist: 148 Questions

## Goal

To consider my congress preparation complete, I should be able to answer all 148 questions below at three levels:

- **30 seconds:** a clear, concise congress-style answer;
- **2 minutes:** a technically solid explanation;
- **follow-up challenge:** the ability to defend assumptions, limitations, alternative interpretations, and details of our actual setup.

### Source legend

- **[A1]** ISIN 2026 abstract on hand-object manipulation.
- **[A2]** ISIN 2026 abstract on visuospatial attention — the study I will present.
- **[PROTO]** Information directly provided about the current protocol.
- **[G1]** Puglisi et al., 2026, *Nature Communications*, “Convergent causal mapping unravels distinct frontal networks for visuospatial selective attention”.
- **[G2]** Viganò et al., 2022, *Brain*, “Stimulation of frontal pathways disrupts hand muscle control during object manipulation”.
- **[G3]** Fornia et al., 2022, *NeuroImage*, “Motor impairment evoked by direct electrical stimulation of human parietal cortex during object manipulation”.
- **[G4]** Fornia et al., 2020, *Cerebral Cortex*, “Direct Electrical Stimulation of Premotor Areas: Different Effects on Hand Muscle Activity during Object Manipulation”.
- **[G5]** Fornia, Puglisi et al., 2020, *Nature Communications*, “Direct electrical stimulation of the premotor cortex shuts down awareness of voluntary actions”.
- **[G6]** Puglisi et al., 2019, *Brain*, right frontal white-matter pathways and executive function.
- **[G7]** Rossi et al., 2019, *Journal of Neurosurgery*, praxis circuit / hand manipulation mapping.
- **[G8]** Viganò et al., 2022, *Frontiers in Oncology*, transcranial vs direct electrical stimulation for intraoperative MEP monitoring.
- **[G9]** Viganò et al., 2019, *Cortex*, human hand-knob electrophysiology.

### Status legend

- **✅** directly supported by our material;
- **⚠️** partially supported: the principle is clear, but a detail of the current ACEP setup still needs verification;
- **📚** theoretical topic not sufficiently documented in the group corpus and requiring general literature.

---

## A. ACEP fundamentals and physiological meaning

### 1. What is an axono-cortical evoked potential?
**Answer:** An ACEP is a time-locked cortical response elicited by electrically stimulating a subcortical white-matter site. In our study, stimulation is delivered at iVSAT-positive subcortical sites and cortical activity is recorded over the superior frontal gyrus/lateral pre-SMA. Importantly, an ACEP is not “the signal of a tract”; it is a cortical response produced after electrically recruiting neural elements, most plausibly axons, near the stimulation site. **Status: ✅ [A2].**

### 2. What are we physically measuring with the cortical electrode?
**Answer:** The cortical electrode measures an extracellular voltage difference between the recording contact and a reference. That voltage reflects the summed electrical activity of local and nearby neuronal populations rather than single-neuron action potentials. Therefore, waveform amplitude and polarity depend not only on physiology but also on source geometry, electrode position, and the chosen reference. **Status: 📚; historical ECoG setup in [G4, G5].**

### 3. Why can stimulation of white matter produce a response in distant cortex?
**Answer:** The working physiological model is that electrical stimulation recruits axons close to the probe, generates propagating action potentials, and activates a connected cortical population. The distant cortical response is then recorded as an evoked field potential. The detailed biophysics of extracellular axonal activation is not fully developed in the group papers and should be supported by general neurophysiology literature. **Status: ✅ for the paradigm [A1, A2], 📚 for the mechanism.**

### 4. Why do we call it “axono-cortical” rather than simply “subcortico-cortical”?
**Answer:** “Subcortico-cortical” describes the spatial arrangement, whereas “axono-cortical” emphasizes the proposed physiological substrate: stimulation of axonal elements in white matter followed by a cortical response. The term therefore carries a mechanistic interpretation, not just an anatomical one. That mechanism should still be expressed cautiously because the exact recruited fibers are not directly visualized by the evoked potential itself. **Status: ✅ [A1, A2], mechanism to be further developed.**

### 5. Does an ACEP prove that two regions are anatomically connected?
**Answer:** It provides evidence that stimulation at one subcortical location can reproducibly influence a cortical recording site with a characteristic latency and topography. This supports a connectivity relationship, especially when appropriate negative and topographic controls are present. However, ACEP alone does not identify a single tract with certainty or fully reconstruct the anatomical route taken by the response. **Status: ✅ as a cautious interpretation [A2, G1].**

### 6. Does an ACEP prove monosynaptic connectivity?
**Answer:** No. A short latency is compatible with rapid and relatively direct propagation, but latency alone cannot establish that no intermediate synapse or parallel pathway is involved. Demonstrating monosynaptic connectivity would require additional physiological and anatomical evidence beyond the ACEP waveform. **Status: 📚; not demonstrated by the group corpus.**

### 7. What does “task-independent” mean in this context?
**Answer:** The functional subcortical site is first identified behaviorally during awake mapping, but once that site has been established, the ACEP can be evoked without requiring active task performance for every stimulus. In practical terms, the electrophysiological readout does not depend on the patient producing an overt behavioral response on each trial. This is the basis for its potential use beyond fully awake task-based mapping. **Status: ✅ [A1, A2].**

### 8. What is the potential advantage of ACEP over behavioral mapping alone?
**Answer:** Behavioral mapping tells us whether stimulation disrupts a function, whereas ACEP adds an electrophysiological marker linking a functionally identified subcortical site to a cortical response. The two approaches are complementary: one probes behavior and the other probes evoked network physiology. A reliable electrophysiological marker could be particularly valuable when continuous active performance is not possible. **Status: ✅ [A1, A2].**

### 9. Why might ACEPs be useful during asleep surgery?
**Answer:** Because the evoked response can in principle be recorded without the patient performing the cognitive task at that moment. Our abstract explicitly proposes this as a future clinical application, but our current study was performed during awake surgery, so asleep applicability remains a hypothesis to be prospectively validated. It should therefore be presented as a translational direction rather than an established indication. **Status: ✅ [A1, A2].**

### 10. What is the difference between ACEP/SCEP and CCEP?
**Answer:** In ACEP/SCEP paradigms, stimulation is delivered in subcortical white matter and the response is recorded from cortex. In CCEP paradigms, one cortical site is stimulated and responses are recorded from another cortical site. Both probe effective connectivity, but the stimulated neural compartment, field geometry, and interpretation are different. **Status: 📚.**

---

## B. Stimulator, probe, and stimulus waveform

### 11. Which stimulator do we use to generate ACEPs?
**Answer:** The current ACEP abstract does not specify the stimulator model. Previous work from our group used the **OSIRIS NeuroStimulator (Inomed), integrated with the ISIS system**, for low-frequency direct electrical stimulation, but we cannot automatically assume that the same generator was used for the ACEP protocol. This must be verified directly from the current operating-room setup or acquisition log. **Status: ⚠️ [G3, G4].**

### 12. Is the ACEP stimulator constant-current or constant-voltage?
**Answer:** This is not explicitly stated for the current ACEP protocol. Historical LF-DES and HF-DES protocols from our group are described as constant-current stimulation, but that information cannot be transferred to the ACEP setup without confirmation. The distinction matters because current delivered to tissue behaves differently under constant-current and constant-voltage stimulation when impedance changes. **Status: ⚠️ [G3, G4, G8].**

### 13. Which electrode or probe is used for subcortical ACEP stimulation?
**Answer:** The ACEP abstract does not report the exact probe model, contact diameter, or geometry. In the iVSAT mapping protocol, a bipolar probe with a 5-mm inter-tip distance is used, and older LF-DES studies describe two 2-mm ball tips separated by 5 mm. We need to verify whether ACEP stimulation uses that same probe or a different configuration. **Status: ⚠️ [G1, G3, G4].**

### 14. Is ACEP stimulation monopolar or bipolar?
**Answer:** The phrase “biphasic pulse” refers to the temporal polarity of the stimulus waveform and does not tell us whether the spatial stimulation configuration is monopolar or bipolar. The iVSAT mapping protocol is bipolar, but the ACEP abstract does not explicitly state the spatial configuration of the single-pulse stimulation. This is therefore a specific setup detail that must be confirmed. **Status: ⚠️ [A2, G1].**

### 15. What exactly does “biphasic pulse” mean?
**Answer:** A biphasic pulse contains two phases of opposite electrical polarity within a single stimulus event. In the group’s LF-DES literature, the stimulus is explicitly described as a biphasic square-wave pulse, while the ACEP protocol reports single biphasic pulses. To fully characterize the waveform, however, we still need phase duration, relative amplitude, interphase interval if any, and first-phase polarity. **Status: ✅ for the basic definition [A2, G3, G4].**

### 16. Does 0.5 ms mean 0.5 ms per phase or 0.5 ms total pulse duration?
**Answer:** The ACEP abstract only states “pulse width 0.5 ms”, which is technically ambiguous. Older LF-DES papers from our group explicitly state **0.5 ms per phase**, but that cannot be assumed for the current single-pulse ACEP protocol. This is one of the most important technical details to verify because it directly affects charge per phase and stimulation dose. **Status: ⚠️ [A2, G3, G4].**

### 17. Are the two phases symmetrical?
**Answer:** This is not documented for the current ACEP protocol. “Biphasic” only tells us that polarity reverses; it does not guarantee equal amplitude, equal duration, or zero net charge. The exact waveform should be checked in the stimulator settings or technical manual. **Status: ⚠️.**

### 18. What is the polarity of the first phase?
**Answer:** The available ACEP material does not report whether the first phase is cathodic or anodic. This matters because the spatial pattern of membrane polarization and therefore neural recruitment can depend on electrode geometry and pulse polarity. We should obtain this information directly from the stimulator configuration. **Status: ⚠️.**

### 19. Why are biphasic pulses used?
**Answer:** The group papers document their use but do not provide a detailed electrochemical rationale. In general neurostimulation practice, biphasic stimulation is used to reduce net charge accumulation and electrode polarization compared with unbalanced monophasic stimulation. The exact safety implications depend on charge balance, electrode material, contact area, and pulse parameters. **Status: 📚.**

### 20. Why was a pulse width of 0.5 ms chosen?
**Answer:** A 0.5-ms pulse width is consistent with several intraoperative stimulation protocols used by our group, including LF-DES and HF-DES. However, the ACEP abstract does not provide a specific strength-duration rationale for selecting this value. Therefore, at the congress we should distinguish “this is our protocol” from “this is physiologically optimal,” unless additional validation data are available. **Status: ⚠️ [G1, G3, G4, G8].**

### 21. Why do we stimulate at 1.1 Hz?
**Answer:** Both ACEP abstracts use 1.1-Hz single-pulse stimulation, but the rationale is not explicitly stated. A low repetition rate is consistent with the need to separate individual evoked responses in time and minimize overlap between successive responses, but this is a general inference rather than a source-derived explanation. The protocol-specific reason should be confirmed with the team. **Status: ⚠️ [A1, A2].**

### 22. Is 1.1 Hz the programmed frequency or the frequency actually measured in the data?
**Answer:** The abstract does not specify this. Technically, a nominal stimulator setting and the interstimulus intervals observed from recorded triggers are not necessarily identical. For high-confidence latency and trial-level analyses, the actual event timing should be verified from the raw acquisition rather than assumed from the nominal setting. **Status: ⚠️.**

### 23. Why use single pulses instead of a train of stimuli?
**Answer:** The iVSAT behavioral mapping protocol uses a 60-Hz train to transiently interfere with ongoing function, whereas the ACEP protocol uses isolated single pulses to generate discrete responses that can be temporally aligned, averaged, and characterized. These are different experimental goals: functional disruption versus evoked-response measurement. The precise cellular reasons for these differences belong to general stimulation physiology. **Status: ✅ for the protocol distinction [A2, G1], 📚 for the full mechanism.**

### 24. Why do we start at 20 mA and progressively decrease the current?
**Answer:** The protocol explicitly states that ACEP stimulation starts at 20 mA and is reduced until the response threshold is reached. Operationally, this allows the team to first establish that an evoked response can be obtained and then identify the lowest current at which it remains reproducible. The abstract, however, does not formally define the thresholding algorithm, so this rationale should be presented as an interpretation until confirmed. **Status: ⚠️ [A2].**

### 25. In what current steps do we decrease stimulation?
**Answer:** The ACEP abstract does not report the step size. In a previous subcortical manipulation-mapping study, LF-DES threshold was reassessed in **0.5-mA steps**, but we should not import that value into the ACEP protocol without direct confirmation. This needs to be recovered from the operating protocol or raw stimulation log. **Status: ⚠️ [G2].**

### 26. How exactly do we define the ACEP response threshold?
**Answer:** We know that the observed ACEP threshold in our cohort is **2–5 mA**, but the operational criterion is still undocumented in the material we have reviewed. We need to know whether threshold means the lowest current producing a reproducible waveform across a predefined number of trials, whether an amplitude or SNR criterion is used, and whether all contacts must meet the same rule. Without that definition, “threshold” is not fully reproducible. **Status: ⚠️ [PROTO].**

### 27. How many trials must show a response before we call it present?
**Answer:** This is not specified for ACEP. In behavioral mapping studies from our group, a site is often considered eloquent when a reproducible error occurs in three non-consecutive stimulation trials, but that criterion cannot be transferred automatically to electrophysiological response detection. The ACEP-specific reproducibility rule must be verified. **Status: ⚠️ [G1, G6, G7].**

### 28. How many pulses are acquired for each ACEP condition?
**Answer:** The abstract does not report the number of single-pulse trials contributing to each average. This number directly affects SNR, precision of latency and amplitude estimates, and the ability to assess trial-to-trial reliability. It should be extracted from the protocol or from the raw files before the congress. **Status: ⚠️.**

### 29. How much time separates different stimulation conditions or series?
**Answer:** This is not documented for the ACEP protocol. Previous behavioral DES paradigms often leave several seconds between stimulation epochs to reduce carry-over or “dragging” effects, but ACEP single-pulse acquisition has a different temporal structure. The actual transition timing between current levels and sites should therefore be checked directly. **Status: ⚠️ [G3, G7, G9].**

### 30. What is the charge per phase of our stimulus?
**Answer:** Charge per phase is calculated as \(Q=I\times t\), but only after clarifying whether 0.5 ms refers to each phase. If it is 0.5 ms per phase, a 2–5 mA threshold corresponds to approximately **1–2.5 µC per phase**, while 20 mA corresponds to **10 µC per phase**. If 0.5 ms refers to the total biphasic duration, those numbers would be different. **Status: ⚠️ [PROTO, A2].**

### 31. What is the charge density at the electrode–tissue interface?
**Answer:** We cannot calculate charge density until we know the effective electrode contact area and the exact charge per phase. Charge density is charge divided by the geometric or effective electrode area, so probe geometry is essential. This is therefore a setup-dependent quantity, not something that can be inferred from current alone. **Status: ⚠️.**

### 32. Why does the same current not necessarily recruit the same neural population at two different sites?
**Answer:** Equal current does not imply equal electric field distribution or equal axonal recruitment. Local tissue geometry, distance from the probe, fiber orientation, white-matter architecture, and conductivity can all differ between sites. Our group literature already acknowledges current spread and anatomical variability as relevant limitations of DES, while the full biophysical explanation comes from general stimulation physiology. **Status: ✅ for the general limitation [G1], 📚 for complete biophysics.**

### 33. Why does the same charge not necessarily produce the same physiological effect?
**Answer:** Charge is only one descriptor of a stimulus. Different combinations of current amplitude and pulse duration can deliver the same charge but interact differently with membrane time constants and excitation thresholds. Therefore, equal charge does not guarantee equal neural recruitment, equal focality, or equal physiological effect. **Status: 📚.**

### 34. How do axon diameter, myelination, and orientation affect stimulation threshold?
**Answer:** These factors influence how an axon responds to an externally applied electric field. Larger, myelinated fibers are often more excitable under many stimulation conditions, while orientation relative to the field and proximity to strong spatial field gradients can substantially modify threshold. This topic is not developed in the group papers and requires dedicated neurostimulation literature. **Status: 📚.**

### 35. What is the volume of tissue activated?
**Answer:** The volume of tissue activated is the region in which the stimulation-induced electric field is sufficient to recruit neural elements under the specific stimulation conditions. It is not identical to the physical size of the electrode and cannot be defined solely by current amplitude. Electrode geometry, tissue conductivity, anisotropy, pulse parameters, and distance all contribute. **Status: 📚.**

### 36. What determines the focality of stimulation?
**Answer:** Focality depends on electrode geometry, inter-contact distance, current amplitude, pulse parameters, tissue conductivity, and the spatial organization of nearby fibers. Our group describes bipolar stimulation as relatively focal, but “focal” should not be interpreted as activating only one tract or one microscopic region. Current spread remains a relevant limitation. **Status: ✅/📚 [G4, G5].**

---

## C. ECoG recording system

### 37. Which system do we use to record ACEP ECoG?
**Answer:** The ACEP abstract does not specify the acquisition system. Historical work from our group reports **Comet/Grass** systems for intraoperative ECoG, whereas ISIS/Inomed systems were used for EMG/MEP monitoring. We must verify the exact hardware used for ACEP because amplifier characteristics directly affect artifact handling and early-latency interpretation. **Status: ⚠️ [G4, G5].**

### 38. What is the ACEP sampling rate?
**Answer:** It is not reported in the abstract or the material reviewed so far. This is a high-priority technical detail because sampling rate determines temporal resolution and constrains the precision with which components occurring within the first 15 ms can be measured. It should be obtained directly from the raw-data header or acquisition software. **Status: ⚠️.**

### 39. What is the corresponding temporal resolution?
**Answer:** Temporal resolution per sample is \(1/F_s\), where \(F_s\) is the sampling frequency. For example, 1 kHz corresponds to 1 ms per sample and 5 kHz to 0.2 ms per sample. We cannot give the value for our ACEP data until the actual sampling rate is verified. **Status: ⚠️.**

### 40. What is the Nyquist frequency?
**Answer:** The Nyquist frequency is half the sampling rate, \(F_s/2\), and represents the highest frequency that can theoretically be represented without aliasing under appropriate anti-alias filtering. Because our sampling rate is currently unknown, the numerical Nyquist frequency is also unknown. **Status: ⚠️.**

### 41. What are the strip characteristics: number of contacts, contact diameter, and spacing?
**Answer:** The ACEP abstract only states that a strip electrode was used. Historical studies from our group report 4–8 contact subdural strips for ECoG and 4/6-contact strips for MEP monitoring, but the ACEP strip model and geometry must be verified independently. These dimensions matter because they determine spatial sampling and influence recorded amplitude. **Status: ⚠️ [G4, G5, G8].**

### 42. Where exactly is the strip positioned in our study?
**Answer:** The main recording strip is placed over the exposed **superior frontal gyrus**, corresponding to the **lateral pre-SMA** region. Additional recordings from the precentral gyrus serve as a cortical topographic control. This spatial arrangement is central to the interpretation of cortical specificity. **Status: ✅ [A2].**

### 43. How is the lateral pre-SMA localized?
**Answer:** The ACEP abstract does not describe the exact intraoperative localization procedure for the recording strip. [G1] identifies the relevant region around the SMA/pre-SMA transition using causal mapping and neuronavigation, but we still need the exact method used to position and document the ACEP strip. Ideally, we should know whether localization relies on anatomical landmarks, navigation coordinates, photographs, or a combination. **Status: ⚠️ [G1].**

### 44. What reference is used for ACEP recording?
**Answer:** This is not reported in the current ACEP material. It is essential because every recorded channel represents a voltage difference relative to the reference, so reference choice can alter apparent amplitude, polarity, and spatial distribution. This detail must be obtained from the acquisition montage. **Status: ⚠️.**

### 45. Where is the ground electrode located?
**Answer:** The ACEP ground location is not documented. Historical HF-DES protocols describe scalp or cranial reference/ground arrangements, but those circuits cannot be assumed to match the ACEP recording montage. We need the actual ACEP wiring diagram or acquisition notes. **Status: ⚠️ [G4, G8].**

### 46. Why can the reference change amplitude, polarity, and waveform morphology?
**Answer:** A channel does not measure an absolute cortical voltage; it measures the difference between an active contact and a reference. If the reference itself contains physiological or artifactual activity, that activity is mathematically subtracted from every referenced channel. Changing the reference can therefore change waveform shape, size, and even apparent polarity without any change in the underlying neural generators. **Status: 📚.**

### 47. Do we use a common reference, common average, or bipolar derivation?
**Answer:** This has not yet been documented for ACEP. Historical ECoG monitoring in our group used a **monopolar array referenced to a mid-frontal electrode**, but ACEP may use a different montage or offline rereferencing. We should identify both the online reference and any offline rereferencing step. **Status: ⚠️ [G4, G5].**

### 48. What does “recorded unfiltered” mean in the abstract?
**Answer:** In the abstract, “unfiltered” means that the reported 1–300 Hz band-pass was applied during postprocessing rather than being the stated acquisition filter. It does not necessarily mean that the analog amplifier had infinite bandwidth or no anti-alias filter. Hardware systems almost always have physical frequency limits, which must be distinguished from offline digital filtering. **Status: ✅/⚠️ [A2].**

### 49. Was the signal truly acquired without filters, or are hardware filters present?
**Answer:** We do not yet know. The acquisition system may include analog high-pass, low-pass, anti-alias, or protection circuitry even if no digital online band-pass was selected. This must be checked in the amplifier specifications and acquisition settings because hardware filtering cannot be undone offline. **Status: ⚠️.**

### 50. What is the amplifier dynamic range?
**Answer:** It is not documented in the material reviewed. Dynamic range determines how large a voltage excursion can be recorded before clipping or saturation, which is especially important when the stimulation artifact is orders of magnitude larger than the physiological response. We should retrieve the amplifier model and technical specifications. **Status: ⚠️.**

### 51. How quickly does the amplifier recover after the stimulation artifact?
**Answer:** This is also unknown and is particularly important for interpreting P0/N0 components occurring within 15 ms. If the front-end amplifier saturates, the first milliseconds may reflect recovery behavior rather than neural activity. We therefore need either manufacturer specifications or direct inspection of the raw traces around the stimulus. **Status: ⚠️.**

---

## D. Stimulator–ECoG synchronization

### 52. How is the stimulator synchronized with the ECoG recording system?
**Answer:** The available material does not describe the synchronization chain. We need to know whether a hardware trigger, digital event line, or software event is recorded together with the ECoG. Without this information, the accuracy of latency measurements cannot be fully assessed. **Status: ⚠️.**

### 53. Is there a hardware TTL trigger?
**Answer:** This has not yet been documented. A TTL trigger recorded directly by the acquisition system would provide a relatively precise event marker, but we must verify whether such a line exists in our setup. The raw file should be inspected for a dedicated stimulation/event channel. **Status: ⚠️.**

### 54. Is the event marker generated in software instead?
**Answer:** This is also unknown. Software markers can be useful, but their timing may include operating-system, communication, or software latency that differs from the actual electrical pulse. We therefore need to distinguish software command time from physical stimulus time. **Status: ⚠️.**

### 55. How do we define \(t=0\) precisely?
**Answer:** Ideally, \(t=0\) should correspond to the sample marking the actual onset of the delivered electrical pulse, or to a hardware trigger whose latency relative to that pulse is known and stable. At present, the abstract does not specify how this is implemented. This is critical because all reported ACEP latencies are measured relative to this reference point. **Status: ⚠️.**

### 56. What is the temporal jitter of the trigger?
**Answer:** The trigger jitter has not been quantified in the available material. If we interpret differences of only a few milliseconds, event timing must be stable enough that trigger variability is much smaller than the physiological effect of interest. This can be assessed from repeated trigger–artifact relationships in the raw data or from device specifications. **Status: ⚠️.**

### 57. Does the trigger mark the stimulation command or the pulse actually delivered to tissue?
**Answer:** This is not yet known. A command marker may precede the actual current pulse by a fixed or variable device latency, whereas a marker derived from the output stage may better represent true delivery time. The distinction directly affects physiological latency estimates. **Status: ⚠️.**

### 58. Do the stimulator and ECoG system share the same clock?
**Answer:** This is not documented. If they share a clock or the stimulator event is captured directly by the ECoG system, alignment may be straightforward; if they run on independent clocks, synchronization and drift become more important. We need the hardware architecture to answer this confidently. **Status: ⚠️.**

### 59. Can clock drift occur between the systems?
**Answer:** In principle, yes, if independent clocks are used over sufficiently long recordings. Whether drift is relevant in our actual setup depends on how the trigger is recorded and whether the systems are synchronized. This is a theoretical possibility until the acquisition chain is known. **Status: ⚠️/📚.**

### 60. Can we associate every single stimulus with the corresponding ECoG sample?
**Answer:** This should be a core requirement of the analysis pipeline. For each trial, we ideally want the exact sample index of the stimulation event together with stimulus parameters and recording channels. The abstract does not tell us whether this trial-by-trial association has already been reconstructed, so it must be verified in the raw-data workflow. **Status: ⚠️.**

---

## E. Stimulation artifact, preprocessing, and signal quality

### 61. How is the stimulation artifact handled?
**Answer:** The ACEP abstract does not describe an artifact-removal procedure. This is one of the most urgent technical gaps because the electrical artifact can be much larger than the physiological response and may contaminate the first milliseconds. We need the exact pipeline used before interpreting the early component. **Status: ⚠️.**

### 62. Does the amplifier saturate during stimulation?
**Answer:** This has not yet been established. Saturation should be assessed directly in the raw data by looking for clipping, flat-topped waveforms, or prolonged recovery after the pulse. If saturation occurs, the earliest post-stimulus samples require particular caution. **Status: ⚠️.**

### 63. How many milliseconds after the stimulus are contaminated by artifact?
**Answer:** The contaminated window is not reported. It should be empirically defined from the raw signal and may depend on current intensity, pulse shape, electrode geometry, amplifier characteristics, and filtering. This is especially important because our P0/N0 component lies within the first 15 ms. **Status: ⚠️.**

### 64. Do we use blanking, interpolation, template subtraction, or another artifact-removal method?
**Answer:** No specific method is documented in the abstract. We need to determine whether the artifact is simply excluded, replaced/interpolated, modeled and subtracted, or left in place with a protected analysis window. Each method can influence early waveform morphology differently. **Status: ⚠️.**

### 65. How do we distinguish an early P0/N0 from residual stimulation artifact?
**Answer:** The study design provides several supportive features: the response is reproducible, follows functionally positive sites, is absent at matched-current negative sites, and is absent or markedly attenuated at a different cortical recording location. Those controls make a purely nonspecific artifact explanation less likely. However, they do not replace a direct characterization of amplifier recovery, raw artifact morphology, and filtering effects. **Status: ✅/⚠️ [A2].**

### 66. Can filtering produce ringing?
**Answer:** Yes. A sharp, high-amplitude stimulation transient contains broad-frequency energy, and band-pass filtering can transform that transient into oscillatory ringing that may resemble a physiological waveform. This is why the unfiltered/raw trace and the exact filter design are essential when interpreting early components. **Status: 📚/⚠️.**

### 67. Can a filter create apparent activity before or immediately after the stimulus?
**Answer:** Yes, particularly with non-causal or zero-phase filters, because information can be distributed both forward and backward in time around a sharp transient. This may create pre-ringing or distort the apparent onset of an early component. Therefore, causal properties and impulse response of the filter must be known before making latency claims. **Status: 📚/⚠️.**

### 68. Why was a 1–300 Hz band-pass chosen?
**Answer:** The abstract reports a 1–300 Hz offline band-pass but does not state the rationale. The range is broad enough to retain relatively fast evoked transients while removing very slow drift and high-frequency noise, but that explanation is general rather than source-derived. We should verify whether this range was chosen empirically, historically, or based on prior ACEP/CCEP literature. **Status: ⚠️ [A2].**

### 69. What type of filter is used: FIR or IIR?
**Answer:** This is not documented. FIR and IIR filters differ in phase behavior, impulse response, transition characteristics, and susceptibility to ringing. Because the stimulation artifact is a strong transient, the exact filter family is not a trivial implementation detail. **Status: ⚠️.**

### 70. What filter order or transition bandwidth is used?
**Answer:** This is not reported. Filter order and transition bandwidth determine how sharply frequencies are attenuated and how long the filter impulse response extends in time. Those properties can materially affect the shape of an evoked potential close to a stimulation artifact. **Status: ⚠️.**

### 71. Is the filter causal or zero-phase?
**Answer:** This is currently unknown. A causal filter preserves temporal direction but can introduce phase delay, whereas zero-phase filtering avoids net phase shift at the cost of using future samples and potentially producing pre-ringing. For early-latency ACEPs, this distinction must be explicitly known. **Status: ⚠️.**

### 72. Do we perform baseline correction?
**Answer:** The abstract does not say whether each epoch is baseline-corrected. If baseline correction is used, we need the exact pre-stimulus interval and confirmation that it is free of contamination from preceding stimuli or drift. Baseline choice can influence measured amplitude, especially for slow components. **Status: ⚠️.**

### 73. What is the epoch time window?
**Answer:** It is not reported. We need to know the pre-stimulus and post-stimulus duration used for each trial, both to assess baseline quality and to determine whether later responses or filter edge effects are included. The epoch should be long enough to characterize the response without overlapping adjacent stimuli. **Status: ⚠️.**

### 74. How are noisy or pathological trials rejected?
**Answer:** No rejection criteria are described in the abstract. We should know whether trials are excluded for amplifier saturation, movement, epileptiform discharges, excessive baseline noise, channel malfunction, or other predefined criteria. A reproducible pipeline should distinguish automated rejection rules from manual inspection. **Status: ⚠️.**

### 75. Do we inspect single trials or only the averaged waveform?
**Answer:** The abstract describes reproducible responses but does not specify how trial-level reproducibility is assessed. For technical credibility, we should be able to show that the average is supported by consistent single-trial responses rather than a few outliers. Single-trial inspection is also essential for measuring latency jitter and response probability. **Status: ⚠️ [A2].**

### 76. How does averaging improve signal-to-noise ratio?
**Answer:** If the physiological response is time-locked and the background noise is independent across trials, averaging preserves the evoked component while random noise tends to cancel. Under ideal assumptions, random noise decreases approximately with \(1/\sqrt{N}\). Real ECoG noise is not perfectly independent, so the empirical SNR gain should still be evaluated. **Status: 📚.**

---

## F. P0/N0, P1/N1, and quantitative features

### 77. How do we define P0/N0 and P1/N1?
**Answer:** In our abstract, P0/N0 refers to an early component occurring within **15 ms**, whereas P1/N1 refers to a subsequent component within **50 ms**. P and N describe observed polarity. What remains unknown is the exact algorithm or visual rule used to identify each peak and how ambiguous or multi-peaked responses are handled. **Status: ✅/⚠️ [A2].**

### 78. What do P and N mean?
**Answer:** P denotes a positive-going deflection and N a negative-going deflection relative to the chosen reference and plotting convention. These labels are descriptive and should not be equated directly with neuronal excitation or inhibition. The same underlying generator can appear with different polarity under a different montage. **Status: 📚.**

### 79. Does waveform polarity have a simple physiological meaning?
**Answer:** No. Polarity reflects the spatial orientation of current sources and sinks, cortical geometry, electrode position, and the reference montage. Therefore, a positive versus negative deflection is not a direct readout of excitatory versus inhibitory physiology. Interpretation should focus on reproducibility, timing, topography, and context rather than sign alone. **Status: 📚.**

### 80. Are peaks identified automatically or manually?
**Answer:** This is not specified. We need to know whether peak detection uses a predefined algorithm, a time window with maximum/minimum search, manual marking, or a hybrid approach. This matters for reproducibility and for understanding potential observer bias. **Status: ⚠️.**

### 81. Do we measure peak latency or onset latency?
**Answer:** The abstract reports temporal windows for the components but does not make clear whether the reported values represent peak timing, onset timing, or simply categorical windows. Peak and onset latency answer different physiological questions and require different detection rules. We should clarify which metric is actually used in the analysis. **Status: ⚠️.**

### 82. How do we define response onset?
**Answer:** No operational definition is currently documented. A robust onset measure should use a reproducible criterion, for example deviation from baseline beyond a statistical or amplitude threshold for a minimum duration. Whatever rule is used must also be robust to residual stimulation artifact. **Status: ⚠️.**

### 83. How is ACEP amplitude measured?
**Answer:** The material reviewed does not state whether amplitude is defined as absolute peak, peak-to-peak, mean amplitude in a window, or another feature. This needs to be standardized because different definitions can produce different dose-response relationships. The reference montage must also be reported alongside amplitude measurements. **Status: ⚠️.**

### 84. What SNR threshold is required to call a response present?
**Answer:** No explicit SNR criterion is reported. If response presence is based on reproducibility rather than an SNR threshold, that rule should be stated clearly. Ideally, detection should be defined prospectively so that response/no-response classification is not subjective. **Status: ⚠️.**

### 85. Why is a component within 15 ms considered “early”?
**Answer:** It occurs very close to the stimulation event and precedes the later component observed within 50 ms. Such a short delay is compatible with relatively rapid propagation from the stimulated white matter to the cortical recording site. However, “early” is a temporal description and does not by itself prove a single direct anatomical pathway. **Status: ✅/📚 [A2].**

### 86. What could generate P0/N0?
**Answer:** Within the proposed ACEP framework, P0/N0 is consistent with an early cortical response following electrically induced propagation along subcortical axons. However, the exact generator, number of synapses, and contribution of local field effects are not established by the abstract alone. Technical exclusion of stimulation artifact is also essential before assigning a physiological interpretation. **Status: ⚠️ [A2].**

### 87. What could generate P1/N1?
**Answer:** The later P1/N1 component may reflect subsequent cortical or network processing after the initial response, potentially including polysynaptic activity or local cortical dynamics. This interpretation is plausible but is not directly established by the current abstract. Dedicated ACEP/CCEP physiology literature is required for a stronger mechanistic claim. **Status: 📚.**

### 88. Can we calculate conduction velocity from the measured latency?
**Answer:** Not directly from latency alone. Conduction velocity requires a meaningful estimate of path length and must account for stimulation-to-axon activation delay, synaptic delay if present, and cortical response-generation time. Without those assumptions, dividing distance by total latency would over-simplify the physiology. **Status: 📚.**

### 89. What assumptions are required to estimate conduction velocity?
**Answer:** We would need the effective path length actually followed by the activated fibers, the location where the action potential is initiated, the true cortical target, the number of synaptic relays, and accurate stimulus timing. Each uncertainty propagates into the velocity estimate. Therefore, any value should be framed as an approximation rather than a direct measurement unless the pathway is very well constrained. **Status: 📚.**

### 90. Does a larger ACEP amplitude mean that more fibers were recruited?
**Answer:** It may be compatible with greater recruitment, but amplitude is not a direct fiber count. It is also influenced by synchrony, cortical generator geometry, distance from the recording contact, reference montage, impedance, and noise. A larger waveform should therefore be interpreted as a larger recorded field potential, not automatically as a larger number of activated axons. **Status: 📚.**

### 91. Why is “amplitude equals connection strength” too simplistic?
**Answer:** Recorded amplitude is the end product of several stages: electrical recruitment, axonal propagation, temporal synchrony, cortical response generation, volume conduction, and recording montage. Any of these can alter amplitude without changing the underlying anatomical connection. ACEP amplitude is therefore a physiological measurement influenced by connectivity, not a direct scalar measure of structural connection strength. **Status: 📚.**

### 92. What might it mean if latency decreases as current increases?
**Answer:** A shorter latency could reflect more effective recruitment of rapidly conducting fibers, more synchronized activation, or improved detectability of the early component. It could also arise from thresholding bias or changes in artifact morphology. The interpretation therefore requires trial-level data and consistent latency detection. **Status: 📚.**

### 93. What might it mean if amplitude increases as current increases?
**Answer:** This pattern would be compatible with recruitment of a larger or more synchronized neural population and would fit a dose-response relationship. However, amplitude can eventually saturate and may also be affected by current-dependent artifact, amplifier behavior, or changing spatial spread. The physiological interpretation should therefore be supported by controls and raw data. **Status: 📚.**

### 94. What does a change in waveform morphology mean?
**Answer:** A change in shape may indicate recruitment of additional neural populations, altered synchrony, multiple propagation routes, or different cortical generators. It can also be produced artificially by changes in stimulation artifact, filtering, reference, or SNR. Morphological differences should therefore be interpreted only after the signal-processing pipeline is stable and validated. **Status: 📚.**

### 95. What does greater temporal dispersion mean?
**Answer:** Greater temporal dispersion means that contributing neural events reach the recording site less synchronously, producing a broader or less sharply defined waveform. Possible causes include heterogeneous conduction velocities, multiple pathways, variable recruitment, or synaptic/network processing. Technical timing jitter must also be excluded before attributing dispersion to physiology. **Status: 📚.**

---

## G. iVSAT, behavioral mapping, and neuroanatomy

### 96. How are attention-positive sites identified?
**Answer:** During the iVSAT, low-frequency direct electrical stimulation is applied during cortical and subcortical mapping. A site is considered functionally positive when stimulation reproducibly induces a target-omission error. These behaviorally defined sites are then used as the subcortical targets for the ACEP experiment. **Status: ✅ [G1].**

### 97. What kind of error makes a site attention-positive?
**Answer:** During iVSAT, the patient searches a letter string for the target “H”. A stimulation-induced omission of the target is the relevant behavioral error, and the spatial side of the omission is used to characterize neglect-like lateralized effects. This provides a direct behavioral criterion for classifying a stimulation site. **Status: ✅ [G1].**

### 98. How many positive stimulations are required to define a site as positive?
**Answer:** In the iVSAT protocol, a site is classified as positive when the error occurs in **three non-consecutive stimulation trials**. Using non-consecutive trials reduces the likelihood that the result reflects a transient fluctuation or systematic sequence effect. This is a behavioral mapping criterion, not an ACEP response-detection criterion. **Status: ✅ [G1].**

### 99. What stimulation protocol is used during iVSAT?
**Answer:** The iVSAT protocol uses **low-frequency DES with biphasic square-wave pulses, 0.5-ms pulse width, 60 Hz, trains lasting 1–4 seconds, and a bipolar probe with 5-mm inter-tip spacing**. Stimulation current is individualized for each patient. This train-based protocol is designed for transient functional interference rather than evoked-potential acquisition. **Status: ✅ [G1].**

### 100. Why is iVSAT DES different from ACEP stimulation?
**Answer:** iVSAT DES uses a 60-Hz train delivered during task performance to transiently disrupt the function of a cortical or subcortical site. ACEP stimulation uses isolated pulses at 1.1 Hz so that each stimulus can be aligned with a distinct cortical response. The two protocols therefore answer different questions: “does disrupting this site alter behavior?” versus “what cortical response follows stimulation of this site?” **Status: ✅ [A2, G1].**

### 101. How is the stimulation current chosen for iVSAT DES?
**Answer:** In [G1], the current is individualized using the lowest current tested over ventral premotor cortex that consistently produces errors during language mapping. That same current is then maintained for subsequent cortical and subcortical iVSAT mapping within the patient. This approach standardizes mapping intensity within each case while respecting inter-individual variability. **Status: ✅ [G1].**

### 102. Where are the attention-positive sites located?
**Answer:** In [G1], positive sites are found in frontal white matter beneath the superior, middle, and inferior frontal gyri. The highest probability of neglect-like errors converges in white matter under the **SMA/pre-SMA transition**, with involvement of the mid-cingulate region. This provides the anatomical rationale for focusing ACEP recording on the superior frontal/lateral pre-SMA region. **Status: ✅ [G1].**

### 103. Which white-matter tracts might be involved?
**Answer:** [G1] identifies a frontal structural network and tractography patterns associated with eloquent sites, but the ACEP abstract does not assign each evoked response to one uniquely identified tract. At the congress, it is safer to distinguish “stimulation of a functionally defined white-matter region” from “proof that one named fascicle generated the response.” Tract attribution requires convergent anatomical evidence. **Status: ✅/⚠️ [G1, A2].**

### 104. How confidently can we identify a specific tract without tractography?
**Answer:** Neuronavigation and anatomical landmarks can localize the stimulation site, but they do not by themselves prove that only one tract was stimulated. Without tractography or another convergent anatomical method, the most defensible language is that the site is compatible with a given pathway or white-matter region. Over-specific tract labeling would exceed the direct evidence. **Status: ✅ as a methodological caution [G1].**

### 105. Why do we record from the superior frontal gyrus/lateral pre-SMA?
**Answer:** Our group’s causal mapping work identifies the superior frontal/SMA-preSMA region and its underlying white matter as a critical node for stimulation-induced neglect-like attentional errors. The ACEP experiment asks whether functionally positive subcortical sites produce a reproducible cortical electrophysiological signature in this region. Thus, the recording site is grounded in prior causal neuroanatomy rather than chosen arbitrarily. **Status: ✅ [G1, A2].**

### 106. What is the role of the lateral pre-SMA in visuospatial attention?
**Answer:** In [G1], stimulation of white matter beneath the superior frontal region around the SMA/pre-SMA transition is strongly associated with contralesional, neglect-like attentional errors. Lesion-symptom mapping, DES, and structural connectivity analyses converge on the causal relevance of this dorsomedial frontal region. The ACEP study extends that framework by adding an electrophysiological connectivity measure. **Status: ✅ [G1].**

### 107. Why does our ACEP study focus on right frontal tumors?
**Answer:** The right frontal attention network is particularly relevant for contralesional visuospatial bias. In [G1], right-sided stimulation produces selective iVSAT omissions consistent with neglect-like disruption, whereas the corresponding left-sided stimulation does not show the same pattern. This provides a causal rationale for restricting the ACEP attention study to right frontal cases. **Status: ✅ [G1].**

### 108. What is the relationship between neglect and the frontal attention network?
**Answer:** [G1] combines lesion-symptom mapping, intraoperative DES, and tractography to show that a right frontal, especially dorsomedial, network contributes causally to contralesional attentional allocation. This broadens classical neglect models that emphasize posterior regions by demonstrating an important frontal component. Our ACEP experiment probes the electrophysiological organization of that frontal network. **Status: ✅ [G1].**

### 109. How does our result relate to the dorsal and ventral attention network models?
**Answer:** [G1] discusses classical DAN/VAN models and shows that dorsomedial frontal territories, often underrepresented in stroke-based models, have a causal role in selective visuospatial attention. ACEP adds a task-independent electrophysiological readout of connectivity within this frontal system. However, the current ACEP data are not sufficient to assign the evoked response exclusively to DAN or VAN. **Status: ✅/⚠️ [G1, A2].**

---

## H. Experimental controls and specificity

### 110. Why are attention-negative subcortical sites an important control?
**Answer:** They test whether a cortical response is produced simply by stimulating any nearby white-matter location or whether it is associated specifically with sites identified as functionally relevant by iVSAT. In our abstract, matched-current stimulation of attention-negative sites does not produce reproducible ACEPs. This strengthens the argument that the response is not a generic consequence of current delivery. **Status: ✅ [A2].**

### 111. Why must negative sites be stimulated at matched current?
**Answer:** If negative sites were stimulated at a lower current, failure to obtain a response could simply reflect insufficient stimulation dose. Matching current reduces that confound and makes the positive-versus-negative site comparison more interpretable. It does not eliminate all anatomical differences, but it controls one major technical variable. **Status: ✅ [A2].**

### 112. What does the absence of a response at negative sites rule out, and what does it not rule out?
**Answer:** It argues against a response that is produced nonspecifically by the same electrical current at any subcortical location. However, it does not control for every local difference in fiber density, distance, orientation, conductivity, or proximity to the recorded cortex. Therefore, it supports functional specificity without proving that functional status is the only determinant of response. **Status: ✅/📚 [A2].**

### 113. Why do we also record from the precentral gyrus?
**Answer:** The precentral recording serves as a cortical topographic control. It tests whether the evoked signal is broadly distributed across nearby exposed cortex or preferentially expressed over the superior frontal/lateral pre-SMA target. This complements the subcortical negative-site control by testing specificity on the recording side of the experiment. **Status: ✅ [A2].**

### 114. What does an absent or markedly attenuated precentral response imply?
**Answer:** It supports topographic specificity of the cortical response toward the superior frontal recording region. A truly nonspecific field spread or global artifact would be expected to appear more similarly across recording sites, although geometry and reference effects still need consideration. Thus, the precentral control strengthens but does not by itself prove pathway-specific propagation. **Status: ✅ [A2].**

### 115. Does the precentral control completely exclude volume conduction?
**Answer:** No. It makes a purely widespread passive signal less likely, but volume conduction must also be assessed using latency, spatial gradients, electrode geometry, reference montage, and the shape of the response. A single negative cortical control cannot fully solve the volume-conduction problem. **Status: 📚.**

### 116. How can we distinguish passive volume conduction from physiological propagation?
**Answer:** No single criterion is sufficient. The strongest case comes from converging evidence: a non-zero physiological latency, reproducibility, spatial specificity, different behavior at positive and negative sites, dose-response properties, and direct characterization of the stimulation artifact. Our abstract already provides some of these controls, but not the complete technical validation. **Status: ✅/📚 [A2].**

### 117. What additional controls would strengthen the study?
**Answer:** Useful additions would include distance-matched negative sites, systematic single-trial analysis, explicit quantification of the stimulation artifact, multiple stimulation intensities, precise anatomical localization, and convergence with patient-specific tractography. Repeating the protocol under asleep conditions would also directly test the proposed clinical translation. **Status: 📚.**

### 118. Could distance between the stimulation site and recording contacts explain response differences?
**Answer:** Yes. Distance affects both the probability of stimulating fibers linked to the recording region and the amplitude of signals detected at the cortical surface. Therefore, stimulation-to-recording distance should ideally be measured and considered as a covariate rather than assumed to be equivalent across sites. **Status: 📚.**

### 119. Could electrode impedance explain amplitude differences?
**Answer:** It can contribute to recording quality, noise level, and effective signal amplitude, especially if contacts differ markedly in impedance. Impedance should therefore be documented together with channel quality. It is unlikely to be the sole explanation for a reproducible, anatomically specific pattern, but it remains a technical confound. **Status: 📚/⚠️.**

### 120. Can brain shift affect anatomical localization?
**Answer:** Yes. As resection proceeds, the relationship between preoperative imaging and the actual intraoperative anatomy can change. In [G1], stimulation coordinates are recorded before tumor debulking and confirmed using anatomy/video to reduce this problem. For ACEP, we need the exact timing and localization procedure to know how strongly brain shift may affect our anatomical interpretation. **Status: ✅/⚠️ [G1].**

---

## I. Resection, disconnection, and circuit integrity

### 121. When are ACEPs recorded relative to tumor resection?
**Answer:** The abstract does not define this with enough precision. We need to know whether the recording occurs before major disconnection, during progressive resection, or after a specific cortical/subcortical component has already been removed. This timing is essential because the physiological meaning of an evoked response depends on the structural state of the circuit. **Status: ⚠️.**

### 122. Is the stimulated pathway intact, partially disconnected, or isolated at the time of recording?
**Answer:** This is not documented for each ACEP acquisition. Without that information, it is difficult to know whether a response reflects an intact physiological network or electrical excitability of residual fibers after partial disconnection. The surgical stage should therefore be linked to each recording whenever possible. **Status: ⚠️.**

### 123. What happens to axonal excitability immediately after disconnection?
**Answer:** The supplied group literature does not directly address this neurophysiological question. In general, structural disconnection and immediate loss of electrical excitability are not identical processes, so an axonal segment may remain excitable for some time after being disconnected from its normal circuit. The exact time course requires dedicated literature. **Status: 📚.**

### 124. What is Wallerian degeneration, and over what time scale does it occur?
**Answer:** Wallerian degeneration is the progressive degeneration of the distal axonal segment after axonal injury or transection. It is not an instantaneous event and evolves over time rather than occurring at the moment of disconnection. The precise human central nervous system time course should be learned from dedicated neurobiology literature rather than inferred from our ACEP data. **Status: 📚.**

### 125. Can a disconnected fiber remain electrically excitable?
**Answer:** Potentially yes, at least transiently, because membrane excitability and participation in an intact functional circuit are different properties. Therefore, an electrically evoked response after disconnection does not automatically mean that the original physiological network remains functionally intact. This distinction is important when interpreting intraoperative responses obtained after partial resection. **Status: 📚.**

### 126. Does a post-resection evoked response prove that the physiological circuit is intact?
**Answer:** No. It proves that the stimulation can still recruit excitable neural elements and generate a measurable response under the tested conditions. Functional integrity requires broader evidence, including the structural state of the pathway, behavior, and ideally postoperative outcome or complementary physiological measures. **Status: 📚.**

### 127. How do we distinguish “electrically excitable fibers” from a “functionally intact network”?
**Answer:** We need convergent evidence. Electrical excitability is established by the ability to evoke a response, whereas functional integrity requires preserved behavioral function, appropriate anatomy, and a circuit capable of operating in its normal physiological context. An ACEP alone cannot establish all of these levels simultaneously. **Status: 📚.**

---

## J. Statistics, hierarchical data, and dose-response

### 128. Why do 20 patients not become thousands of independent observations simply because we deliver many stimuli?
**Answer:** Because multiple trials from the same site and multiple sites from the same patient share common biological and technical factors. They are correlated observations, not independent replications of the experiment. Treating every pulse as an independent sample would artificially inflate the effective sample size and underestimate uncertainty. **Status: 📚.**

### 129. Why are trials from the same patient not independent?
**Answer:** They share the same brain anatomy, pathology, recording hardware, reference, physiological state, surgical conditions, and often the same stimulation site. Those shared factors create within-patient correlation. Statistical models must therefore account for clustering rather than assuming that every trial comes from a new independent individual. **Status: 📚.**

### 130. What is the correct statistical unit: trial, site, or patient?
**Answer:** It depends on the scientific question, but the hierarchy must be respected. Trials are nested within stimulation sites, and sites are nested within patients, so none of these levels should be treated as interchangeable. Patient-level inference generally requires explicit modeling of the lower-level repeated measures. **Status: 📚.**

### 131. How should we analyze many trials per site and many sites per patient?
**Answer:** A natural approach is a hierarchical or mixed-effects model that includes the repeated structure of the data. Patient can be modeled as a random effect, with site as another nested level when appropriate, while stimulation parameters and anatomical factors are entered as fixed effects. The exact model should match the outcome distribution and hypothesis. **Status: 📚.**

### 132. How should threshold, latency, and amplitude be compared statistically?
**Answer:** Each outcome should be defined prospectively and modeled according to its scale and distribution. For example, current or pulse width could be fixed predictors, while patient and site contribute random effects. The key principle is to avoid reducing the data to apparently independent trial-level comparisons when the measurements are clustered. **Status: 📚.**

### 133. How would we build an electrophysiological dose-response curve?
**Answer:** For each site and patient, we would relate stimulation dose — current, pulse width, or charge — to outcomes such as response probability, amplitude, latency, and waveform features. The analysis should model repeated observations within site and patient and allow for non-linear behavior or saturation. This would convert the 250–500–800 µs comparison into a mechanistic experiment rather than a descriptive one. **Status: 📚.**

### 134. Which technical covariates should we control for?
**Answer:** Relevant variables include current, pulse width, number of averaged trials, stimulation and recording contact identity, reference montage, impedance, stimulation-to-recording distance, acquisition order, artifact burden, and signal quality. If these factors vary systematically across conditions, they can mimic or obscure a true physiological effect. **Status: 📚.**

### 135. Which anatomical covariates should we control for?
**Answer:** Important anatomical variables include stimulation site, cortical recording site, distance, likely white-matter pathway, relation to tumor and edema, extent of resection, and possible brain shift. These variables may alter both the electric field and the physiological connectivity being tested. Patient-specific anatomy is therefore not just descriptive context; it can be a model covariate. **Status: 📚.**

### 136. How should trial-to-trial variability be quantified?
**Answer:** We can examine the full distributions of amplitude and latency, their variance or standard deviation, latency jitter, response probability, reliability metrics, SNR, and outlier structure. Visualizing single trials is important because two conditions may have the same average waveform but very different consistency. Variability itself may also contain physiological information. **Status: 📚.**

### 137. How can we separate a patient effect from a stimulation effect?
**Answer:** We need a statistical model that explicitly represents patient-to-patient variability, typically through random effects, while estimating the effect of stimulation parameters as predictors. If enough data are available, random slopes can test whether dose-response relationships differ across patients. This prevents stable individual differences from being mistaken for stimulation effects. **Status: 📚.**

---

## K. Critical appraisal, inference, and difficult congress questions

### 138. What is the main limitation of our interpretation?
**Answer:** ACEPs support an electrophysiological relationship between a functionally identified subcortical site and a cortical recording region, but they do not by themselves prove one specific direct anatomical pathway. In addition, our cohort was studied during awake surgery, while asleep use remains prospective. The strongest interpretation is therefore “a reproducible task-independent electrophysiological signature compatible with functional connectivity,” not definitive tract proof. **Status: ✅ [A2].**

### 139. How strongly can we use the term “direct connectivity”?
**Answer:** The abstract appropriately states that ACEPs **may identify direct** connectivity. That probabilistic wording should be maintained because short latency and topographic specificity support directness but do not establish monosynaptic anatomy with certainty. At the congress, “compatible with relatively direct connectivity” is safer than “proves a direct connection.” **Status: ✅ [A2].**

### 140. Is short latency alone sufficient to call the connection “direct”?
**Answer:** No. Short latency is supportive because it limits the amount of time available for prolonged network processing, but it does not exclude one or more fast synaptic relays or parallel pathways. Directness is best argued from converging latency, anatomy, topography, and control data rather than latency alone. **Status: 📚.**

### 141. Could intermediate synapses be involved?
**Answer:** Yes. The observed latency does not independently rule out intermediate synapses, especially if the pathway is short and synaptic delays are small. The current data therefore support rapid connectivity but do not directly count the number of synaptic relays. **Status: 📚.**

### 142. Could more than one white-matter tract be recruited?
**Answer:** Yes. The stimulation site is a region of white matter, and the electric field may recruit multiple nearby axonal populations depending on geometry and current spread. Assigning the response to a single tract requires additional anatomical evidence such as patient-specific tractography or highly constrained anatomy. **Status: ✅/📚 [G1].**

### 143. Can the tumor alter connectivity and excitability?
**Answer:** Our group’s work shows that tumors can distort patient-specific anatomy and motivates the use of individualized tractography and intraoperative mapping. The exact effect of infiltration or plasticity on ACEP excitability is not directly quantified in the current material. Therefore, tumor-related reorganization should be considered a biologically plausible source of inter-patient variability. **Status: ✅/📚 [G2, G1].**

### 144. Can edema and tumor infiltration modify current spread?
**Answer:** It is plausible because tissue conductivity and local anatomy can influence the electric field, but the current ACEP material does not quantify this effect. We should not claim a measured edema effect unless we analyze it directly. For now, it is best treated as a potential biophysical confound and a possible source of between-site variability. **Status: 📚.**

### 145. Can brain shift alter our anatomical interpretation?
**Answer:** Yes. Brain shift can progressively reduce the accuracy of preoperative image-to-brain registration. [G1] reduces this problem by recording stimulation coordinates before major debulking and confirming location with intraoperative anatomy/video. We need to document whether the ACEP protocol uses the same or a comparable strategy. **Status: ✅/⚠️ [G1].**

### 146. Can our current sample be generalized to asleep surgery?
**Answer:** No, not yet. The present attention study was conducted during awake surgery, and the proposed asleep application is a translational hypothesis. A dedicated asleep cohort is needed to show that the signal remains reliable under different anesthetic and physiological conditions and that it retains clinical usefulness. **Status: ✅ [A2].**

### 147. Why is further validation required?
**Answer:** Further validation is needed to establish reproducibility across patients and centers, standardize stimulation and recording parameters, define response-detection criteria, clarify anatomical specificity, and test whether the method adds clinically useful information. The abstracts also explicitly identify larger cohorts and asleep surgery as important next steps. **Status: ✅ [A1, A2].**

### 148. What would be the ideal next experiment?
**Answer:** A strong next study would be a larger prospective validation with a fully standardized technical protocol, predefined response-threshold criteria, explicit stimulation-artifact handling, trial-level analysis, precise anatomical localization, and patient-specific tractography. It should also test the paradigm during asleep surgery and relate electrophysiological markers to functional outcomes. That design would address both mechanistic validity and clinical translation. **Status: ✅ for the clinical direction [A1, A2]; methodological details remain to be designed.**

---

# Technical information already extracted from the group corpus

## Current iVSAT mapping protocol
From [G1]:

- LF-DES with **biphasic square-wave pulses**;
- pulse width **0.5 ms**;
- frequency **60 Hz**;
- train duration **1–4 s**;
- **bipolar** probe with **5-mm inter-tip distance**;
- current individualized using the lowest intensity that consistently produces errors during language mapping over ventral premotor cortex;
- the same current maintained during subsequent cortical and subcortical iVSAT mapping;
- positive site: error in **3 non-consecutive trials**;
- sites also checked with naming and praxis;
- coordinates recorded with **Curve, Brainlab** before tumor debulking;
- sites modeled as **5-mm spherical ROIs**, reflecting probe spatial resolution.

## Historical LF-DES standard in the group
From [G3, G4, G5]:

- **OSIRIS NeuroStimulator, Inomed**, integrated with **ISIS**;
- constant-current stimulation;
- bipolar probe with **two 2-mm ball tips**, **5-mm separation**;
- biphasic square-wave pulses;
- **0.5 ms per phase**;
- **60 Hz**, ISI 16.6 ms;
- trains typically **2–5 s**;
- stimulation intensities commonly in the **2–6 mA** range.

**Critical note:** these parameters describe historical LF-DES protocols and must not be automatically attributed to the current single-pulse ACEP protocol until directly verified.

## Historical ECoG monitoring setup
From [G4, G5]:

- reported systems: **Comet / Grass**;
- subdural strips with **4–8 contacts**;
- monopolar array referenced to a mid-frontal electrode;
- **1–100 Hz** band-pass for monitoring ECoG;
- main purpose: baseline activity, after-discharges, and seizure monitoring.

**Critical note:** this is not necessarily the same hardware or montage used for ACEP acquisition.

## ACEP protocol from our abstract
From [A2] + [PROTO]:

- subcortical **attention-positive** sites identified with iVSAT;
- single **biphasic pulses**;
- **1.1 Hz**;
- pulse width **0.5 ms**;
- starting at **20 mA** and progressively decreasing;
- ACEP response threshold in our cohort: **2–5 mA**;
- **unfiltered** recording from a strip over the **superior frontal gyrus/lateral pre-SMA**;
- offline **1–300 Hz** band-pass;
- cortical control: **precentral gyrus**;
- subcortical control: **attention-negative sites** stimulated at matched current;
- P0/N0: **within 15 ms**;
- P1/N1: **within 50 ms**;
- no reproducible response from negative subcortical sites and absent/markedly attenuated responses over precentral cortex.

---

# Priority technical gaps to close before the congress

The following details are still not documented in the material reviewed and should be recovered directly from the ACEP setup, acquisition software, raw files, or team protocol:

1. exact ACEP stimulator model;
2. constant-current vs constant-voltage mode;
3. exact ACEP probe model and geometry;
4. monopolar vs bipolar spatial stimulation configuration;
5. exact meaning of **0.5 ms**: per phase or total biphasic duration;
6. first-phase polarity and symmetry of the biphasic waveform;
7. current decrement steps from 20 mA to threshold;
8. operational definition of **response threshold**;
9. number of pulses/trials per condition;
10. exact ACEP recording system;
11. sampling rate;
12. complete strip geometry;
13. online reference and ground;
14. hardware/anti-alias filtering;
15. amplifier dynamic range and post-stimulus recovery;
16. trigger pathway and precise definition of \(t=0\);
17. verification of the actual 1.1-Hz timing from recorded timestamps;
18. stimulation-artifact management;
19. epoch window and baseline interval;
20. filter type/order/phase properties for the 1–300 Hz postprocessing;
21. trial-rejection rules;
22. averaging procedure;
23. operational definition of P0/N0 and P1/N1 peaks;
24. amplitude and latency measurement rules;
25. exact timing of ACEP acquisition relative to resection;
26. exact localization of stimulation sites and recording contacts.

Closing these gaps is the next operational objective. Once these parameters are documented, the most technically challenging congress questions will become much easier to answer with confidence.
