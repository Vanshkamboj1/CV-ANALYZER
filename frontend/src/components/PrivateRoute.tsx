import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = useAuthStore((s) => s.token);
  const hrId = useAuthStore((s) => s.hrId);

  if (!token || !hrId) {
    toast.error("Session expired. Please sign in again.");
    try {
      useAuthStore.getState().logout();
    } catch (e) {
      
    }
    return <Navigate to="/signin" replace />;
  }

  return children;
};
