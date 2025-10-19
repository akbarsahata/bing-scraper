import { t } from "@/worker/trpc/trpc-instance";
import { authRouter } from "./routers/auth";
import { filesRouter } from "./routers/files";
import { queriesRouter } from './routers/queries';

export const appRouter = t.router({
  auth: authRouter,
  files: filesRouter,
  queries: queriesRouter,
});

export type AppRouter = typeof appRouter;
