import { NextResponse } from "next/server";
import { getBranchCodeMap } from "@/lib/colleges";

export async function GET() {
  const branchCodeMap = await getBranchCodeMap();
  return NextResponse.json({ branchCodeMap }, { status: 200 });
}
