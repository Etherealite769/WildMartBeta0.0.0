import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://gjvodijwoamyjperbiyr.supabase.co";
const supabaseAnonKey = "sb_secret_A72XCeadUJfkHRJklQY5Yg_6921CMKI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
