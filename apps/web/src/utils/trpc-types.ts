import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/worker/trpc/router";

// Vanilla client for server-side calls
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/trpc",
    }),
  ],
});

// React Query client for hooks
export const trpcReact = createTRPCReact<AppRouter>();

export type { AppRouter };
