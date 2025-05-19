-- Migration to create the watchlist table

DROP TABLE IF EXISTS public.watchlist;

CREATE TABLE public.watchlist (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  anime_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  comment TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Add index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
