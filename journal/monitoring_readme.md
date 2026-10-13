# Monitoraggi Journal

Monitoraggi persistenti su Supabase con obiettivi, rilevazioni giornaliere e revisioni periodiche.

## Copertura delle rilevazioni
La scheda mostra la copertura degli ultimi sette giorni (o dei giorni effettivi dall'inizio dell'obiettivo, se più recente): giorni registrati, giorni mancanti e percentuale con denominatore esplicito.

## Monitoraggio del sonno
Per ciascun giorno di risveglio vengono registrati gli orari dichiarati della sera precedente (`bed_time`) e del risveglio (`wake_time`). L'interfaccia valuta separatamente il rispetto della soglia di andare a letto e di quella di risveglio (comprese le eccezioni del giovedì), nonché il rispetto congiunto dei due obiettivi. Le ore trascorse a letto **non** sono presentate come ore di sonno effettive. Un orario a letto dopo mezzanotte non è considerato erroneamente 'in anticipo' rispetto alle 23:00.

Le sintesi di revisione leggono il periodo scelto direttamente da Supabase; sono modificabili prima del salvataggio. Una revisione storica non riporta indietro la data dell'ultima revisione effettuata.

## Controlli
Le rilevazioni e revisioni future o anteriori alla data di inizio sono respinte. Lo stato dell'obiettivo non viene modificato automaticamente. L'app usa la sessione autenticata e le policy RLS; non inserisce dati fittizi.
