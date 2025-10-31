import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/useAuth";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    data: { user: User | null; session: Session | null };
    error: AuthError | null;
  }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{
    data: { user: User | null; session: Session | null };
    error: AuthError | null;
  }>;
  signInWithGoogle: () => Promise<{
    data: { url: string | null; provider: string } | null;
    error: AuthError | null;
  }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  sendMagicLink: (email: string) => Promise<{
    data: { user: User | null; session: Session | null } | null;
    error: AuthError | null;
  }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// Export hook alongside provider for convenience
// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
