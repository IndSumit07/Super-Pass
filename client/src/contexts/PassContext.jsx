// src/contexts/PassContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";
import axios from "axios";
import { useToast } from "../components/Toast";
import { useAuth } from "./AuthContext";

const PassContext = createContext();

export const PassProvider = ({ children }) => {
  const toast = useToast();
  const { forceRefresh } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      timeout: 30000,
    });

    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("accessToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    instance.interceptors.response.use(
      (res) => res,
      async (err) => {
        const original = err.config;
        if (!original || err?.response?.status !== 401)
          return Promise.reject(err);
        if (original._retry || original?.url?.includes("/auth/refresh")) {
          return Promise.reject(err);
        }
        original._retry = true;
        try {
          const newToken = await forceRefresh();
          if (newToken) {
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${newToken}`;
          }
          return instance(original);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    );
    return instance;
  }, [API_URL, forceRefresh]);

  // create Razorpay order → open checkout → verify → return pass
  const buyTicket = async ({ eventId, quantity = 1 }) => {
    setBuying(true);
    try {
      // 1) create order (or direct pass for free events)
      const { data } = await api.post("/payments/order", { eventId, quantity });
      if (!data?.success)
        throw new Error(data?.message || "Failed to create order");

      // DIRECT MODE (free events / amount < 100)
      if (data?.mode === "direct" && data?.data?._id) {
        toast.success({
          title: "Pass issued",
          description: "Free event pass created.",
        });
        return data.data;
      }

      // PAID MODE
      const { data: order, publicKey } = data;

      await loadRazorpayScript();

      const options = {
        key: publicKey,
        amount: order.amount,
        currency: order.currency,
        name: "SuperPaas",
        description: "Event Ticket",
        order_id: order.id,
        theme: { color: "#0ea5e9" },
        handler: async (response) => {
          const verifyRes = await api.post("/payments/verify", {
            eventId,
            orderId: order.id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (verifyRes?.data?.success) {
            toast.success({
              title: "Payment successful",
              description: "Pass issued!",
            });
            return verifyRes.data.data;
          } else {
            throw new Error(verifyRes?.data?.message || "Verification failed");
          }
        },
        modal: { ondismiss: () => {} },
        prefill: {},
      };

      const rz = new window.Razorpay(options);

      return new Promise((resolve, reject) => {
        rz.on("payment.failed", () => {
          toast.error({
            title: "Payment failed",
            description: "Please try again.",
          });
          reject(new Error("Payment failed"));
        });
        const originalHandler = options.handler;
        options.handler = async (resp) => {
          try {
            const pass = await originalHandler(resp);
            resolve(pass);
          } catch (e) {
            reject(e);
          }
        };
        rz.open();
      });
    } catch (err) {
      toast.error({
        title: "Purchase failed",
        description: err?.message || "Try again.",
      });
      return null;
    } finally {
      setBuying(false);
    }
  };

  const fetchMyPasses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/passes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (data?.success) setPasses(data.data || []);
    } catch (err) {
      toast.error({
        title: "Failed to load passes",
        description: err?.message || "",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPassById = async (id) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/passes/${id}`);
      return data?.success ? data.data : null;
    } catch (err) {
      toast.error({
        title: "Failed to load pass",
        description: err?.message || "",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PassContext.Provider
      value={{
        passes,
        loading,
        buying,
        buyTicket,
        fetchMyPasses,
        fetchPassById,
      }}
    >
      {children}
    </PassContext.Provider>
  );
};

export const usePasses = () => useContext(PassContext);

// util
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Razorpay SDK failed to load."));
    document.body.appendChild(script);
  });
}
