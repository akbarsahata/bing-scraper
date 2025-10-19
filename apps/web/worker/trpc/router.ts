import { t } from "@/worker/trpc/trpc-instance";
import { filesRouter } from "./routers/files";
import { queriesRouter } from "./routers/queries";

export const appRouter = t.router({
  files: filesRouter,
  queries: queriesRouter,
});

export type AppRouter = typeof appRouter;
