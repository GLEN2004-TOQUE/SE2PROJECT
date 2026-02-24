import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dvglcyzwjbyigdvxitvx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2Z2xjeXp3amJ5aWdkdnhpdHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MDMwMDcsImV4cCI6MjA4NzQ3OTAwN30.0I-SLxF4x94frEZ7MUD_ybYwxfWr0roPZozi3l1bNao';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };
