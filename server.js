import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   RESEND SETUP
========================= */
const resend = new Resend(process.env.RESEND_API_KEY);

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

    // validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const response = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: process.env.EMAIL_USER,
      subject: subject || `New message from ${name}`,
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
    });

    console.log("✅ EMAIL SENT:", response);

    return res.json({
      success: true,
      message: "Email sent successfully 🚀",
    });

  } catch (error) {
    console.log("❌ RESEND ERROR:", error);

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
