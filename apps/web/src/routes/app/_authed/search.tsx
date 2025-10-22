import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { trpcReact } from '@/utils/trpc-types';
import { Card } from '@/components/ui/Card';
import { LoadingState, EmptyState } from '@/components/ui/States';

export const Route = createFileRoute('/app/_authed/search')({
  component: SearchPage,
});

function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const { data, isLoading, error, refetch } = trpcReact.queries.search.useQuery(
    { searchTerm: activeSearch },
    { enabled: activeSearch.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setActiveSearch(searchTerm.trim());
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-gray-600">
            Search across all your scraped search results
          </p>
        </div>

        <Card>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search in titles, URLs, snippets, or domains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              disabled={!searchTerm.trim()}
              className="px-6 py-2 bg-black text-white font-bold border-2 border-black hover:bg-gray-900 disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </form>
        </Card>

        {isLoading && <LoadingState message="Searching..." />}

        {error && (
          <Card>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2 text-red-600">Search failed</h3>
              <p className="text-gray-600 mb-4">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-black text-white font-bold border-2 border-black hover:bg-gray-900"
              >
                Try Again
              </button>
            </div>
          </Card>
        )}

        {!isLoading && !error && activeSearch && data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Found {data.length} result{data.length !== 1 ? 's' : ''} for "{activeSearch}"
              </h2>
            </div>

            {data.length === 0 ? (
              <EmptyState message={`No search results match "${activeSearch}". Try a different search term.`} />
            ) : (
              <div className="space-y-4">
                {data.map((result) => (
                  <Card key={result.id}>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold">Query: {result.queryText}</h3>
                        <p className="text-sm text-gray-600">
                          Scraped: {new Date(result.scrapedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-3">
                        {result.items.map((item) => (
                          <div
                            key={item.id}
                            className="border-l-4 border-black pl-4 py-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline font-medium"
                                >
                                  {item.title}
                                </a>
                                <p className="text-sm text-gray-600 truncate">
                                  {item.displayUrl}
                                </p>
                                {item.snippet && (
                                  <p className="text-sm mt-1 line-clamp-2">
                                    {item.snippet}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs bg-gray-200 px-2 py-1 font-bold flex-shrink-0">
                                #{item.position}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {!activeSearch && (
          <EmptyState message="Enter a search term above to find results across all your scraped data" />
        )}
      </div>
    </div>
  );
}
