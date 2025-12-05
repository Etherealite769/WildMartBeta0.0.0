import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "https://gjvodijwoamyjperbiyr.supabase.co";
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqdm9kaWp3b2FteWpwZXJiaXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NjM4NDMsImV4cCI6MjA4MDEzOTg0M30.6NaorouxBxq2_FJZIwk8N_Q0KTfJWpN7Vilm1-n_QFw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
