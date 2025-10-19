import { useAuth } from "../components/auth/provider.tsx";

/**
 * Hook to handle logout logic
 */
export function useLogout() {
  const { signOut } = useAuth();
  return signOut;
}
