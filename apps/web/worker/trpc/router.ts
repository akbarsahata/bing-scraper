import { t } from "@/worker/trpc/trpc-instance";

export const appRouter = t.router({
  // Merge in all the sub-routers
});

export type AppRouter = typeof appRouter;
