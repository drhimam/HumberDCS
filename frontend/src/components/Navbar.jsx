import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { BookOpen, HeartPulse, LayoutDashboard, Menu, X, XOctagon } from "lucide-react";
import { useProgress, wrongAttempts } from "@/lib/progress";
import { cn } from "@/lib/utils";

const NavItem = ({ to, icon: Icon, children, testId }) => (
  <NavLink
    to={to}
    data-testid={testId}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )
    }
  >
    <Icon className="h-4 w-4" />
    {children}
  </NavLink>
);

export const Navbar = () => {
  const progress = useProgress();
  const wrong = wrongAttempts(progress).length;
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6">
        <Link to="/dashboard" className="flex min-w-0 items-center gap-3" data-testid="brand-link" onClick={close}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm shadow-sky-200">
            <HeartPulse className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-heading text-lg font-bold text-slate-900">EchoBank</span>
            <span className="hidden sm:block text-[11px] font-medium uppercase tracking-wider text-slate-500">Diagnostic Cardiac Sonography</span>
          </span>
        </Link>
        <nav className="hidden shrink-0 items-center gap-1 overflow-x-auto sm:flex">
          <NavItem to="/dashboard" icon={LayoutDashboard} testId="nav-dashboard"><span className="hidden sm:inline">Dashboard</span></NavItem>
          <NavItem to="/courses" icon={BookOpen} testId="nav-courses"><span className="hidden sm:inline">Subjects</span></NavItem>
          <NavItem to="/wrong-answers" icon={XOctagon} testId="nav-wrong-answers">
            <span className="hidden sm:inline">Wrong answers</span>
            {wrong > 0 && (
              <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white" data-testid="nav-wrong-count">{wrong}</span>
            )}
          </NavItem>
        </nav>
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 sm:hidden"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          data-testid="mobile-nav-toggle"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-slate-200 px-3 pb-3 pt-2 sm:hidden" data-testid="mobile-nav-menu">
          <div className="flex flex-col gap-1">
            <NavItem to="/dashboard" icon={LayoutDashboard} testId="mobile-nav-dashboard"><span>Dashboard</span></NavItem>
            <NavItem to="/courses" icon={BookOpen} testId="mobile-nav-courses"><span>Subjects</span></NavItem>
            <NavItem to="/wrong-answers" icon={XOctagon} testId="mobile-nav-wrong-answers">
              <span>Wrong answers</span>
              {wrong > 0 && (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">{wrong}</span>
              )}
            </NavItem>
          </div>
        </nav>
      )}
    </header>
  );
};
