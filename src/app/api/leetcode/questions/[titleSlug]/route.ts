import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { leetcodeGraphqlRequest, buildLeetCodeCookiesFromEnv } from "@/lib/ingestion/leetcode";

const QUESTION_DATA_QUERY = `
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    questionFrontendId
    title
    titleSlug
    content
    isPaidOnly
    difficulty
    likes
    dislikes
    topicTags { name slug }
    stats
    hints
    similarQuestions
  }
}`;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ titleSlug: string }> }
) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { titleSlug } = await params;

    if (!titleSlug || typeof titleSlug !== "string" || !/^[a-z0-9-]+$/i.test(titleSlug)) {
      return NextResponse.json({ error: "Invalid titleSlug parameter" }, { status: 400 });
    }

    const cookies = buildLeetCodeCookiesFromEnv();

    const data = await leetcodeGraphqlRequest({
      query: QUESTION_DATA_QUERY,
      variables: { titleSlug },
      cookies,
    });

    if (!data?.question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    let stats = data.question.stats;
    try {
      if (stats) stats = JSON.parse(stats);
    } catch {
      /* leave as-is */
    }

    let similarQuestions = data.question.similarQuestions;
    try {
      if (similarQuestions) similarQuestions = JSON.parse(similarQuestions);
    } catch {
      /* leave as-is */
    }

    return NextResponse.json(
      {
        ...data.question,
        stats,
        similarQuestions,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in getLeetcodeQuestion:", error.message);
    return NextResponse.json({ error: "Failed to fetch question data." }, { status: 500 });
  }
}
