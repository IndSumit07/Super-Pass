import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    otp: "",
  });
  const { registerUser, verifyEmail, loading } = useAuth();
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Live validation
  const isFirstValid = form.firstname.trim().length >= 3;
  const isLastValid = form.lastname.trim().length >= 3;
  const isPassValid = form.password.trim().length >= 6;

  const submitStep1 = async (e) => {
    e.preventDefault();
    if (!isFirstValid || !isLastValid || !isPassValid) return; // simple guard
    const payload = {
      fullname: {
        firstname: form.firstname,
        lastname: form.lastname,
      },
      email: form.email,
      password: form.password,
    };
    const response = await registerUser(payload);
    if (response) setStep(2);
  };

  const submitStep2 = async (e) => {
    e.preventDefault();
    const payload = { email: form.email, otp: form.otp };
    await verifyEmail(payload);
  };

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      {/* BG */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(900px_420px_at_84%_-10%,rgba(64,131,255,0.22),transparent_60%),radial-gradient(780px_360px_at_-18%_12%,rgba(0,174,255,0.12),transparent_60%)]" />

      {/* Centered card */}
      <div className="relative z-10 min-h-[100svh] grid place-items-center p-4">
        <div className="w-full max-w-[520px]">
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
              <span className="text-white/80"> • Register</span>
            </h1>
            <p className="mt-1 text-center text-sm text-white/60">
              {step === 1
                ? "Create your account"
                : "We’ve sent an OTP to your email"}
            </p>

            {/* STEP 1 */}
            {step === 1 && (
              <form onSubmit={submitStep1} className="mt-6 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-xs text-white/70">Full name</label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {/* First name */}
                    <div
                      className={`h-12 px-3 rounded-xl border bg-[#0c1222]/60 flex items-center gap-2 transition focus-within:border-white/20 ${
                        form.firstname
                          ? isFirstValid
                            ? "border-emerald-500/40"
                            : "border-rose-500/40"
                          : "border-white/10"
                      }`}
                    >
                      <User className="h-4 w-4 text-white/60" />
                      <input
                        name="firstname"
                        required
                        value={form.firstname}
                        onChange={onChange}
                        className="w-full bg-transparent outline-none text-sm"
                        placeholder="First name"
                      />
                      {form.firstname && (
                        <>
                          {isFirstValid ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-400" />
                          )}
                        </>
                      )}
                    </div>

                    {/* Last name */}
                    <div
                      className={`h-12 px-3 rounded-xl border bg-[#0c1222]/60 flex items-center gap-2 transition focus-within:border-white/20 ${
                        form.lastname
                          ? isLastValid
                            ? "border-emerald-500/40"
                            : "border-rose-500/40"
                          : "border-white/10"
                      }`}
                    >
                      <User className="h-4 w-4 text-white/60" />
                      <input
                        name="lastname"
                        required
                        value={form.lastname}
                        onChange={onChange}
                        className="w-full bg-transparent outline-none text-sm"
                        placeholder="Last name"
                      />
                      {form.lastname && (
                        <>
                          {isLastValid ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-400" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {(form.firstname || form.lastname) && (
                    <p className="mt-1 text-[11px] text-white/50">
                      {(!isFirstValid || !isLastValid) && (
                        <>Names must be at least 3 characters.</>
                      )}
                    </p>
                  )}
                </div>

                {/* Email */}
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

                {/* Password */}
                <div>
                  <label className="text-xs text-white/70">Password</label>
                  <div
                    className={`mt-1 h-12 px-3 rounded-xl border bg-[#0c1222]/60 flex items-center gap-2 transition focus-within:border-white/20 ${
                      form.password
                        ? isPassValid
                          ? "border-emerald-500/40"
                          : "border-rose-500/40"
                        : "border-white/10"
                    }`}
                  >
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
                    {form.password && (
                      <>
                        {isPassValid ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-400" />
                        )}
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-white/50">
                    Use at least 6 characters.
                  </p>
                </div>

                {/* Navigation & submit */}
                <div className="flex items-center justify-between text-xs">
                  <Link
                    to="/login"
                    className="text-white/70 hover:text-white inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to login
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 transition inline-flex items-center justify-center gap-2"
                >
                  {loading ? "Sending OTP..." : "Continue"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
              <form onSubmit={submitStep2} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs text-white/70">Enter OTP</label>
                  <div className="mt-1 h-12 px-3 rounded-xl border border-white/10 bg-[#0c1222]/60 flex items-center gap-2 focus-within:border-white/20">
                    <KeyRound className="h-4 w-4 text-white/60" />
                    <input
                      name="otp"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      value={form.otp}
                      onChange={onChange}
                      className="w-full bg-transparent outline-none text-sm"
                      placeholder="6-digit code"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-white/50">
                    We sent a code to <b>{form.email}</b>.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-white/70 hover:text-white inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Edit details
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await new Promise((r) => setTimeout(r, 600));
                      alert("OTP resent");
                    }}
                    className="text-white/70 hover:text-white"
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 transition inline-flex items-center justify-center gap-2"
                >
                  {loading ? "Verifying..." : "Verify & Register"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-white/50">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-white/70 hover:text-white underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
