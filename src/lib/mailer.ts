import resend from "@/lib/resend";
import { getWelcomeEmailTemplate, getPotdEmailTemplate } from "@/lib/emailTemplates";

export const sendEmail = async (to: string, subject: string, content: string) => {
  try {
    const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
    const isHtml = typeof content === "string" && content.trim().startsWith("<");

    const { data, error } = await resend.emails.send(
      isHtml
        ? { from: fromEmail, to, subject, html: content }
        : { from: fromEmail, to, subject, text: content }
    );

    if (error) {
      console.error("Resend API Error details:", error);
      throw new Error(error.message || "Unknown Resend Error");
    }

    console.log("Email sent successfully via Resend. ID:", data?.id);
    return data;
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    throw error;
  }
};

export const sendWelcomeEmail = async (to: string, name: string) => {
  const subject = "Welcome to DSA Buddy! 🚀";
  const htmlContent = getWelcomeEmailTemplate(name);
  return sendEmail(to, subject, htmlContent);
};

export const sendDailyPotdEmail = async (to: string, name: string, problem: unknown) => {
  const p = problem as { displayName?: string; title?: string };
  const subject = `Daily DSA Challenge: ${p.displayName || p.title} 🎯`;
  const htmlContent = getPotdEmailTemplate(name, problem as Parameters<typeof getPotdEmailTemplate>[1]);
  return sendEmail(to, subject, htmlContent);
};
