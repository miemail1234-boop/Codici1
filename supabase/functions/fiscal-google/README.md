# Google background worker (deployed without OAuth configuration)

The shared browser implementation works only while the app is open and the Google token is valid. This server worker is the path to offline synchronization; it must not be described as operational until the following gates pass.

Required Edge secrets, configured in Supabase (never Git or chat):
- GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from a Web OAuth client.
- FISCAL_TOKEN_KEY: base64 encoding of 32 cryptographically random bytes. Preserve securely; rotation needs token re-encryption.
- FISCAL_CRON_SECRET: independent random worker authentication secret.

Google Cloud: enable Calendar and Drive APIs; authorized origin `https://miemail1234-boop.github.io`; callback `<SUPABASE_URL>/functions/v1/fiscal-google/callback`. Minimum scopes are drive.file, calendar.events.owned, calendar.calendarlist.readonly. The existing receipts folder must be explicitly authorized through Google Picker; drive.file cannot enumerate arbitrary pre-existing Drive folders. Picker folder authorization and real server-side upload remain release gates.

Apply outbox migration only after a fresh private backup. Deploy with JWT verification disabled at gateway (callback has one-use expiring state; worker checks its separate secret; user endpoints verify JWT with Auth). Set a Supabase Cron job to POST `/worker` with the secret supplied from Vault, never inline in checked-in SQL. No schedule is enabled by this change.

Security: refresh tokens use AES-256-GCM and are only accessible to service role. Owner IDs come from validated Supabase JWTs or server-owned queue entries. Queue claims lease rows; successful deletes require matching generation. New changes during processing survive. Calendar writes verify ownership markers and use ETags. Unknown/non-applicable dates are not published. Events unrelated to LifeOS are never edited. Logs must not print credentials, requests, or token payloads.

Pending validation: real consent/code exchange, Google Picker folder access, refresh/revocation, worker concurrency, creation retry, cancellation/restoration, live Drive upload and private permission checks. Do not merge or claim unattended Google sync until these tests pass.
