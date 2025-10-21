import { ReactNode } from "react";
import { PageHeader } from "./PageHeader";

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

  return (
    <div className={`min-h-screen w-full bg-gray-50 p-8 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border-2 border-black p-8">
          {showLogout && <PageHeader />}
          {children}
        </div>
      </div>
    </div>
  );
}
