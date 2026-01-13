import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveStream } from "@/lib/streams/service";

// Simple in-memory rate limit for MVP (Map<IP, Timestamp>)
const rateLimit = new Map<string, number>();
const LIMIT_WINDOW_MS = 1000; // 1 request per second per user/IP

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Basic Rate Limiting
  const now = Date.now();
  const userKey = session.user?.email || "unknown";
  const lastRequest = rateLimit.get(userKey) || 0;
  
  if (now - lastRequest < LIMIT_WINDOW_MS) {
     return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  rateLimit.set(userKey, now);

  try {
    const body = await req.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const data = await resolveStream(token);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Stream resolution error:", error);
    // Be vague in production, but specific here for MVP debugging
    const message = error.message === "Stream not found" ? "Stream not found" : "Internal Server Error";
    const status = error.message === "Stream not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}