import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "אימייל", type: "email" },
        password: { label: "סיסמה", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });
        if (!user || user.banned) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          username: user.username,
          role: user.role,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id!;
        token.username = (user as { username?: string }).username;
        token.role = (user as { role?: string }).role;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      // Node.js only — runs when client calls session update(), not in middleware
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            username: true,
            displayName: true,
            role: true,
            avatarUrl: true,
            email: true,
          },
        });
        if (dbUser) {
          token.username = dbUser.username;
          token.name = dbUser.displayName;
          token.role = dbUser.role;
          token.picture = dbUser.avatarUrl;
          token.email = dbUser.email;
        }
      }

      return token;
    },
  },
});
