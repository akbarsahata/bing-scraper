import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-white border-2 border-black p-8 ${className}`}>
      {children}
    </div>
  );
}
