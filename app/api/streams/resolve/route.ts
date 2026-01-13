import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveStream } from "@/lib/streams";

// Rate limiting disabled for MVP dev mode to prevent React Strict Mode issues
// const rateLimit = new Map<string, number>();
// const LIMIT_WINDOW_MS = 1000; 

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* // Rate Limiting Logic - Commented out for now
    const now = Date.now();
    const userKey = session.user?.email || "unknown";
    const lastRequest = rateLimit.get(userKey) || 0;
    
    if (now - lastRequest < LIMIT_WINDOW_MS) {
       return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    rateLimit.set(userKey, now);
    */

    const body = await req.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const data = await resolveStream(token);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Stream resolution error:", error);
    // Return specific error if stream missing, generic otherwise
    const message = error.message === "Stream not found" || error.message === "Stream is currently inactive"
      ? error.message 
      : "Internal Server Error";
    
    // 404 for not found, 500 for others
    const status = error.message === "Stream not found" ? 404 : 500;
    
    return NextResponse.json({ error: message }, { status });
  }
}