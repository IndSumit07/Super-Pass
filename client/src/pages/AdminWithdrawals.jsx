import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Search,
  Filter,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import { useToast } from "../components/Toast";
import { useAuth } from "../contexts/AuthContext";

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [processingId, setProcessingId] = useState(null);
  
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchWithdrawals();
  }, [filterStatus]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const query = filterStatus ? `?status=${filterStatus}` : "";
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/withdrawals/admin/all${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWithdrawals(response.data.data);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast.error({ title: "Error", description: "Failed to load withdrawals" });
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id, status, failureReason = "") => {
    let transactionId = "";
    
    if (status === "completed") {
      transactionId = prompt("Enter Transaction ID (Optional for manual payments):");
      if (transactionId === null) return; // Cancelled
    } else {
      if (!window.confirm(`Are you sure you want to mark this as ${status}?`)) return;
    }

    try {
      setProcessingId(id);
      const token = localStorage.getItem("accessToken");
      
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/withdrawals/${id}/process`,
        { status, failureReason, transactionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success({ 
        title: "Success", 
        description: `Withdrawal marked as ${status}` 
      });
      fetchWithdrawals();
    } catch (error) {
      toast.error({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to process withdrawal" 
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "processing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "completed":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "failed":
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-white/5 text-white/60 border-white/10";
    }
  };

  if (loading && withdrawals.length === 0) {
    return (
      <div className="min-h-screen bg-[#05070d] flex items-center justify-center text-white/60">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070d] text-white font-space p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-semibold">Admin Withdrawals</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#0b0f1a] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/50"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="bg-[#0b0f1a] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/60 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Method</th>
                  <th className="px-6 py-4 font-medium">Details</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {withdrawals.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <div className="font-medium">{item.user?.fullname?.firstname} {item.user?.fullname?.lastname}</div>
                      <div className="text-xs text-white/50">{item.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ₹{item.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {item.paymentMethod.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        {item.paymentMethod === "upi" ? (
                          <div>UPI: <span className="text-white/80">{item.bankDetails?.upiId}</span></div>
                        ) : (
                          <>
                            <div>Acc: <span className="text-white/80">{item.bankDetails?.accountNumber}</span></div>
                            <div>IFSC: <span className="text-white/80">{item.bankDetails?.ifscCode}</span></div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs border ${getStatusColor(item.status)}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status === "pending" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleProcess(item._id, "completed")}
                            disabled={processingId === item._id}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt("Enter rejection reason:");
                              if (reason) handleProcess(item._id, "failed", reason);
                            }}
                            disabled={processingId === item._id}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {withdrawals.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-white/40">
                      No withdrawal requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawals;
