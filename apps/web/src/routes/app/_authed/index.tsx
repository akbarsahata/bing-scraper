import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/_authed/")({
  component: RouteComponent,
  loader: async ({ }) => {
    await Promise.all([
      // context.queryClient.prefetchQuery(
      //   context.trpc.links.activeLinks.queryOptions(),
      // ),
      // context.queryClient.prefetchQuery(
      //   context.trpc.links.totalLinkClickLastHour.queryOptions(),
      // ),
      // context.queryClient.prefetchQuery(
      //   context.trpc.links.last24HourClicks.queryOptions(),
      // ),
      // context.queryClient.prefetchQuery(
      //   context.trpc.links.last30DaysClicks.queryOptions(),
      // ),
      // context.queryClient.prefetchQuery(
      //   context.trpc.evaluations.problematicDestinations.queryOptions(),
      // ),
      // context.queryClient.prefetchQuery(
      //   context.trpc.links.clicksByCountry.queryOptions(),
      // ),
    ]);
  },
});

function RouteComponent() {
  const { isConnected } = { isConnected: true }; // Replace with actual connection status

  return (
    <div className="flex w-full min-w-0">
      <main className="flex-1 min-w-0">
        <div className="container mx-auto p-6 space-y-6 max-w-full">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-muted-foreground">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
          {/* Other dashboard components can be added here */}
        </div>
      </main>
    </div>
  );
}
