import { defineConfig } from "@prisma/config";
import "dotenv/config";

export default defineConfig({
  // @ts-expect-error Prisma config type is not fully exported yet
  earlyAccess: true,
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
