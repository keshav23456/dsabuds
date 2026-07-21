import { NextRequest, NextResponse } from "next/server";
import { getBranchesForEmail } from "@/lib/colleges";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const branches = await getBranchesForEmail(email);
  return NextResponse.json({ branches }, { status: 200 });
}
