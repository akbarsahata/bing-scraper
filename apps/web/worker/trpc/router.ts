import { t } from "@/worker/trpc/trpc-instance";
import { filesRouter } from "./routers/files";
// import { tasksRouter } from "./routers/tasks";
// import { queriesRouter } from "./routers/queries";
// import { scrapeRouter } from "./routers/scrape";

export const appRouter = t.router({
  files: filesRouter,
  // tasks: tasksRouter,
  // queries: queriesRouter,
  // scrape: scrapeRouter,
});

export type AppRouter = typeof appRouter;
