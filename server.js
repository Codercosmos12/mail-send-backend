import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// 1️⃣ dotenv FIRST
dotenv.config();

// 2️⃣ create app FIRST
const app = express();

// 3️⃣ middleware
app.use(cors());
app.use(express.json());

// 4️⃣ route
app.post("/send", async (req, res) => {
  try {
    console.log("🔥 SEND ROUTE HIT");

    const { name, email, subject, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

   const mailOptions = {
  from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_USER,
  subject: subject || `New message from ${name}`,
  replyTo: email, // 👈 THIS is important
  text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
  `,
};
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Email sent!" });
  } catch (error) {
    console.log("EMAIL ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 5️⃣ listen LAST
const PORT = process.env.PORT || 5000;
app.listen(5000, () => {
  console.log(`Server running on port ${PORT}`);
});