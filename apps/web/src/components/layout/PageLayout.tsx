import { useLogout } from "@/hooks";
import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  showLogout?: boolean;
  className?: string;
}

export function PageLayout({
  children,
  showLogout = false,
  className = "",
}: PageLayoutProps) {
  const handleLogout = useLogout();

  return (
    <div className={`min-h-screen w-full bg-gray-50 p-8 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border-2 border-black p-8">
          {showLogout && (
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
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
