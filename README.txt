FIELD MANUAL 1.0 RC16 · PERSISTENT COMPLETION

Fixes the daily family checklist persistence bug.

Key fix:
- Daily routine rows are now INSERTED ONLY WHEN MISSING.
- Existing rows are never upserted during app startup, so completed/completed_at/completed_by are not reset.
- A successful checkbox change remains visible immediately and is then reconciled with Supabase.
- Supabase Realtime remains enabled for cross-device updates.

Upload every file in this folder to the GitHub Pages repository root and commit to main.
