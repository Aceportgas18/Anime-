-- STEP 1: Create function to auto-set user_id from auth.uid()
CREATE OR REPLACE FUNCTION set_user_id_from_auth()
RETURNS trigger AS $BODY$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 2: Attach insert trigger to watchlist table
DROP TRIGGER IF EXISTS set_user_id_trigger ON public.watchlist;

CREATE TRIGGER set_user_id_trigger
BEFORE INSERT ON public.watchlist
FOR EACH ROW
EXECUTE FUNCTION set_user_id_from_auth();

-- STEP 3: Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 4: Attach update trigger to update updated_at
DROP TRIGGER IF EXISTS update_watchlist_timestamp ON public.watchlist;

CREATE TRIGGER update_watchlist_timestamp
BEFORE UPDATE ON public.watchlist
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- STEP 5: Ensure RLS is enabled (double check)
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- STEP 6: Recreate correct RLS policies (if not already in place)
DROP POLICY IF EXISTS "Allow select for owner" ON public.watchlist;
DROP POLICY IF EXISTS "Allow insert for owner" ON public.watchlist;
DROP POLICY IF EXISTS "Allow update for owner" ON public.watchlist;
DROP POLICY IF EXISTS "Allow delete for owner" ON public.watchlist;

CREATE POLICY "Allow select for owner" ON public.watchlist
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for owner" ON public.watchlist
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update for owner" ON public.watchlist
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow delete for owner" ON public.watchlist
FOR DELETE USING (auth.uid() = user_id);
