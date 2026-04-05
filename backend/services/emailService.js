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

exports.sendOTP = async (email) => {
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store OTP for THIS specific email
  otpStore.set(email.toLowerCase().trim(), { otp, expiresAt });

  console.log(`📧 Sending OTP to: ${email} | OTP: ${otp}`); // for debugging

  const transporter = createTransporter();

  // Verify connection before sending
  await transporter.verify();

  await transporter.sendMail({
    from: `"QuizSystem OTP" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Your OTP Verification Code — QuizSystem',
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;
        margin:0 auto;background:#fff;border-radius:16px;
        overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1);">

        <div style="background:linear-gradient(135deg,#8b1a1a,#4a0c0c);
          padding:32px 36px;">
          <h1 style="color:#f5e6c8;margin:0;font-size:22px;">QuizSystem</h1>
          <p style="color:rgba(245,230,200,.6);margin:6px 0 0;font-size:13px;">
            Email Verification
          </p>
        </div>

        <div style="padding:36px;">
          <p style="color:#333;font-size:15px;margin:0 0 8px;">
            Hello! Your one-time verification code is:
          </p>

          <div style="background:#f8f4ee;border:2px dashed #c9a227;
            border-radius:12px;padding:28px;text-align:center;margin:24px 0;">
            <span style="font-size:46px;font-weight:900;color:#8b1a1a;
              letter-spacing:14px;font-family:monospace;">
              ${otp}
            </span>
          </div>

          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;">
                <span style="color:#999;font-size:12px;">Sent to</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;text-align:right;">
                <span style="color:#333;font-size:12px;font-weight:600;">
                  ${email}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="color:#999;font-size:12px;">Expires in</span>
              </td>
              <td style="padding:8px 0;text-align:right;">
                <span style="color:#8b1a1a;font-size:12px;font-weight:600;">
                  10 minutes
                </span>
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

  // OTP matched — delete it so it can't be reused
  otpStore.delete(key);
  return { valid: true };
};

// Debug helper: see all active OTPs (remove in production)
exports.debugStore = () => {
  console.log('📦 Current OTP store:');
  otpStore.forEach((val, key) => {
    const remaining = Math.max(0, Math.round((val.expiresAt - Date.now()) / 1000));
    console.log(`   ${key} → ${val.otp} (expires in ${remaining}s)`);
  });
};