import { createContext, useContext, ReactNode } from "react";

interface SubscriptionState {
  subscribed: boolean;
  isAdmin: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
}

interface AuthContextType {
  user: null;
  session: null;
  loading: false;
  subscription: SubscriptionState;
  signUp: (email: string, password: string) => Promise<{ error: null }>;
  signIn: (email: string, password: string) => Promise<{ error: null }>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUBSCRIPTION: SubscriptionState = {
  subscribed: false,
  isAdmin: false,
  productId: null,
  subscriptionEnd: null,
  loading: false,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const value: AuthContextType = {
    user: null,
    session: null,
    loading: false,
    subscription: SUBSCRIPTION,
    signUp: async () => ({ error: null }),
    signIn: async () => ({ error: null }),
    signOut: async () => {},
    refreshSubscription: async () => {},
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
