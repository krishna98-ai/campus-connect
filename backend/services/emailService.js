import { log } from "console";
import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  console.log("email bhjne vala function chl rha ab ");
  
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.FROM_NAME || "Campus Connect"}" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
    text,
  };

  return await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: 'Segoe UI', sans-serif; background: #f4f4f4; padding: 30px 0;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Campus Connect</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Your Campus Community Platform</p>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1f2937; font-size: 22px; margin: 0 0 16px;">Reset Your Password</h2>
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px;">Hi <strong>${name}</strong>,</p>
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px;">We received a request to reset the password for your Campus Connect account. Click the button below to create a new password. This link is valid for <strong>30 minutes</strong>.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 8px;">Or copy and paste this URL into your browser:</p>
          <p style="color: #6366f1; font-size: 13px; word-break: break-all; margin: 0 0 24px;">${resetUrl}</p>
          <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
        </div>
        <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Campus Connect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Campus Connect - Reset Your Password",
    html,
    text: `Hi ${name}, reset your password at: ${resetUrl}`,
  });
};

const sendWelcomeEmail = async (email, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: 'Segoe UI', sans-serif; background: #f4f4f4; padding: 30px 0;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Welcome to Campus Connect! 🎓</h1>
        </div>
        <div style="padding: 40px;">
          <p style="color: #4b5563; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
          <p style="color: #4b5563; line-height: 1.6;">Welcome to Campus Connect! We're excited to have you join our community of students.</p>
          <ul style="color: #4b5563; line-height: 2;">
            <li>📝 Share posts and connect with peers</li>
            <li>📚 Upload and download study notes</li>
            <li>💬 Chat in real-time with classmates</li>
            <li>🔔 Get notified about campus activities</li>
          </ul>
          <p style="color: #4b5563;">Explore and make the most of your campus experience!</p>
        </div>
        <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Campus Connect.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to Campus Connect! 🎓",
    html,
    text: `Hi ${name}, welcome to Campus Connect!`,
  });
};

const sendSignupOtpEmail = async (email, name, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px;">
      <h2>Verify your Campus Connect email</h2>
      <p>Hi ${name},</p>
      <p>Use this OTP to complete your signup. It expires in 10 minutes.</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px 0;">
        ${otp}
      </div>
      <p>If you didn't request this, you can ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Campus Connect - Email Verification OTP",
    html,
    text: `Hi ${name}, your Campus Connect signup OTP is ${otp}. It expires in 10 minutes.`,
  });
};

export { sendEmail, sendPasswordResetEmail, sendWelcomeEmail,sendSignupOtpEmail };
