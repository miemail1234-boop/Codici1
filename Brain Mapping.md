# Brain Mapping

Documento progressivo di apprendimento sul brain mapping, da aggiornare man mano che vengono consolidate nuove conoscenze.

## Obiettivo

Sviluppare competenza nell'individualized multimodal brain mapping applicato alla neuro-oncologia, integrando progressivamente:

- elettrofisiologia intraoperatoria;
- SCEP/CCEP;
- localizzazione anatomica delle registrazioni corticali e dei siti di stimolazione;
- tractography patient-specific;
- lesion e disconnection mapping;
- dati neuropsicologici e outcome.

## Fase attuale — SCEP

Priorità del prossimo mese: diventare competente nell'esperimento di subcortico-cortical evoked potentials (SCEP).

### Modello concettuale

Stimolazione elettrica della sostanza bianca → attivazione delle fibre → propagazione → risposta corticale → registrazione tramite grid → acquisizione e preprocessing → waveform evocata.

### Parametri sperimentali da padroneggiare

1. Sistema di registrazione utilizzato
2. Sampling rate
3. Numero e disposizione dei contatti della grid
4. Riferimento utilizzato durante la registrazione
5. Intensità di stimolazione
6. Forma mono/bifasica e durata dell'impulso
7. Frequenza degli stimoli
8. Numero di stimolazioni mediate
9. Marcatura temporale degli stimoli
10. Formato dei dati grezzi
11. Filtri applicati durante l'acquisizione
12. Gestione dell'artefatto di stimolazione

## Percorso di apprendimento SCEP

### Settimana 1 — Neurofisiologia
Comprendere stimolazione elettrica, eccitazione assonale, propagazione, potenziali di campo, differenza SCEP/CCEP, latenza, ampiezza, polarità, artefatto di stimolazione e averaging.

### Settimana 2 — Segnale e preprocessing
Sampling, Nyquist, filtri, notch, reference, baseline, epoching, artifact rejection e averaging. Inizio dell'analisi con Python/MNE.

### Settimana 3 — Analisi quantitativa
Peak latency, onset latency, ampiezza, SNR, riproducibilità trial-to-trial e distribuzione topografica delle risposte corticali.

### Settimana 4 — Interpretazione
Integrare risposta elettrofisiologica e anatomia; distinguere ciò che i dati dimostrano da ciò che può soltanto essere inferito.

## Criterio di padronanza

Davanti a una risposta SCEP essere in grado di rispondere autonomamente a quattro domande:

1. Che cosa sto misurando?
2. Come l'ho ottenuto?
3. Quali artefatti potrebbero produrlo?
4. Quale conclusione fisiologica posso legittimamente trarne?

## Note di apprendimento

### Sistema di registrazione
Da approfondire come primo parametro sperimentale.
