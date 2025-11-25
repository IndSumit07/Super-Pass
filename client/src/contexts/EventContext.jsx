// src/contexts/EventContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { useToast } from "../components/Toast";
import { useAuth } from "./AuthContext";

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    forceRefresh,
  } = useAuth();
  const toast = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  const [events, setEvents] = useState([]);
  const [singleEvent, setSingleEvent] = useState(null);

  // loading states (mirror AuthContext style)
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false); // create/update/delete
  const isBusy = loading || actionLoading;

  // ---- Axios instance (aligned with AuthContext) ----
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

    // 401 -> try refresh once via AuthContext, then retry original
    instance.interceptors.response.use(
      (res) => res,
      async (err) => {
        const original = err.config;
        if (!original || err?.response?.status !== 401) {
          return Promise.reject(err);
        }
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

  // ==========
  //  API Calls ==========

  // Fetch list
  const fetchEvents = async (params = {}) => {
    if (authLoading) return; // wait for auth resolution
    setLoading(true);
    try {
      const { data } = await api.get("/events", { params });
      if (data?.success) {
        setEvents(data.data || []);
      }
    } catch (err) {
      toast.error({
        title: "Failed to fetch events",
        description: err.response?.data?.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch single
  const fetchEventById = async (idOrSlug) => {
    if (!idOrSlug || authLoading) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/events/${idOrSlug}`);
      if (data?.success) {
        setSingleEvent(data.data || null);
      }
    } catch (err) {
      toast.error({
        title: "Failed to load event",
        description: err.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create (multipart)
  // IMPORTANT: do not set Content-Type for multipart; let Axios add the boundary
  const createEvent = async (formData) => {
    if (!isAuthenticated) {
      toast.error({
        title: "Login required",
        description: "Please sign in to create an event.",
      });
      return null;
    }
    setActionLoading(true);
    try {
      const { data } = await api.post("/events/create", formData, {
        headers: {
          // no "Content-Type" here!
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (data?.success) {
        toast.success({
          title: "Event created 🎉",
          description: "Your event has been added to SuperPaas.",
        });
        setEvents((prev) => [data.data, ...prev]);
        return data.data;
      }
      return null;
    } catch (err) {
      toast.error({
        title: "Failed to create event",
        description:
          err.response?.data?.message ||
          "Please check your inputs and try again.",
      });
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  // Update
  const updateEvent = async (idOrSlug, formData) => {
    if (!isAuthenticated) {
      toast.error({
        title: "Login required",
        description: "Please sign in to update an event.",
      });
      return null;
    }
    setActionLoading(true);
    try {
      const { data } = await api.put(`/events/${idOrSlug}`, formData, {
        headers: {
          // let Axios set the multipart header automatically
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (data?.success) {
        toast.success({
          title: "Event updated ✅",
          description: "Your changes have been saved.",
        });
        setEvents((prev) =>
          prev.map((e) => (e._id === data.data._id ? data.data : e))
        );
        if (singleEvent?._id === data.data._id) setSingleEvent(data.data);
        return data.data;
      }
      return null;
    } catch (err) {
      toast.error({
        title: "Failed to update event",
        description: err.response?.data?.message || "Please try again later.",
      });
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  // Delete
  const deleteEvent = async (idOrSlug) => {
    if (!isAuthenticated) {
      toast.error({
        title: "Login required",
        description: "Please sign in to delete an event.",
      });
      return;
    }
    setActionLoading(true);
    try {
      const { data } = await api.delete(`/events/${idOrSlug}`);
      if (data?.success) {
        setEvents((prev) => prev.filter((e) => e._id !== idOrSlug));
        if (singleEvent?._id === idOrSlug) setSingleEvent(null);
        toast.info({
          title: "Event deleted",
          description: "The event has been removed successfully.",
        });
      }
    } catch (err) {
      toast.error({
        title: "Failed to delete event",
        description: err.response?.data?.message || "Please try again.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Mine (organized by me)
  const myEvents = React.useMemo(
    () =>
      events.filter(
        (e) => e.createdBy?._id === user?._id || e.createdBy === user?._id
      ),
    [events, user]
  );

  // Auto-fetch when auth finishes
  useEffect(() => {
    if (!authLoading) fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, API_URL]);

  return (
    <EventContext.Provider
      value={{
        // data
        events,
        myEvents,
        singleEvent,
        // loading
        loading, // list/details
        actionLoading, // create/update/delete
        isBusy,
        // actions
        fetchEvents,
        fetchEventById,
        createEvent,
        updateEvent,
        deleteEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => useContext(EventContext);
