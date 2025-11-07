// src/pages/Start.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const Start = () => {
  const navigate = useNavigate();
  const goHome = () => navigate("/home");

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      {/* Fixed background layers so they always cover full viewport */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(800px_400px_at_85%_-10%,rgba(56,126,255,0.22),transparent_60%),radial-gradient(700px_350px_at_-20%_10%,rgba(0,174,255,0.12),transparent_60%)]" />
      <div
        aria-hidden="true"
        className="fixed right-[-15%] top-[-22%] w-[85%] h-[70%] opacity-45 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(112,141,255,0.14) 0 1px, transparent 1px 32px), repeating-linear-gradient(90deg, rgba(112,141,255,0.14) 0 1px, transparent 1px 32px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(70% 70% at 100% 0%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(70% 70% at 100% 0%, black 40%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-[100svh] items-center justify-center">
        <div className="flex flex-col justify-between h-[92vh] md:h-[86vh] w-[90%] max-w-[420px] py-10 safe-bottom">
          {/* Mini brand marks */}
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-blue-500" />
            <span className="h-3 w-3 rounded bg-indigo-500" />
            <span className="h-3 w-3 rounded bg-emerald-500" />
            <span className="ml-1 h-[10px] w-[10px] rounded-sm border border-white/20" />
          </div>

          {/* Hero copy */}
          <div className="select-none">
            <p className="text-xs tracking-[0.22em] uppercase text-white/60">
              Platform
            </p>
            <h1 className="mt-2 text-[28px] leading-[1.1] font-semibold tracking-wide text-white/90">
              <span className="font-forum text-[#19cfbc] text-6xl tracking-wide leading-snug">
                SuperPass
              </span>
              <br />
              <span className="text-[28px]">Automated Event Management</span>
            </h1>
            <p className="mt-4 text-[13.5px] leading-relaxed text-white/70">
              A MERN-based platform that automates registrations, secure
              payments, QR tickets, fast check-ins, tokens & analytics.
            </p>

            {/* Quick highlights */}
            <ul className="mt-5 grid grid-cols-2 gap-2">
              <li className="text-[12px] text-white/75 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                QR Check-In
              </li>
              <li className="text-[12px] text-white/75 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                Tokens & Vouchers
              </li>
              <li className="text-[12px] text-white/75 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                Live Analytics
              </li>
              <li className="text-[12px] text-white/75 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                Custom Branding
              </li>
            </ul>
          </div>

          {/* Get Started */}
          <div className="mt-8">
            <button
              onClick={goHome}
              className="group w-full h-12 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-blue-600 to-blue-600 text-white font-medium shadow-md backdrop-blur-sm transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
              aria-label="Get Started"
            >
              Get Started
              <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            <p className="mt-3 text-[11px] text-white/50 text-center">
              Continue to dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Start;
