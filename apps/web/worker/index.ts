import { getAuth } from "@repo/data/auth";
import { getDb, initDatabase } from "@repo/data/database";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "./trpc/context";
import { appRouter } from "./trpc/router";

export default {
  fetch(request, env, ctx) {
    initDatabase(env.DATABASE);

    const db = getDb();

    const url = new URL(request.url);

    if (url.pathname.startsWith("/trpc")) {
      return fetchRequestHandler({
        endpoint: "/trpc",
        req: request,
        router: appRouter,
        createContext: () =>
          createContext({ req: request, env: env, workerCtx: ctx, db }),
      });
    }

    if (url.pathname.startsWith("/api/auth/")) {
      const auth = getAuth(db);

      return auth.handler(request);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
