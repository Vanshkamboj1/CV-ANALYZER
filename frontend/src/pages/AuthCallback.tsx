import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setRefreshToken } = useAuthStore();

  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");

    if (token) {
      setToken(token);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }
      toast.success("Successfully logged in with Google!");
      navigate("/");
    } else {
      toast.error("Failed to login with Google");
      navigate("/signin");
    }
  }, [searchParams, navigate, setToken, setRefreshToken]);

  return (
    <div className="h-screen flex items-center justify-center bg-[#f4f7f5]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
};

export default AuthCallback;
