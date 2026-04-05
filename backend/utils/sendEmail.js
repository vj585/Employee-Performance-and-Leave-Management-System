/**
 * sendEmail.js (Resend API version)
 * Uses standard HTTP request to completely bypass Render's free tier SMTP firewall.
 */
const sendEmail = async (options) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('No RESEND_API_KEY provided. Skipping email dispatch.');
      return;
    }

    // 1. Fire an HTTP POST request to Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        // NOTE: On Resend's free tier, you MUST dispatch from 'onboarding@resend.dev' 
        // until you formally verify your own domain (e.g. hr@yourcompany.com).
        from: 'HR System <onboarding@resend.dev>', 
        to: options.email,
        subject: options.subject,
        html: options.htmlMessage || `<p style="white-space: pre-wrap;">${options.message}</p>`
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Email successfully dispatched to ${options.email} via Resend! ID: ${data.id}`);
    } else {
      console.error('❌ Email dispatch rejected by Resend API:', data.message);
    }
  } catch (error) {
    console.error('Email request totally failed:', error.message);
  }
};

module.exports = sendEmail;
