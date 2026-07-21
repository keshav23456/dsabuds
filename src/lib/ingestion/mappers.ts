export function normalizeTag(s: unknown): string {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function mapDifficultyFromCodeforcesRating(rating: unknown): "EASY" | "MEDIUM" | "HARD" {
  if (typeof rating !== "number") return "MEDIUM";
  if (rating <= 1200) return "EASY";
  if (rating <= 1800) return "MEDIUM";
  return "HARD";
}

export function mapDifficultyFromLeetCode(difficulty: unknown): "EASY" | "MEDIUM" | "HARD" {
  const d = String(difficulty ?? "").toUpperCase();
  if (d === "EASY") return "EASY";
  if (d === "MEDIUM") return "MEDIUM";
  if (d === "HARD") return "HARD";
  return "MEDIUM";
}

export function mapDifficultyFromCodechefRating(rating: unknown): "EASY" | "MEDIUM" | "HARD" {
  if (typeof rating !== "number" || rating <= 0) return "MEDIUM";
  if (rating <= 1400) return "EASY";
  if (rating <= 1800) return "MEDIUM";
  return "HARD";
}
