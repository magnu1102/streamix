import type { NextAuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials" 
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs" 

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", 
  },
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    CredentialsProvider({
      name: "Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // Check user existence
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // SECURITY: Block unverified users
        if (!user.emailVerified) {
          throw new Error("Email not verified. Please register again to verify.");
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid credentials");

        return user;
      }
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
  },
  callbacks: {
    async signIn({ user, account }) {
      // 1. Password Login (handled in authorize above, but double check safe)
      if (account?.provider === "credentials") return true;

      // 2. Magic Link Login
      if (account?.provider === "email") {
        if (!user.email) return false;

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        // SECURITY: User must exist AND be verified
        if (!existingUser) {
          return "/login?error=AccountNotFound";
        }
        if (!existingUser.emailVerified) {
          // You might want a specific error for this, but AccountNotFound is safe enough
          // or create a new error param like ?error=Unverified
          return "/login?error=AccountNotFound"; 
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        // @ts-ignore
        session.user.id = token.id;
      }
      return session;
    }
  }
}