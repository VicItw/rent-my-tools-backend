const nodemailer = require("nodemailer");

// Sends a "you are registered" email through Gmail SMTP.
// Needs GMAIL_USER and GMAIL_APP_PASSWORD; without them it does nothing.
// It never throws, so a mail problem can never block registration.
const sendWelcomeEmail = async (user) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return false;
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
    const siteUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const send = transporter.sendMail({
      from: `"Rent My Tools" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: "Welcome to Rent My Tools",
      text: `Hi ${user.name},\n\nYour Rent My Tools account is ready. You registered as ${user.role} with ${user.email}.\n\nLog in at ${siteUrl}/login to browse equipment and send rental requests.\n\nRent My Tools`,
      html: `<p>Hi ${escapeHtml(user.name)},</p><p>Your <strong>Rent My Tools</strong> account is ready. You registered as <strong>${escapeHtml(user.role)}</strong> with ${escapeHtml(user.email)}.</p><p><a href="${siteUrl}/login">Log in</a> to browse equipment and send rental requests.</p><p>Rent My Tools</p>`,
    });
    // Give up after 8 seconds so a slow mail server cannot hold the request.
    await Promise.race([send, new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000))]);
    return true;
  } catch (error) {
    console.error(`Welcome email failed: ${error.message}`);
    return false;
  }
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

module.exports = sendWelcomeEmail;
