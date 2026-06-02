# Life Tracker

Repository predisposto per pubblicare Life Tracker come sito statico/PWA.

Ho inizializzato il repository con `.nojekyll`. Per completare la pubblicazione, carica nella root del repository i file della cartella `life_tracker_app` aggiornata:

- `index.html`
- `app.js`
- `styles.css`
- `investment_seed.js`
- `manifest.webmanifest`
- `sw.js`
- cartella `vendor/` con `supabase.js`

Poi abilita GitHub Pages da **Settings → Pages** usando branch `main` e folder `/root`.

Nota: il repository risulta privato. GitHub Pages per repository privati può dipendere dal piano GitHub. Se Pages non è disponibile, rendi il repository pubblico oppure usa Netlify/Vercel/Cloudflare Pages.
