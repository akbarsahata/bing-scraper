import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "../../components/auth/auth-client";

export const Route = createFileRoute("/app/_authed")({
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession();
    
    if (!session?.data?.user) {
      throw redirect({
        to: "/sign-in",
        search: {
          redirect: location.pathname,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex">
      <Outlet />
    </div>
  );
}
