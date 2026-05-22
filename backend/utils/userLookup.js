const pool = require('../config/db');
const { supabaseAdmin } = require('../supabaseClient');

/** Escape `%`, `_`, and `\` for PostgREST `ilike` filters (literal match, case-insensitive). */
function escapeForILike(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

/**
 * True if an account row exists with this email (Supabase `users` first, then legacy Postgres `users`).
 */
async function emailExistsInUsers(emailLower) {
  const lower = String(emailLower || '').toLowerCase().trim();
  if (!lower) return false;

  const { data: sb, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .ilike('email', escapeForILike(lower))
    .maybeSingle();
  if (error) throw error;
  if (sb) return true;

  try {
    const r = await pool.query(
      'SELECT 1 FROM users WHERE LOWER(TRIM(email)) = $1 LIMIT 1',
      [lower]
    );
    return r.rowCount > 0;
  } catch (dbErr) {
    console.warn('⚠️ Local DB unavailable while checking email existence:', dbErr.message || dbErr);
    return false;
  }
}

/**
 * Where this email is authenticated (Supabase `users` is checked first).
 * @returns {Promise<{ source: 'supabase'|'postgres', id: string|number, email: string } | null>}
 */
async function getUserAuthLocationByEmail(emailLower) {
  const lower = String(emailLower || '').toLowerCase().trim();
  if (!lower) return null;

  const { data: sb, error } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .ilike('email', escapeForILike(lower))
    .maybeSingle();
  if (error) throw error;
  if (sb) return { source: 'supabase', id: sb.id, email: String(sb.email || lower) };

  try {
    const r = await pool.query(
      'SELECT id, email FROM users WHERE LOWER(TRIM(email)) = $1 LIMIT 1',
      [lower]
    );
    const row = r.rows[0];
    if (!row) return null;
    return { source: 'postgres', id: row.id, email: String(row.email || lower) };
  } catch (dbErr) {
    console.warn('⚠️ Local DB unavailable while locating auth email:', dbErr.message || dbErr);
    return null;
  }
}

module.exports = { escapeForILike, emailExistsInUsers, getUserAuthLocationByEmail };
