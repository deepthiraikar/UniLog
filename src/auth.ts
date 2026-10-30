import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            studentProfile: true,
            facultyProfile: true,
          },
        });
        if (!user || !user.isActive) return null;

        const isMatch = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!isMatch) return null;

        return {
          id: user.id as string,
          email: user.email,
          name: user.name,
          role: user.role as "ADMIN" | "FACULTY" | "STUDENT",
          studentProfileId: user.studentProfile?.id,
          facultyProfileId: user.facultyProfile?.id,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.studentProfileId = (user as any).studentProfileId;
        token.facultyProfileId = (user as any).facultyProfileId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).studentProfileId = token.studentProfileId as string | undefined;
        (session.user as any).facultyProfileId = token.facultyProfileId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET || "unilog-college-attendance-management-super-secret-key-32chars",
});
