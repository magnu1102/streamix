// lib/ratelimit.ts
import { prisma } from "@/lib/prisma";

const DAILY_LIMIT = 5;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function checkRateLimit(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { 
      id: true, 
      verificationRequestCount: true, 
      verificationRequestStart: true 
    }
  });

  if (!user) return { allowed: true }; // New users are allowed to start

  const now = new Date();
  const windowStart = new Date(user.verificationRequestStart);
  
  // If window has passed, we will reset (logic handled in increment)
  if (now.getTime() - windowStart.getTime() > WINDOW_MS) {
    return { allowed: true };
  }

  // Check limit
  if (user.verificationRequestCount >= DAILY_LIMIT) {
    return { 
      allowed: false, 
      error: "Daily limit exceeded. Please try again tomorrow." 
    };
  }

  return { allowed: true };
}

export async function incrementRateLimit(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (user) {
    const now = new Date();
    const windowStart = new Date(user.verificationRequestStart);
    const isNewWindow = now.getTime() - windowStart.getTime() > WINDOW_MS;

    await prisma.user.update({
      where: { email },
      data: {
        verificationRequestCount: isNewWindow ? 1 : { increment: 1 },
        verificationRequestStart: isNewWindow ? now : undefined 
      }
    });
  }
}