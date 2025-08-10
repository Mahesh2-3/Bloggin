const nodemailer = require("nodemailer");

const sendFeedbackEmail = async (adminEmail, userEmail, userName, feedbackText, rating) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    // 1. Send feedback to admin
    await transporter.sendMail({
      from: `"Bloggin' Support" <${process.env.MAIL_USER}>`,
      to: adminEmail,
      subject: `Feedback from ${userName} - Rating: ${rating}⭐`,
      html: `
        <h3>Feedback</h3>
        <p><strong>Name:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Rating:</strong> ${rating}/5</p>
        <p><strong>Feedback:</strong> ${feedbackText}</p>
      `,
    });

    // 2. Auto-reply to user
    await transporter.sendMail({
      from: `"Bloggin' Support" <${process.env.MAIL_USER}>`,
      to: userEmail,
      subject: "Thank You for Your Feedback",
      html: `
        <p>Hello ${userName},</p>
        <p>Thank you for your feedback! Your rating of ${rating}/5 is greatly appreciated.</p>
        <p>We value your opinion and will use it to improve our services.</p>
        <p>— The Bloggin' Team</p>
      `,
    });
  } catch (err) {
    console.error("❌ Failed to send feedback email:", err);
    throw err;
  }
};

module.exports = sendFeedbackEmail;
