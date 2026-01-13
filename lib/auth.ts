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

        // Check if user exists and has a password
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

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
      // 1. Allow Password login to flow (it checks password itself)
      if (account?.provider === "credentials") {
        return true;
      }

      // 2. Restrict Magic Link (Email Provider)
      if (account?.provider === "email") {
        if (!user.email) return false;

        // Check if user actually exists in the DB
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        // If not found, reject login and redirect to error message
        if (!existingUser) {
          return "/login?error=AccountNotFound";
        }
      }
      
      return true;
    },
    // We need to persist the user ID in the JWT and Session manually when using JWT strategy
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
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