import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { enrichUserWithRanks } from "@/lib/userRanks";

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user: authUser } = authResult;

  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: {
      id: true,
      name: true,
      userName: true,
      email: true,
      avatarUrl: true,
      college: true,
      branch: true,
      year: true,
      points: true,
      overallRank: true,
      branchChangesCount: true,
      socialLinks: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const enriched = await enrichUserWithRanks(user);
  return NextResponse.json({ user: enriched }, { status: 200 });
}
