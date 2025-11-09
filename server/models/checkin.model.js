import mongoose from "mongoose";

const CheckinSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      index: true,
      required: true,
    },
    pass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pass",
      index: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },

    // who scanned (event owner / staff)
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    // quick snapshot
    userSnapshot: {
      name: String,
      email: String,
    },

    notes: String,
    success: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Checkin = mongoose.model("Checkin", CheckinSchema);
export default Checkin;
