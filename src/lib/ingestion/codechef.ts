import { fetchJson } from "./http";

function parseStars(starsStr: unknown): number | null {
  if (!starsStr) return null;
  const str = String(starsStr).trim();
  const starEntities = (str.match(/&#9733;/g) || []).length;
  const starChars = (str.match(/â/g) || []).length;
  const count = Math.max(starEntities, starChars);
  if (count > 0) return count;

  const digitMatch = str.match(/(\d+)\s*(?:â|star)/i);
  if (digitMatch) {
    return parseInt(digitMatch[1], 10);
  }
  return null;
}

export async function fetchCodechefUserStats({ username }: { username: string }): Promise<any> {
  if (!username) throw new Error("CodeChef username is required");
  const cleanUsername = String(username).trim();

  try {
    const apiUrl = `https://codeindex.vercel.app/api/codechef?username=${cleanUsername}`;
    const data = await fetchJson(apiUrl, { timeoutMs: 5000 });
    if (data && data.success) {
      return {
        username: data.username || cleanUsername,
        problemsSolved:
          typeof data.totalSolved === "number" ? data.totalSolved : parseInt(data.totalSolved, 10) || 0,
        rating: typeof data.rating === "number" ? data.rating : parseInt(data.rating, 10) || null,
        stars: parseStars(data.stars),
        rankLabel: data.stars ? `${parseStars(data.stars)} Star` : null,
      };
    }
  } catch (err: any) {
    console.warn(`CodeIndex API failed for CodeChef user ${cleanUsername}:`, err.message);
  }

  try {
    const profileUrl = `https://www.codechef.com/users/${cleanUsername}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(profileUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`CodeChef profile returned HTTP ${res.status}`);
    }

    const html = await res.text();

    const ratingMatch = html.match(/<div class="rating-number">(\d+)<\/div>/);
    const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : null;

    const starsMatch = html.match(/class="rating-star"[^>]*?>([\s\S]*?)<\/span>/i);
    let starsCount: number | null = null;
    if (starsMatch) {
      const starText = starsMatch[1];
      const starEntities = (starText.match(/&#9733;/g) || []).length;
      const starChars = (starText.match(/★/g) || []).length;
      starsCount = Math.max(starEntities, starChars);
      if (starsCount === 0 && starText.trim().length > 0) {
        const textMatch = starText.match(/(\d+)\s*★/);
        if (textMatch) starsCount = parseInt(textMatch[1], 10);
      }
    }

    const solvedMatch =
      html.match(/<h3>Total Problems Solved:\s*(\d+)<\/h3>/i) ||
      html.match(/Total Problems Solved:\s*(\d+)/i);
    const solved = solvedMatch ? parseInt(solvedMatch[1], 10) : null;

    if (rating === null && solved === null) {
      throw new Error(`Scraper failed to extract CodeChef metrics for user '${cleanUsername}'`);
    }

    return {
      username: cleanUsername,
      problemsSolved: solved || 0,
      rating,
      stars: starsCount,
      rankLabel: starsCount ? `${starsCount} Star` : null,
    };
  } catch (error) {
    console.error("Error fetching CodeChef stats:", error);
    throw error;
  }
}
