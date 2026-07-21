import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(req);

    const post = await prisma.forumPost.findUnique({
      where: { id },
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
        comments: {
          orderBy: { createdAt: "asc" },
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
        },
        votes: {
          select: { userId: true, value: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const userVoteObj = user ? post.votes.find((v) => v.userId === user.userId) : null;
    const userVote = userVoteObj ? userVoteObj.value : 0;
    const score = post.votes.reduce((sum, v) => sum + v.value, 0);

    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      tags: post.tags,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.user,
      comments: post.comments.map((c) => ({
        id: c.id,
        content: c.content,
        parentId: c.parentId,
        createdAt: c.createdAt,
        author: c.user,
      })),
      score,
      userVote,
      upvoteCount: score,
      isUpvoted: userVote === 1,
    };
    return NextResponse.json({ post: formattedPost }, { status: 200 });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const userId = authResult.user.userId;

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { title, content, tags } = body as { title?: string; content?: string; tags?: unknown };

    const existingPost = await prisma.forumPost.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (existingPost.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You are not the author of this post" },
        { status: 403 }
      );
    }

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const post = await prisma.forumPost.update({
      where: { id },
      data: {
        title,
        content,
        tags: Array.isArray(tags) ? tags : [],
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
        comments: { select: { id: true } },
        votes: { select: { userId: true, value: true } },
      },
    });

    const userVoteObj = post.votes.find((v) => v.userId === userId);
    const userVote = userVoteObj ? userVoteObj.value : 0;
    const score = post.votes.reduce((sum, v) => sum + v.value, 0);

    return NextResponse.json(
      {
        post: {
          id: post.id,
          title: post.title,
          content: post.content,
          tags: post.tags,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          author: post.user,
          commentCount: post.comments.length,
          score,
          userVote,
          upvoteCount: score,
          isUpvoted: userVote === 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const userId = authResult.user.userId;

    const { id } = await params;
    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You are not the author of this post" },
        { status: 403 }
      );
    }
    await prisma.forumPost.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Post deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
