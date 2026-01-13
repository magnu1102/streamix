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

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        if (!user.emailVerified) {
          throw new Error("Email not verified. Please register again to verify.");
        }

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
      if (account?.provider === "credentials") return true;

      if (account?.provider === "email") {
        if (!user.email) return false;
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existingUser) return "/login?error=AccountNotFound";
        if (!existingUser.emailVerified) return "/login?error=AccountNotFound"; 
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // 1. Initial Sign In: Add version to token
      if (user) {
        token.id = user.id;
        token.sessionVersion = user.sessionVersion;
      }

      // 2. Subsequent Requests: Verify Version from DB
      // We check this roughly every time the JWT is decrypted/accessed (e.g. page loads)
      if (!user && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { sessionVersion: true },
        });

        // If user is gone or version changed, invalidate token
        if (!dbUser || dbUser.sessionVersion !== token.sessionVersion) {
           // Returning null/modified token forces signout behavior in the session callback
           return { ...token, error: "RefreshAccessTokenError" }; 
        }
      }

      return token;
    },
    async session({ session, token }) {
      // If the JWT callback marked this as invalid, return null to log out user
      if (token.error) {
        return { ...session, user: null as any }; // Forces logout on client
      }

      if (session.user && token) {
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.sessionVersion = token.sessionVersion;
      }
      return session;
    }
  }
}