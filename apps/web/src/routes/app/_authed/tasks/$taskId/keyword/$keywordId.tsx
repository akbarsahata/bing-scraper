import { trpcReact } from "@/utils/trpc-types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, LoadingState, EmptyState } from "@/components/layout";

export const Route = createFileRoute(
  "/app/_authed/tasks/$taskId/keyword/$keywordId"
)({
  component: KeywordResultsPage,
});

function KeywordResultsPage() {
  const { keywordId, taskId } = Route.useParams();
  const navigate = useNavigate();

  const { data, isLoading } = trpcReact.queries.getByQueryId.useQuery({
    queryId: keywordId,
    uploadedFileId: taskId,
  });

  const keyword = data?.query.queryText || "";

  const results = data?.results.items || [];
  
  const adsCount = results.filter((item) => item.isAd).length;
  const linksCount = results.filter((item) => !item.isAd).length;

  const handleDownload = () => {
    console.log("Downloading results for keyword:", keyword);
  };

  const handleBack = () => {
    navigate({ to: `/app/tasks/${taskId}` });
  };

  return (
    <div className="w-full bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border-2 border-black p-8">
          <PageHeader />

          <div className="mb-6">
            <button
              onClick={handleBack}
              className="text-blue-500 text-sm hover:underline mb-4"
            >
              &lt; Back to file
            </button>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {isLoading ? "Loading..." : keyword || "No keyword"}
              </h2>
            </div>

            <div className="flex gap-4 mb-4">
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600"
                disabled={isLoading || results.length === 0}
              >
                download
              </button>
              <div className="flex gap-4 text-sm">
                <span>
                  <span className="font-bold">Ads found:</span>{" "}
                  {isLoading ? "..." : adsCount}
                </span>
                <span>
                  <span className="font-bold">Links found:</span>{" "}
                  {isLoading ? "..." : linksCount}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">search results</h3>
            <div className="space-y-4">
              {isLoading ? (
                <LoadingState message="Loading results..." />
              ) : results.length === 0 ? (
                <EmptyState message="No results found for this query" />
              ) : (
                results.map((result) => (
                  <div
                    key={result.id}
                    className="border border-gray-300 p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium flex-1"
                      >
                        {result.title}
                      </a>
                      {result.isAd && (
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                          AD
                        </span>
                      )}
                    </div>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 text-sm hover:underline block mb-2"
                    >
                      {result.displayUrl || result.url}
                    </a>
                    {result.snippet && (
                      <p className="text-sm text-gray-700">{result.snippet}</p>
                    )}
                    <div className="mt-2 flex gap-4 text-xs text-gray-500">
                      <span>Position: {result.position}</span>
                      {result.type && (
                        <span className="capitalize">Type: {result.type}</span>
                      )}
                      {result.domain && <span>Domain: {result.domain}</span>}
                    </div>
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
