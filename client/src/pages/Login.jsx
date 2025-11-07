import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const { loading, loginUser } = useAuth();
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      email: form.email,
      password: form.password,
    };
    await loginUser(payload);
  };

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(900px_420px_at_84%_-10%,rgba(64,131,255,0.22),transparent_60%),radial-gradient(780px_360px_at_-18%_12%,rgba(0,174,255,0.12),transparent_60%)]" />
      <div
        aria-hidden="true"
        className="fixed right-[-14%] top-[-22%] w-[86%] h-[68%] opacity-45 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(120,150,255,.14) 0 1px, transparent 1px 32px),repeating-linear-gradient(90deg, rgba(120,150,255,.14) 0 1px, transparent 1px 32px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(72% 72% at 100% 0%, black 38%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(72% 72% at 100% 0%, black 38%, transparent 100%)",
        }}
      />

      {/* Centered card */}
      <div className="relative z-10 min-h-[100svh] grid place-items-center p-4">
        <div className="w-full max-w-[440px]">
          {/* Brand */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="h-3 w-3 rounded bg-blue-500" />
            <span className="h-3 w-3 rounded bg-indigo-500" />
            <span className="h-3 w-3 rounded bg-emerald-500" />
            <span className="ml-1 h-[10px] w-[10px] rounded-sm border border-white/20" />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-7 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
            <h1 className="text-center text-[26px] font-semibold tracking-tight">
              <span className="font-forum text-[#19cfbc]">SuperPass</span>
              <span className="text-white/80"> • Login</span>
            </h1>
            <p className="mt-1 text-center text-sm text-white/60">
              Welcome back! Sign in to continue.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs text-white/70">Email</label>
                <div className="mt-1 h-12 px-3 rounded-xl border border-white/10 bg-[#0c1222]/60 flex items-center gap-2 focus-within:border-white/20">
                  <Mail className="h-4 w-4 text-white/60" />
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={onChange}
                    className="w-full bg-transparent outline-none text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/70">Password</label>
                <div className="mt-1 h-12 px-3 rounded-xl border border-white/10 bg-[#0c1222]/60 flex items-center gap-2 focus-within:border-white/20">
                  <Lock className="h-4 w-4 text-white/60" />
                  <input
                    name="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={onChange}
                    className="w-full bg-transparent outline-none text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <Link
                  to="/forgot-password"
                  className="text-white/70 hover:text-white"
                >
                  Forgot password?
                </Link>
                <Link to="/register" className="text-white/70 hover:text-white">
                  Create account
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 transition inline-flex items-center justify-center gap-2"
              >
                {loading ? "Signing in..." : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-white/50">
            By continuing you agree to our Terms & Privacy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
