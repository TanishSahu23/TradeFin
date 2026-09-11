import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Markets",
    path: "/markets",
  },
  {
    label: "Portfolio",
    path: "/portfolio",
  },
  {
    label: "Orders",
    path: "/orders",
  },
  {
    label: "Watchlist",
    path: "/watchlist",
  },
  {
    label: "Journal",
    path: "/journal",
  },
  {
    label: "IPOs",
    path: "/ipos",
  },
  {
    label: "Analytics",
    path: "/analytics",
  },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-gray-200 bg-white p-5">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          TradeFin
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Trading & Portfolio Analytics
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="border-t border-gray-200 pt-4">
        {user && (
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user.fullName}
            </p>

            <p className="truncate text-xs text-gray-500">
              {user.email}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;