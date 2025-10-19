
import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@/worker/trpc/router";
import { AuthProvider } from "../components/auth/provider.tsx";

export interface RouterAppContext {
  trpc: TRPCOptionsProxy<AppRouter>;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: () => (
    <>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
      <TanStackRouterDevtools />
    </>
  ),
});
