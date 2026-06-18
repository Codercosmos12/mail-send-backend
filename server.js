import express from "react";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// 1️⃣ Initialize environment variables first
dotenv.config();

// 2️⃣ Create the Express application instance
const app = express();

// 3️⃣ Global Middleware
// CORS allows your React frontend website to communicate with this Railway backend
app.use(cors());
// This allows your backend to automatically read JSON data sent from the frontend form
app.use(express.json());

// 4️⃣ The Main Mail-Sending Route
// This listens for a POST request at your-railway-url.up.railway.app/send
app.post("/send", async (req, res) => {
  try {
    console.log("🔥 SEND ROUTE HIT - Form data received from frontend");

    // Extracting user inputs sent by your React form
    const { name, email, subject, message } = req.body;

    // Validate that required fields are present
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (name, email, or message)."
      });
    }

    // Set up Nodemailer to connect securely with Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Kept completely secret via Railway Variables
        pass: process.env.EMAIL_PASS, // Your 16-character Google App Password
      },
    });

    // Structure the notification email template that will hit your inbox
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // The email will be sent to your personal inbox
      subject: subject || `New message from ${name}`,
      replyTo: email, // Clicking "Reply" in your inbox sends a message back to the client
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

    // Send a green-light response back to the React UI
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
// Dynamically reads the PORT environment variable assigned automatically by Railway
const PORT = process.env.PORT || 5000;

// Listen on the dynamic port and bind to '0.0.0.0' to prevent 502 Bad Gateway errors
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production Mail Server running smoothly on port ${PORT}`);
});
