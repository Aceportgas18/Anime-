-- Migration to add image_url column to watchlist table

ALTER TABLE public.watchlist
ADD COLUMN image_url VARCHAR(255);
