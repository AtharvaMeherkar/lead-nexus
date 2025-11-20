import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api, { setAuthToken } from "../utils/api";
import { UserProfile } from "../types";

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("lead-nexus-token"));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (authToken?: string) => {
    const activeToken = authToken ?? token;
    if (!activeToken) {
      setLoading(false);
      return;
    }
    setAuthToken(activeToken);
    try {
      setLoading(true);
      const { data } = await api.get<UserProfile>("/auth/me");
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => fetchProfile();

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const login = async (newToken: string) => {
    localStorage.setItem("lead-nexus-token", newToken);
    setToken(newToken);
    await fetchProfile(newToken);
  };

  const logout = () => {
    localStorage.removeItem("lead-nexus-token");
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      refreshProfile,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};


