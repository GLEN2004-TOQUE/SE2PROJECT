-- Per-question weight for grading (default 1 point each). Run once on your Supabase DB.
ALTER TABLE questions ADD COLUMN IF NOT EXISTS points integer NOT NULL DEFAULT 1;
