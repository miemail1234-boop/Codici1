# LifeOS — Organizza, monitora, migliora

**LifeOS** è il sistema operativo personale proattivo del progetto `Codici1`: collega informazioni, appuntamenti, attività, obiettivi, abitudini, scadenze e revisioni. Il nome indica l'**ecosistema completo**, non una nuova app né un database separato.

## Identità: evitare ambiguità

| Termine | Significato | Percorso |
| --- | --- | --- |
| **LifeOS** | Sistema completo di gestione personale | `/` (hub e documentazione) |
| **Life Tracker 3.1** | App/modulo di monitoraggio e dashboard, inclusi allenamento e nutrizione | `/life-tracker/` |
| **Journal** | Diario, Da fare, Check-in, Monitoraggi, Scadenze, Pianificazione e Festività | `/journal/` |
| **Google Calendar** | Fonte autorevole di appuntamenti (calendari Lavoro e Attività clinica) | Connettore esterno; non viene copiato interamente in Journal |
| **Automazioni ChatGPT** | Briefing, check-in serale, controlli scadenze e revisioni | Funzioni programmate separate dal sito |

**Compatibilità:** le directory, gli URL, le tabelle esistenti e il nome del modulo *Life Tracker* rimangono invariati. Modificare soltanto l'identità visibile e le istruzioni non interrompe i collegamenti preesistenti.

## Componenti e flussi

- **Mattino, 08:00:** briefing con attività di Journal, Google Calendar, scadenze verificate, conflitti di pianificazione e domande di monitoraggio. Per il sonno: orario *effettivo* di coricamento della sera precedente, risveglio, energia da 1 a 5 e nota facoltativa.
- **Sera, 21:30:** verifica attività svolte/non svolte, proposte di ripianificazione, ora *prevista* di andare a letto e nota. La lista Da fare non viene modificata automaticamente.
- **Monitoraggi:** obiettivi e rilevazioni strutturate, con revisioni dei progressi e separazione dei giorni privi di dati.
- **Scadenze:** date accertate, categoria, stato e preavvisi. Una voce con data ignota non riceve una data inventata.
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

## Quando l'utente dice «LifeOS»

1. Interpretare il riferimento come **l'ecosistema** di questa pagina.
2. Se disponibile il connettore Supabase, consultare `public.lifeos_system_registry` e la versione corrente di `public.journal_instructions`.
3. Per domande su attività, sonno, scadenze o appuntamenti leggere le **fonti operative attuali**; non presentare dati storici o istruzioni statiche come stato aggiornato.
4. Non eseguire modifiche di calendario, notifiche o task senza richiesta/consenso; segnalare chiaramente le fonti non disponibili.

Le istruzioni su Supabase sono persistenti, ma una futura conversazione le deve **recuperare esplicitamente** tramite il connettore: non equivalgono a memoria automatica né all'accesso garantito in qualsiasi modalità ChatGPT.

Per implementazione e limiti dei moduli consultare [documentazione Journal](journal/monitoring_readme.md). Per la definizione riproducibile del registro identità, vedere [schema SQL LifeOS](supabase/sql/lifeos_system_registry.sql).

## Distribuzione

Applicazione web pubblicata su GitHub Pages dal repository `miemail1234-boop/Codici1`. La pagina radice è l'hub **LifeOS**. Il contenuto privato viene letto da Supabase soltanto dopo autenticazione; i dati personali non sono nel repository. L'integrazione di Google Calendar e le automazioni non funzionano direttamente dal solo browser, ma attraverso connettori e pianificazioni esterne.

