require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const otpStore = new Map();

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.generateTempPassword = () => {
  const lower   = 'abcdefghijkmnpqrstuvwxyz';
  const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits  = '23456789';
  const special = '@#$!';
  const rand = (str) => str[Math.floor(Math.random() * str.length)];
  let pwd = rand(upper) + rand(digits) + rand(special);
  for (let i = 0; i < 7; i++) pwd += rand(lower + upper + digits);
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
};

// ─── Send OTP ─────────────────────────────────────────────────────────────────

exports.sendOTP = async (email) => {
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  otpStore.set(email.toLowerCase().trim(), { otp, expiresAt });

  console.log(`📧 Sending OTP to: ${email} | OTP: ${otp}`);

  const { error } = await resend.emails.send({
    from: 'QuizSystem OTP <onboarding@resend.dev>',   // use this until you verify a domain
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

  if (error) {
    console.error('❌ Resend error:', error);
    throw new Error(error.message || 'Failed to send OTP email');
  }

  console.log(`✅ OTP sent successfully to ${email}`);
  return true;
};

// ─── Send teacher credentials ─────────────────────────────────────────────────

exports.sendTeacherCredentials = async (email, fullName, tempPassword) => {
  console.log(`📧 Sending teacher credentials to: ${email}`);

  const frontendUrl = process.env.FRONTEND_URL || 'https://se2project.onrender.com';

  const { error } = await resend.emails.send({
    from: 'QuizSystem Admin <onboarding@resend.dev>',
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
                  <span style="color:#6b7280;font-size:12px;">Email Address</span>
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
            <a href="${frontendUrl}" style="display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#1e40af,#1e3a8a);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">
              Log In to QuizSystem →
            </a>
          </div>
        </div>
      </div>
    `,
  });

  if (error) throw new Error(error.message || 'Failed to send credentials email');
  return true;
};

// ─── OTP verification ─────────────────────────────────────────────────────────

exports.verifyOTP = (email, otp) => {
  const key = email.toLowerCase().trim();
  const record = otpStore.get(key);

  if (!record) return { valid: false, message: 'No OTP found for this email. Please request a new one.' };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }
  if (record.otp !== String(otp).trim()) {
    return { valid: false, message: 'Incorrect OTP code. Please try again.' };
  }

  otpStore.delete(key);
  return { valid: true };
};

exports.debugStore = () => {
  console.log('📦 Current OTP store:');
  otpStore.forEach((val, key) => {
    const remaining = Math.max(0, Math.round((val.expiresAt - Date.now()) / 1000));
    console.log(`   ${key} → ${val.otp} (expires in ${remaining}s)`);
  });
};