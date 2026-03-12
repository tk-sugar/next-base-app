import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

// Edge Runtime (middleware) でも動く軽量設定 — Prisma等のNode.jsモジュールをimportしない
export const authConfig: NextAuthConfig = {
  providers: [GitHub],
  pages: { signIn: "/" },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
};
