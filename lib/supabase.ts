import { createClient } from '@supabase/supabase-js';

// Use environment variables for the URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tdbgejczqlhycykeqffj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmdlamN6cWxoeWN5a2VxZmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1Njk2MTMsImV4cCI6MjA1OTE0NTYxM30.MCMKE4L1qO4gIcooMoQcY_G1N9T43CUAjz3EcezOgq8';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);