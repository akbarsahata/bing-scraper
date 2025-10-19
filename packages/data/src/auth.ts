import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { Db } from "@/db/database";

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  database: drizzleAdapter({}, { provider: "sqlite", usePlural: true }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want to require email verification
  },
});

export const getAuth: (db: Db) => ReturnType<typeof betterAuth> = (db: Db) =>
  betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite", usePlural: true }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Set to true if you want to require email verification
    },
  });
