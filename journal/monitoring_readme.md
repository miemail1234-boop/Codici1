# LifeOS / Journal — sistema di monitoraggio e pianificazione

Aggiornamento: 13 ottobre 2026.

## Obiettivo e separazione dei dati
LifeOS è il nome dell'ecosistema complessivo. Il modulo web Life Tracker 3.1 mantiene il proprio nome e percorso; Journal è il componente LifeOS dedicato a diario e pianificazione. Google Calendar resta la fonte per gli appuntamenti, senza riscriverli o copiarli sul database. Non duplicare la sezione testuale "Da fare": l'utente può annotare nel check-in quali attività sono concluse, ma la lista non viene modificata senza conferma.

## Identità persistente LifeOS
- `lifeos_system_registry`: identità canonica, alias, moduli, repo e confini tra componenti.
- `journal_instructions`: istruzioni operative versionate, che contengono anche la definizione persistente di LifeOS e le regole di verifica delle festività.
- Il documento principale del progetto è [`README.md`](../README.md). Le directory `life-tracker/`, `journal/` e le tabelle preesistenti non vengono rinominate.

## Tabelle Supabase
- `journal_monitoring_goals`, `journal_monitoring_logs`, `journal_monitoring_reviews`: obiettivi attivi, misurazioni e revisioni individuali.
- `journal_daily_checkins`: check-in mattino/sera, una riga per utente/data/fase con risposte JSON e nota.
- `journal_deadlines`: scadenze con categoria, data opzionale verificata, stato e avvisi anticipati.
- `journal_planning_audits`: esiti e fonti dei controlli sul calendario (orizzonte tipico 28 giorni).
- `journal_periodic_reviews`: revisioni generali settimanali e mensili.
- `journal_holiday_dates`: festività nazionali e milanesi del periodo 2026–2045, compresi Pasqua, Pasquetta e Sant'Ambrogio il 7 dicembre per sedi di Milano.

Le tabelle hanno protezione Row Level Security, vincoli su user_id e permessi per account autenticato.

## Interfaccia Web Journal
Le schede `Monitoraggi`, `Check-in`, `Scadenze`, `Pianificazione` e `Festività` vengono caricate da:
- `monitoring_patch.js`, `monitoring_seed_patch.js`
- `daily_checkin_patch.js`
- `deadlines_patch.js`
- `planning_patch.js`
- `holidays_patch.js`

L'accesso avviene con il login Supabase già esistente. Il monitoraggio del sonno è derivato dalla nota classificata del Diario del 13 ottobre, e viene inizializzato al primo accesso autenticato. I campi del mattino includono `bed_time`, `wake_time`, `energy_1_5`; l'ora prevista alla sera è distinta dall'ora effettiva registrata al mattino. I giorni senza rilevazioni non vanno conteggiati come conformi.

## Automazioni
- 08:00: briefing e domande mattutine con check calendario e obiettivi.
- 21:30: verifica serale.
- Domenica ore 19: revisione settimanale; proposta di revisione mensile alla prima domenica del mese.
- Controllo quotidiano delle scadenze con `due_on` valorizzata, `status='pending'` e giorni di preavviso configurabili.

Le automazioni sono configurate separatamente in ChatGPT. Se le notifiche del servizio sono disattivate, la presenza della schedulazione non garantisce una notifica push.

## Verifiche e limiti
Il codice JavaScript di tutte le patch è stato controllato sintatticamente. La sicurezza delle nuove tabelle è stata verificata tramite Supabase Advisors. Non è ancora stato eseguito un test end-to-end con login nel browser dell'utente, né è stata verificata la consegna delle notifiche.

Per rilevare sovrapposizioni su Google Calendar l'assistente deve consultare calendari reali tramite connettore nel briefing: la pagina Journal da sola non usa un token Google né estrae eventi direttamente. Le date fiscali non vengono create o dedotte automaticamente se non verificate; la sezione Scadenze consente di registrarle e modificarle.

Il check-in serale non modifica automaticamente il testo della sezione Da fare; le riprogrammazioni effettive sono una fase successiva previa conferma.

## Richieste future all'assistente
Quando l'utente dice **LifeOS**, deve essere inteso il sistema completo. Se i connettori sono disponibili, leggere prima `public.lifeos_system_registry` e la versione corrente di `public.journal_instructions`, poi le tabelle operative e Google Calendar soltanto se necessario. La definizione persistente non significa che ChatGPT recuperi automaticamente lo stato in qualsiasi conversazione: deve essere interrogata quando pertinente.

## Politica dei calendari LifeOS — aggiornata il 14 ottobre 2026

Per impegni e verifiche di pianificazione sono rilevanti esclusivamente i calendari Google **«Lavoro»** (personale e principale) e **«Calendario Neuropsi Galeazzi»** (condiviso). Non attribuire automaticamente all'utente ogni evento del condiviso. Il calendario **«Attività clinica» è escluso** da letture, briefing e scritture LifeOS. Per tutti i nuovi appuntamenti autorizzati, anche clinici, **scrivere su «Lavoro» per impostazione predefinita**; «Calendario Neuropsi Galeazzi» è destinazione valida solo quando espressamente richiesta. Le festività sono un riferimento normativo e non un terzo calendario di appuntamenti. Le istruzioni canoniche e gli ID dei calendari sono mantenuti in `public.journal_instructions` e `public.lifeos_system_registry`.

Nel briefing mattutino verificare i due calendari insieme al check-in serale del giorno precedente, evidenziando separatamente eventuali appuntamenti confermati ma assenti da Google Calendar. Al check-in serale chiedere consenso prima di creare gli eventi del giorno successivo non calendarizzati. Non confondere check-in giornaliero e conferma di calendario.
