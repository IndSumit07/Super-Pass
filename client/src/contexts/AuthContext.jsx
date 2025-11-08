// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useToast } from "../components/Toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const toast = useToast();

  const API_URL = import.meta.env.VITE_API_URL;

  // --- single-flight refresh + timer refs (ADDED) ---
  const isRefreshingRef = useRef(false);
  const refreshPromiseRef = useRef(null);
  const pendingRequestsRef = useRef([]);
  const clearRefreshTimerRef = useRef(() => {});

  // --- helpers (ADDED) ---
  const parseJwtExp = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return typeof payload?.exp === "number" ? payload.exp : null;
    } catch {
      return null;
    }
  };

  const scheduleEarlyRefresh = (accessToken) => {
    const exp = parseJwtExp(accessToken);
    if (!exp) return () => {};
    const now = Math.floor(Date.now() / 1000);
    const delayMs = Math.max((exp - 120 - now) * 1000, 1000); // refresh 120s early
    const id = setTimeout(() => {
      forceRefresh().catch(() => {
        // handled in forceRefresh
      });
    }, delayMs);
    return () => clearTimeout(id);
  };

  const startEarlyRefresh = (accessToken) => {
    clearRefreshTimerRef.current?.();
    clearRefreshTimerRef.current = scheduleEarlyRefresh(accessToken);
  };

  const setSession = (accessToken, userObj) => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      startEarlyRefresh(accessToken);
    }
    if (userObj) {
      setUser(userObj);
      setIsAuthenticated(true);
    }
  };

  const clearSession = () => {
    clearRefreshTimerRef.current?.();
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common.Authorization;
    setUser(null);
    setIsAuthenticated(false);
  };

  const notifyPending = (err, token = null) => {
    const queue = pendingRequestsRef.current;
    pendingRequestsRef.current = [];
    queue.forEach(({ resolve, reject }) => {
      if (err) reject(err);
      else resolve(token);
    });
  };

  const forceRefresh = async () => {
    // de-dupe concurrent refreshes
    if (isRefreshingRef.current && refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }
    isRefreshingRef.current = true;

    refreshPromiseRef.current = api
      .post("/auth/refresh") // expects { accessToken }, refresh token in httpOnly cookie
      .then((res) => {
        const newToken = res?.data?.accessToken;
        if (!newToken) throw new Error("No accessToken in refresh response");
        localStorage.setItem("accessToken", newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        startEarlyRefresh(newToken);
        notifyPending(null, newToken);
        return newToken;
      })
      .catch((err) => {
        notifyPending(err);
        clearSession();
        toast.info({
          title: "Session expired",
          description: "Please sign in again.",
        });
        navigate("/login");
        throw err;
      })
      .finally(() => {
        isRefreshingRef.current = false;
        refreshPromiseRef.current = null;
      });

    return refreshPromiseRef.current;
  };

  // Create a dedicated axios instance
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      withCredentials: true,
    });

    // Inject Bearer token if present
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("accessToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    // Handle 401s: try refresh once, then retry original; if that fails => logout (ADDED)
    instance.interceptors.response.use(
      (res) => res,
      async (err) => {
        const original = err.config;

        // If there's no response or no config, or it's not a 401, just bail
        if (!original || err?.response?.status !== 401) {
          return Promise.reject(err);
        }

        // Avoid trying to refresh on the refresh endpoint itself
        if (original?.url?.includes("/auth/refresh")) {
          return Promise.reject(err);
        }

        // prevent infinite loop
        if (original._retry) {
          return Promise.reject(err);
        }
        original._retry = true;

        // If a refresh is already in progress, queue behind it
        if (isRefreshingRef.current && refreshPromiseRef.current) {
          return new Promise((resolve, reject) => {
            pendingRequestsRef.current.push({
              resolve: (newToken) => {
                if (newToken) {
                  original.headers.Authorization = `Bearer ${newToken}`;
                }
                resolve(instance(original));
              },
              reject,
            });
          });
        }

        // Start a refresh, then retry once
        try {
          const newToken = await forceRefresh();
          original.headers.Authorization = `Bearer ${newToken}`;
          return instance(original);
        } catch (refreshErr) {
          // forceRefresh already cleared session + navigated
          return Promise.reject(refreshErr);
        }
      }
    );

    return instance;
  }, [API_URL, navigate, toast]);

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // initial app load
  const [actionLoading, setActionLoading] = useState(false); // per-action overlay

  // 🧠 Fetch Current User
  const fetchUser = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }
    // ensure header is set after hard reload
    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    try {
      const { data } = await api.get("/user/profile");
      if (data?.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        startEarlyRefresh(token); // (ADDED) resume early refresh after reload
      } else {
        clearSession();
      }
    } catch {
      // If 401, interceptor will attempt refresh; on failure it logs out
      // We still finish initial loading state
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Register (Step 1: send OTP)
  const registerUser = async (payload) => {
    setActionLoading(true);
    try {
      const { data } = await api.post("/auth/register", payload);
      toast.success({
        title: "OTP sent",
        description: data?.message || "Check your email for the code.",
      });
      return true;
    } catch (err) {
      toast.error({
        title: "Registration failed",
        description: err.response?.data?.message || "Try again.",
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // 🔹 Verify Registration OTP (Step 2)
  const verifyEmail = async (payload) => {
    setActionLoading(true);
    try {
      const { data } = await api.post("/auth/verify-registration-otp", payload);
      toast.success({
        title: "Email verified",
        description: data?.message || "You can now sign in.",
      });
      navigate("/login");
      return true;
    } catch (err) {
      toast.error({
        title: "Invalid OTP",
        description:
          err.response?.data?.message || "Please check and try again.",
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // 🔹 Login
  const loginUser = async (credentials) => {
    setActionLoading(true);
    try {
      const { data } = await api.post("/auth/login", credentials);
      const accessToken = data?.accessToken;
      if (accessToken) {
        setSession(accessToken, data.user); // (ADDED) saves token + starts early refresh
      } else {
        // if backend returns only cookie refresh and no access token, you might fetch profile next
        // For now we require accessToken to proceed cleanly.
        throw new Error("Login response missing accessToken");
      }
      toast.success({
        title: "Welcome back",
        description: "Login successful.",
      });
      navigate("/home"); // or "/"
      return true;
    } catch (err) {
      toast.error({
        title: "Login failed",
        description: err.response?.data?.message || "Check your details.",
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // 🔹 Logout
  const logoutUser = async () => {
    setActionLoading(true);
    try {
      await api.post("/auth/logout");
    } catch (_e) {
      // ignore network errors on logout
    } finally {
      clearSession();
      toast.info({ title: "Logged out", description: "See you soon." });
      setActionLoading(false);
      navigate("/login");
    }
  };

  // 🔹 Forgot Password: request OTP
  const forgotPassword = async (email) => {
    setActionLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      if (data?.success) {
        toast.success({
          title: "OTP sent",
          description: data.message || "Check your inbox.",
        });
        return true;
      }
      return false;
    } catch (err) {
      toast.error({
        title: "Request failed",
        description: err.response?.data?.message || "Try again.",
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // 🔹 Verify Reset OTP
  const verifyResetOtp = async (email, otp) => {
    setActionLoading(true);
    try {
      const { data } = await api.post("/auth/verify-password-reset-otp", {
        email,
        otp,
      });
      if (data?.success) {
        toast.success({
          title: "OTP verified",
          description: data.message || "Continue to set a new password.",
        });
        return true;
      }
      return false;
    } catch (err) {
      toast.error({
        title: "OTP verification failed",
        description: err.response?.data?.message || "Please try again.",
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // 🔹 Reset Password
  const resetPassword = async (email, newPassword) => {
    setActionLoading(true);
    try {
      const { data } = await api.post("/auth/reset-password", {
        email,
        newPassword,
      });
      toast.success({
        title: "Password updated",
        description: data?.message || "You can sign in now.",
      });
      navigate("/login");
      return true;
    } catch (err) {
      toast.error({
        title: "Reset failed",
        description: err.response?.data?.message || "Please try again.",
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    // attach token header on boot (hard reload)
    const t = localStorage.getItem("accessToken");
    if (t) {
      api.defaults.headers.common.Authorization = `Bearer ${t}`;
    }
    fetchUser();
    return () => clearRefreshTimerRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Loader />;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        setLoading,
        actionLoading,
        setActionLoading,
        registerUser,
        verifyEmail,
        loginUser,
        logoutUser,
        forgotPassword,
        resetPassword,
        verifyResetOtp,
        // Optional: expose for debugging
        forceRefresh,
      }}
    >
      {children}
      {/* Action overlay loader */}
      {actionLoading && <Loader />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
