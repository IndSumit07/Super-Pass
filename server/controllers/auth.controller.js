import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { PendingUser } from "../models/pendingUser.model.js";
import { BlacklistToken } from "../models/blacklistToken.model.js";
import generateOtp from "../utils/generateOtp.js";
import {
  sendVerificationEmail,
  sendRegistrationSuccessEmail,
  sendPasswordResetEmail,
} from "../utils/sendEmail.js";

/* -------------------------------------------------------------------------- */
/*                                TOKEN HELPERS                               */
/* -------------------------------------------------------------------------- */

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.ACCESS_SECRET, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

/* -------------------------------------------------------------------------- */
/*                             REFRESH ACCESS TOKEN                           */
/* -------------------------------------------------------------------------- */

export const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "No refresh token provided" });

    const isBlacklisted = await BlacklistToken.findOne({ token });
    if (isBlacklisted)
      return res
        .status(403)
        .json({ success: false, message: "Token has been blacklisted" });

    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    const { accessToken } = generateTokens(decoded.id);

    return res.json({ success: true, accessToken });
  } catch {
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired refresh token" });
  }
};

/* -------------------------------------------------------------------------- */
/*                                  REGISTER                                  */
/* -------------------------------------------------------------------------- */

export const register = async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;
    if (!fullname || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    await PendingUser.deleteOne({ email }); // Remove old pending entries

    const otp = generateOtp();
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedOtp = await bcrypt.hash(otp, 10);

    await PendingUser.create({
      fullname,
      email,
      password: hashedPassword,
      registrationOtp: hashedOtp,
      role,
    });

    await sendVerificationEmail(email, otp);

    return res
      .status(201)
      .json({ success: true, message: "Verification email sent." });
  } catch (error) {
    console.error("[Register Error]:", error.message);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                           VERIFY REGISTRATION OTP                          */
/* -------------------------------------------------------------------------- */

export const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser)
      return res.status(400).json({
        success: false,
        message: "Session expired, please register again",
      });

    const isOtpValid = await bcrypt.compare(otp, pendingUser.registrationOtp);
    if (!isOtpValid)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    const newUser = await User.create({
      fullname: pendingUser.fullname,
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role,
    });

    await PendingUser.deleteOne({ email });

    await sendRegistrationSuccessEmail(
      email,
      pendingUser.fullname.firstname + " " + pendingUser.fullname.lastname
    );

    return res.json({
      success: true,
      message: "Registration verified successfully",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("[Verify OTP Error]:", error.message);
    return res.status(500).json({
      success: false,
      message: "Verification failed. Please try again.",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                                   LOGIN                                    */
/* -------------------------------------------------------------------------- */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Enhanced cookie security
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction, // Only use secure in production (requires HTTPS)
      sameSite: isProduction ? "strict" : "lax", // Strict in production, lax in development
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const safeUser = { ...user._doc };
    delete safeUser.password;

    return res.json({
      success: true,
      message: "Login successful",
      user: safeUser,
      accessToken,
    });
  } catch (error) {
    console.error("[Login Error]:", error.message);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                                   LOGOUT                                   */
/* -------------------------------------------------------------------------- */

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.split(" ")[1];

    if (refreshToken) await BlacklistToken.create({ token: refreshToken });
    if (accessToken) await BlacklistToken.create({ token: accessToken });

    res.clearCookie("refreshToken");

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("[Logout Error]:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Logout failed. Please try again." });
  }
};

/* -------------------------------------------------------------------------- */
/*                         PASSWORD RESET REQUEST (OTP)                       */
/* -------------------------------------------------------------------------- */

export const sendForgotPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.otp = {
      code: hashedOtp,
      subject: "Password Reset OTP",
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
    };

    await user.save();
    await sendPasswordResetEmail(email, otp);

    return res.json({
      success: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                        VERIFY PASSWORD RESET OTP                           */
/* -------------------------------------------------------------------------- */

export const verifyPasswordResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user || !user.otp?.code)
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });

    if (user.otp.expiresAt < Date.now())
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired" });

    const isOtpValid = await bcrypt.compare(otp, user.otp.code);
    if (!isOtpValid)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    user.otp.isVerified = true;
    await user.save();

    return res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                               RESET PASSWORD                               */
/* -------------------------------------------------------------------------- */

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // CRITICAL FIX: Ensure OTP was verified before allowing password reset
    if (!user.otp?.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify OTP before resetting password",
      });
    }

    // Check if OTP is still valid (not expired)
    if (user.otp.expiresAt < Date.now()) {
      user.otp = {};
      await user.save();
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = {}; // Clear OTP after successful reset
    await user.save();

    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
