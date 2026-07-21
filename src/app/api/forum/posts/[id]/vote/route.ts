import { NextRequest } from "next/server";
import { votePostHandler } from "@/lib/forumVote";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return votePostHandler(req, ctx);
}
