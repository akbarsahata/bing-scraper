import { useNavigate } from "@tanstack/react-router";
import { trpcReact } from "@/utils/trpc-types";

export function useLogout() {
  const navigate = useNavigate();

  const signOutMutation = trpcReact.auth.signOut.useMutation({
    onSettled: () => {
      localStorage.removeItem("auth_token");
      navigate({ to: "/sign-in", search: { redirect: "/app" } });
    },
  });

  const handleLogout = () => {
    signOutMutation.mutate();
  };

  return handleLogout;
}
