// models/teamMemberInvite.model.js
import mongoose from "mongoose";

const TeamMemberInviteSchema = new mongoose.Schema(
  {
    teamRegistration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamRegistration",
      required: true,
      index: true,
    },
    inviteEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    inviteToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["captain", "member"],
      default: "member",
    },
    
    // Verification status
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // OTP management
    currentOtp: String,
    otpExpiresAt: Date,
    otpAttempts: {
      type: Number,
      default: 0,
    },
    lastOtpSentAt: Date,

    // Invite expiry
    expiresAt: {
      type: Date,
      required: true,
    },

    // Status tracking
    status: {
      type: String,
      enum: ["invited", "verified", "expired", "replaced"],
      default: "invited",
      index: true,
    },

    // Metadata
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    replacedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamMemberInvite",
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
TeamMemberInviteSchema.index({ teamRegistration: 1, inviteEmail: 1 });
TeamMemberInviteSchema.index({ inviteToken: 1, status: 1 });
TeamMemberInviteSchema.index({ status: 1, expiresAt: 1 });

const TeamMemberInvite = mongoose.model("TeamMemberInvite", TeamMemberInviteSchema);
export default TeamMemberInvite;
