// models/ticket.model.js
import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    // ownership/holder
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional if guest
    holderName: { type: String, required: true, trim: true },
    holderEmail: { type: String, trim: true },

    tier: { type: String, default: "General" }, // VIP, EarlyBird, etc.
    pricePaid: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },

    // issuance
    code: { type: String, unique: true, index: true }, // e.g., SP-XXXX-1234
    qrData: { type: String }, // what gets encoded in QR
    issuedAt: { type: Date, default: Date.now },

    // check-in
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: ["valid", "void", "refunded"],
      default: "valid",
    },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", TicketSchema);
export default Ticket;
