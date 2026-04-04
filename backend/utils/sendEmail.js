const nodemailer = require('nodemailer');

/**
 * Utility function to send an email.
 * Configured via .env variables for flexibility across SMTP providers.
 */
const sendEmail = async (options) => {
  try {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // 2. Define the email options
    const mailOptions = {
      from: `HR Management System <${process.env.SMTP_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.htmlMessage || `<p>${options.message}</p>`,
    };

    // 3. Actually send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully dispatched to ${options.email}`);
  } catch (error) {
    console.error('Email dispatch failed:', error.message);
    // Depending on requirements, we can throw the error to fail the entire request,
    // or return false and log it to let the app continue (better for leave requests).
    // Let's log it and allow the app to survive email failures.
  }
};

module.exports = sendEmail;
