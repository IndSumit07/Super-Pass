import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [100, "Minimum withdrawal amount is ₹100"],
    },
    events: [
      {
        eventId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Event",
        },
        eventTitle: String,
        revenue: Number,
      },
    ],
    withdrawalType: {
      type: String,
      enum: ["event-wise", "bulk"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "upi", "razorpay"],
      required: true,
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
      upiId: String,
    },
    transactionId: String,
    processedAt: Date,
    failureReason: String,
    notes: String,
  },
  { timestamps: true }
);

// Index for faster queries
withdrawalSchema.index({ user: 1, status: 1 });
withdrawalSchema.index({ createdAt: -1 });

export const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
