import mongoose from "mongoose";

const HelpTicketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    subject: { type: String, required: true, trim: true, maxlength: 140 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: {
      type: String,
      enum: ["open", "in_progress", "closed"],
      default: "open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("HelpTicket", HelpTicketSchema);
