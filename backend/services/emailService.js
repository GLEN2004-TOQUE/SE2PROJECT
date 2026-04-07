require('dotenv').config();
const nodemailer = require('nodemailer');

// OTP store: { email → { otp, expiresAt } }
const otpStore = new Map();

// Create transporter fresh per send (avoids connection timeout issues)
const createTransporter = () =>
  nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─── Generate a temporary password ───────────────────────────────────────────
exports.generateTempPassword = () => {
  const lower   = 'abcdefghijkmnpqrstuvwxyz';
  const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits  = '23456789';
  const special = '@#$!';

  const rand = (str) => str[Math.floor(Math.random() * str.length)];

  let pwd = rand(upper) + rand(digits) + rand(special);
  for (let i = 0; i < 7; i++) {
    pwd += rand(lower + upper + digits);
  }
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
};

// ─── Send teacher account credentials ────────────────────────────────────────
exports.sendTeacherCredentials = async (email, fullName, tempPassword) => {
  console.log(`📧 Sending teacher credentials to: ${email}`);

  const transporter = createTransporter();
  await transporter.verify();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  await transporter.sendMail({
    from: `"QuizSystem Admin" <${process.env.EMAIL_USER}>`,
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
          <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px;">
            An administrator has created a teacher account for you on QuizSystem.
            Below are your login credentials. Please log in and <strong>change your password immediately</strong>.
          </p>
          <div style="background:#f0f4ff;border:2px dashed #3b82f6;border-radius:12px;padding:28px;margin:0 0 24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e0e7ff;">
                  <span style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.06em;">Email Address</span>
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #e0e7ff;text-align:right;">
                  <span style="color:#1e3a8a;font-size:14px;font-weight:600;font-family:monospace;">${email}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;">
                  <span style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.06em;">Temporary Password</span>
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

  transporter.close();
  return true;
};

// ─── Send password changed notification ───────────────────────────────────────
exports.sendPasswordChangedEmail = async (email, fullName) => {
  console.log(`📧 Sending password-changed notification to: ${email}`);

  const transporter = createTransporter();
  await transporter.verify();

  const now = new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });

  await transporter.sendMail({
    from: `"QuizSystem Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔒 Your Password Has Been Changed — QuizSystem',
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:500px;
        margin:0 auto;background:#fff;border-radius:16px;
        overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1);">

        <div style="background:linear-gradient(135deg,#065f46,#047857);padding:32px 36px;">
          <h1 style="color:#fff;margin:0;font-size:22px;">QuizSystem</h1>
          <p style="color:rgba(255,255,255,.65);margin:6px 0 0;font-size:13px;">Security Notification</p>
        </div>

        <div style="padding:36px;">
          <!-- Green check circle -->
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-flex;align-items:center;justify-content:center;
              width:70px;height:70px;border-radius:50%;
              background:#d1fae5;border:3px solid #10b981;">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
                stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
          </div>

          <h2 style="text-align:center;color:#065f46;font-size:20px;font-weight:700;margin:0 0 8px;">
            Password Changed Successfully
          </h2>
          <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 28px;">
            Your QuizSystem account password was updated.
          </p>

          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #d1fae5;">
                  <span style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.06em;">Account</span>
                </td>
                <td style="padding:8px 0;border-bottom:1px solid #d1fae5;text-align:right;">
                  <span style="color:#065f46;font-size:13px;font-weight:600;">${fullName}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #d1fae5;">
                  <span style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.06em;">Email</span>
                </td>
                <td style="padding:8px 0;border-bottom:1px solid #d1fae5;text-align:right;">
                  <span style="color:#065f46;font-size:13px;font-family:monospace;">${email}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;">
                  <span style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.06em;">Changed At</span>
                </td>
                <td style="padding:8px 0;text-align:right;">
                  <span style="color:#065f46;font-size:13px;">${now}</span>
                </td>
              </tr>
            </table>
          </div>

          <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
            <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
              ⚠️ <strong>Wasn't you?</strong> If you did not make this change, please contact your administrator immediately and reset your password.
            </p>
          </div>

          <p style="color:#9ca3af;font-size:11px;text-align:center;margin:0;">
            This is an automated security notification from QuizSystem.
          </p>
        </div>
      </div>
    `,
  });

  transporter.close();
  return true;
};

// ─── OTP functions ────────────────────────────────────────────────────────────
exports.sendOTP = async (email) => {
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  otpStore.set(email.toLowerCase().trim(), { otp, expiresAt });

  console.log(`📧 Sending OTP to: ${email} | OTP: ${otp}`);

  const transporter = createTransporter();
  await transporter.verify();

  await transporter.sendMail({
    from: `"QuizSystem OTP" <${process.env.EMAIL_USER}>`,
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
          <p style="color:#333;font-size:15px;margin:0 0 8px;">Hello! Your one-time verification code is:</p>
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

  transporter.close();
  return true;
};

exports.verifyOTP = (email, otp) => {
  const key = email.toLowerCase().trim();
  const record = otpStore.get(key);

  console.log(`🔍 Verifying OTP for: ${email}`);
  console.log(`   Stored record:`, record);
  console.log(`   Entered OTP:`, otp);

  if (!record) {
    return { valid: false, message: 'No OTP found for this email. Please request a new one.' };
  }
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