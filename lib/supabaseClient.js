import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://skzkjdmrbunngwfsqxry.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNremtqZG1yYnVubmd3ZnNxeHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MjIxOTUsImV4cCI6MjA2MjE5ODE5NX0.o_yGO3xrofyDT7W7qELePQyqiOOx_1rQm2xHg44pUZA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
