import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  leetcodeGraphqlRequest,
  buildLeetCodeCookiesFromEnv,
  USER_PROFILE_QUERY,
} from "@/lib/ingestion/leetcode";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { username } = await params;

    if (!username || typeof username !== "string" || !/^[A-Za-z0-9_-]{1,39}$/.test(username)) {
      return NextResponse.json({ error: "Invalid username parameter" }, { status: 400 });
    }

    const cookies = buildLeetCodeCookiesFromEnv();

    const data = await leetcodeGraphqlRequest({
      query: USER_PROFILE_QUERY,
      variables: { username },
      cookies,
    });

    if (!data?.matchedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(data.matchedUser, { status: 200 });
  } catch (error: any) {
    console.error("Error in getLeetcodeUser:", error.message);
    return NextResponse.json({ error: "Failed to fetch user data." }, { status: 500 });
  }
}
