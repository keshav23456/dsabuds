import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  return NextResponse.redirect(`${baseUrl}/login?error=email_not_allowed`);
}
