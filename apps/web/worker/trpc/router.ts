import { t } from "@/worker/trpc/trpc-instance";
import { filesRouter } from "./routers/files";
import { queriesRouter } from "./routers/queries";
import { sessionsRouter } from "./routers/sessions";

export const appRouter = t.router({
  files: filesRouter,
  queries: queriesRouter,
  sessions: sessionsRouter,
});

export type AppRouter = typeof appRouter;
