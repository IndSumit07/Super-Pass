import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "ultra"],
      default: "free",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "pending"],
      default: "active",
    },
    eventsHostedThisMonth: {
      type: Number,
      default: 0,
    },
    eventsLimit: {
      type: Number,
      default: 1, // Free plan: 1 event
    },
    currentPeriodStart: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      default: function () {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date;
      },
    },
    razorpay_subscription_id: String,
    razorpay_payment_id: String,
    cancelledAt: Date,
    cancelReason: String,
  },
  { timestamps: true }
);

// Reset monthly event count
subscriptionSchema.methods.resetMonthlyCount = function () {
  const now = new Date();
  if (now >= this.currentPeriodEnd) {
    this.eventsHostedThisMonth = 0;
    this.currentPeriodStart = now;
    const nextPeriod = new Date(now);
    nextPeriod.setMonth(nextPeriod.getMonth() + 1);
    this.currentPeriodEnd = nextPeriod;
  }
};

// Check if user can create event
subscriptionSchema.methods.canCreateEvent = function () {
  this.resetMonthlyCount();
  
  if (this.plan === "ultra") return true; // Unlimited
  if (this.plan === "pro") return this.eventsHostedThisMonth < 5;
  if (this.plan === "free") return this.eventsHostedThisMonth < 1;
  
  return false;
};

// Increment event count
subscriptionSchema.methods.incrementEventCount = function () {
  this.resetMonthlyCount();
  this.eventsHostedThisMonth += 1;
};

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
