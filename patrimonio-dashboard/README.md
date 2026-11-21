# Patrimonio — dashboard indipendente (v1)

Applicazione statica su GitHub Pages nella directory `/patrimonio-dashboard/`. È **totalmente distinta nel codice, URL, fogli di stile, componenti e navigazione** da `/invest-tracker/`. Non modifica alcun file dell'app originale.

## Sicurezza e modello dati

- Accesso mediante sessione Supabase già autenticata in LifeOS, chiave **pubblicabile**, nessuna password o dato patrimoniale nel repository.
- L'app è **in sola lettura**: non usa `INSERT`, `UPDATE`, `DELETE` lato client.
- Legge le tabelle esistenti `public.investment_assets`, `public.investment_entries`, `public.investment_cash_flows`, `public.investment_trades` senza modificarle.
- Nuove tabelle separate e private, con RLS per proprietario e solo permesso SELECT per utenti autenticati:
  - `public.portfolio_dashboard_movements`: estratti conto e transazioni complete, chiave (utente,id);
  - `public.portfolio_dashboard_balances`: saldo Fineco documentato;
  - `public.portfolio_dashboard_scenarios`: ipotesi del benchmark immobiliare.
- Snapshot e transazioni sono letti soltanto per `auth.uid()` mediante le policy RLS. Il client non contiene alcun ID utente.

## Fonte dei movimenti

- Trade Republic: 1.817 registrazioni effettive del PDF di estratto conto (controllati addebiti, accrediti e saldo).
- Fineco: 96 movimenti dell'export XLSX, inclusi stipendio, spese e trasferimenti; sul registro i movimenti personali appaiono con filtro dedicato.
- Scalable: 142 movimenti **effettivi e contabili** trascritti dall'elenco testuale, compresi acquisti, vendite, interessi, commissioni e due movimenti di migrazione. Richieste annullate/rifiutate/scadute non trattate come movimenti monetari.
- È uno storico cronologico di movimenti di banca/trading, non la somma tra estratto bancario e registro di trade: quelle duplicazioni sono evitate usando una singola fonte per ciascun conto.

## KPI

- Il patrimonio attuale è somma delle ultime valorizzazioni disponibili per singolo asset + ultimi saldi di liquidità dei due broker + saldo Fineco.
- Il rendimento degli **investimenti** è XIRR sui flussi esterni broker verificati e sul terminal value. Non aggiunge un secondo versamento quando Fineco trasferisce fondi a Trade Republic. La liquidità Fineco è inclusa nel patrimonio ma non nel calcolo della performance degli investimenti.
- La stima delle imposte di liquidazione: `0.26 * sum(max(0, valore corrente - costo residuo medio))` per ciascun asset aperto, usando il registro disponibile; non compensa automaticamente minusvalenze ETF; non copre eventuali imposte ancora dovute sulle **vendite storiche**. Non è un calcolo fiscale ufficiale né una liquidazione realmente eseguita.
- Il netto mensile è `guadagno totale netto stimato / mesi trascorsi`: media retrospettiva, non distribuzione mensile di reddito.

## Grafico e benchmark

- Periodo di riferimento dal 19 settembre 2023.
- Serie selezionabili: patrimonio globale, investimenti, utile netto teorico, singoli strumenti; valori EUR o tasso percentuale.
- Le curve storiche **non inventano prezzi** per periodi non documentati. Si richiedono snapshot vicini alla data per le posizioni aperte; i tratti senza copertura rimangono vuoti. Per ricostruire il grafico completo dal 2023 servono quotazioni storiche affidabili.
- Benchmark casa: acquisto da 250.000 EUR senza mutuo, canone costante da 940 EUR/mese. L'affitto teoricamente evitato dell'abitazione principale non è imponibile al 26%.
- Scenario rivalutazione con slider parametricamente impostato al 2% annuo **come semplice ipotesi**, non come andamento verificato del mercato di Monza/Milano. Costi di acquisto, manutenzione e imposte della proprietà sono da integrare quando disponibili.
- Le criptovalute spot su Trade Republic sono valorizzate **convenzionalmente a zero per scelta dell'utente**, non a quotazione di mercato.

## Questioni aperte

1. Riconciliare 71,20 EUR tra estratto Trade Republic del 20/11 e saldo app del 21/11.
2. Riconciliare 33,63 EUR tra totale dei 142 movimenti Scalable e saldo contabile dell'app (da non sanare con un movimento fittizio).
3. Ottenere storico prezzi 2023–2026 se si desidera una curva completa del rendimento effettivo, non semplici snapshot.
4. Completare fiscalità di plusvalenze già realizzate, regime fiscale per singolo broker e aliquote speciali.
5. Integrare costi immobiliari reali e un indice del valore delle case comparabili per il benchmark B.

## Separazione e rollback

La versione preesistente rimane in `/invest-tracker/`, file originali invariati. Se questa dashboard non funziona, si continua a utilizzare la precedente senza interventi. Per ritirare la dashboard nuova basta non usare `/patrimonio-dashboard/` o eliminare esclusivamente la sua directory e le sue tre tabelle private, previa verifica dei dati.
