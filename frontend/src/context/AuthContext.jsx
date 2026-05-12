import { createContext, useState, useContext, useEffect } from "react";
import { AUTH_TOKEN_STORAGE_KEY, getUser } from "../services/api";

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());

  useEffect(() => {
    const sync = () => setUser(getUser());

    const onStorage = (e) => {
      if (e.key !== AUTH_TOKEN_STORAGE_KEY && e.key !== null) return;
      sync();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("auth-token-changed", sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth-token-changed", sync);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);