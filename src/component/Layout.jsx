import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex dark:bg-dark-mode">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} />

      {/* Main Content */}
      <div
        className="flex flex-col transition-all duration-300 w-full dark:bg-dark-mode"
        // style={{ marginLeft: isSidebarOpen ? "18rem" : "5.5rem" }} // 72 or 22 tailwind widths
      >
        {/* Header */}
        <Header isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Section */}
        <main className="p-6 text-[#000000]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
