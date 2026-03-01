const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const getSupabase = (token) => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    token ? {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    } : {}
  );
};

module.exports = getSupabase;