const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// In-memory OTP store: email → { otp, expiresAt }
const otpStore = new Map();

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOTP = async (email) => {
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email, { otp, expiresAt });

  await transporter.sendMail({
    from: `"QuizSystem" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Verification Code — QuizSystem',
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1);">
        <div style="background:linear-gradient(135deg,#8b1a1a,#4a0c0c);padding:32px 36px;">
          <h1 style="color:#f5e6c8;margin:0;font-size:22px;letter-spacing:-.5px;">QuizSystem</h1>
          <p style="color:rgba(245,230,200,.6);margin:6px 0 0;font-size:13px;">Email Verification</p>
        </div>
        <div style="padding:36px;">
          <p style="color:#333;font-size:15px;margin:0 0 8px;">Hello! Here is your one-time verification code:</p>
          <div style="background:#f8f4ee;border:2px dashed #c9a227;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
            <span style="font-size:42px;font-weight:900;color:#8b1a1a;letter-spacing:12px;">${otp}</span>
          </div>
          <p style="color:#666;font-size:13px;margin:0;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="color:#999;font-size:12px;margin:12px 0 0;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  });

  return true;
};

exports.verifyOTP = (email, otp) => {
  const record = otpStore.get(email);
  if (!record) return { valid: false, message: 'No OTP found. Please request a new one.' };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }
  if (record.otp !== otp) return { valid: false, message: 'Incorrect OTP code.' };
  otpStore.delete(email);
  return { valid: true };
};