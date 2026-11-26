# Patrimonio — dashboard indipendente (v1.1)

## Ruolo operativo dal 26 novembre 2026

**Patrimonio è il punto d'accesso principale alle finanze di LifeOS**, per Trade Republic, Scalable Capital e Fineco. La home LifeOS collega direttamente `/patrimonio-dashboard/`. Il modulo `/invest-tracker/` rimane disponibile come interfaccia precedente per le funzioni specialistiche non ancora integrate (ad esempio watchlist, operazioni e BTD); entrambi leggono tabelle condivise in Supabase. Non eseguire una migrazione o una dismissione distruttiva prima della verifica delle funzionalità e della completezza delle registrazioni.

**Perimetro e qualità dei dati:** `portfolio_dashboard_movements` registra 2.055 movimenti documentali dei tre conti (1.817 Trade Republic, 142 Scalable, 96 Fineco), mentre `investment_trades` raccoglie 55 compravendite strutturate e `investment_entries` 494 rilevazioni (verifica 26/11/2026). I movimenti non costituiscono automaticamente uno storico completo per singolo asset. Le 92 operazioni di acquisto/vendita Scalable dispongono di strumento e quantità, mentre i 147 movimenti di acquisto/vendita/PAC Trade Republic non sono attribuiti in `portfolio_dashboard_movements` a uno strumento con quantità verificata. Non derivare quantità o prezzi eseguiti da importi generici.

**Analisi consolidata:** leggere sempre posizioni, liquidità e movimenti di tutti e tre i conti con date e provenienza; distinguere patrimonio finanziario globale, capitale investito nei broker, riserva personale su Fineco e rendimenti dei titoli. Non usare `Fineco = 0` solo perché il saldo non compare nelle tabelle Invest Tracker. Il saldo Fineco rimane uno snapshot da estratto conto, non live; la componente crypto spot TR non valorizzata non deve essere interpretata come assenza di asset. Non conteggiare due volte trasferimenti fra conti. Se lo storico per singolo asset è incompleto, dichiararlo prima di esporre rendimenti o suggerire ribilanciamenti.

Web app statica su GitHub Pages in `/patrimonio-dashboard/`, distinta nel codice e nell'URL dall'app storica `/invest-tracker/`. Non modifica file né tabelle dell'Invest Tracker preesistente.

## Fonti e autorizzazione

- Accesso tramite sessione Supabase già autenticata: una chiave *pubblicabile* è nel JS, nessuna password, ID utente o storico patrimoniale sensibile nel repository.
- Frontend **solo lettura**. Esegue `SELECT` sulle quattro tabelle Invest Tracker `investment_assets`, `investment_entries`, `investment_cash_flows`, `investment_trades`; non le modifica.
- Le tabelle separate `portfolio_dashboard_movements`, `portfolio_dashboard_balances`, `portfolio_dashboard_scenarios`, `portfolio_dashboard_property_index` hanno policy RLS di selezione per `auth.uid()`, attive, e permesso `SELECT` al ruolo `authenticated`.
- I controlli immobiliari e i costi immessi nell'interfaccia agiscono soltanto localmente e **non vengono scritti** in Supabase.

## Registro documentale

- Trade Republic: 1.817 operazioni dell'estratto conto, riconciliate con saldo al 20/11/2026 di 2.335,49 €.
- Scalable: 142 movimenti contabili forniti in elenco testuale, inclusi 54 acquisti, 38 vendite, 19 commissioni PRIME+, interessi e altri movimenti.
- Fineco: 96 operazioni dell'estratto XLSX, riconciliate con saldo 36.394,03 €.
- Totale: **2.055** movimenti. Vista iniziale: **391** dopo distinzione fra movimenti finanziari e spese quotidiane. Le transazioni nascoste dal filtro non sono eliminate.
- I record Trade Republic ora distinguono acquisti, vendite, PAC, interessi e imposte senza alterare la descrizione documentale originaria.
- I giroconti fra conti personali restano verificabili; nel rendimento di un singolo broker sono flussi esterni, mentre nell'analisi del patrimonio complessivo vanno eliminati.

## Contabilità e rendimento

- Patrimonio finanziario visualizzato = ultime posizioni valorizzate + saldi disponibili Scalable e Trade Republic + saldo Fineco (snapshot, non streaming).
- L'indicatore `XIRR broker` usa entrate e uscite **esterne ai broker**, incluse le spese con carta Trade Republic come prelievi dal conto. Non va confuso con il rendimento di un portafoglio investito in titoli senza liquidità o con la crescita del patrimonio complessivo includendo Fineco e UniCredit.
- Importi ricostruiti al 21/11/2026: patrimonio 253.532,67 €; valore broker 217.138,64 €; flussi netti conferiti ai broker 185.861,85 €; risultato lordo broker 31.276,79 €; imposte ipotetiche su posizioni aperte 2.406,26 €; risultato netto **parziale** 28.870,53 €.
- XIRR lordo broker: circa 9,67% a.a.; XIRR al netto delle *sole imposte di liquidazione sulle posizioni attualmente aperte*: circa 8,96% a.a. Non sono state ricostruite tutte le imposte storiche o le specificità degli strumenti.
- La media storica di 758,19 €/mese = risultato netto parziale diviso numero di mesi trascorsi. **Non** è una rendita mensile né una previsione.
- Gli asset individuali in modalità percentuale utilizzano XIRR annualizzato dei trade disponibili con valore terminale osservato; non `prezzo/costo residuo -1`.

## Serie temporali

- Intervallo di riferimento dal **19/09/2023**, apertura Scalable.
- La curva **flussi netti verso i broker** è ricostruibile dal primo versamento, distinguendo depositi e prelievi/consumi.
- Per valori di mercato effettivi (titoli e liquidità) si usano solo snapshot storici esistenti, in finestre di attendibilità di 45 giorni. I periodi senza dati sono discontinui, non interpolati arbitrariamente.
- Il grafico non presenta rendimenti percentuali del patrimonio globale quando mancano storia UniCredit e riconciliazioni. Per gli strumenti considera solo finestre in cui risulta detenuta una quantità positiva.
- In modalità **risultato broker** la curva della casa viene mostrata soltanto come confronto fra benefici economici (non fra valore della casa e valore dei titoli), con avviso di **non omogeneità dei capitali**.

## Benchmark immobiliare

- Modello: 250.000 € di acquisto senza mutuo nell'autunno 2023; 940 € mensili di affitto evitato, pro rata sul tempo trascorso; non tassati come reddito da locazione.
- In Supabase sono archiviate **38 osservazioni mensili** di prezzi medi **richiesti**, per il **Comune di Monza**, da settembre 2023 a ottobre 2026, con fonte [Idealista – serie storica](https://www.idealista.it/sala-stampa/report-prezzo-immobile/vendita/lombardia/monza-brianza/monza/storico/).
- Prezzi medi richiesti: settembre 2023 **2.684 €/m²**; ottobre 2026 **3.101 €/m²**: differenza **+15,54%**. Idealista segnala una modifica metodologica da luglio 2026; questa variazione è indicativa e **non rappresenta un prezzo di vendita certo** per una casa specifica.
- Applicato ipoteticamente alla casa da 250.000 €: valore teorico circa **288.841 €**, plusvalore circa **38.841 €**, affitto evitato circa **35.793 €**; beneficio teorico totale circa **74.635 €**, **prima dei costi** di acquisto e gestione.
- L'interfaccia permette di passare a una rivalutazione parametrica anziché osservata e di inserire costi iniziali e mensili facoltativi.
- Comparare 250.000 € investiti tutti nel 2023 con un portafoglio alimentato da apporti progressivi **non misura la superiorità effettiva** dell'una o dell'altra scelta: per un confronto controfattuale rigoroso va uniformata la dotazione di capitale e trattato il mancato affitto come risparmio sui consumi.

## Riconciliazioni e lavoro ancora necessario

1. Scostamento Trade Republic 20–21/11: 71,20 €.
2. Scostamento Scalable fra ledger disponibile e saldo mostrato: 33,63 €; non inserire voci fittizie per correggerlo.
3. Mancano serie di prezzi storici giornalieri affidabili e lo storico integrale delle valutazioni 2023–2025; il grafico effettivo non può ancora essere continuo dal 2023.
4. Fiscalità completa delle plusvalenze già realizzate e regime fiscale dei broker da verificare.
5. Per un benchmark immobiliare individuale servono zona, metratura, condizioni, costi accessori e potenziale prezzo di realizzo effettivo.

## Verifiche ed esclusione dell'app legacy

Il 21/11/2026 la nuova dashboard è stata caricata in un test funzionale con dati Supabase: **18 asset, 476 valorizzazioni, 55 trade legacy, 663 cash flow, 2.055 movimenti documentali, 38 rilevazioni immobiliari**. Sono stati controllati KPI, indice di mercato (+15,54%), valore della casa (288.841 €), modalità simulata (crescita 2% → 266.213 €), e disponibilità/indisponibilità corretta dei grafici.

Le repository `miemail1234-boop/Codici1` e `miemail1234-boop/neuroapp` sono state verificate all'albero file, non soltanto dai README. L'app finanziaria e quella nuova si trovano entrambe in `Codici1` e in cartelle distinte. La directory originale `invest-tracker/` è invariata e utilizzabile indipendentemente. Se la nuova non funziona, la vecchia non richiede rollback.
