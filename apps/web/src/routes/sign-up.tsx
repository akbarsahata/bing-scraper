import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement sign up logic with Better Auth
    console.log("Sign up:", formData);
    navigate({ to: "/sign-in" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-black p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">BING SCRAPER</h1>
            <p className="text-sm text-gray-600">scrape bing all you want!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                required
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
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="confirm password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 hover:bg-blue-600 transition-colors"
            >
              sign up
            </button>
          </form>

          <div className="text-center mt-4">
            <Link to="/sign-in" className="text-blue-500 text-sm hover:underline">
              sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
