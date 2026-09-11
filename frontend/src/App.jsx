import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout.jsx";

import Dashboard from "./features/dashboard/Dashboard.jsx";
import Markets from "./features/market/Markets.jsx";
import InstrumentDetails from "./features/market/InstrumentDetails.jsx";
import Portfolio from "./features/portfolio/Portfolio.jsx";
import OrderHistory from "./features/trading/OrderHistory.jsx";
import Watchlist from "./features/watchlist/Watchlist.jsx";
import Journal from "./features/journal/Journal.jsx";
import IPOs from "./features/ipo/IPOs.jsx";
import Analytics from "./features/analytics/Analytics.jsx";

import Login from "./features/auth/Login.jsx";
import Register from "./features/auth/Register.jsx";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";

const App = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/markets"
            element={<Markets />}
          />

          <Route
            path="/markets/:id"
            element={<InstrumentDetails />}
          />

          <Route
            path="/portfolio"
            element={<Portfolio />}
          />

          <Route
            path="/orders"
            element={<OrderHistory />}
          />

          <Route
            path="/watchlist"
            element={<Watchlist />}
          />

          <Route
            path="/journal"
            element={<Journal />}
          />

          <Route
            path="/ipos"
            element={<IPOs />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />
        </Route>
      </Route>

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
};

export default App;