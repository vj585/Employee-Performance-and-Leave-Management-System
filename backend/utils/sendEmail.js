/**
 * sendEmail.js (Brevo API version)
 * Uses Brevo's HTTP API to send emails to ANY address without domain verification.
 * Works perfectly on Render's free tier since it uses HTTPS (port 443), not SMTP.
 */
const sendEmail = async (options) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.log('No BREVO_API_KEY provided. Skipping email dispatch.');
      return;
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: 'HR Management System',
          email: process.env.BREVO_SENDER_EMAIL || 'vijay.m582005@gmail.com'
        },
        to: [{ email: options.email }],
        subject: options.subject,
        htmlContent: options.htmlMessage || `<p style="font-family: Arial, sans-serif; white-space: pre-wrap;">${options.message}</p>`
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Email sent to ${options.email} via Brevo! ID: ${data.messageId}`);
    } else {
      console.error('❌ Brevo rejected email:', JSON.stringify(data));
    }
  } catch (error) {
    console.error('Email request failed:', error.message);
  }
};

module.exports = sendEmail;
