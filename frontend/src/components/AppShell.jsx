import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

export const AppShell = () => (
  <div className="min-h-screen bg-slate-50">
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
