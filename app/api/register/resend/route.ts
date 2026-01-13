// app/api/register/resend/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit, incrementRateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // 1. Check User Status
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ error: "User already verified" }, { status: 400 });
    }

    // 2. Check 24h Rate Limit
    const rateLimit = await checkRateLimit(email);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.error }, { status: 429 });
    }

    // 3. SAFEGUARD: Check 2-Minute Cooldown
    const activeToken = await prisma.verificationToken.findFirst({
      where: { identifier: email },
    });

    if (activeToken) {
      const cooldownEnds = new Date(activeToken.expires.getTime() - 13 * 60 * 1000);
      
      if (new Date() < cooldownEnds) {
        const waitSeconds = Math.ceil((cooldownEnds.getTime() - Date.now()) / 1000);
        return NextResponse.json(
          { error: `Please wait ${waitSeconds}s before resending.` },
          { status: 429 }
        );
      }
    }

    // 4. Generate New Token
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.$transaction(async (tx) => {
      await tx.verificationToken.deleteMany({ where: { identifier: email } });
      await tx.verificationToken.create({
        data: { identifier: email, token, expires },
      });
    });

    // 5. Increment & Send
    await incrementRateLimit(email);
    await sendVerificationEmail(email, token);

    return NextResponse.json({ message: "Code sent" }, { status: 200 });

  } catch (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}