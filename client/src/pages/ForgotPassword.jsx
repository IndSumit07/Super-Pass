import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import PasswordInput from "../components/PasswordInput";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const { loading, forgotPassword, resetPassword, verifyResetOtp } = useAuth();
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    confirm: "",
  });

  // Validation State
  const [isPassValid, setIsPassValid] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Validation
  const isMatch =
    form.password && form.confirm && form.password === form.confirm;

  const submitEmail = async (e) => {
    e.preventDefault();
    const response = await forgotPassword(form.email);
    if (response) setStep(2);
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    const response = await verifyResetOtp(form.email, form.otp);
    if (response) setStep(3);
  };

  const submitNewPass = async (e) => {
    e.preventDefault();
    if (!isPassValid || !isMatch) return;
    await resetPassword(form.email, form.password);
  };

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(900px_420px_at_84%_-10%,rgba(64,131,255,0.22),transparent_60%),radial-gradient(780px_360px_at_-18%_12%,rgba(0,174,255,0.12),transparent_60%)]" />

      {/* Main container */}
      <div className="relative z-10 min-h-[100svh] grid place-items-center p-4">
        <div className="w-full max-w-[520px]">
          {/* Brand indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="h-3 w-3 rounded bg-blue-500" />
            <span className="h-3 w-3 rounded bg-indigo-500" />
            <span className="h-3 w-3 rounded bg-emerald-500" />
            <span className="ml-1 h-[10px] w-[10px] rounded-sm border border-white/20" />
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-7 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
            <h1 className="text-center text-[26px] font-semibold tracking-tight">
              <span className="font-forum text-[#19cfbc]">SuperPass</span>
              <span className="text-white/80"> • Reset Password</span>
            </h1>
            <p className="mt-1 text-center text-sm text-white/60">
              {step === 1 && "We’ll email you a reset code"}
              {step === 2 && "Enter the OTP we sent to your email"}
              {step === 3 && "Choose a new password"}
            </p>

            {/* STEP 1: Email */}
            {step === 1 && (
              <form onSubmit={submitEmail} className="mt-6 space-y-4">
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
                  {loading ? "Sending OTP..." : "Send OTP"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
              <form onSubmit={submitOtp} className="mt-6 space-y-4">
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
                    <ArrowLeft className="h-3.5 w-3.5" /> Change email
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
                  {loading ? "Verifying..." : "Verify OTP"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* STEP 3: New password */}
            {step === 3 && (
              <form onSubmit={submitNewPass} className="mt-6 space-y-4">
                {/* New Password */}
                <div>
                  <label className="text-xs text-white/70">New password</label>
                  <div className="mt-1">
                    <PasswordInput
                      value={form.password}
                      name="password"
                      onChange={onChange}
                      showStrength={true}
                      onValidationChange={setIsPassValid}
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs text-white/70">
                    Confirm password
                  </label>
                  <div className="mt-1">
                    <PasswordInput
                      value={form.confirm}
                      name="confirm"
                      onChange={onChange}
                      showStrength={false}
                      placeholder="Confirm password"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-white/50">
                    {form.confirm &&
                      (isMatch
                        ? "Passwords match."
                        : "Passwords do not match.")}
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-white/70 hover:text-white inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-12 rounded-xl transition inline-flex items-center justify-center gap-2 ${isPassValid && isMatch
                      ? "bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white"
                      : "bg-white/10 text-white/40 cursor-not-allowed"
                    }`}
                >
                  {loading ? "Saving..." : "Reset Password"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <p className="mt-4 text-center text-xs text-white/50">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="text-white/70 hover:text-white underline underline-offset-4"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
