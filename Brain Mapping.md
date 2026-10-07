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
- **Intensità di stimolazione:** da identificare
- **Pulse width:** da identificare
- **Stimolo mono/bifasico:** da identificare
- **Frequenza/intervallo interstimolo:** da identificare
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
