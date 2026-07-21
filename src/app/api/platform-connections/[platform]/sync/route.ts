import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { recalculateUserPoints } from "@/lib/points";
import { syncPlatformConnection } from "@/lib/platformSync";
import { platformParamSchema } from "@/lib/validation/api.validation";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const authResult = requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const userId = authResult.user.userId;

    const rawParams = await params;
    const parsedParams = await platformParamSchema.safeParseAsync(rawParams);
    if (!parsedParams.success) {
      return NextResponse.json({ error: parsedParams.error.format() }, { status: 422 });
    }
    const { platform } = parsedParams.data;

    const existing = await prisma.platformConnection.findUnique({
      where: { userId_platform: { userId, platform } },
      select: { username: true },
    });

    if (!existing || !existing.username) {
      return NextResponse.json(
        {
          error: `No username found for ${platform}. Please set it first via PUT /api/platform-connections/${platform}`,
        },
        { status: 400 }
      );
    }

    const updated = await syncPlatformConnection(userId, platform, existing.username);

    await recalculateUserPoints(userId);

    return NextResponse.json(
      {
        message: "Platform stats synced successfully",
        platformConnection: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("syncMyPlatformStats error:", error);
    return NextResponse.json(
      { error: error.message ?? "Failed to sync platform stats" },
      { status: 500 }
    );
  }
}
