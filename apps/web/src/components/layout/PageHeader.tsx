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
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
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
