import { t } from "@/worker/trpc/trpc-instance";
import { getAuth } from "@repo/data/auth";
import { z } from "zod";

export const authRouter = t.router({
  signUp: t.procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const auth = getAuth(db);

      try {
        const result = await auth.api.signUpEmail({
          body: {
            email: input.email,
            password: input.password,
            name: input.name,
          },
          headers: new Headers({
            "Content-Type": "application/json",
          }),
        });

        if (!result) {
          throw new Error("Failed to create user");
        }

        return {
          success: true,
          user: result.user,
        };
      } catch (error) {
        console.error("Sign up error:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to sign up"
        );
      }
    }),

  signIn: t.procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const auth = getAuth(db);

      try {
        const result = await auth.api.signInEmail({
          body: {
            email: input.email,
            password: input.password,
          },
          headers: new Headers({
            "Content-Type": "application/json",
          }),
        });

        console.log("Sign in result:", result);

        if (!result) {
          throw new Error("Invalid credentials");
        }

        return {
          success: true,
          user: result.user,
          token: result.token,
        };
      } catch (error) {
        console.error("Sign in error:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to sign in"
        );
      }
    }),

  signOut: t.procedure.mutation(async ({ ctx }) => {
    const { db } = ctx;
    const auth = getAuth(db);
    const authHeader = ctx.req.headers.get("Authorization");

    if (!authHeader) {
      throw new Error("No authorization header");
    }

    try {
      await auth.api.signOut({
        headers: new Headers({
          Authorization: authHeader,
        }),
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("Sign out error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to sign out"
      );
    }
  }),

  getSession: t.procedure.query(async ({ ctx }) => {
    const { db } = ctx;
    const auth = getAuth(db);
    const authHeader = ctx.req.headers.get("Authorization");

    if (!authHeader) {
      return {
        user: null,
        session: null,
      };
    }

    try {
      const result = await auth.api.getSession({
        headers: new Headers({
          Authorization: authHeader,
        }),
      });

      return {
        user: result?.user || null,
        session: result?.session || null,
      };
    } catch (error) {
      console.error("Get session error:", error);
      return {
        user: null,
        session: null,
      };
    }
  }),
});
