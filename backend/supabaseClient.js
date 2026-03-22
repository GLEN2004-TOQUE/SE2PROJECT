const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dvglcyzwjbyigdvxitvx.supabase.co';

// Admin client 
const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Anon client - for public/frontend use
const supabase = createClient(
  supabaseUrl,
  process.env.SUPABASE_ANON_KEY
);

module.exports = { supabase, supabaseAdmin };