import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// 1️⃣ Initialize environment variables
dotenv.config();

// 2️⃣ Create the Express application instance
const app = express();

// 3️⃣ Global Middleware
app.use(cors());
app.use(express.json());

// 4️⃣ The Main Mail-Sending Route
app.post("/send", async (req, res) => {
  try {
    console.log("🔥 SEND ROUTE HIT - Form data received from frontend");

    const { name, email, subject, message } = req.body;

    // Validate fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (name, email, or message)."
      });
    }

    // Set up Nodemailer to connect securely with Gmail
       // Force IPv4 connection to bypass Railway's network routing glitch
    const transporter = nodemailer.createTransport({
      host: "://gmail.com",
      port: 465,
      secure: true, // Use SSL/TLS
      connectionTimeout: 10000, // 10 seconds timeout
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
      tls: {
        // This forces Node to look up the IPv4 address instead of IPv6
        family: 4 
      }
    });


    // Structure the notification email
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, 
      subject: subject || `New message from ${name}`,
      replyTo: email, 
      text: `
📬 New Portfolio Form Submission!
===================================
Name: ${name}
Email: ${email}
Subject: ${subject || "No Subject Given"}

Message Content:
-----------------------------------
${message}
===================================
      `,
    };

    // Execute the mail transfer
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to inbox!");

    res.json({ success: true, message: "Email sent!" });

  } catch (error) {
    console.log("❌ EMAIL ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 5️⃣ Production Server Setup
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production Mail Server running smoothly on port ${PORT}`);
});
