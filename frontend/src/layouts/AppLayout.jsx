import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="app-shell">
      <div className="flex min-h-screen">
        <Sidebar />
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-ink-950/80 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <Sidebar
          variant="mobile"
          isOpen={mobileOpen}
          onNavigate={() => setMobileOpen(false)}
        />
        <div className="flex-1">
          <Topbar
            onMenuClick={() => setMobileOpen(true)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          <main className="px-6 pb-12 pt-6 md:px-10">
            <div className="page-enter">
              <Outlet context={{ searchTerm }} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
