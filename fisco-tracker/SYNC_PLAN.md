# Fisco Tracker / LifeOS sync

- Store text, amounts, completion flags and notes in Supabase under authenticated user with RLS.
- Use `journal_deadlines.external_source` and `external_key` for stable synchronization without duplicates.
- Do not import template dates as verified fiscal deadlines.
- Preserve existing LifeOS deadlines and user modifications.
- Store receipt files in private Google Drive, then attach Drive references to Google Calendar events. Google Calendar is not a file storage service.
- Require explicit Google OAuth authorization and calendar selection before writing events.
- Do not overwrite local data without backup and reconciliation.
