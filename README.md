# LifeOS — Organizza, monitora, migliora

**LifeOS** è il sistema operativo personale proattivo del progetto `Codici1`: collega informazioni, appuntamenti, attività, obiettivi, abitudini, scadenze e revisioni. Il nome indica l'**ecosistema completo**, non una nuova app né un database separato.

## Identità: evitare ambiguità

| Termine | Significato | Percorso |
| --- | --- | --- |
| **LifeOS** | Sistema completo di gestione personale | `/` (hub e documentazione) |
| **Life Tracker 3.1** | App/modulo di monitoraggio e dashboard, inclusi allenamento e nutrizione | `/life-tracker/` |
| **Journal** | Diario, Da fare, Check-in, Monitoraggi, Scadenze, Pianificazione e Festività | `/journal/` |
| **Google Calendar** | Fonte autorevole degli appuntamenti (solo calendari «Lavoro», personale, e «Calendario Neuropsi Galeazzi», condiviso) | Connettore esterno; non viene copiato interamente in Journal |
| **Emma in ChatGPT** | Recupero contestuale e funzioni conversazionali su richiesta | Istruzioni canoniche in Supabase e protocolli privati su Drive |

**Compatibilità:** le directory, gli URL, le tabelle esistenti e il nome del modulo *Life Tracker* rimangono invariati. Modificare soltanto l'identità visibile e le istruzioni non interrompe i collegamenti preesistenti.

## Componenti e flussi

- **Mattino, su richiesta:** check-in volontario e successivo menù della giornata, applicando le istruzioni canoniche correnti e le fonti obbligatorie. Nessun briefing parte spontaneamente.
- **Sera, su richiesta:** check-in volontario, verifica delle attività e analisi soltanto con il consenso previsto. La lista Da fare non viene modificata per deduzione.
- **Monitoraggi:** obiettivi e rilevazioni strutturate, con revisioni dei progressi e separazione dei giorni privi di dati.
- **Scadenze:** date accertate, categoria, stato e metadati di preavviso. Una voce con data ignota non riceve una data inventata. Le funzioni LifeOS operano su richiesta; i metadati non costituiscono notifiche automatiche. Le modifiche esterne a `journal_todo_single` devono sincronizzare anche `journal_deadlines`, perché il JavaScript dell'interfaccia non viene eseguito dalle scritture esterne.
- **Attività con scadenza:** le attività inserite nella lista «Da fare» sotto intestazioni `ENTRO <giorno mese anno>` oppure con un `entro <data>` esplicito vengono sincronizzate dal sito in `journal_deadlines` al salvataggio. La sincronizzazione esterna via ChatGPT deve aggiornare entrambe le tabelle secondo `journal_instructions`; i promemoria sono progressivi (fino a 7, 3, 1, 0 giorni, adattati all'orizzonte). Le scadenze non creano eventi Calendar. Le automazioni programmate e le notifiche ChatGPT sono componenti separati: verificare che le notifiche siano abilitate, non presumere invii push/email.
- **Pianificazione:** confronto degli eventi fino a 28 giorni, gestione delle sovrapposizioni confermate/potenziali e controllo obbligatorio delle festività nazionali italiane, delle domeniche e delle festività milanesi applicabili.
- **Revisione:** sintesi settimanale e, quando utile, mensile. Le analisi vengono salvate soltanto quando le fonti e le conferme sono disponibili.

## Persistenza Supabase

Progetto: `kujyowhezihjambhpahe`.

| Tabella in `public` | Ruolo |
| --- | --- |
| `lifeos_system_registry` | **Identità canonica LifeOS**, alias, mappa dei componenti e repository |
| `journal_instructions` | Istruzioni operative permanenti versionate, compresa l'identità LifeOS |
| `journal_todo_single` | Testo della lista Da fare |
| `journal_monitoring_goals`, `journal_monitoring_logs`, `journal_monitoring_reviews` | Obiettivi, osservazioni e revisioni |
| `journal_daily_checkins` | Risposte strutturate mattino/sera |
| `journal_deadlines` | Scadenze e soglie di promemoria |
| `journal_planning_audits` | Verifiche della pianificazione con fonti e criticità |
| `journal_periodic_reviews` | Revisioni settimanali/mensili |
| `journal_holiday_dates` | Festività italiane e milanesi precompilate (2026–2045) |

Le tabelle private applicano Row Level Security per utente. Non aggiungere API key private o dati personali ai file GitHub.

## Istruzioni modulari di Emma

Dal 24 ottobre 2026 `journal_instructions` contiene un nucleo operativo breve. I protocolli specialistici privati risiedono nella cartella Drive `M/Sistema_LifeOS` e sono indirizzati da ID effettivi in `lifeos_system_registry.components.instruction_architecture`.

La memoria di lavoro è composita e viene costruita su richiesta: BloccoNote e fonti operative ordinarie per il contesto corrente, copertura completa per la pianificazione, fonti selettive per gli approfondimenti specialistici. Non esiste un nuovo database che duplica continuamente tutte le fonti.

Questa architettura è dipendente dai connettori. Le istruzioni descrivono il comportamento atteso ma non garantiscono l'accesso automatico in ogni nuova chat o modalità Voice. Le versioni precedenti restano recuperabili in `journal_instruction_history`.

## Quando l'utente dice «LifeOS»

1. Interpretare il riferimento come **l'ecosistema** di questa pagina.
2. Se disponibile il connettore Supabase, consultare `public.lifeos_system_registry` e la versione corrente di `public.journal_instructions`.
3. Per domande su attività, sonno, scadenze o appuntamenti leggere le **fonti operative attuali**; non presentare dati storici o istruzioni statiche come stato aggiornato.
4. Non eseguire modifiche di calendario, notifiche o task senza richiesta/consenso; segnalare chiaramente le fonti non disponibili.

Le istruzioni su Supabase sono persistenti, ma una futura conversazione le deve **recuperare esplicitamente** tramite il connettore: non equivalgono a memoria automatica né all'accesso garantito in qualsiasi modalità ChatGPT.

Per implementazione e limiti dei moduli consultare [documentazione Journal](journal/monitoring_readme.md). Per la definizione riproducibile del registro identità, vedere [schema SQL LifeOS](supabase/sql/lifeos_system_registry.sql).

## Distribuzione

Applicazione web pubblicata su GitHub Pages dal repository `miemail1234-boop/Codici1`. La pagina radice è l'hub **LifeOS**. Il contenuto privato viene letto da Supabase soltanto dopo autenticazione; i dati personali non sono nel repository. L'integrazione di Google Calendar e le automazioni non funzionano direttamente dal solo browser, ma attraverso connettori e pianificazioni esterne.



## Regola operativa dei calendari (14 ottobre 2026)

LifeOS consulta come fonti per gli appuntamenti **solo «Lavoro» e «Calendario Neuropsi Galeazzi»**. «Lavoro» è il calendario personale dell'utente; «Calendario Neuropsi Galeazzi» è condiviso, quindi gli eventi che vi compaiono non vanno attribuiti automaticamente all'utente senza verifica. Il calendario «Attività clinica» è dismesso dal flusso LifeOS e va **sempre escluso** da lettura, briefing, controlli di conflitti e nuove scritture. Il calendario delle festività può essere usato soltanto come ausilio normativo, non come calendario di appuntamenti.

**Qualsiasi nuovo evento o modifica di calendario autorizzata dall'utente va eseguita per impostazione predefinita su «Lavoro», anche per gli appuntamenti clinici.** Usare o modificare «Calendario Neuropsi Galeazzi» soltanto quando l'utente lo richiede espressamente; non scegliere il calendario di destinazione deducendolo dal tipo di attività. Nessun evento va creato o modificato senza richiesta o autorizzazione specifica.

Il briefing mattutino deve incrociare i due calendari con gli appuntamenti menzionati nei check-in e segnalare gli impegni confermati ma **non ancora calendarizzati**, senza considerarli automaticamente salvati in Google Calendar. Il check-in serale verifica gli appuntamenti di domani e chiede autorizzazione per quelli mancanti. Le impostazioni tecniche aggiornate e gli ID dei calendari sono registrati in Supabase, in `public.lifeos_system_registry.components.integrations.calendar_policy` e nella versione corrente di `public.journal_instructions`.

## LifeOS Voice Bridge — lettura resiliente

Il recupero contestuale per Voice Live è regolato dalle istruzioni Supabase correnti. Per il protocollo tecnico di lettura selettiva, gestione dei blocchi intermittenti e checklist di verifica, consultare [Voice Bridge — runbook](journal/voice_bridge_runbook.md). Un blocco parziale del connettore non rende automaticamente inaccessibile l'intero Journal; i dati mancanti devono comunque essere dichiarati.



## LifeOS 4: contextual check-ins

The Check-in tab reads life directions from the authenticated user's `lifeos_system_registry.components.life_direction_model`. It reads and exports the latest private `lifeos_context_snapshots` document. No personal objectives or snapshots are embedded in public source code.

New optional JSON answer keys: `health_1_10`, `wake_energy_1_10`, `day_energy_1_10`, `weight_kg`, `symptoms`, actual `bed_time`/`wake_time`, separately reported `actual_sleep_hours`, training fields, actual dinner, intended bedtime, actual results, strategic minutes, task outcomes and contextual pillar contributions. Historical `energy_1_5` and unknown fields are preserved unchanged. Existing date/phase records are prefilled. Updates require confirmation and use an `updated_at` concurrency condition; inserts rely on the existing unique user/date/phase constraint. Blank untouched fields remain absent, not zero. Task completion is never automatic.

Canonical assistant behavior remains in private `journal_instructions`: compare planned/actual/results/goals, preserve autonomy, use verified local time when tools allow, and separate archived context from conversation updates and verified writes. Scheduled tasks launch that same protocol. New measurements are stored in check-ins; readers must combine them with historical monitoring logs and deduplicate observations. Weight is not automatically copied into a second table.

Run browser regression tests with `node tests/checkin.cjs` after installing Playwright and its Chromium browser. Tests use a mocked backend and never write personal data.

