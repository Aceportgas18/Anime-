-- Enable Row Level Security on watchlist table
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own watchlist entries
CREATE POLICY "Allow select for owner" ON public.watchlist
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert watchlist entries with their own user_id
CREATE POLICY "Allow insert for owner" ON public.watchlist
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own watchlist entries
CREATE POLICY "Allow update for owner" ON public.watchlist
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own watchlist entries
CREATE POLICY "Allow delete for owner" ON public.watchlist
FOR DELETE USING (auth.uid() = user_id);
