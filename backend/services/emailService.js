require('dotenv').config();
const { BrevoClient } = require('@getbrevo/brevo');
const pool = require('../config/db');
const { supabaseAdmin } = require('../supabaseClient');
const { getUserAuthLocationByEmail } = require('../utils/userLookup');

const transactionalApi = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY || '',
}).transactionalEmails;

/** In-memory fallback only if DB is unavailable (e.g. misconfigured local env). */
const otpStoreFallback = new Map();

let otpTableEnsured = false;

async function ensurePasswordResetOtpTable() {
  if (otpTableEnsured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_otps (
      email_lower TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    )
  `);
  otpTableEnsured = true;
}

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sender = {
  email: process.env.BREVO_SENDER_EMAIL || 'tchristopherglen@gmail.com',
  name:  process.env.BREVO_SENDER_NAME  || 'Quizdev',
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not set');
  }

  const result = await transactionalApi.sendTransacEmail({
    sender,
    to: [{ email: to }],
    subject,
    htmlContent: html,
  });
  console.log(`✅ Email sent to ${to} | messageId: ${result?.messageId || 'ok'}`);
  return result;
};

// ─── Generate temp password ───────────────────────────────────────────────────

exports.generateTempPassword = () => {
  const lower   = 'abcdefghijkmnpqrstuvwxyz';
  const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits  = '23456789';
  const special = '@#$!';
  const rand = (s) => s[Math.floor(Math.random() * s.length)];
  let pwd = rand(upper) + rand(digits) + rand(special);
  for (let i = 0; i < 7; i++) pwd += rand(lower + upper + digits);
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
};

// ─── Send OTP ─────────────────────────────────────────────────────────────────

exports.sendOTP = async (email) => {
  const otp = generateOTP();
  const key = email.toLowerCase().trim();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  try {
    await ensurePasswordResetOtpTable();
    await pool.query(
      `INSERT INTO password_reset_otps (email_lower, code, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (email_lower) DO UPDATE SET
         code = EXCLUDED.code,
         expires_at = EXCLUDED.expires_at`,
      [key, otp, new Date(expiresAt)]
    );
  } catch (e) {
    console.warn('OTP DB store failed, using in-memory fallback:', e.message);
    otpStoreFallback.set(key, { otp, expiresAt });
  }

  console.log(`📧 Sending OTP to: ${email} | OTP: ${otp}`);

  await sendEmail({
    to: email,
    subject: '🔐 Your OTP Verification Code — QuizSystem',
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;
        margin:0 auto;background:#fff;border-radius:16px;
        overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1);">
        <div style="background:linear-gradient(135deg,#8b1a1a,#4a0c0c);padding:32px 36px;">
          <h1 style="color:#f5e6c8;margin:0;font-size:22px;">QuizSystem</h1>
          <p style="color:rgba(245,230,200,.6);margin:6px 0 0;font-size:13px;">Email Verification</p>
        </div>
        <div style="padding:36px;">
          <p style="color:#333;font-size:15px;margin:0 0 8px;">Your one-time verification code is:</p>
          <div style="background:#f8f4ee;border:2px dashed #c9a227;border-radius:12px;padding:28px;text-align:center;margin:24px 0;">
            <span style="font-size:46px;font-weight:900;color:#8b1a1a;letter-spacing:14px;font-family:monospace;">${otp}</span>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;">
                <span style="color:#999;font-size:12px;">Sent to</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;text-align:right;">
                <span style="color:#333;font-size:12px;font-weight:600;">${email}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="color:#999;font-size:12px;">Expires in</span>
              </td>
              <td style="padding:8px 0;text-align:right;">
                <span style="color:#8b1a1a;font-size:12px;font-weight:600;">10 minutes</span>
              </td>
            </tr>
          </table>
          <p style="color:#bbb;font-size:11px;margin:20px 0 0;text-align:center;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });

  return true;
};

// ─── Forgot password OTP (existing accounts) ───────────────────────────────────

/** Persists OTP for legacy Postgres `users` rows (same table as registration OTP). */
async function persistForgotPasswordOtpPostgres(emailLower, otp, expiresAtMs) {
  try {
    await ensurePasswordResetOtpTable();
    await pool.query(
      `INSERT INTO password_reset_otps (email_lower, code, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (email_lower) DO UPDATE SET
         code = EXCLUDED.code,
         expires_at = EXCLUDED.expires_at`,
      [emailLower, otp, new Date(expiresAtMs)]
    );
  } catch (e) {
    console.warn('Forgot-password OTP DB store failed, using in-memory fallback:', e.message);
    otpStoreFallback.set(emailLower, { otp, expiresAt: expiresAtMs });
  }
}

/**
 * Sends a 6-digit OTP for password reset. For Supabase `users`, OTP is stored on the row
 * (`password_reset_otp`, `password_reset_otp_expires_at`). For Postgres-only accounts,
 * uses `password_reset_otps`.
 */
exports.sendForgotPasswordOTP = async (email) => {
  const key = email.toLowerCase().trim();
  const loc = await getUserAuthLocationByEmail(key);
  if (!loc) {
    const err = new Error('NO_ACCOUNT');
    err.code = 'NO_ACCOUNT';
    throw err;
  }

  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  const expiresIso = new Date(expiresAt).toISOString();

  if (loc.source === 'supabase') {
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        password_reset_otp: otp,
        password_reset_otp_expires_at: expiresIso,
      })
      .eq('id', loc.id);
    if (error) throw new Error(error.message || 'Could not save reset code. Add columns password_reset_otp and password_reset_otp_expires_at to users in Supabase (see backend/sql/add_password_reset_otp_columns.sql).');
  } else {
    await persistForgotPasswordOtpPostgres(key, otp, expiresAt);
  }

  console.log(`📧 Forgot-password OTP to: ${email} | OTP: ${otp}`);

  await sendEmail({
    to: email,
    subject: '🔐 Password reset code — QuizSystem',
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;
        margin:0 auto;background:#fff;border-radius:16px;
        overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1);">
        <div style="background:linear-gradient(135deg,#8b1a1a,#4a0c0c);padding:32px 36px;">
          <h1 style="color:#f5e6c8;margin:0;font-size:22px;">QuizSystem</h1>
          <p style="color:rgba(245,230,200,.6);margin:6px 0 0;font-size:13px;">Password reset</p>
        </div>
        <div style="padding:36px;">
          <p style="color:#333;font-size:15px;margin:0 0 8px;">Use this code to choose a new password:</p>
          <div style="background:#f8f4ee;border:2px dashed #c9a227;border-radius:12px;padding:28px;text-align:center;margin:24px 0;">
            <span style="font-size:46px;font-weight:900;color:#8b1a1a;letter-spacing:14px;font-family:monospace;">${otp}</span>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;">
                <span style="color:#999;font-size:12px;">Account</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;text-align:right;">
                <span style="color:#333;font-size:12px;font-weight:600;">${email}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="color:#999;font-size:12px;">Expires in</span>
              </td>
              <td style="padding:8px 0;text-align:right;">
                <span style="color:#8b1a1a;font-size:12px;font-weight:600;">10 minutes</span>
              </td>
            </tr>
          </table>
          <p style="color:#bbb;font-size:11px;margin:20px 0 0;text-align:center;">
            If you did not request a password reset, you can ignore this email.
          </p>
        </div>
      </div>
    `,
  });

  return true;
};

/**
 * Verifies forgot-password OTP, clears stored OTP, and removes the password so a new one can be set.
 */
exports.verifyForgotPasswordOtpAndClearPassword = async (email, otp) => {
  const key = email.toLowerCase().trim();
  const trimmedOtp = String(otp).trim();
  const loc = await getUserAuthLocationByEmail(key);
  if (!loc) return { ok: false, message: 'No account found for this email.' };

  if (loc.source === 'supabase') {
    const { data: row, error } = await supabaseAdmin
      .from('users')
      .select('id, password_reset_otp, password_reset_otp_expires_at')
      .eq('id', loc.id)
      .single();
    if (error || !row) return { ok: false, message: 'Could not verify account. Try again.' };
    if (!row.password_reset_otp) {
      return { ok: false, message: 'No OTP found. Please request a new one.' };
    }
    const expMs = row.password_reset_otp_expires_at
      ? new Date(row.password_reset_otp_expires_at).getTime()
      : 0;
    if (Date.now() > expMs) {
      await supabaseAdmin
        .from('users')
        .update({ password_reset_otp: null, password_reset_otp_expires_at: null })
        .eq('id', loc.id);
      return { ok: false, message: 'OTP has expired. Please request a new one.' };
    }
    if (String(row.password_reset_otp).trim() !== trimmedOtp) {
      return { ok: false, message: 'Incorrect OTP. Please try again.' };
    }
    const { error: upErr } = await supabaseAdmin
      .from('users')
      .update({
        password_reset_otp: null,
        password_reset_otp_expires_at: null,
        password: null,
      })
      .eq('id', loc.id);
    if (upErr) return { ok: false, message: upErr.message };
    return { ok: true, source: 'supabase', email: key };
  }

  const v = await exports.verifyOTP(key, trimmedOtp);
  if (!v.valid) return { ok: false, message: v.message };

  await pool.query(
    'UPDATE users SET password = NULL WHERE LOWER(TRIM(email)) = $1',
    [key]
  );
  return { ok: true, source: 'postgres', email: key };
};

// ─── Password reset (temporary password by email) ─────────────────────────────

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** After OTP verification: deliver a new temporary sign-in password (plain only in email). */
exports.sendPasswordResetEmail = async (email, tempPassword) => {
  const safeEmail = escapeHtml(email);
  const safePwd = escapeHtml(tempPassword);
  const frontendUrl = process.env.FRONTEND_URL || 'https://se2project.onrender.com';

  await sendEmail({
    to: email,
    subject: '🔑 Your temporary password — QuizSystem',
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;
        margin:0 auto;background:#fff;border-radius:16px;
        overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1);">
        <div style="background:linear-gradient(135deg,#8b1a1a,#4a0c0c);padding:32px 36px;">
          <h1 style="color:#f5e6c8;margin:0;font-size:22px;">QuizSystem</h1>
          <p style="color:rgba(245,230,200,.65);margin:6px 0 0;font-size:13px;">Password reset</p>
        </div>
        <div style="padding:36px;">
          <p style="color:#333;font-size:15px;margin:0 0 16px;">You requested a new sign-in password. Use this <strong>temporary password</strong> once, then change it after you log in if your profile has a change-password option.</p>
          <div style="background:#f8f4ee;border:2px dashed #c9a227;border-radius:12px;padding:28px;margin:0 0 24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0e8d8;">
                  <span style="color:#666;font-size:12px;">Account email</span>
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #f0e8d8;text-align:right;">
                  <span style="color:#333;font-size:13px;font-weight:600;font-family:monospace;">${safeEmail}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;">
                  <span style="color:#666;font-size:12px;">Temporary password</span>
                </td>
                <td style="padding:10px 0;text-align:right;">
                  <span style="color:#8b1a1a;font-size:18px;font-weight:700;letter-spacing:2px;font-family:monospace;">${safePwd}</span>
                </td>
              </tr>
            </table>
          </div>
          <p style="color:#555;font-size:13px;margin:0 0 20px;line-height:1.5;">If you did not request this, secure your account by signing in and changing your password, or contact your instructor.</p>
          <div style="text-align:center;">
            <a href="${frontendUrl}" style="display:inline-block;padding:13px 32px;
              background:linear-gradient(135deg,#8b1a1a,#4a0c0c);color:#f5e6c8;
              text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">
              Open QuizSystem →
            </a>
          </div>
        </div>
      </div>
    `,
  });

  return true;
};

// ─── Send teacher credentials ─────────────────────────────────────────────────

exports.sendTeacherCredentials = async (email, fullName, tempPassword) => {
  console.log(`📧 Sending credentials to: ${email}`);
  const frontendUrl = process.env.FRONTEND_URL || 'https://se2project.onrender.com';

  await sendEmail({
    to: email,
    subject: '🎓 Your Teacher Account Has Been Created — QuizSystem',
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;
        margin:0 auto;background:#fff;border-radius:16px;
        overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1);">
        <div style="background:linear-gradient(135deg,#1e3a8a,#1e40af);padding:32px 36px;">
          <h1 style="color:#fff;margin:0;font-size:22px;">QuizSystem</h1>
          <p style="color:rgba(255,255,255,.65);margin:6px 0 0;font-size:13px;">Teacher Account Created</p>
        </div>
        <div style="padding:36px;">
          <p style="color:#333;font-size:15px;margin:0 0 16px;">Hello, <strong>${fullName}</strong>! 👋</p>
          <div style="background:#f0f4ff;border:2px dashed #3b82f6;border-radius:12px;padding:28px;margin:0 0 24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e0e7ff;">
                  <span style="color:#6b7280;font-size:12px;">Email</span>
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #e0e7ff;text-align:right;">
                  <span style="color:#1e3a8a;font-size:14px;font-weight:600;font-family:monospace;">${email}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;">
                  <span style="color:#6b7280;font-size:12px;">Temporary Password</span>
                </td>
                <td style="padding:10px 0;text-align:right;">
                  <span style="color:#dc2626;font-size:18px;font-weight:700;letter-spacing:3px;font-family:monospace;">${tempPassword}</span>
                </td>
              </tr>
            </table>
          </div>
          <div style="text-align:center;">
            <a href="${frontendUrl}" style="display:inline-block;padding:13px 32px;
              background:linear-gradient(135deg,#1e40af,#1e3a8a);color:#fff;
              text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">
              Log In to QuizSystem →
            </a>
          </div>
        </div>
      </div>
    `,
  });

  return true;
};

// ─── OTP verification ─────────────────────────────────────────────────────────

exports.verifyOTP = async (email, otp) => {
  const key = email.toLowerCase().trim();
  const trimmedOtp = String(otp).trim();

  try {
    await ensurePasswordResetOtpTable();
    const { rows } = await pool.query(
      'SELECT code, expires_at FROM password_reset_otps WHERE email_lower = $1',
      [key]
    );
    const row = rows[0];
    if (row) {
      const expMs = new Date(row.expires_at).getTime();
      if (Date.now() > expMs) {
        await pool.query('DELETE FROM password_reset_otps WHERE email_lower = $1', [key]);
        return { valid: false, message: 'OTP has expired. Please request a new one.' };
      }
      if (row.code !== trimmedOtp) {
        return { valid: false, message: 'Incorrect OTP. Please try again.' };
      }
      await pool.query('DELETE FROM password_reset_otps WHERE email_lower = $1', [key]);
      return { valid: true };
    }
  } catch (e) {
    console.warn('OTP DB verify failed, checking in-memory fallback:', e.message);
  }

  const record = otpStoreFallback.get(key);
  if (!record) return { valid: false, message: 'No OTP found. Please request a new one.' };
  if (Date.now() > record.expiresAt) {
    otpStoreFallback.delete(key);
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }
  if (record.otp !== trimmedOtp) return { valid: false, message: 'Incorrect OTP. Please try again.' };
  otpStoreFallback.delete(key);
  return { valid: true };
};

exports.debugStore = async () => {
  console.log('📦 OTP store (DB + memory fallback):');
  try {
    await ensurePasswordResetOtpTable();
    const { rows } = await pool.query(
      'SELECT email_lower, code, expires_at FROM password_reset_otps ORDER BY email_lower'
    );
    for (const r of rows) {
      const remaining = Math.max(0, Math.round((new Date(r.expires_at).getTime() - Date.now()) / 1000));
      console.log(`   ${r.email_lower} → ${r.code} (${remaining}s left)`);
    }
  } catch (e) {
    console.log('   (DB unreadable)', e.message);
  }
  otpStoreFallback.forEach((val, key) => {
    const remaining = Math.max(0, Math.round((val.expiresAt - Date.now()) / 1000));
    console.log(`   ${key} → ${val.otp} (${remaining}s left) [memory]`);
  });
};