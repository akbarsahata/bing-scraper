import { PageHeader, LoadingState, EmptyState } from "@/components/layout";
import { trpcReact } from "@/utils/trpc-types";
import { UploadedFileSchema } from "@repo/data/zod-schema/uploaded-files";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/_authed/tasks/")({
  component: TasksPage,
});

function TasksPage() {
  const navigate = useNavigate();

  const { data: tasks = [], isLoading } = trpcReact.files.getAll.useQuery();

  const getStatusColor = (status: UploadedFileSchema["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "processing":
        return "text-orange-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border-2 border-black p-8">
          <PageHeader />

          <div className="space-y-2">
            {isLoading ? (
              <LoadingState message="Loading tasks..." />
            ) : tasks.length === 0 ? (
              <EmptyState message="No tasks found. Upload a CSV file to get started." />
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-300 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate({ to: `/app/tasks/${task.id}` })}
                >
                  <div>
                    <p className="font-medium">{task.fileName}</p>
                    <p className="text-xs text-gray-600">{task.uploadedAt}</p>
                  </div>
                  <div className="text-right">
                    {task.status === "failed" ? (
                      <span className="text-sm font-bold text-red-600">
                        Error
                      </span>
                    ) : (
                      <span
                        className={`text-sm font-bold ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.totalQueries && task.processedQueries
                          ? (task.processedQueries / task.totalQueries) * 100
                          : 0}
                        %
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
