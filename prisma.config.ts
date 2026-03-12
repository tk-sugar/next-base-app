import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
  migrate: {
    async adapter(env: Record<string, string | undefined>) {
      return new PrismaPg({ connectionString: env.DATABASE_URL as string });
    },
  },
});
