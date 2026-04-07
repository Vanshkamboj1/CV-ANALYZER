import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = useAuthStore((s) => s.token);
  const hrId = useAuthStore((s) => s.hrId);

  if (!token || !hrId) {
    try {
      useAuthStore.getState().logout();
    } catch (e) {
      
    }
    return <Navigate to="/signin" replace />;
  }

  return children;
};
