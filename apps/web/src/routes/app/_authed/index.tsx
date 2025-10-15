import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/app/_authed/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const recentScrapes = [
    { name: "<FILE NAME>", date: "Thursday, 21 Oct 2025", progress: 56 },
    { name: "<FILE NAME>", date: "Monday, 18 Oct 2025", progress: 100 },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // TODO: Upload file to R2 and process
      console.log("Uploading file:", selectedFile.name);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleUploadAgain = () => {
    setShowSuccess(false);
    setShowError(false);
  };

  const handleGoToTask = () => {
    navigate({ to: "/app/tasks" });
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border-2 border-black p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">BING SCRAPER</h1>
            <p className="text-sm text-gray-600">scrape bing all you want!</p>
          </div>

          <div className="mb-6">
            <label className="block text-center mb-4">
              <div className="border-2 border-dashed border-gray-300 p-8 cursor-pointer hover:border-gray-400">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-sm">Upload your keywords (*.csv) here!</p>
              </div>
            </label>
            <div className="text-center">
              <a href="/template.csv" className="text-blue-500 text-sm hover:underline">
                template file
              </a>
            </div>
          </div>

          <div>
            <h2 className="font-bold mb-4">Recent scrapes</h2>
            <div className="space-y-2">
              {recentScrapes.map((scrape, index) => (
                <div
                  key={index}
                  className="border border-gray-300 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate({ to: "/app/tasks/$taskId", params: { taskId: "1" } })}
                >
                  <div>
                    <p className="font-medium">{scrape.name}</p>
                    <p className="text-xs text-gray-600">{scrape.date}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold ${
                        scrape.progress === 100 ? "text-green-600" : "text-orange-600"
                      }`}
                    >
                      {scrape.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white border-2 border-black p-8 max-w-sm">
            <h3 className="text-center font-bold mb-4">File uploaded successfully!</h3>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleUploadAgain}
                className="px-6 py-2 border border-gray-300 hover:bg-gray-50"
              >
                upload again
              </button>
              <button
                onClick={handleGoToTask}
                className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600"
              >
                go to task
              </button>
            </div>
          </div>
        </div>
      )}

      {showError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white border-2 border-black p-8 max-w-sm">
            <h3 className="text-center font-bold mb-4">File upload failed!</h3>
            <div className="flex justify-center">
              <button
                onClick={handleUploadAgain}
                className="px-6 py-2 border border-gray-300 hover:bg-gray-50"
              >
                upload again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
