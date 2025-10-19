import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

console.log("Initializing Better Auth with SQLite database.. 😂😂😂😂😂");

export const auth = betterAuth({
  database: drizzleAdapter({}, { provider: "sqlite", usePlural: true }),
  emailAndPassword: {
    enabled: true,
  },
});
