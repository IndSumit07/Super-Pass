// models/pass.model.js
import mongoose from "mongoose";

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

    // what’s encoded into the QR
    qrPayload: { type: String, index: true },

    // on-ground scanning
    checkedIn: { type: Boolean, default: false },

    // NEW (optional, for better UI/audit)
    checkedInAt: { type: Date },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Pass = mongoose.model("Pass", PassSchema);
export default Pass;
