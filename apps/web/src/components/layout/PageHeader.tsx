import { Link } from "@tanstack/react-router";
import { useLogout } from "@/hooks";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  showLogout?: boolean;
}

export function PageHeader({
  title = "BING SCRAPER",
  subtitle,
  showLogout = true,
}: PageHeaderProps) {
  const handleLogout = useLogout();

  return (
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-6">
        <div>
          <Link to="/app" className="hover:text-blue-600 transition-colors">
            <h1 className="text-2xl font-bold">{title}</h1>
          </Link>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        <nav className="flex items-center gap-4 mt-1">
          <Link
            to="/app"
            className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
            activeProps={{
              className: "text-blue-600 font-medium"
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/app/tasks"
            className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
            activeProps={{
              className: "text-blue-600 font-medium"
            }}
          >
            Tasks
          </Link>
          <Link
            to="/app/search"
            className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
            activeProps={{
              className: "text-blue-600 font-medium"
            }}
          >
            Search
          </Link>
        </nav>
      </div>
      {showLogout && (
        <button
          onClick={handleLogout}
          className="text-red-600 text-sm hover:underline"
        >
          logout
        </button>
      )}
    </div>
  );
}
