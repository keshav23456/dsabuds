import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authResult = requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const { user: authUser } = authResult;

    const body = await req.json().catch(() => ({}));
    const { currentPassword, newPassword } = body;

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Password update not available for this account" },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    const newSalt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, newSalt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        salt: newSalt,
      },
    });

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Update password error:", error);
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
