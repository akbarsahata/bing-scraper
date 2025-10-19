import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { trpcReact } from "../../utils/trpc-types";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const signInMutation = trpcReact.auth.signIn.useMutation();
  const signUpMutation = trpcReact.auth.signUp.useMutation();
  const signOutMutation = trpcReact.auth.signOut.useMutation();

  // Check session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Use fetch directly to avoid circular dependency
        const response = await fetch("/trpc/auth.getSession", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json() as any;
          if (data.result?.data?.user) {
            setUser(data.result.data.user);
          } else {
            localStorage.removeItem("auth_token");
          }
        } else {
          localStorage.removeItem("auth_token");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("auth_token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInMutation.mutateAsync({ email, password });
      
      if (result.token) {
        localStorage.setItem("auth_token", result.token);
        setUser(result.user);
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      await signUpMutation.mutateAsync({ name, email, password });
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutMutation.mutateAsync();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      localStorage.removeItem("auth_token");
      setUser(null);
      navigate({ to: "/sign-in", search: { redirect: "/app" } });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
