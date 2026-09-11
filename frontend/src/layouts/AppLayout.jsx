import { Outlet } from "react-router-dom";

import Sidebar from "../components/common/Sidebar.jsx";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />

      <main className="min-h-screen ml-[275px]">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;