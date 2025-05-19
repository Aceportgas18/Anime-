import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are not set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('watchlist').select('*').limit(1);
    if (error) {
      console.error('Supabase query error:', error);
      process.exit(1);
    }
    console.log('Supabase query succeeded:', data);
    process.exit(0);
  } catch (err) {
    console.error('Exception during Supabase query:', err);
    process.exit(1);
  }
}

testConnection();
