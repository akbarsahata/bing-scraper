import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../components/auth/provider.tsx";

export const Route = createFileRoute("/sign-in")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || "/app",
    };
  },
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/sign-in" });
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(formData.email, formData.password);
      // Navigate to redirect path or default to /app
      navigate({ to: redirect });
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-black p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">BING SCRAPER</h1>
            <p className="text-sm text-gray-600">scrape bing all you want!</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "signing in..." : "sign in"}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link to="/sign-up" className="text-blue-500 text-sm hover:underline">
              register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
