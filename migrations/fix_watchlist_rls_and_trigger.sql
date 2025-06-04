-- Enable Row Level Security on watchlist table
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Create or replace trigger function to set user_id from auth.uid()
CREATE OR REPLACE FUNCTION set_user_id_from_auth()
RETURNS TRIGGER AS $BODY$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS set_user_id_trigger ON public.watchlist;

-- Create trigger to call the function before insert
CREATE TRIGGER set_user_id_trigger
BEFORE INSERT ON public.watchlist
FOR EACH ROW
EXECUTE FUNCTION set_user_id_from_auth();

-- RLS policies for watchlist table

-- Allow users to select their own watchlist entries
CREATE POLICY "Allow select for owner" ON public.watchlist
FOR SELECT
USING (user_id = auth.uid());

-- Allow users to insert watchlist entries with user_id set by trigger
CREATE POLICY "Allow insert for owner" ON public.watchlist
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Allow users to update their own watchlist entries
CREATE POLICY "Allow update for owner" ON public.watchlist
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own watchlist entries
CREATE POLICY "Allow delete for owner" ON public.watchlist
FOR DELETE
USING (user_id = auth.uid());
