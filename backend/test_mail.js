require('dotenv').config();

const testMail = async () => {
  console.log("Testing Brevo email...");
  console.log("API Key found:", process.env.BREVO_API_KEY ? "YES ✅" : "NO ❌");
  console.log("Sender email:", process.env.BREVO_SENDER_EMAIL);

  try {
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
        to: [{ email: process.env.BREVO_SENDER_EMAIL || 'vijay.m582005@gmail.com' }],
        subject: "Brevo Test Email",
        htmlContent: "<p>If you receive this, Brevo is working perfectly! ✅</p>"
      })
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("✅ Success! Check your inbox.");
    } else {
      console.log("❌ Failed. See response above for details.");
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
};

testMail();
