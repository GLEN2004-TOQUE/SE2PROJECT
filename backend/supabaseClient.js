const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dvglcyzwjbyigdvxitvx.supabase.co';

// anon key (role: anon) - used for public/limited access
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2Z2xjeXp3amJ5aWdkdnhpdHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MDMwMDcsImV4cCI6MjA4NzQ3OTAwN30.0I-SLxF4x94frEZ7MUD_ybYwxfWr0roPZozi3l1bNao';

// service role key (role: service_role) - bypasses RLS
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2Z2xjeXp3amJ5aWdkdnhpdHZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTkwMzAwNywiZXhwIjoyMDg3NDc5MDA3fQ.ZVDRAAFKcardzO8szCpZmKOVLXnQhYNO7h8XSdF-oNo';

// Admin client - bypasses RLS, use for all server-side operations
const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || SERVICE_ROLE_KEY
);

// Anon client - respects RLS
const supabase = createClient(
  supabaseUrl,
  process.env.SUPABASE_ANON_KEY || ANON_KEY
);

module.exports = { supabase, supabaseAdmin };