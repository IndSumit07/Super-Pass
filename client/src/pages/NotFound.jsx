import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search, Compass, Ghost } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space flex items-center justify-center">
      {/* background gradient layers */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(800px_400px_at_80%_-10%,rgba(25,207,188,0.15),transparent_70%),radial-gradient(700px_400px_at_-20%_10%,rgba(0,174,255,0.12),transparent_70%)]" />

      {/* content */}
      <div className="relative z-10 w-[92%] max-w-[600px] text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <Ghost className="h-20 w-20 text-[#19cfbc] opacity-80 drop-shadow-[0_0_8px_rgba(25,207,188,0.4)]" />
          </div>
          <h1 className="mt-6 text-5xl md:text-6xl font-forum font-bold tracking-tight text-white">
            404
          </h1>
          <p className="mt-2 text-lg text-white/80 font-medium">
            Oops! The page you’re looking for doesn’t exist.
          </p>
          <p className="text-sm text-white/60 max-w-[380px] mx-auto mt-1">
            It might have been moved, deleted, or you may have mistyped the URL.
          </p>

          {/* action buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-sm hover:bg-white/10 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-4 h-11 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>

            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-sm hover:bg-white/10 transition"
            >
              <Compass className="h-4 w-4" />
              Explore Events
            </Link>
          </div>

          {/* search suggestion */}
          <div className="mt-8 border-t border-white/10 pt-5">
            <div className="flex items-center justify-center gap-2 text-sm text-white/70">
              <Search className="h-4 w-4" />
              Try searching for events, passes, or creators from{" "}
              <Link
                to="/"
                className="text-[#19cfbc] hover:underline hover:text-[#25f1dc]"
              >
                Home
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
