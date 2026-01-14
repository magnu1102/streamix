
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function revokeAllSessions() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  // Increment sessionVersion to invalidate all existing cookies
  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      sessionVersion: { increment: 1 },
    },
  });

  return { success: true };
}