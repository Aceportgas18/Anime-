-- Create function to auto-set user_id from auth.uid() on insert
CREATE OR REPLACE FUNCTION set_user_id_from_auth()
RETURNS trigger AS $BODY$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to watchlist table
DROP TRIGGER IF EXISTS set_user_id_trigger ON public.watchlist;

CREATE TRIGGER set_user_id_trigger
BEFORE INSERT ON public.watchlist
FOR EACH ROW
EXECUTE FUNCTION set_user_id_from_auth();
