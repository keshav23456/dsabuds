import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search");
    const tag = req.nextUrl.searchParams.get("tag");
    const user = getUserFromRequest(req);

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    const posts = await prisma.forumPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
          select: { id: true },
        },
        votes: {
          select: { userId: true, value: true },
        },
      },
    });

    const formattedPosts = posts.map((post) => {
      const userVoteObj = user ? post.votes.find((v) => v.userId === user.userId) : null;
      const userVote = userVoteObj ? userVoteObj.value : 0;
      const score = post.votes.reduce((sum, v) => sum + v.value, 0);

      return {
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
      };
    });

    return NextResponse.json({ posts: formattedPosts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = requireAuth(req);
    if ("error" in authResult) return authResult.error;
    const userId = authResult.user.userId;

    const body = await req.json().catch(() => ({}));
    const { title, content, tags } = body as { title?: string; content?: string; tags?: unknown };

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        tags: Array.isArray(tags) ? tags : [],
        userId,
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
        post: {
          id: post.id,
          title: post.title,
          content: post.content,
          tags: post.tags,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          author: post.user,
          commentCount: 0,
          score: 0,
          userVote: 0,
          upvoteCount: 0,
          isUpvoted: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
