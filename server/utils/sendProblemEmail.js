const nodemailer = require("nodemailer");

const sendProblemEmail = async (adminEmail, userEmail, userName, problemText) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    // 1. Send problem to admin
    await transporter.sendMail({
      from: `"Bloggin' Support" <${process.env.MAIL_USER}>`,
      to: adminEmail,
      subject: `Problem Report from ${userName}`,
      html: `
        <h3>Problem Report</h3>
        <p><strong>Name:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Problem:</strong> ${problemText}</p>
      `,
    });

    // 2. Auto-reply to user
    await transporter.sendMail({
      from: `"Bloggin' Support" <${process.env.MAIL_USER}>`,
      to: userEmail,
      subject: "We Received Your Problem Report",
      html: `
        <p>Hello ${userName},</p>
        <p>We have received your problem report and our team will investigate it soon.</p>
        <p>Thank you for letting us know.</p>
        <p>— The Bloggin' Team</p>
      `,
    });
  } catch (err) {
    console.error("❌ Failed to send problem email:", err);
    throw err;
  }
};

module.exports = sendProblemEmail;
