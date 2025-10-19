import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { trpcReact } from "@/utils/trpc-types";

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
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");

  const signInMutation = trpcReact.auth.signIn.useMutation({
    onSuccess: async (data) => {
      // Store session token in localStorage
      if (data.token) {
        console.log("setting token: ", data.token);
        localStorage.setItem("auth_token", data.token);
      }
      // Navigate to redirect path or default to /app
      console.log("navigating to: ", redirect);
      await navigate({ to: redirect });
    },
    onError: (error) => {
      setError(error.message || "Failed to sign in");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    signInMutation.mutate({
      email: formData.email,
      password: formData.password,
    });
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
                disabled={signInMutation.isPending}
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
                disabled={signInMutation.isPending}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={signInMutation.isPending}
            >
              {signInMutation.isPending ? "signing in..." : "sign in"}
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
