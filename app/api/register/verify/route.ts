import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Find Token
    const record = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code,
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // 2. Check Expiry
    if (new Date() > record.expires) {
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    // 3. Verify User (Transaction)
    await prisma.$transaction(async (tx) => {
      // Mark user verified
      await tx.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      });

      // Delete used token
      await tx.verificationToken.delete({
        where: { identifier_token: { identifier: email, token: code } },
      });
    });

    return NextResponse.json({ message: "Account verified" }, { status: 200 });

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}