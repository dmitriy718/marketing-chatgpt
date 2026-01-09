"use client";

import { createContext, useContext, useMemo, useState } from "react";

type AuthContextValue = {
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function CrmAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem("crm_token");
  });
  const [loading] = useState(false);

  const login = async (email: string, password: string) => {
    const response = await fetch("/crm-auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials.");
    }

    const data = (await response.json()) as { access_token: string };
    window.localStorage.setItem("crm_token", data.access_token);
    setToken(data.access_token);
  };

  const logout = () => {
    window.localStorage.removeItem("crm_token");
    setToken(null);
  };

  const value = useMemo(
    () => ({ token, loading, login, logout }),
    [token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useCrmAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("CrmAuthProvider missing");
  }
  return ctx;
}
