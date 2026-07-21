import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const userId = authResult.user.userId;

    const { id } = await params;
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    if (comment.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You are not the author of this comment" },
        { status: 403 }
      );
    }
    await prisma.comment.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Comment deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
