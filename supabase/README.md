# BTD: esecuzione da ChatGPT senza credenziali in chat

Il motore esistente resta invariato: `btd-run-now-temp` continua a invocare
`btd-scan-and-store` con `force_macro_refresh=true` (28 asset e 15 mercati macro).

## Soluzione

1. Il connettore Supabase, autenticato come amministratore, inserisce una riga
   in `public.btd_chat_requests` con `DEFAULT VALUES`.
2. Un trigger Postgres invia l'identificativo UUID generato dal **database**
   a `btd-chat-dispatch` tramite `pg_net`. Non invia JWT né API key.
3. La Edge Function, con `verify_jwt=false` **ma autenticazione applicativa
   obbligatoria**, effettua una `PATCH` atomica su una richiesta:
   - esistente e `queued`;
   - creata dal database, UUID casuale non prevedibile;
   - non scaduta (due minuti);
   - consumabile una sola volta.
4. Solo dopo il claim, la funzione invoca `btd-run-now-temp` usando le
   credenziali **server-side** già fornite da Supabase alle Edge Functions.
5. Il risultato viene salvato su `btd_chat_requests`; il run e i 28 risultati
   rimangono registrati nelle tabelle BTD esistenti.

La tabella è protetta da RLS; `anon` e `authenticated` **non hanno permessi**
di lettura/inserimento. `service_role` ha soltanto `SELECT`/`UPDATE`
espliciti per convalidare e aggiornare lo stato.

**Non disabilitare la verifica JWT sulle funzioni BTD preesistenti.** Solo la
nuova funzione di dispatch, che implementa il controllo ticket, richiede
`verify_jwt=false`.

## File

- `sql/btd-chat-dispatch.sql`: tabella, protezioni RLS/GRANT, trigger `pg_net`.
- `functions/btd-chat-dispatch/index.ts`: verifica ticket e orchestrazione.

I file non contengono credenziali. L'URL Supabase nel SQL contiene solo il
project ref pubblico.

## Utilizzo quotidiano tramite ChatGPT/Supabase

```sql
INSERT INTO public.btd_chat_requests DEFAULT VALUES RETURNING id;
```

Il trigger invia la richiesta dopo il commit. L'elaborazione è asincrona,
quindi attendere il completamento prima di dichiarare successo:

```sql
SELECT id, status, run_id, error, created_at, completed_at
FROM public.btd_chat_requests
ORDER BY created_at DESC LIMIT 1;

SELECT id, started_at, status, asset_count, success_count, error_count
FROM public.btd_scan_runs
ORDER BY started_at DESC LIMIT 1;

SELECT count(*) AS results, count(*) FILTER (WHERE status='ok' AND error IS NULL) AS valid
FROM public.btd_scan_results
WHERE run_id = '<ID-DEL-NUOVO-RUN>';
```

Controllare anche `fetched_at` in `btd_cycle_scores` e
`btd_monetary_scores` per tutti i 15 mercati.

**Test autenticazione negativa:** una POST con un UUID non presente e/o già
consumato deve restituire HTTP 401 e **non** avviare scansioni.

**Test end-to-end del 9 ottobre 2026:** l'inserimento via connettore ha creato
il run `acb39060-6e67-4982-847e-294b15668681`, con `success`,
28/28, zero errori e refresh macro 15/15 + 15/15. Una POST con ticket casuale
inesistente ha restituito 401.

### Monitoraggio e avvertenze

- `pg_net` è asincrono. Una richiesta HTTP può andare in timeout pur avendo
  avviato il lavoro; lo stato persistito nel database è la fonte autorevole.
- Il trigger imposta un timeout HTTP di 60 secondi; la scansione può comunque
  avere tempi variabili.
- Non esporre `btd_chat_requests` ai ruoli `anon`/`authenticated`.
- Non inserire credenziali in SQL, GitHub, URL, corpo POST o chat.
