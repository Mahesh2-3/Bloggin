const nodemailer = require("nodemailer");

const sendOtp = async (email, otp, mode) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // ✅ allow self-signed certs
      },
    });

  const mailOptionsLogin = {
  from: `"Bloggin'" <${process.env.MAIL_USER}>`,
  to: email,
  subject: "Your Bloggin' OTP Code 📝",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="color: #333;">Hello there 👋,</h2>
      <p style="font-size: 16px; color: #555;">
        Thanks for signing up on <strong>Bloggin'</strong>! To verify your email, please use the OTP below:
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; font-size: 28px; font-weight: bold; color: #2b6cb0; background: #e6f0ff; padding: 10px 20px; border-radius: 8px;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 14px; color: #777;">
        This code will expire in <strong>5 minutes</strong>. Please don’t share it with anyone.
      </p>
      <p style="font-size: 14px; color: #999;">
        Didn’t request this OTP? Just ignore this email.
      </p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 14px; color: #aaa;">
        — The Bloggin' Team
      </p>
    </div>
  `,
};
const mailOptionsPass = {
  from: `"Bloggin'" <${process.env.MAIL_USER}>`,
  to: email,
  subject: "Bloggin' Password Reset OTP 🔐",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="color: #333;">Hello there 👋,</h2>
      <p style="font-size: 16px; color: #555;">
        We received a request to reset your password for your <strong>Bloggin'</strong> account. 
        Please use the OTP below to proceed:
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; font-size: 28px; font-weight: bold; color: #d97706; background: #fff7ed; padding: 10px 20px; border-radius: 8px;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 14px; color: #777;">
        This code will expire in <strong>5 minutes</strong>. If you did not request a password reset, please ignore this email.
      </p>
      <p style="font-size: 14px; color: #999;">
        Once you enter this OTP, you’ll be able to set a new password for your account.
      </p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 14px; color: #aaa;">
        — The Bloggin' Team
      </p>
    </div>
  `,
};


    const info = await transporter.sendMail(mode == 'login'? mailOptionsLogin : mailOptionsPass);
  } catch (err) {
    console.error("❌ Failed to send email:", err);
    throw err;
  }
};

module.exports = sendOtp;
