import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";

// 1. Create context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// 3. AuthProvider component (exported)
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;

    try {
      const parsedUser = JSON.parse(storedUser);
      return parsedUser;
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      localStorage.removeItem("user");
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const checkAuthStatus = async () => {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const currentUser = await authAPI.getCurrentUser();
        const currentUserWithToken = { ...currentUser, token: savedToken };

        setUser(currentUserWithToken);
        setToken(savedToken);
        localStorage.setItem("user", JSON.stringify(currentUserWithToken));
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      setAuthError('');
      const userData = await authAPI.login({ email, password });
      const authToken = userData?.token || localStorage.getItem("token");

      if (authToken) {
        const userWithToken = { ...userData, token: authToken };
        setUser(userWithToken);
        setToken(authToken);
        localStorage.setItem("user", JSON.stringify(userWithToken));
        localStorage.setItem("token", authToken);
        return userWithToken;
      }
      
      throw new Error('Invalid credentials');
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed.';
      setAuthError(errorMessage);
      return null;
    }
  };

  const register = async (userData) => {
    try {
      setAuthError('');
      const newUser = await authAPI.register(userData);
      const authToken = newUser?.token || localStorage.getItem("token");

      if (authToken) {
        const newUserWithToken = { ...newUser, token: authToken };
        setUser(newUserWithToken);
        setToken(authToken);
        localStorage.setItem("user", JSON.stringify(newUserWithToken));
        localStorage.setItem("token", authToken);
        return newUserWithToken;
      }
      
      throw new Error('Registration failed');
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed.';
      setAuthError(errorMessage);
      return null;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setAuthError('');
    }
  };

  const updateUser = (updatedUser) => {
    const userWithToken = { ...user, ...updatedUser, token };
    setUser(userWithToken);
    localStorage.setItem("user", JSON.stringify(userWithToken));
  };

  const getToken = useCallback(() => token, [token]);

  const value = {
    user,
    token: getToken(),
    loading,
    authError,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token,
    isAdmin: user?.role === "admin",
    setAuthError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;