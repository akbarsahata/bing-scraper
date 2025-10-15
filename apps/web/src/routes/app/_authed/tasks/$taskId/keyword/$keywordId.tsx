import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/app/_authed/tasks/$taskId/keyword/$keywordId"
)({
  component: KeywordResultsPage,
});

function KeywordResultsPage() {
  const { taskId } = Route.useParams();
  const navigate = useNavigate();

  const keyword = "keyword 1";

  const results = [
    {
      id: "1",
      url: "https://example.com/result1",
      title:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eu efficitur libero. Phasellus tincidunt rutrum metus, nec aliquet magna pharetra a.",
      adsFound: 12,
      linksFound: 10,
    },
    {
      id: "2",
      url: "https://example.com/result2",
      title:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eu efficitur libero. Phasellus tincidunt rutrum metus, nec aliquet magna pharetra a.",
      adsFound: 8,
      linksFound: 15,
    },
  ];

  const handleDownload = () => {
    // TODO: Implement download CSV functionality
    console.log("Downloading results for keyword:", keyword);
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate({ to: "/sign-in" });
  };

  const handleBack = () => {
    navigate({ to: `/app/tasks/${taskId}` });
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
            <button
              onClick={handleBack}
              className="text-blue-500 text-sm hover:underline mb-4"
            >
              &lt; FILE NAME
            </button>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{keyword}</h2>
            </div>

            <div className="flex gap-4 mb-4">
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600"
              >
                download
              </button>
              <div className="flex gap-4 text-sm">
                <span>
                  <span className="font-bold">Ads found:</span>{" "}
                  {results[0]?.adsFound || 0}
                </span>
                <span>
                  <span className="font-bold">Links found:</span>{" "}
                  {results[0]?.linksFound || 0}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">search results</h3>
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.id} className="border border-gray-300 p-4">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mb-2 block"
                  >
                    {result.url}
                  </a>
                  <p className="text-sm text-gray-700">{result.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
