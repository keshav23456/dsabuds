import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/mailer";
import { requireSyncSecret } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const authError = requireSyncSecret(req);
  if (authError) return authError;

  const body = await req.json().catch(() => ({}));
  const { to, name } = body as { to?: string; name?: string };

  if (!to) {
    return NextResponse.json({ error: 'Recipient email "to" is required' }, { status: 400 });
  }

  try {
    const info = await sendWelcomeEmail(to, name || "User");
    return NextResponse.json({ message: "Welcome email sent successfully", info }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error sending welcome email", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
