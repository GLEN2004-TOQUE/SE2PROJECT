const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { supabaseAdmin } = require('../supabaseClient');

function buildStudentRows(fullName, email, hashedPassword, course, section) {
  const base = {
    full_name: String(fullName).trim(),
    email: String(email).toLowerCase().trim(),
    password: hashedPassword,
    role: 'student',
    course: String(course).trim(),
    section: String(section).trim(),
    status: true,
  };
  return [
    { ...base, points: 0, streak: 0, tier: 'Beginner' },
    base,
    {
      full_name: base.full_name,
      email: base.email,
      password: base.password,
      role: 'student',
      status: true,
    },
  ];
}

/**
 * Create a student account. Supabase is the primary store (matches login/admin).
 * Retries with fewer columns when the live schema omits optional gamification fields.
 */
async function registerStudent({ fullName, email, password, course, section }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const rowVariants = buildStudentRows(fullName, email, hashedPassword, course, section);
  let lastError = null;

  for (const row of rowVariants) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([row])
      .select('id, full_name, email, role, course, section')
      .single();

    if (!error && data) {
      return { source: 'supabase', user: data };
    }
    lastError = error;
    if (error?.code !== 'PGRST204' && error?.code !== '42703') break;
    console.warn('⚠️ Supabase insert retry (schema):', error.message || error);
  }

  console.warn('⚠️ Supabase student registration failed, trying Postgres:', lastError?.message || lastError);

  const primary = rowVariants[0];
  try {
    const pgResult = await pool.query(
      `INSERT INTO users (full_name, email, password, role, course, section, status)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, full_name, email, role, course, section`,
      [primary.full_name, primary.email, hashedPassword, 'student', primary.course, primary.section]
    );
    if (pgResult.rows[0]) {
      return { source: 'postgres', user: pgResult.rows[0] };
    }
  } catch (pgErr) {
    const err = lastError || pgErr;
    err.message = err.message || pgErr.message;
    err.code = err.code || pgErr.code;
    throw err;
  }

  if (lastError) throw lastError;
  throw new Error('Registration failed: could not create user record.');
}

module.exports = { registerStudent };
