import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/useAuth";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    data: any;
    error: any;
  }>;
  signUp: (email: string, password: string) => Promise<{
    data: any;
    error: any;
  }>;
  signInWithGoogle: () => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  sendMagicLink: (email: string) => Promise<{ data: any; error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
