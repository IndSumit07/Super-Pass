// src/pages/TeamInvite.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loader from "../components/Loader";
import {
  Users,
  Mail,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Shield,
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function TeamInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [teamStatus, setTeamStatus] = useState(null);

  useEffect(() => {
    fetchInviteDetails();
  }, [token]);

  const fetchInviteDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/teams/invite/${token}`);
      setInvite(response.data.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load invitation details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/team-invite/${token}`);
      return;
    }

    try {
      setSending(true);
      setOtpError("");
      const authToken = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/teams/invite/${token}/send-otp`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setOtpSent(true);
      setOtpError("");
    } catch (err) {
      setOtpError(
        err.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setVerifying(true);
      setOtpError("");
      const authToken = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/teams/invite/${token}/verify-otp`,
        { otp },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setVerified(true);
      setTeamStatus(response.data.data);
    } catch (err) {
      setOtpError(
        err.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
        <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
        <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invitation Error</h2>
            <p className="text-white/70 mb-4">{error}</p>
            <button
              onClick={() => navigate("/events")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Browse Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
        <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full rounded-2xl border border-green-500/20 bg-green-500/5 p-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Verification Successful!</h2>
            <p className="text-white/70 mb-4">
              You've successfully joined the team for {invite?.event?.title}.
            </p>
            {teamStatus && (
              <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm text-white/80">
                  Team Status: <span className="font-semibold text-[#19cfbc]">{teamStatus.teamStatus}</span>
                </p>
                <p className="text-xs text-white/60 mt-1">
                  {teamStatus.verifiedMembers} of {teamStatus.totalMembers} members verified
                </p>
              </div>
            )}
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(900px_420px_at_84%_-10%,rgba(64,131,255,0.22),transparent_60%),radial-gradient(780px_360px_at_-18%_12%,rgba(0,174,255,0.12),transparent_60%)]" />

      <div className="relative z-10 mx-auto w-[92%] max-w-[680px] py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/events")}
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </button>
          <h1 className="text-2xl md:text-3xl font-semibold">
            <span className="font-forum text-[#19cfbc]">Team</span>{" "}
            <span className="text-white/85">Invitation</span>
          </h1>
        </div>

        {/* Invitation Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-4">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-[#19cfbc]/10 border border-[#19cfbc]/20 grid place-items-center">
              <Users className="h-6 w-6 text-[#19cfbc]" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1">
                {invite?.team?.captain?.name || "Team Captain"} invited you
              </h2>
              <p className="text-sm text-white/60">
                Join their team for {invite?.event?.title}
              </p>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-white/60" />
              <span className="text-white/80">
                {new Date(invite?.event?.start).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-white/60" />
              <span className="text-white/80">{invite?.event?.city}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-white/60" />
              <span className="text-white/80">Invited as: {invite?.invite?.email}</span>
            </div>
            {invite?.team?.name && (
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-white/60" />
                <span className="text-white/80">Team: {invite?.team?.name}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-white/60" />
              <span className="text-white/80">
                Expires: {new Date(invite?.invite?.expiresAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Authentication Check */}
          {!isAuthenticated && (
            <div className="mb-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-200/90">
                <Shield className="h-4 w-4 inline mr-2" />
                You need to sign in with <strong>{invite?.invite?.email}</strong> to accept this invitation.
              </p>
            </div>
          )}

          {/* Email Mismatch Warning */}
          {isAuthenticated && user?.email?.toLowerCase() !== invite?.invite?.email?.toLowerCase() && (
            <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-200/90">
                <XCircle className="h-4 w-4 inline mr-2" />
                You're signed in as <strong>{user?.email}</strong>, but this invitation is for <strong>{invite?.invite?.email}</strong>.
                Please sign in with the correct account.
              </p>
            </div>
          )}

          {/* OTP Section */}
          {!otpSent ? (
            <button
              onClick={handleSendOTP}
              disabled={sending || !isAuthenticated || user?.email?.toLowerCase() !== invite?.invite?.email?.toLowerCase()}
              className={`w-full h-12 rounded-xl text-sm inline-flex items-center justify-center transition ${
                sending || !isAuthenticated || user?.email?.toLowerCase() !== invite?.invite?.email?.toLowerCase()
                  ? "bg-white/10 cursor-not-allowed text-white/60"
                  : "bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500"
              }`}
            >
              {sending ? "Sending OTP..." : "Accept Invitation & Send OTP"}
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/70 mb-2">
                  Enter 6-digit OTP sent to {invite?.invite?.email}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-12 px-4 rounded-lg border border-white/10 bg-[#0c1222]/60 outline-none text-center text-lg tracking-widest"
                  placeholder="000000"
                />
              </div>
              {otpError && (
                <p className="text-sm text-red-400">{otpError}</p>
              )}
              <button
                onClick={handleVerifyOTP}
                disabled={verifying || otp.length !== 6}
                className={`w-full h-12 rounded-xl text-sm inline-flex items-center justify-center transition ${
                  verifying || otp.length !== 6
                    ? "bg-white/10 cursor-not-allowed text-white/60"
                    : "bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-emerald-500"
                }`}
              >
                {verifying ? "Verifying..." : "Verify & Join Team"}
              </button>
              <button
                onClick={handleSendOTP}
                disabled={sending}
                className="w-full text-sm text-white/60 hover:text-white transition"
              >
                Resend OTP
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <p className="text-xs text-white/50 text-center">
          This invitation is valid until {new Date(invite?.invite?.expiresAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
