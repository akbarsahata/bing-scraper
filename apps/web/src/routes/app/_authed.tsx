import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/_authed")({
  beforeLoad: async () => {
    // Check if user has auth token
    const token = localStorage.getItem("auth_token");
    
    if (!token) {
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
