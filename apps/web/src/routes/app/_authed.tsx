import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/_authed")({
  component: RouteComponent,
});
function RouteComponent() {
  return (
    <div className="h-screen overflow-hidden flex">
      <Outlet />
    </div>
  );
}
