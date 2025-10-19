import { useNavigate } from "@tanstack/react-router";

export function useLogout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate({ to: "/sign-in" });
  };

  return handleLogout;
}
