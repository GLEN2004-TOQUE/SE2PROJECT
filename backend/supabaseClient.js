const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://dvglcyzwjbyigdvxitvx.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2Z2xjeXp3amJ5aWdkdnhpdHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MDMwMDcsImV4cCI6MjA4NzQ3OTAwN30.0I-SLxF4x94frEZ7MUD_ybYwxfWr0roPZozi3l1bNao';
const jwtsecret = process.env.JWT_SECRET || 'w10muPfoKbUGKH8CpeVHiowrThGPPL3q+XMp7ETv46xZ3IVpGzKzeTVTZAIb5y2FDhu6ifFi7DzZJxG0CZwbsA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = { supabase };
