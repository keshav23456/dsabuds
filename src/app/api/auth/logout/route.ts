import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  try {
    const res = NextResponse.json(
      { status: "success", message: "Logged out successfully" },
      { status: 200 }
    );
    clearAuthCookie(res);
    return res;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
