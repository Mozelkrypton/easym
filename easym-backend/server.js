import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or use "smtp.ethereal.email" for testing
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS
  }
});

// ✅ Health check route
app.get("/", (req, res) => {
  res.send(" Easym backend is running...");
});

// ✅ Route: Send email
app.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    const info = await transporter.sendMail({
      from: `"Easym" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });

    res.json({ status: "sent", messageId: info.messageId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: error.message });
  }
});

// ✅ Route: Spam / Phishing Detection (rule-based)
app.post("/check-email", (req, res) => {
  const { subject, body } = req.body;

  if (!subject || !body) {
    return res.status(400).json({ error: "Email subject and body are required" });
  }

  const spamKeywords = [
    "win money",
    "urgent password reset",
    "free gift",
    "click here",
    "lottery",
    "claim prize",
    "bank account",
    "verify your password"
  ];

  const emailContent = (subject + " " + body).toLowerCase();
  const foundKeywords = spamKeywords.filter(keyword =>
    emailContent.includes(keyword)
  );

  const isSpam = foundKeywords.length > 0;

  res.json({
    isSpam,
    foundKeywords,
    message: isSpam
      ? "⚠️ This email looks suspicious!"
      : "✅ This email seems safe."
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
