import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Briefcase, Upload, LayoutDashboard, FileText, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export const Layout = () => {
  const navigate = useNavigate();
  const userEmail = useAuthStore((s) => s.email);
  const token = useAuthStore((s) => s.token);

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "flex items-center gap-2 text-indigo-600 font-medium bg-indigo-50 border-l-4 border-indigo-600 px-3 py-2 rounded"
      : "flex items-center gap-2 text-gray-700 hover:text-indigo-600 px-3 py-2 rounded transition-colors";

  // On mount — if no token in store, redirect to signin
  useEffect(() => {
    if (!token) {
      toast.error("Please sign in to access your dashboard.");
      navigate("/signin");
    }
  }, [navigate, token]);

  const handleLogout = () => {
    try {
      useAuthStore.getState().logout();
    } catch (e) {
      // ignore
    }
    toast.success("Logged out successfully!");
    navigate("/signin");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-5 flex flex-col">
        <h2 className="text-2xl font-bold text-indigo-600 mb-8 text-center">
          CV Analyzer
        </h2>

        {/* Optional Greeting */}
        {userEmail && (
          <p className="text-xs text-gray-500 text-center mb-4 break-all">
            Signed in as <br />
            <span className="font-medium text-indigo-600">{userEmail}</span>
          </p>
        )}

        <nav className="flex flex-col gap-3">
          <NavLink to="/" className={linkClasses}>
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>

          <NavLink to="/uploadresume" className={linkClasses}>
            <Upload className="w-5 h-5" />
            Upload Resume
          </NavLink>

          <NavLink to="/jobs" className={linkClasses}>
            <Briefcase className="w-5 h-5" />
            Job Repository
          </NavLink>

          <NavLink to="/job-upload" className={linkClasses}>
            <FileText className="w-5 h-5" />
            Upload Job
          </NavLink>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 text-sm mt-6 bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>

        <div className="mt-auto text-sm text-gray-400 text-center">
          © {new Date().getFullYear()} Vansh CV Analyzer
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-zinc-100 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
