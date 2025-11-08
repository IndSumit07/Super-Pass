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

    // snapshot at purchase time to keep visual consistency
    eventSnapshot: {
      title: String,
      organization: String,
      start: Date,
      city: String,
      category: String,
      price: Number,
      logoUrl: String,
      bannerUrl: String,
      ticketTemplate: Object, // same shape as event.ticketTemplate
    },

    // payment fields
    amount: { type: Number, required: true }, // in paise
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
      index: true,
    },

    // razorpay refs
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,

    // QR payload (what scanners will read)
    qrPayload: { type: String, index: true },

    // simple “admission status” toggle for on-ground scanning flows
    checkedIn: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Pass = mongoose.model("Pass", PassSchema);
export default Pass;
