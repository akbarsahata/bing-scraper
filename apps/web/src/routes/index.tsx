import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return <Navigate to="/sign-in" search={{ redirect: "/app" }} />;
}
