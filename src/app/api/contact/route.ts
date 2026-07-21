import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import { rateLimit } from "@/lib/rateLimit";

const INTERNAL_NOTIFY_EMAIL = "tanmaygupta.0215@gmail.com";

const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizeHeader = (str = "") => String(str).replace(/[\r\n]+/g, " ").trim();

const internalNotificationHtml = (name: string, email: string, message: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Inter', sans-serif; background: #0D1117; color: #e2e8f0; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #161B22; border: 1px solid #1F2937; border-radius: 12px; overflow: hidden; }
    .header { background: #35b9f1; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 18px; font-weight: 700; color: #000; }
    .body { padding: 32px; }
    .label { font-size: 10px; font-family: monospace; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
    .value { font-size: 15px; color: #f1f5f9; margin-bottom: 20px; }
    .message-box { background: #0D1117; border: 1px solid #1F2937; border-radius: 8px; padding: 16px; font-size: 14px; color: #d1d5db; line-height: 1.6; white-space: pre-wrap; }
    .footer { padding: 16px 32px; border-top: 1px solid #1F2937; font-size: 11px; color: #4b5563; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Contact Form Submission — DSABuddy</h1>
    </div>
    <div class="body">
      <div class="label">Name</div>
      <div class="value">${escapeHtml(name)}</div>
      <div class="label">Email</div>
      <div class="value"><a href="mailto:${escapeHtml(email)}" style="color:#35b9f1">${escapeHtml(email)}</a></div>
      <div class="label">Message</div>
      <div class="message-box">${escapeHtml(message)}</div>
    </div>
    <div class="footer">Received via dsabuddy.xyz/contact</div>
  </div>
</body>
</html>
`;

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { key: "contact", limit: 5, windowSeconds: 60 * 60 });
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const { name, email, message } = body as { name?: string; email?: string; message?: string };

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "name, email, and message are required." }, { status: 422 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 422 });
  }

  const submission = await prisma.contactSubmission.create({
    data: { name: name.trim(), email: email.trim().toLowerCase(), message: message.trim() },
  });

  sendEmail(
    INTERNAL_NOTIFY_EMAIL,
    sanitizeHeader(`New contact from ${name} <${email}>`),
    internalNotificationHtml(name, email, message)
  ).catch((err) => console.error("Failed to send contact notification email:", err));

  return NextResponse.json({ id: submission.id }, { status: 201 });
}
