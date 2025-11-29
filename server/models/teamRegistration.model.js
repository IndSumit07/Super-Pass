// models/teamRegistration.model.js
import mongoose from "mongoose";

const TeamRegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    teamName: {
      type: String,
      trim: true,
      default: "",
    },
    teamSizeRequested: {
      type: Number,
      required: true,
      min: 2,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending", "partially_verified", "confirmed", "cancelled", "expired"],
      default: "pending",
      index: true,
    },
    
    // Payment details
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },

    // Event snapshot for historical reference
    eventSnapshot: {
      title: String,
      organization: String,
      start: Date,
      city: String,
      category: String,
      perPersonFee: Number,
      logoUrl: String,
      bannerUrl: String,
    },

    // Expiry for the entire team registration
    expiresAt: {
      type: Date,
      required: true,
    },

    // Metadata
    notes: String,
    cancelledReason: String,
    cancelledAt: Date,
  },
  { timestamps: true }
);

// Index for efficient queries
TeamRegistrationSchema.index({ event: 1, captain: 1 });
TeamRegistrationSchema.index({ status: 1, expiresAt: 1 });

const TeamRegistration = mongoose.model("TeamRegistration", TeamRegistrationSchema);
export default TeamRegistration;
