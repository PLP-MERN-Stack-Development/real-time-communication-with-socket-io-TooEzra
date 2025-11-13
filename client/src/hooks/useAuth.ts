import { useState } from "react";
import { login } from "../services/api";

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  // Derive username directly from token (no effect!)
  const username = token
    ? (() => {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          return payload.username || null;
        } catch {
          return null;
        }
      })()
    : null;

  const signIn = async (name: string) => {
    const t = await login(name);
    localStorage.setItem("token", t);
    setToken(t);
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return { token, username, signIn, signOut };
};