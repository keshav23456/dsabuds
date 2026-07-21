import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const userId = authResult.user.userId;

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { content, parentId } = body as { content?: string; parentId?: string };

    if (!content) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { postId: true },
      });
      if (!parentComment || parentComment.postId !== id) {
        return NextResponse.json({ error: "Invalid parent comment" }, { status: 400 });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: id,
        userId,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userName: true,
            avatarUrl: true,
            college: true,
            branch: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        comment: {
          id: comment.id,
          content: comment.content,
          parentId: comment.parentId,
          createdAt: comment.createdAt,
          author: comment.user,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
