import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/_authed/tasks/")({
  component: TasksPage,
});

function TasksPage() {
  const navigate = useNavigate();

  const tasks = [
    {
      id: "1",
      name: "<FILE NAME>",
      date: "Thursday, 21 Oct 2025",
      progress: 48,
      status: "running",
    },
    {
      id: "2",
      name: "<FILE NAME>",
      date: "Monday, 18 Oct 2025",
      progress: 100,
      status: "completed",
    },
    {
      id: "3",
      name: "<FILE NAME>",
      date: "Wednesday, 13 Oct 2025",
      progress: 0,
      status: "error",
    },
    {
      id: "4",
      name: "<FILE NAME>",
      date: "Monday, 10 Oct 2025",
      progress: 100,
      status: "completed",
    },
    {
      id: "5",
      name: "<FILE NAME>",
      date: "Thursday, 21 Oct 2025",
      progress: 100,
      status: "completed",
    },
    {
      id: "6",
      name: "<FILE NAME>",
      date: "Monday, 18 Oct 2025",
      progress: 100,
      status: "completed",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "running":
        return "text-orange-600";
      case "error":
        return "text-red-600";
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
          <div className="flex justify-between items-start mb-8">
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

          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-300 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => navigate({ to: `/app/tasks/${task.id}` })}
              >
                <div>
                  <p className="font-medium">{task.name}</p>
                  <p className="text-xs text-gray-600">{task.date}</p>
                </div>
                <div className="text-right">
                  {task.status === "error" ? (
                    <span className="text-sm font-bold text-red-600">
                      Error
                    </span>
                  ) : (
                    <span
                      className={`text-sm font-bold ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.progress}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
