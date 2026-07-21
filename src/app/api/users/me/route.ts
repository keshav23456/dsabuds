import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { enrichUserWithRanks } from "@/lib/userRanks";
import { deleteCacheByPattern } from "@/lib/cache";
import { updateMeBodySchema } from "@/lib/validation/api.validation";

export async function PATCH(req: NextRequest) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;
  const { user: authUser } = authResult;
  const userId = authUser.userId;

  const body = await req.json().catch(() => ({}));
  const parsed = await updateMeBodySchema.safeParseAsync(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { branch: true, branchChangesCount: true, year: true },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = { ...parsed.data };

  if (updateData.socialLinks !== undefined) {
    updateData.socialLinks = Object.fromEntries(
      Object.entries(updateData.socialLinks).filter(([, value]) => value)
    );
  }

  if (updateData.branch !== undefined && updateData.branch !== currentUser.branch) {
    if (currentUser.branch) {
      if (currentUser.branchChangesCount >= 1) {
        return NextResponse.json(
          { error: "Branch can only be changed once after onboarding." },
          { status: 400 }
        );
      }
      updateData.branchChangesCount = { increment: 1 };
    }
  }

  if (updateData.year !== undefined && updateData.year !== currentUser.year) {
    if (currentUser.year && currentUser.year !== "N/A") {
      return NextResponse.json(
        { error: "Graduation year cannot be changed once set." },
        { status: 400 }
      );
    }
    const parsedYear = parseInt(updateData.year, 10);
    if (isNaN(parsedYear) || parsedYear < 2020 || parsedYear > 2100) {
      return NextResponse.json(
        { error: "Please provide a valid graduation year between 2020 and 2100." },
        { status: 400 }
      );
    }
    updateData.year = String(parsedYear);
  }

  let updated;
  try {
    updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        userName: true,
        email: true,
        avatarUrl: true,
        college: true,
        branch: true,
        year: true,
        role: true,
        points: true,
        overallRank: true,
        branchChangesCount: true,
        socialLinks: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    if (err?.code === "P2002") {
      const target = err.meta?.target;
      const field = Array.isArray(target) ? target[0] : target;
      return NextResponse.json(
        { error: `That ${field ?? "value"} is already taken.` },
        { status: 409 }
      );
    }
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }

  await deleteCacheByPattern(`user:ranks:${userId}:*`);
  const enriched = await enrichUserWithRanks(updated);
  await deleteCacheByPattern("leaderboard:*");
  return NextResponse.json({ user: enriched }, { status: 200 });
}
