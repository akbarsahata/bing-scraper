import { getDb } from "@/db/database";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  database: drizzleAdapter(getDb(), { provider: "sqlite", usePlural: true }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want to require email verification
  },
});

export const getAuth: () => ReturnType<typeof betterAuth> = () =>
  betterAuth({
    database: drizzleAdapter(getDb(), { provider: "sqlite", usePlural: true }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Set to true if you want to require email verification
    },
  });
