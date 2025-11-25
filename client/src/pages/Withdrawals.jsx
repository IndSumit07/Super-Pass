import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  IndianRupee,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/Toast";

const Withdrawals = () => {
  const [dashboard, setDashboard] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawalType, setWithdrawalType] = useState("bulk");
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    upiId: "",
  });
  
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboard();
    fetchHistory();
  }, []);



  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/withdrawals/dashboard`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDashboard(response.data.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      toast.error({ title: "Error", description: "Failed to load dashboard data" });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/withdrawals/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory(response.data.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleWithdraw = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      
      const payload = {
        withdrawalType,
        paymentMethod,
        bankDetails: paymentMethod === "upi" 
          ? { upiId: bankDetails.upiId }
          : {
              accountNumber: bankDetails.accountNumber,
              ifscCode: bankDetails.ifscCode,
              accountHolderName: bankDetails.accountHolderName,
            },
      };

      if (withdrawalType === "event-wise") {
        payload.eventIds = selectedEvents;
      } else if (withdrawalType === "custom") {
        payload.customAmount = Number(customAmount);
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/withdrawals/request`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success({ 
        title: "Success", 
        description: "Withdrawal request submitted successfully! 🎉" 
      });
      setShowWithdrawModal(false);
      fetchDashboard();
      fetchHistory();
      
      // Reset form
      setSelectedEvents([]);
      setCustomAmount("");
      setBankDetails({
        accountNumber: "",
        ifscCode: "",
        accountHolderName: "",
        upiId: "",
      });
    } catch (error) {
      toast.error({ 
        title: "Request Failed", 
        description: error.response?.data?.message || "Failed to submit withdrawal request" 
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "processing":
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "failed":
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "border-yellow-400/30 bg-yellow-400/10 text-yellow-200";
      case "processing":
        return "border-blue-400/30 bg-blue-400/10 text-blue-200";
      case "completed":
        return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
      case "failed":
      case "cancelled":
        return "border-red-400/30 bg-red-400/10 text-red-200";
      default:
        return "border-white/10 bg-white/5 text-white/60";
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white flex items-center justify-center">
        <div className="text-sm text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      {/* Background layers - matching Dashboard theme */}
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

      {/* Content */}
      <div className="relative z-10 mx-auto w-[92%] max-w-[1200px] pb-28 pt-6 md:pt-10">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-blue-500" />
              <span className="h-3 w-3 rounded bg-indigo-500" />
              <span className="h-3 w-3 rounded bg-emerald-500" />
              <span className="ml-1 h-[10px] w-[10px] rounded-sm border border-white/20" />
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              <span className="font-forum text-[#19cfbc]">Withdrawals</span>
            </h1>
          </div>
          <p className="text-sm text-white/60 mt-2">Manage your earnings and withdrawal requests</p>
        </div>

        {user?.role === "admin" && (
          <div className="mb-6 flex justify-end">
            <Link
              to="/admin/withdrawals"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Admin Panel
            </Link>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/60">Total Revenue</p>
              <p className="mt-1 text-xl font-semibold">
                ₹{(dashboard?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 grid place-items-center">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
          </div>

          {/* Available Balance Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/60">Available Balance</p>
              <p className="mt-1 text-xl font-semibold text-[#19cfbc]">
                ₹{(dashboard?.availableBalance || 0).toLocaleString()}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 grid place-items-center">
              <Wallet className="h-5 w-5 text-[#19cfbc]" />
            </div>
          </div>
        </div>

        {/* Withdraw Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={!dashboard?.availableBalance || dashboard?.availableBalance < 100}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-4 h-11 text-sm hover:from-blue-500 hover:to-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Request Withdrawal
          </button>
          {(!dashboard?.availableBalance || dashboard?.availableBalance < 100) && (
            <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {dashboard?.availableBalance === 0 
                ? "No funds available for withdrawal." 
                : "Minimum withdrawal amount is ₹100."}
            </p>
          )}
        </div>

        {/* Event Revenue */}
        {dashboard?.eventRevenue && dashboard.eventRevenue.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 mb-6">
            <h2 className="text-lg font-semibold text-white/90 mb-4">Event Revenue</h2>
            <div className="divide-y divide-white/5">
              {dashboard.eventRevenue.map((event) => (
                <div key={event.eventId} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white/90">{event.eventTitle}</p>
                    <p className="text-xs text-white/60 mt-1">
                      {event.ticketsSold} tickets sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">₹{event.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Withdrawal History */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
          <h2 className="text-lg font-semibold text-white/90 mb-4">Withdrawal History</h2>
          {history.length === 0 ? (
            <p className="text-sm text-white/60 py-6 text-center">No withdrawal requests yet</p>
          ) : (
            <div className="divide-y divide-white/5">
              {history.map((withdrawal) => (
                <div
                  key={withdrawal._id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(withdrawal.status)}
                    <div>
                      <p className="font-medium text-white/90">
                        ₹{withdrawal.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-white/60">
                        {withdrawal.withdrawalType} • {withdrawal.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-white/60">
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowWithdrawModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0f1a]/95 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Request Withdrawal</h2>

            {/* Withdrawal Type */}
            <div className="mb-4">
              <label className="block text-sm text-white/70 mb-2">Withdrawal Type</label>
              <select
                value={withdrawalType}
                onChange={(e) => setWithdrawalType(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-white outline-none"
              >
                <option value="bulk">Withdraw All (Total Revenue)</option>
                <option value="event-wise">Event-wise</option>
                <option value="custom">Custom Amount</option>
              </select>
            </div>

            {/* Event Selection */}
            {withdrawalType === "event-wise" && (
              <div className="mb-4">
                <label className="block text-sm text-white/70 mb-2">Select Events</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {dashboard?.eventRevenue?.map((event) => (
                    <label key={event.eventId} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event.eventId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEvents([...selectedEvents, event.eventId]);
                          } else {
                            setSelectedEvents(selectedEvents.filter((id) => id !== event.eventId));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-white">{event.eventTitle} (₹{event.revenue})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Amount */}
            {withdrawalType === "custom" && (
              <div className="mb-4">
                <label className="block text-sm text-white/70 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="100"
                  max={dashboard?.availableBalance}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-white outline-none"
                />
                <p className="text-xs text-white/50 mt-1">
                  Max available: ₹{dashboard?.availableBalance}
                </p>
              </div>
            )}

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm text-white/70 mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-white outline-none"
              >
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            {/* Bank Details */}
            {paymentMethod === "upi" ? (
              <div className="mb-6">
                <label className="block text-sm text-white/70 mb-2">UPI ID</label>
                <input
                  type="text"
                  value={bankDetails.upiId}
                  onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                  placeholder="user@paytm"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-white outline-none placeholder:text-white/50"
                />
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <label className="block text-sm text-white/70 mb-2">Account Holder Name</label>
                  <input
                    type="text"
                    value={bankDetails.accountHolderName}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-white outline-none"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm text-white/70 mb-2">Account Number</label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-white outline-none"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm text-white/70 mb-2">IFSC Code</label>
                  <input
                    type="text"
                    value={bankDetails.ifscCode}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-white outline-none"
                  />
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 h-11 text-sm hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 h-11 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdrawals;
