# Fisco Tracker ↔ LifeOS: implementation and release gates

Status: implementation staged; not a completed production integration. Reviewed both full repository trees, main app HTML/JS, authentication and persistence, PR #3 and PR #1. `neuroapp` contains gaze/video tools and no fiscal storage integration; no changes made there. PR #3 offers manual text backup/status transfer only. PR #1 uses another localStorage version and manual profile sync. This implementation uses their existing Supabase project and external identity columns but replaces manual archive copying with the canonical `journal_deadlines` rows.

## Implemented
- Additive fiscal columns on existing deadlines; existing dates and non-fiscal records preserved.
- Same reusable editor in Journal and Fisco Tracker, same Supabase auth origin/session, polling every 15 seconds while visible, optimistic revision checks, year/category filters, due amounts, payment log, status changes, notes and sources.
- Separate payment/document tables with owner-bound composite FKs. Documents are Drive identifiers only. Immutable history via restricted trigger.
- One-time browser migration with local backup, explicit account binding, stable identities and conflict review. Alternative saldo payment windows share one identity. Legacy amount semantics do not fabricate paid dates or payments.
- Google browser adapter: session-only token, private folder/file checks, retry-stable file IDs, event identity + ETag guards. Client configuration/real OAuth required.
- Server worker: authenticated connect/status/upload, one-use OAuth state, encrypted refresh token, background outbox with generation and lease, retry backoff, idempotent event IDs, existing event links, scoped privacy checks, upload reservations. Worker is deployed but OAuth credentials and scheduler are not configured.

## Deployment state
Additive schemas, restricted service tables and the Edge endpoint are deployed. Existing records were backed up privately and preserved. Personal reconciliation details and Drive/Calendar identifiers are retained only in the user's private system and the conversation, not this repository. OAuth and scheduled processing remain disabled pending configuration and real consent tests.

## Tests performed
- `npm ci && npm run test:fiscal` (Node 24): core identity/alternative-window reconciliation, absent templates, preservation of custom TARI, rejection of stale edits, exclusion of document bytes, DOM rendering/XSS escaping/filter/editor conflict behavior, Google unrelated-event and unverified-date guards, Edge authentication/state failure guards.
- Live Supabase transactions rolled back: payment idempotency, revision rejection, audit history, cross-owner insert rejection, outbox generation, stale job acknowledgement, denial of connection reads and history truncate to authenticated role.
- Checked RLS on every relevant table and hardened default grants; RLS alone does not restrict TRUNCATE.
- Google event readback and private folder metadata/listing.

## Release gates / not tested yet
- Real sign-in and browser-local migration in the user's original browser (no connected local browser surface available in this session).
- Google Cloud Web OAuth client ID/secret, enabled APIs, callback URI, restricted Picker API key/project number; secrets configured directly in Supabase.
- Explicit folder selection using Google Picker for drive.file access to the existing receipt folder. Chat connector access is not the app's OAuth grant.
- Live consent/refresh/revocation and an actual receipt upload. Test Google creation/update/cancellation/restoration, connection/account mismatch, concurrent uploads, refresh-token failure and scheduled worker.
- Activate Cron only after OAuth end-to-end tests. No background schedule is running.
- Merge/publish the new frontends only after these gates. Current production frontend remains unchanged.

## Fiscal verification
Do not promote template dates/applicability into personal obligations. In particular the legacy ENPAP March 3 date is wrong for 2026: official date March 2, 2026 (ENPAP news, February 2026). Official precompiled Redditi PF deadline is November 2, 2026, distinct from the second-acconto template. Neither fact establishes personal applicability or payment completion.
Sources checked:
- https://www.enpap.it/news/2026/02/2-marzo-2026-scadenza-versamento-contributi-in-acconto-su-redditi-2025/
- https://infoprecompilata.agenziaentrate.gov.it/portale/web/guest/redditi-persone-fisiche
- https://developers.google.com/identity/oauth2/web/guides/use-token-model
- https://developers.google.com/workspace/drive/api/guides/api-specific-auth

Scalable, Trade Republic, Binance, foreign-asset reporting, capital gains, IVAFE and crypto depend on tax year, account regime and reports. F24 is a payment instrument, not automatically another obligation. Do not generate duplicate payments for it. Personal insurance/vehicle/local-tax dates require the actual notice or contract. The complete annual personal list remains unverified until the original fiscal data are available.
