// src/components/Loader.jsx
import React from "react";
import { motion } from "framer-motion";

/**
 * Minimal, professional loader for SuperPaas
 * - Dark glass overlay
 * - Thin ring with a single teal orb orbit
 * - Accessible (aria)
 */
const Loader = () => {
  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
    >
      <div className="relative">
        {/* Outer soft glow */}
        <div className="pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(40%_40%_at_50%_50%,rgba(25,207,188,0.20),transparent_70%)]" />

        {/* Orbit wrapper (rotates) */}
        <motion.div
          className="relative h-16 w-16"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
          aria-hidden="true"
        >
          {/* Base ring */}
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div className="absolute inset-[2px] rounded-full border border-white/5" />

          {/* Orbiting dot */}
          <div className="absolute inset-0">
            <div className="absolute left-1/2 top-0 -translate-x-1/2">
              <div className="h-2.5 w-2.5 rounded-full bg-[#19cfbc] shadow-[0_0_12px_2px_rgba(25,207,188,0.55)]" />
            </div>
          </div>
        </motion.div>

        {/* Visually hidden live text for screen readers */}
        <span className="sr-only" role="status" aria-live="polite">
          Loading…
        </span>
      </div>
    </div>
  );
};

export default Loader;
