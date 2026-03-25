import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import  AuthLayout  from "../components/AuthLayout"; 
import client from "../api/client";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

const SignIn = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null); //missing in your code
  const navigate = useNavigate();

  const setToken = useAuthStore((state) => state.setToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);
  const token = useAuthStore((state) => state.token);

  //Redirect if already logged in
  useEffect(() => {
    if (token) navigate("/");
  }, [navigate, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await client.post("/hrusers/login", formData);

      if (!data?.accessToken) throw new Error("No token received from server");

  //Store token in Zustand + persist refresh token
  setToken(data.accessToken);
  if (data.refreshToken) setRefreshToken(data.refreshToken);

      toast.success("Login successful!");
      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid email or password";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign In" subtitle="Access your HR dashboard">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="you@example.com"
          />
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-sm text-center bg-red-50 py-2 rounded-xl">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-indigo-600 text-white py-3 rounded-xl transition 
          ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-700"}`}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Divider / Link */}
        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-indigo-600 font-medium hover:underline"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignIn;
