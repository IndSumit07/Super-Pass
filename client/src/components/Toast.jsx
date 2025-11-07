import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  CircleAlert,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

/**
 * SuperPaas Toast System
 * - Dark glass + top-right grid vibe
 * - Variants: success, error, info, warning
 * - Auto-dismiss + progress bar
 * - Accessible with aria-live
 */

const ToastContext = createContext(null);

export const ToastProvider = ({
  children,
  max = 4,
  defaultDuration = 4000,
}) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    ({ title, description, variant = "info", duration = defaultDuration }) => {
      const id = ++idRef.current;
      setToasts((t) => {
        const next = [{ id, title, description, variant, duration }, ...t];
        return next.slice(0, max);
      });
      return id;
    },
    [max, defaultDuration]
  );

  const api = useMemo(() => ({ push, remove }), [push, remove]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  const success = (opts) => ctx.push({ ...opts, variant: "success" });
  const error = (opts) => ctx.push({ ...opts, variant: "error" });
  const info = (opts) => ctx.push({ ...opts, variant: "info" });
  const warning = (opts) => ctx.push({ ...opts, variant: "warning" });
  return { ...ctx, success, error, info, warning };
};

/* ------------------------ UI ------------------------ */

const variantStyles = {
  success: {
    icon: CheckCircle2,
    ring: "from-emerald-400/30 to-emerald-400/10",
    bar: "bg-emerald-300",
    accent: "text-emerald-200",
    dot: "bg-emerald-400",
  },
  error: {
    icon: CircleAlert,
    ring: "from-rose-400/30 to-rose-400/10",
    bar: "bg-rose-300",
    accent: "text-rose-200",
    dot: "bg-rose-400",
  },
  info: {
    icon: Info,
    ring: "from-blue-400/30 to-blue-400/10",
    bar: "bg-blue-300",
    accent: "text-blue-200",
    dot: "bg-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    ring: "from-amber-400/30 to-amber-400/10",
    bar: "bg-amber-300",
    accent: "text-amber-200",
    dot: "bg-amber-400",
  },
};

const ToastViewport = ({ toasts, onClose }) => {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9998] flex items-start justify-end p-4 sm:p-6"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="w-full max-w-sm space-y-3 sm:space-y-3 ml-auto">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={() => onClose(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const { title, description, variant, duration } = toast;
  const Icon = variantStyles[variant]?.icon ?? Info;
  const ring = variantStyles[variant]?.ring;
  const bar = variantStyles[variant]?.bar;
  const accent = variantStyles[variant]?.accent;
  const dot = variantStyles[variant]?.dot;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="pointer-events-auto relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,.35)] overflow-hidden"
      role="status"
    >
      {/* subtle accent glow ring */}
      <div
        className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${ring} opacity-[0.18] pointer-events-none`}
      />

      <div className="relative p-4 pr-10">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-9 w-9 shrink-0 grid place-items-center rounded-xl border border-white/10 bg-[#0b1020]/50">
            <Icon className={`h-5 w-5 ${accent}`} />
          </div>
          <div className="min-w-0">
            {title && (
              <p className="text-[13.5px] font-medium text-white/90 leading-5">
                {title}
              </p>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-white/70 leading-5">
                {description}
              </p>
            )}
          </div>

          {/* close */}
          <button
            onClick={onClose}
            className="absolute right-2 top-2 p-1 rounded-md hover:bg-white/10 active:scale-95 transition"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* progress bar */}
      {duration ? (
        <motion.div
          className={`h-0.5 ${bar}`}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      ) : null}

      {/* tiny accent dot */}
      <div
        className={`absolute left-3 top-3 h-1.5 w-1.5 rounded-full ${dot}`}
      />
      <AutoDismiss ms={duration} onDone={onClose} />
    </motion.div>
  );
};

const AutoDismiss = ({ ms, onDone }) => {
  React.useEffect(() => {
    if (!ms) return;
    const t = setTimeout(onDone, ms);
    return () => clearTimeout(t);
  }, [ms, onDone]);
  return null;
};
