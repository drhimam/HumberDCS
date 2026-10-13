import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  Heart,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  X,
  XOctagon,
} from "lucide-react";
import { toast } from "sonner";
import { useProgress, wrongAttempts } from "@/lib/progress";
import { logout, useAuthUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileDialog } from "@/components/ProfileDialog";
import { DonateDialog } from "@/components/DonateDialog";

const NavItem = ({ to, icon: Icon, children, testId }) => (
  <NavLink
    to={to}
    data-testid={testId}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
        isActive
          ? "bg-white/25 text-white shadow-sm ring-1 ring-white/35 font-bold"
          : "text-sky-50/90 hover:bg-white/15 hover:text-white",
      )
    }
  >
    <Icon className="h-4 w-4" />
    {children}
  </NavLink>
);

export const Navbar = () => {
  const progress = useProgress();
  const user = useAuthUser();
  const navigate = useNavigate();
  const wrong = wrongAttempts(progress).length;

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = async () => {
    close();
    await logout();
    toast.success("Signed out successfully.");
    navigate("/signin", { replace: true });
  };

  const initials = (user?.displayName || user?.email || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-sky-900/20 bg-gradient-to-r from-sky-700 via-cyan-600 to-teal-600 shadow-lg shadow-sky-900/10">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6">
          {/* Brand */}
          <Link to="/dashboard" className="flex min-w-0 items-center gap-3" data-testid="brand-link" onClick={close}>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-lg shadow-sky-950/20 ring-4 ring-white/20">
              <HeartPulse className="h-6 w-6" />
            </span>
            <span className="leading-tight">
              <span className="block font-heading text-xl font-extrabold tracking-tight text-white">DCSQbank</span>
              <span className="hidden text-xs font-semibold uppercase tracking-wider text-sky-100 sm:block">Diagnostic Cardiac Sonography</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
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

          {/* Right Header Controls: Donate & User Menu */}
          <div className="hidden items-center gap-2 sm:flex">
            {/* Quick Donate Button in Top Bar */}
            <button
              type="button"
              onClick={() => setDonateOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur transition-all hover:bg-white/20 hover:border-white/40"
            >
              <Heart className="h-3.5 w-3.5 fill-rose-300 text-rose-300" />
              <span>Donate</span>
            </button>

            {/* User Dropdown Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1 pr-2.5 text-left text-white backdrop-blur transition-all hover:bg-white/20 focus:outline-none"
                    aria-label="User profile and settings"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white font-bold text-sky-700 shadow-sm text-xs">
                      {initials}
                    </div>
                    <span className="max-w-[120px] truncate text-xs font-semibold text-white">
                      {user.displayName || user.email.split("@")[0]}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-slate-200">
                  <DropdownMenuLabel className="p-2 font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold text-slate-900 leading-none truncate">
                        {user.displayName || "DCS Sonographer"}
                      </p>
                      <p className="text-xs text-slate-500 truncate leading-none mt-0.5">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 mt-1">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        Verified Learner
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setProfileOpen(true)}
                    className="flex cursor-pointer items-center gap-2 rounded-xl py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <User className="h-4 w-4 text-sky-600" />
                    <span>Profile & Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDonateOpen(true)}
                    className="flex cursor-pointer items-center gap-2 rounded-xl py-2 text-xs font-medium text-slate-700 hover:bg-rose-50"
                  >
                    <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                    <span>Support DCSQbank</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex cursor-pointer items-center gap-2 rounded-xl py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 focus:text-rose-700 focus:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 sm:hidden"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            data-testid="mobile-nav-toggle"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {open && (
          <nav className="border-t border-white/15 bg-sky-900/40 px-3 pb-4 pt-2 sm:hidden backdrop-blur" data-testid="mobile-nav-menu">
            {user && (
              <div className="mb-3 rounded-2xl border border-white/20 bg-white/10 p-3 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white font-bold text-sky-700 text-xs shadow">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold leading-tight">{user.displayName || "Learner"}</p>
                    <p className="truncate text-[11px] text-sky-200">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <NavItem to="/dashboard" icon={LayoutDashboard} testId="mobile-nav-dashboard"><span onClick={close}>Dashboard</span></NavItem>
              <NavItem to="/courses" icon={BookOpen} testId="mobile-nav-courses"><span onClick={close}>Subjects</span></NavItem>
              <NavItem to="/wrong-answers" icon={XOctagon} testId="mobile-nav-wrong-answers">
                <span onClick={close}>Wrong answers</span>
                {wrong > 0 && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">{wrong}</span>
                )}
              </NavItem>
            </div>

            <div className="mt-3 border-t border-white/15 pt-3 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => {
                  close();
                  setDonateOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/30"
              >
                <Heart className="h-4 w-4 fill-rose-300 text-rose-300" />
                Support DCSQbank / Donate
              </button>
              <button
                type="button"
                onClick={() => {
                  close();
                  setProfileOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
              >
                <User className="h-4 w-4 text-sky-200" />
                Profile Settings
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-white/20"
              >
                <LogOut className="h-4 w-4 text-rose-300" />
                Sign Out
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Global Dialogs */}
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <DonateDialog open={donateOpen} onOpenChange={setDonateOpen} />
    </>
  );
};
