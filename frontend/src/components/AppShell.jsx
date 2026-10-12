import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

export const AppShell = () => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(125,211,252,0.24),transparent_30rem),radial-gradient(circle_at_90%_15%,rgba(94,234,212,0.18),transparent_28rem)]">
    <Navbar />
    <Outlet />
  </div>
);

export const PageState = ({ loading, error, children }) => {
  if (loading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center" data-testid="page-loading">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
      </div>
    );
  if (error)
    return (
      <div className="mx-auto max-w-xl p-10 text-center text-rose-700" data-testid="page-error">
        Could not load the question bank. {String(error.message || error)}
      </div>
    );
  return children;
};
