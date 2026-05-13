import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, Search, Menu } from "lucide-react";
import useToast from "../hooks/useToast";
import { clearToken } from "../services/tokenStorage";

const titleMap = {
  "/notes": "Notes Dashboard"
};

const notifications = [
  {
    id: "note-1",
    title: "New secure note added",
    time: "2 min ago"
  },
  {
    id: "note-2",
    title: "Token rotated for notes service",
    time: "12 min ago"
  },
  {
    id: "note-3",
    title: "Policy pack synced",
    time: "38 min ago"
  }
];

const Topbar = ({ onMenuClick, searchTerm, onSearchChange }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const title = titleMap[pathname] || "DevSecOps Zero Trust";
  const showLogout = pathname !== "/login";
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleAuthInvalid = () => {
      pushToast({
        title: "Session expired",
        message: "Authentication required to access notes.",
        tone: "warn"
      });
    };

    window.addEventListener("auth:invalid", handleAuthInvalid);
    return () => window.removeEventListener("auth:invalid", handleAuthInvalid);
  }, [pushToast]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!notificationsRef.current) {
        return;
      }
      if (!notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      window.addEventListener("click", handleOutsideClick);
    }

    return () => window.removeEventListener("click", handleOutsideClick);
  }, [notificationsOpen]);

  const handleLogout = () => {
    clearToken();
    pushToast({
      title: "Signed out",
      message: "Your session has ended.",
      tone: "info"
    });
    window.dispatchEvent(new CustomEvent("auth:logout"));
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-ink-800/80 bg-ink-900/70 px-6 py-5 backdrop-blur md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-700/70 bg-ink-850/70 text-slate-200 lg:hidden"
            onClick={onMenuClick}
            type="button"
          >
            <Menu size={18} />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              DevSecOps Zero Trust
            </p>
            <h1 className="font-display text-2xl text-slate-100">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-ink-700/70 bg-ink-850/70 px-4 py-2 text-sm text-slate-300 md:flex">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search notes, alerts..."
              className="w-56 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-700/70 bg-ink-850/70 text-slate-200"
            >
              <Bell size={18} />
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-ink-800/80 bg-ink-900/95 p-4 text-sm text-slate-200 shadow-xl">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Notifications
                </p>
                <div className="mt-3 space-y-3">
                  {notifications.map((item) => (
                    <div key={item.id} className="rounded-xl border border-ink-800/70 bg-ink-950/40 px-3 py-2">
                      <p className="text-sm text-slate-100">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="hidden rounded-full border border-ink-700/70 bg-ink-850/70 px-4 py-2 text-xs text-slate-300 sm:block">
            Region: us-east-1
          </div>
          {showLogout && (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border border-ink-700/70 bg-ink-850/70 px-4 py-2 text-xs text-slate-200 hover:border-teal-400/60 hover:text-teal-200"
            >
              <LogOut size={14} />
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
