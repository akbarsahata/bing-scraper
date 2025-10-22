import { getAuth } from "@repo/data/auth";
import { getDb, initDatabase } from "@repo/data/database";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "./trpc/context";
import { appRouter } from "./trpc/router";

export default {
  async fetch(request, env, ctx) {
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

    if (url.pathname === "/api/download") {
      const auth = getAuth(db);
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        return new Response("Unauthorized", { status: 401 });
      }

      const key = url.searchParams.get("key");
      const type = url.searchParams.get("type");

      if (!key) {
        return new Response("Missing key parameter", { status: 400 });
      }

      const object = await env.STORAGE.get(key);

      if (!object) {
        return new Response("File not found", { status: 404 });
      }

      const contentType =
        type === "screenshot" ? "image/png" : "text/html; charset=utf-8";
      const filename =
        type === "screenshot"
          ? key.split("/").pop() || "screenshot.png"
          : key.split("/").pop() || "page.html";

      return new Response(object.body, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
