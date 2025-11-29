// models/pass.model.js
import mongoose from "mongoose";

const TeamMemberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // If they register
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    invitedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date },
  },
  { _id: true }
);

const PassSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    eventSnapshot: {
      title: String,
      organization: String,
      start: Date,
      city: String,
      category: String,
      price: Number,
      logoUrl: String,
      bannerUrl: String,
      ticketTemplate: Object,
    },

    quantity: { type: Number, default: 1 },

    amount: { type: Number, required: true }, // in paise
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
      index: true,
    },

    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,

    // what's encoded into the QR
    qrPayload: { type: String, index: true },

    // on-ground scanning
    checkedIn: { type: Boolean, default: false },

    // NEW (optional, for better UI/audit)
    checkedInAt: { type: Date },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Team event fields
    isTeamPass: { type: Boolean, default: false },
    teamName: { type: String, trim: true },
    teamLeader: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Same as 'user' for team leader
    teamMembers: [TeamMemberSchema], // Array of team members with invite status
    teamSize: { type: Number, min: 1 }, // Total team size including leader
  },
  { timestamps: true }
);

const Pass = mongoose.model("Pass", PassSchema);
export default Pass;
