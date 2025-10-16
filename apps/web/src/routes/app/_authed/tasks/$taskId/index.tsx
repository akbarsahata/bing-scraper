import { trpcReact } from '@/utils/trpc-types';
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SearchQuerySchema } from "@repo/data/zod-schema/search-queries"
import { format } from "date-fns";

export const Route = createFileRoute("/app/_authed/tasks/$taskId/")({
  component: TaskDetailPage,
});

function TaskDetailPage() {
  const { taskId } = Route.useParams();
  const navigate = useNavigate();

  const {
    data: task,
    isLoading: isLoadingTask,
  } = trpcReact.files.getById.useQuery({ fileId: taskId });

  const getStatusColor = (status: SearchQuerySchema["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "scraping":
        return "text-blue-600";
      case "pending":
        return "text-gray-400";
      case "failed":
        return "text-red-600";
      case "queued":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate({ to: "/sign-in" });
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border-2 border-black p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">BING SCRAPER</h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-600 text-sm hover:underline"
            >
              logout
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">
                {isLoadingTask ? "Loading..." : task?.fileName}
              </h2>
              <div>
                <span className="text-orange-600 font-bold text-lg">
                  {isLoadingTask
                    ? "..."
                    : task?.totalQueries
                    ? Math.round(
                        ((task.processedQueries || 0) / task.totalQueries) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {isLoadingTask || !task?.uploadedAt
                ? "Loading..."
                : `Started from ${format(new Date(task.uploadedAt), "eeee, dd MMM yyyy")}`}
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">queries</h3>
            <div className="space-y-2">
              {isLoadingTask ? (
                <div className="text-center text-gray-500 py-4">
                  Loading queries...
                </div>
              ) : !task?.searchQueries || task.searchQueries.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No queries found
                </div>
              ) : (
                task.searchQueries.map((query) => (
                  <div
                    key={query.id}
                    className={`border border-gray-300 p-3 flex justify-between items-center ${
                      query.status === "completed"
                        ? "cursor-pointer hover:bg-gray-50"
                        : ""
                    }`}
                    onClick={() => {
                      if (query.status === "completed") {
                        navigate({
                          to: `/app/tasks/${taskId}/keyword/${query.id}`,
                        });
                      }
                    }}
                  >
                    <p className="font-medium">{query.queryText}</p>
                    <span className={`text-sm ${getStatusColor(query.status)}`}>
                      {query.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
