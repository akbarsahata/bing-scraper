interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading...",
  className = "",
}: LoadingStateProps) {
  return (
    <div className={`text-center text-gray-500 py-8 ${className}`}>
      {message}
    </div>
  );
}

interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className = "" }: EmptyStateProps) {
  return (
    <div className={`text-center text-gray-500 py-8 ${className}`}>
      {message}
    </div>
  );
}
