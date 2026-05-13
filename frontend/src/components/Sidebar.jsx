import { NavLink } from "react-router-dom";
import { ShieldCheck, StickyNote } from "lucide-react";

const navItems = [
  { label: "Notes", to: "/notes", icon: StickyNote }
];

const Sidebar = ({ variant = "desktop", isOpen = false, onNavigate }) => (
  <aside
    className={
      variant === "mobile"
        ? `fixed inset-y-0 left-0 z-40 w-72 transform border-r border-ink-800/80 bg-ink-900/95 px-6 py-8 transition duration-300 lg:hidden ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`
        : "hidden w-72 flex-col border-r border-ink-800/80 bg-ink-900/90 px-6 py-8 lg:flex"
    }
  >
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/20 text-teal-400">
        <ShieldCheck size={20} />
      </div>
      <div>
        <p className="font-display text-lg">Zero Trust</p>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          DevSecOps
        </p>
      </div>
    </div>

    <nav className="mt-10 flex flex-1 flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/notes"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-ink-800/80 text-slate-100 shadow-glow"
                  : "text-slate-300 hover:bg-ink-800/50 hover:text-slate-100"
              }`
            }
          >
            <Icon size={18} />
            {item.label}
          </NavLink>
        );
      })}
    </nav>

    <div className="glass-panel mt-auto px-4 py-4 text-xs text-slate-300">
      <p className="uppercase tracking-[0.2em] text-slate-500">Posture</p>
      <p className="mt-2 text-lg font-semibold text-teal-400">Secure</p>
      <p className="mt-1 text-slate-400">No critical signals detected.</p>
    </div>
  </aside>
);

export default Sidebar;
