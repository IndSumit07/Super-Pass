import { Withdrawal } from "../models/withdrawal.model.js";
import { User } from "../models/user.model.js";
import Event from "../models/event.model.js";
import Pass from "../models/pass.model.js";

import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Get user's withdrawal dashboard data
export const getWithdrawalDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      "totalRevenue availableBalance totalWithdrawn"
    );

    // Get event-wise revenue breakdown
    const events = await Event.find({ createdBy: userId })
      .select("title _id")
      .lean();

    const eventRevenue = await Promise.all(
      events.map(async (event) => {
        const passes = await Pass.find({
          event: event._id,
          status: "paid",
        }).lean();

        const revenue = passes.reduce(
          (sum, pass) => sum + (pass.amount / 100) * pass.quantity,
          0
        );

        return {
          eventId: event._id,
          eventTitle: event.title,
          revenue: revenue,
          ticketsSold: passes.reduce((sum, pass) => sum + pass.quantity, 0),
        };
      })
    );

    // Temporary fix for legacy users: Sync available balance if inconsistent
    // If totalRevenue > 0, but availableBalance is 0 and totalWithdrawn is 0, and no pending withdrawals
    if (user.totalRevenue > 0 && user.availableBalance === 0 && user.totalWithdrawn === 0) {
      const pendingWithdrawals = await Withdrawal.countDocuments({ 
        user: userId, 
        status: { $in: ["pending", "processing"] } 
      });

      if (pendingWithdrawals === 0) {
        console.log(`Syncing balance for user ${userId}: ${user.totalRevenue}`);
        user.availableBalance = user.totalRevenue;
        await user.save();
      }
    }

    res.json({
      success: true,
      data: {
        totalRevenue: user.totalRevenue || 0,
        availableBalance: user.availableBalance || 0,
        totalWithdrawn: user.totalWithdrawn || 0,
        eventRevenue: eventRevenue.filter((e) => e.revenue > 0),
      },
    });
  } catch (error) {
    console.error("[Withdrawal Dashboard Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch withdrawal dashboard",
    });
  }
};

// Request withdrawal (event-wise, bulk, or custom)
export const requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { withdrawalType, eventIds, paymentMethod, bankDetails, customAmount } = req.body;

    // Validate input
    if (!withdrawalType || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Withdrawal type and payment method are required",
      });
    }

    if (withdrawalType === "event-wise" && (!eventIds || eventIds.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one event",
      });
    }

    if (withdrawalType === "custom" && (!customAmount || customAmount < 100)) {
      return res.status(400).json({
        success: false,
        message: "Valid custom amount (min ₹100) is required",
      });
    }

    const user = await User.findById(userId);

    let amount = 0;
    let events = [];

    if (withdrawalType === "bulk") {
      // Withdraw all available balance
      amount = user.availableBalance || 0;
      
      // ... (existing bulk logic) ...
      // Get all events with revenue
      const userEvents = await Event.find({ createdBy: userId })
        .select("title _id")
        .lean();

      for (const event of userEvents) {
        const passes = await Pass.find({
          event: event._id,
          status: "paid",
        }).lean();

        const revenue = passes.reduce(
          (sum, pass) => sum + (pass.amount / 100) * pass.quantity,
          0
        );

        if (revenue > 0) {
          events.push({
            eventId: event._id,
            eventTitle: event.title,
            revenue: revenue,
          });
        }
      }
    } else if (withdrawalType === "custom") {
      amount = Number(customAmount);
    } else {
      // Event-wise withdrawal
      for (const eventId of eventIds) {
        const event = await Event.findById(eventId);
        if (!event || String(event.createdBy) !== String(userId)) {
          return res.status(403).json({
            success: false,
            message: "Unauthorized access to event",
          });
        }

        const passes = await Pass.find({
          event: eventId,
          status: "paid",
        }).lean();

        const revenue = passes.reduce(
          (sum, pass) => sum + (pass.amount / 100) * pass.quantity,
          0
        );

        amount += revenue;
        events.push({
          eventId: event._id,
          eventTitle: event.title,
          revenue: revenue,
          // Note: For event-wise, we might be withdrawing partial if multiple events.
          // But here we just sum them up.
        });
      }
    }

    // Validate minimum withdrawal amount
    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum withdrawal amount is ₹100",
      });
    }

    // Check if user has sufficient balance
    if (amount > user.availableBalance) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      user: userId,
      amount,
      events,
      withdrawalType,
      paymentMethod,
      bankDetails,
      status: "pending",
    });

    // Deduct from available balance (will be restored if withdrawal fails)
    user.availableBalance -= amount;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      data: withdrawal,
    });
  } catch (error) {
    console.error("[Request Withdrawal Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process withdrawal request",
    });
  }
};

// Get withdrawal history
export const getWithdrawalHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { user: userId };
    if (status) filter.status = status;

    const withdrawals = await Withdrawal.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Withdrawal.countDocuments(filter);

    res.json({
      success: true,
      data: withdrawals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("[Withdrawal History Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch withdrawal history",
    });
  }
};

// Cancel pending withdrawal
export const cancelWithdrawal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { withdrawalId } = req.params;

    const withdrawal = await Withdrawal.findOne({
      _id: withdrawalId,
      user: userId,
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal request not found",
      });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending withdrawals can be cancelled",
      });
    }

    withdrawal.status = "cancelled";
    await withdrawal.save();

    // Restore balance
    const user = await User.findById(userId);
    user.availableBalance += withdrawal.amount;
    await user.save();

    res.json({
      success: true,
      message: "Withdrawal cancelled successfully",
    });
  } catch (error) {
    console.error("[Cancel Withdrawal Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel withdrawal",
    });
  }
};

// Admin: Process withdrawal (mark as completed)
export const processWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { status, transactionId, failureReason } = req.body;

    const withdrawal = await Withdrawal.findById(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal request not found",
      });
    }

    // If approving, try to process via Razorpay Payouts
    let payoutId = transactionId;
    
    if (status === "completed" && !transactionId && process.env.RAZORPAY_KEY_ID) {
      try {
        // Create Fund Account (if needed) or use VPA
        // For simplicity, we'll use VPA payout if UPI
        // Or Bank Account if bank transfer
        
        const fundAccountDetails = withdrawal.paymentMethod === 'upi' 
          ? {
              account_type: 'vpa',
              vpa: { address: withdrawal.bankDetails.upiId }
            }
          : {
              account_type: 'bank_account',
              bank_account: {
                name: withdrawal.bankDetails.accountHolderName,
                ifsc: withdrawal.bankDetails.ifscCode,
                account_number: withdrawal.bankDetails.accountNumber
              }
            };

        // Note: In a real production flow, you'd create a Contact first, then Fund Account, then Payout.
        // This is a simplified implementation assuming Razorpay X is enabled.
        // If not enabled, this might fail, so we catch the error.
        
        // 1. Create Contact
        const contact = await razorpay.contacts.create({
          name: withdrawal.bankDetails.accountHolderName || "User",
          type: "vendor",
          reference_id: String(withdrawal.user),
        });

        // 2. Create Fund Account
        const fundAccount = await razorpay.fundAccount.create({
          contact_id: contact.id,
          ...fundAccountDetails
        });

        // 3. Create Payout
        const payout = await razorpay.payouts.create({
          account_number: process.env.RAZORPAY_X_ACCOUNT_NUMBER, // Required for payouts
          fund_account_id: fundAccount.id,
          amount: withdrawal.amount * 100, // paise
          currency: "INR",
          mode: "IMPS",
          purpose: "payout",
          queue_if_low_balance: true,
          reference_id: String(withdrawal._id),
        });

        payoutId = payout.id;
      } catch (rzpError) {
        console.error("Razorpay Payout Failed:", rzpError);
        // We don't fail the whole request, but we log it. 
        // Admin might need to process manually if API fails.
      }
    }

    withdrawal.status = status;
    withdrawal.transactionId = payoutId;
    withdrawal.failureReason = failureReason;

    if (status === "completed") {
      withdrawal.processedAt = new Date();
      
      // Update user's total withdrawn
      const user = await User.findById(withdrawal.user);
      user.totalWithdrawn += withdrawal.amount;
      await user.save();
    } else if (status === "failed") {
      // Restore balance on failure
      const user = await User.findById(withdrawal.user);
      user.availableBalance += withdrawal.amount;
      await user.save();
    }

    await withdrawal.save();

    res.json({
      success: true,
      message: `Withdrawal ${status} successfully`,
      data: withdrawal,
    });
  } catch (error) {
    console.error("[Process Withdrawal Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process withdrawal",
    });
  }
};

// Admin: Get all withdrawals
export const getAllWithdrawals = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const withdrawals = await Withdrawal.find(filter)
      .populate("user", "fullname email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Withdrawal.countDocuments(filter);

    res.json({
      success: true,
      data: withdrawals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("[Admin All Withdrawals Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all withdrawals",
    });
  }
};
