import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   SMTP TRANSPORT (FIXED)
========================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 1,
  rateLimit: 1,
});

/* Optional: check SMTP at startup */
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ SMTP READY");
  }
});

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* =========================
   SEND EMAIL ROUTE
========================= */
app.post("/send", async (req, res) => {
  try {
    console.log("🔥 SEND ROUTE HIT - Data received");

    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: subject || `New message from ${name}`,
      replyTo: email,
      text: `
📬 New Portfolio Form Submission
-----------------------------------
Name: ${name}
Email: ${email}
Subject: ${subject || "No Subject"}
Message:
${message}
-----------------------------------
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ EMAIL SENT:", info.response);

    return res.json({
      success: true,
      message: "Email sent successfully 🚀",
    });

  } catch (error) {
    console.log("❌ EMAIL ERROR FULL:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
