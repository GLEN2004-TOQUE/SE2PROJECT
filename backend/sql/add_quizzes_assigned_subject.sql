-- Run once in Supabase SQL editor so "subject" chosen when sending a quiz is stored and shown to students.
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS assigned_subject text;
