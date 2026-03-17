import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo read:org",
        },
      },
      checks: ["state"],
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const githubId = String(profile.id);
        const user = await prisma.user.upsert({
          where: { githubId },
          create: {
            githubId,
            name: (profile.name as string) ?? (profile.login as string) ?? "",
            email: (profile.email as string) ?? "",
            githubAccessToken: account.access_token,
          },
          update: {
            githubAccessToken: account.access_token,
            name: (profile.name as string) ?? (profile.login as string) ?? "",
          },
        });
        token.accessToken = account.access_token;
        token.githubId = githubId;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.id = token.userId as string;
      return session;
    },
  },
});
