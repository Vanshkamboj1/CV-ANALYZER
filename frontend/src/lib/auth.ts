import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "@/store/authStore";

interface JwtPayload {
  hrId: number;
  email: string;
  exp: number; // expiration timestamp (in seconds)
  iat: number;
}

/**
 * Safely extracts HR ID from the current JWT token in the zustand store.
 * Returns null if token is missing, invalid, or expired.
 */
export function getHrIdFromToken(): number | null {
  const token = useAuthStore.getState().token;
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    //Check if token expired
    const now = Date.now() / 1000; // current time in seconds
    if (decoded.exp && decoded.exp < now) {
      console.warn("⚠️ JWT token expired");
      try {
        useAuthStore.getState().logout();
      } catch (e) {
        // ignore
      }
      return null;
    }

    return decoded.hrId || null;
  } catch (err) {
    console.error("Invalid JWT token", err);
    try {
      useAuthStore.getState().logout();
    } catch (e) {
      // ignore
    }
    return null;
  }
}
