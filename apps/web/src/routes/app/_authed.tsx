import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { trpc } from "@/utils/trpc-types";

export const Route = createFileRoute("/app/_authed")({
  beforeLoad: async () => {
    // Check if user has auth token
    console.log("Checking auth token in _authed route");
    const token = localStorage.getItem("auth_token");
    console.log("auth token: ", token);
    
    if (!token) {
      throw redirect({
        to: "/sign-in",
        search: {
          redirect: location.pathname,
        },
      });
    }

    // Verify token is valid by checking session
    try {
      const session = await trpc.auth.getSession.query();
      
      if (!session.user) {
        // Token is invalid, clear it and redirect
        localStorage.removeItem("auth_token");
        throw redirect({
          to: "/sign-in",
          search: {
            redirect: location.pathname,
          },
        });
      }
    } catch (error) {
      // Error checking session, redirect to sign-in
      localStorage.removeItem("auth_token");
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
