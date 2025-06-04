-- Alter user_id column to allow NULL values so trigger can set it on insert
ALTER TABLE public.watchlist
ALTER COLUMN user_id DROP NOT NULL;
