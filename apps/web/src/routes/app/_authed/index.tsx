import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { trpc } from "@/utils/trpc-types";

export const Route = createFileRoute("/app/_authed/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);

  const recentScrapes = [
    { name: "<FILE NAME>", date: "Thursday, 21 Oct 2025", progress: 56 },
    { name: "<FILE NAME>", date: "Monday, 18 Oct 2025", progress: 100 },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith(".csv")) {
      setErrorMessage("Please upload a CSV file");
      setShowError(true);
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage("File size must be less than 10MB");
      setShowError(true);
      return;
    }

    setIsUploading(true);
    setShowError(false);

    try {
      // Read file as base64
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remove data:text/csv;base64, prefix
          const base64Content = base64.split(",")[1];
          resolve(base64Content);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      console.log("File content (base64):", fileContent);

      // Upload via tRPC
      const result = await trpc.files.upload.mutate({
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileContent: fileContent,
      });

      setUploadedFileId(result.fileId);
      setShowSuccess(true);
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to upload file"
      );
      setShowError(true);
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleUploadAgain = () => {
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage("");
    setUploadedFileId(null);
  };

  const handleGoToTask = () => {
    if (uploadedFileId) {
      navigate({ to: "/app/tasks/$taskId", params: { taskId: uploadedFileId } });
    } else {
      navigate({ to: "/app/tasks" });
    }
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
              <div
                className={`border-2 border-dashed border-gray-300 p-8 cursor-pointer hover:border-gray-400 ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
                <p className="text-sm">
                  {isUploading
                    ? "Uploading..."
                    : "Upload your keywords (*.csv) here!"}
                </p>
              </div>
            </label>
            <div className="text-center">
              <a
                href="/template.csv"
                className="text-blue-500 text-sm hover:underline"
              >
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
            <h3 className="text-center font-bold mb-4 text-red-600">
              File upload failed!
            </h3>
            {errorMessage && (
              <p className="text-center text-sm text-gray-600 mb-4">
                {errorMessage}
              </p>
            )}
            <div className="flex justify-center">
              <button
                onClick={handleUploadAgain}
                className="px-6 py-2 border border-gray-300 hover:bg-gray-50"
              >
                try again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
