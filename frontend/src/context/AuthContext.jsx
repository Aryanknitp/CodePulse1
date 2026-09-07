import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi } from "../services/authApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      const data = await authApi.getCurrentUser();
      const currentUser = data?.user || data;
      setUser(currentUser);
      console.log("correctly data", currentUser);
      return currentUser;
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    await fetchUser();
    return data;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const refreshUser = fetchUser;

  const isAuthenticated = !!user;
  const emailVerified = user?.emailVerified;
  const codeforcesConnected = !!user?.codeforcesHandle;
  const codeforcesVerified = user?.codeforcesVerified;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        emailVerified,
        codeforcesConnected,
        codeforcesVerified,
        login,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
