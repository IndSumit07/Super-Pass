import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      firstname: {
        type: String,
        required: true,
        trim: true,
        minLength: [3, "First name must be at least 3 characters long"],
        maxLength: [30, "First name must be at most 30 characters long"],
      },
      lastname: {
        type: String,
        trim: true,
        minLength: [3, "Last name must be at least 3 characters long"],
        maxLength: [30, "Last name must be at most 30 characters long"],
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minLength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    otp: {
      subject: { type: String },
      code: { type: String },
      expiresAt: {
        type: Date,
      },
      isVerified: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
