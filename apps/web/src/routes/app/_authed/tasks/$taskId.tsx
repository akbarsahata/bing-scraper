import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/_authed/tasks/$taskId")({
  component: TaskDetailPage,
});

function TaskDetailPage() {
  const { taskId } = Route.useParams();
  const navigate = useNavigate();

  const queries = [
    { id: "1", keyword: "keyword 6", status: "not started" },
    { id: "2", keyword: "keyword 5", status: "running" },
    { id: "3", keyword: "keyword 4", status: "running" },
    { id: "4", keyword: "keyword 3", status: "done" },
    { id: "5", keyword: "keyword 2", status: "done" },
    { id: "6", keyword: "keyword 1", status: "done" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "text-green-600";
      case "running":
        return "text-blue-600";
      case "not started":
        return "text-gray-400";
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
              <h2 className="text-xl font-bold">&lt;FILE NAME&gt;</h2>
              <div>
                <span className="text-orange-600 font-bold text-lg">56%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Started from Thursday, 21 Oct 2025
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">queries</h3>
            <div className="space-y-2">
              {queries.map((query) => (
                <div
                  key={query.id}
                  className={`border border-gray-300 p-3 flex justify-between items-center ${
                    query.status === "done"
                      ? "cursor-pointer hover:bg-gray-50"
                      : ""
                  }`}
                  onClick={() => {
                    if (query.status === "done") {
                      navigate({
                        to: `/app/tasks/${taskId}/keyword/${query.id}`,
                      });
                    }
                  }}
                >
                  <p className="font-medium">{query.keyword}</p>
                  <span className={`text-sm ${getStatusColor(query.status)}`}>
                    {query.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
