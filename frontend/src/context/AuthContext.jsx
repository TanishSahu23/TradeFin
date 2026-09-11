import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../api/auth.api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser =
      localStorage.getItem("tradefin_user");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  });

  const [loading, setLoading] =
    useState(true);

  const saveAuthData = ({ user, token }) => {
    localStorage.setItem(
      "tradefin_token",
      token
    );

    localStorage.setItem(
      "tradefin_user",
      JSON.stringify(user)
    );

    setUser(user);
  };

  const register = async (userData) => {
    const result =
      await registerUser(userData);

    saveAuthData(result);

    return result;
  };

  const login = async (credentials) => {
    const result =
      await loginUser(credentials);

    saveAuthData(result);

    return result;
  };

  const logout = () => {
    localStorage.removeItem(
      "tradefin_token"
    );

    localStorage.removeItem(
      "tradefin_user"
    );

    setUser(null);
  };

  useEffect(() => {
    const token =
      localStorage.getItem(
        "tradefin_token"
      );

    if (!token) {
      setLoading(false);
      return;
    }

    const verifyUser = async () => {
      try {
        const currentUser =
          await getCurrentUser();

        localStorage.setItem(
          "tradefin_user",
          JSON.stringify(currentUser)
        );

        setUser(currentUser);
      } catch (error) {
        localStorage.removeItem(
          "tradefin_token"
        );

        localStorage.removeItem(
          "tradefin_user"
        );

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated:
          Boolean(user),
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};