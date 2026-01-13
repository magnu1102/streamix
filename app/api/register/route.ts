import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // 2. Validate Password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 chars, with 1 uppercase, 1 lowercase, 1 number, and 1 symbol." },
        { status: 400 }
      );
    }

    // 3. Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // SECURITY: If user exists AND is verified, block them.
      if (existingUser.emailVerified) {
        return NextResponse.json({ error: "User already exists" }, { status: 409 });
      }
      // If unverified, we allow "re-registering" (Squatting protection)
    }

    // 4. Generate OTP (6 digits) and Hash Password
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // 5. Database Operations (Transaction)
    await prisma.$transaction(async (tx) => {
      // Create or Update User (Unverified)
      if (existingUser) {
        await tx.user.update({
          where: { email },
          data: { password: hashedPassword }, // Update password to new one
        });
      } else {
        await tx.user.create({
          data: { email, password: hashedPassword },
        });
      }

      // Cleanup old tokens
      await tx.verificationToken.deleteMany({
        where: { identifier: email },
      });

      // Save new Token
      await tx.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });
    });

    // 6. Send Email
    await sendVerificationEmail(email, token);

    return NextResponse.json({ message: "Verification code sent" }, { status: 200 });

  } catch (error) {
    console.error("Registration init error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}