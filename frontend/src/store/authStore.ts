import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  hrId: number;
  email: string;
  exp: number;
  iat: number;
}

interface AuthState {
  hrId: number | null;
  email: string | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  logout: () => void;
}

//Initialize state by decoding existing token
const storedToken = localStorage.getItem("accessToken");
let decoded: JwtPayload | null = null;
if (storedToken) {
  try {
    decoded = jwtDecode<JwtPayload>(storedToken);
  } catch (err) {
    console.warn("Invalid stored JWT, clearing...");
    localStorage.removeItem("accessToken");
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  hrId: decoded?.hrId ?? null,
  email: decoded?.email ?? null,
  token: storedToken ?? null,
  refreshToken: localStorage.getItem("refreshToken") ?? null,
  isAuthenticated: !!storedToken && !!decoded?.hrId,

  //Set token + decode JWT to store hrId + email
  setToken: (token: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      set({
        hrId: decoded.hrId,
        email: decoded.email,
        token,
        isAuthenticated: true,
      });
      localStorage.setItem("accessToken", token);
    } catch (err) {
      console.error("Invalid JWT:", err);
      set({ hrId: null, email: null, token: null, isAuthenticated: false });
    }
  },

  //Keep refresh token synced
  setRefreshToken: (token: string) => {
    try {
      localStorage.setItem("refreshToken", token);
    } catch (e) {
      console.warn("Could not persist refreshToken", e);
    }
    set({ refreshToken: token });
  },

  //Logout clears everything
  logout: () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } catch (e) {
      console.warn("Could not clear persisted tokens", e);
    }
    set({
      hrId: null,
      email: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));
