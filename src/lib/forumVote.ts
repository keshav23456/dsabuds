import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function votePostHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const userId = authResult.user.userId;

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { value } = body as { value?: unknown };

    const numericValue = parseInt(String(value), 10);
    if (isNaN(numericValue) || ![-1, 0, 1].includes(numericValue)) {
      return NextResponse.json({ error: "Invalid vote value" }, { status: 400 });
    }

    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (numericValue === 0) {
      await prisma.vote.deleteMany({
        where: { postId: id, userId },
      });
    } else {
      await prisma.vote.upsert({
        where: {
          userId_postId: { userId, postId: id },
        },
        update: { value: numericValue },
        create: { postId: id, userId, value: numericValue },
      });
    }

    const votes = await prisma.vote.findMany({
      where: { postId: id },
      select: { value: true },
    });

    const score = votes.reduce((sum, v) => sum + v.value, 0);

    return NextResponse.json(
      {
        score,
        userVote: numericValue,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error voting on post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
