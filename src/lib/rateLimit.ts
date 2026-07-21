import { NextRequest, NextResponse } from "next/server";
import redisClient from "@/lib/redis";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

// Fails open on Redis errors — app availability matters more than perfect limiting during an outage.
export async function rateLimit(
  req: NextRequest,
  { key, limit, windowSeconds }: RateLimitOptions
): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  const redisKey = `ratelimit:${key}:${ip}`;

  try {
    const count = await redisClient.incr(redisKey);
    if (count === 1) {
      await redisClient.expire(redisKey, windowSeconds);
    }
    if (count > limit) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  } catch (err) {
    console.error("Rate limit check failed:", (err as Error).message);
  }

  return null;
}
