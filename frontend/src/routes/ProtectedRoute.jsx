import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = () => {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Loading TradeFin...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;