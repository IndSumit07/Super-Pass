// controllers/team.controller.js
import crypto from "crypto";
import TeamRegistration from "../models/teamRegistration.model.js";
import TeamMemberInvite from "../models/teamMemberInvite.model.js";
import Event from "../models/event.model.js";
import { User } from "../models/user.model.js";
import generateOtp from "../utils/generateOtp.js";
import {
  sendTeamInvitationEmail,
  sendTeamVerificationOTP,
  sendTeamStatusNotification,
} from "../utils/sendEmail.js";

const APP_URL = process.env.APP_URL || "http://localhost:5173";
const INVITE_EXPIRY_HOURS = 72; // 72 hours for invite expiry
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

/**
 * Create a team registration
 * POST /api/teams/register
 */
export const createTeamRegistration = async (req, res) => {
  try {
    const {
      eventId,
      teamName,
      teamSizeRequested,
      inviteEmails,
    } = req.body;
    const captainUserId = req.user._id;

    // Validate input
    if (!eventId || !teamSizeRequested || teamSizeRequested < 2) {
      return res.status(400).json({
        success: false,
        message: "Invalid team size. Minimum 2 members required.",
      });
    }

    if (!inviteEmails || !Array.isArray(inviteEmails)) {
      return res.status(400).json({
        success: false,
        message: "Invite emails must be provided as an array.",
      });
    }

    // Check if team size matches invites + captain
    if (inviteEmails.length !== teamSizeRequested - 1) {
      return res.status(400).json({
        success: false,
        message: `You must invite exactly ${teamSizeRequested - 1} members for a team of ${teamSizeRequested}.`,
      });
    }

    // Fetch event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    // Check if event supports teams
    if (!event.isTeamEvent) {
      return res.status(400).json({
        success: false,
        message: "This event does not support team registrations.",
      });
    }

    // Validate team size against event limits
    if (event.teamMax && teamSizeRequested > event.teamMax) {
      return res.status(400).json({
        success: false,
        message: `Team size exceeds maximum allowed (${event.teamMax}).`,
      });
    }

    if (event.teamMin && teamSizeRequested < event.teamMin) {
      return res.status(400).json({
        success: false,
        message: `Team size is below minimum required (${event.teamMin}).`,
      });
    }

    // Check for duplicate emails
    const uniqueEmails = [...new Set(inviteEmails.map(e => e.toLowerCase()))];
    if (uniqueEmails.length !== inviteEmails.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate email addresses are not allowed.",
      });
    }

    // Check if captain's email is in the invite list
    const captain = await User.findById(captainUserId);
    if (uniqueEmails.includes(captain.email.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "You cannot invite yourself.",
      });
    }

    // Calculate total amount
    const perPersonFee = event.price || 0;
    const totalAmount = perPersonFee * teamSizeRequested;

    // Create expiry date
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + INVITE_EXPIRY_HOURS);

    // Create team registration
    const teamRegistration = await TeamRegistration.create({
      event: eventId,
      captain: captainUserId,
      teamName: teamName || "",
      teamSizeRequested,
      totalAmount,
      paidAmount: 0,
      status: "pending",
      paymentStatus: "pending",
      eventSnapshot: {
        title: event.title,
        organization: event.organization,
        start: event.start,
        city: event.city,
        category: event.category,
        perPersonFee,
        logoUrl: event.logoUrl,
        bannerUrl: event.bannerUrl,
      },
      expiresAt,
    });

    // Create invites for each team member
    const invitePromises = uniqueEmails.map(async (email) => {
      const inviteToken = crypto.randomBytes(32).toString("hex");
      const invite = await TeamMemberInvite.create({
        teamRegistration: teamRegistration._id,
        inviteEmail: email,
        inviteToken,
        role: "member",
        isVerified: false,
        status: "invited",
        expiresAt,
        invitedBy: captainUserId,
      });

      // Send invitation email
      const verifyLink = `${APP_URL}/team-invite/${inviteToken}`;
      await sendTeamInvitationEmail(email, {
        eventTitle: event.title,
        teamName: teamName || "Unnamed Team",
        captainName: captain.name || captain.email,
        verifyLink,
        expiresAt,
      });

      return {
        email,
        status: "invited",
        expiresAt,
      };
    });

    const inviteStatuses = await Promise.all(invitePromises);

    // Also create an invite record for the captain (auto-verified)
    await TeamMemberInvite.create({
      teamRegistration: teamRegistration._id,
      inviteEmail: captain.email,
      inviteToken: crypto.randomBytes(32).toString("hex"),
      role: "captain",
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy: captainUserId,
      status: "verified",
      expiresAt,
      invitedBy: captainUserId,
    });

    res.status(201).json({
      success: true,
      data: {
        teamRegistrationId: teamRegistration._id,
        totalAmount,
        perPersonFee,
        teamSize: teamSizeRequested,
        status: "pending",
        expiresAt,
        inviteStatuses,
      },
      message: "Team registration created successfully. Invitations sent.",
    });
  } catch (error) {
    console.error("Create team registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create team registration.",
    });
  }
};

/**
 * Get team registration details
 * GET /api/teams/:teamId
 */
export const getTeamRegistration = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user._id;

    const team = await TeamRegistration.findById(teamId)
      .populate("event", "title organization start city category")
      .populate("captain", "name email");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team registration not found.",
      });
    }

    // Check if user is captain or a team member
    const isCaptain = team.captain._id.toString() === userId.toString();
    const memberInvite = await TeamMemberInvite.findOne({
      teamRegistration: teamId,
      verifiedBy: userId,
      isVerified: true,
    });

    if (!isCaptain && !memberInvite) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this team.",
      });
    }

    // Get all invites
    const invites = await TeamMemberInvite.find({
      teamRegistration: teamId,
    }).select("-currentOtp");

    res.json({
      success: true,
      data: {
        team,
        invites,
        isCaptain,
      },
    });
  } catch (error) {
    console.error("Get team registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch team registration.",
    });
  }
};

/**
 * Get invite details by token
 * GET /api/teams/invite/:token
 */
export const getInviteByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await TeamMemberInvite.findOne({
      inviteToken: token,
    }).populate({
      path: "teamRegistration",
      populate: [
        { path: "event", select: "title organization start city category" },
        { path: "captain", select: "name email" },
      ],
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found or invalid.",
      });
    }

    // Check if expired
    if (new Date() > invite.expiresAt) {
      invite.status = "expired";
      await invite.save();
      return res.status(410).json({
        success: false,
        message: "This invitation has expired.",
      });
    }

    // Check if already verified
    if (invite.isVerified) {
      return res.status(400).json({
        success: false,
        message: "This invitation has already been verified.",
      });
    }

    res.json({
      success: true,
      data: {
        invite: {
          email: invite.inviteEmail,
          role: invite.role,
          expiresAt: invite.expiresAt,
          status: invite.status,
        },
        team: {
          name: invite.teamRegistration.teamName,
          size: invite.teamRegistration.teamSizeRequested,
          captain: invite.teamRegistration.captain,
        },
        event: invite.teamRegistration.event,
      },
    });
  } catch (error) {
    console.error("Get invite by token error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch invitation.",
    });
  }
};

/**
 * Send OTP for team member verification
 * POST /api/teams/invite/:token/send-otp
 */
export const sendInviteOTP = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user._id;

    const invite = await TeamMemberInvite.findOne({
      inviteToken: token,
    }).populate({
      path: "teamRegistration",
      select: "teamName eventSnapshot",
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found.",
      });
    }

    // Check if expired
    if (new Date() > invite.expiresAt) {
      invite.status = "expired";
      await invite.save();
      return res.status(410).json({
        success: false,
        message: "This invitation has expired.",
      });
    }

    // Check if already verified
    if (invite.isVerified) {
      return res.status(400).json({
        success: false,
        message: "This invitation has already been verified.",
      });
    }

    // Verify email matches
    const user = await User.findById(userId);
    if (user.email.toLowerCase() !== invite.inviteEmail.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "You must be logged in with the invited email address.",
      });
    }

    // Check resend cooldown
    if (invite.lastOtpSentAt) {
      const secondsSinceLastOtp = (Date.now() - invite.lastOtpSentAt.getTime()) / 1000;
      if (secondsSinceLastOtp < OTP_RESEND_COOLDOWN_SECONDS) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastOtp)} seconds before requesting another OTP.`,
        });
      }
    }

    // Generate OTP
    const otp = generateOtp();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    invite.currentOtp = otp;
    invite.otpExpiresAt = otpExpiresAt;
    invite.lastOtpSentAt = new Date();
    await invite.save();

    // Send OTP email
    await sendTeamVerificationOTP(invite.inviteEmail, {
      otp,
      eventTitle: invite.teamRegistration.eventSnapshot.title,
      teamName: invite.teamRegistration.teamName,
    });

    res.json({
      success: true,
      message: "OTP sent to your email.",
      expiresAt: otpExpiresAt,
    });
  } catch (error) {
    console.error("Send invite OTP error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP.",
    });
  }
};

/**
 * Verify OTP and confirm team member
 * POST /api/teams/invite/:token/verify-otp
 */
export const verifyInviteOTP = async (req, res) => {
  try {
    const { token } = req.params;
    const { otp } = req.body;
    const userId = req.user._id;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required.",
      });
    }

    const invite = await TeamMemberInvite.findOne({
      inviteToken: token,
    }).populate("teamRegistration");

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found.",
      });
    }

    // Check if expired
    if (new Date() > invite.expiresAt) {
      invite.status = "expired";
      await invite.save();
      return res.status(410).json({
        success: false,
        message: "This invitation has expired.",
      });
    }

    // Check if already verified
    if (invite.isVerified) {
      return res.status(400).json({
        success: false,
        message: "This invitation has already been verified.",
      });
    }

    // Verify email matches
    const user = await User.findById(userId);
    if (user.email.toLowerCase() !== invite.inviteEmail.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "You must be logged in with the invited email address.",
      });
    }

    // Check OTP attempts
    if (invite.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Maximum OTP attempts exceeded. Please request a new OTP.",
      });
    }

    // Check if OTP exists and not expired
    if (!invite.currentOtp || !invite.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request an OTP first.",
      });
    }

    if (new Date() > invite.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    if (invite.currentOtp !== otp.trim()) {
      invite.otpAttempts += 1;
      await invite.save();
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${MAX_OTP_ATTEMPTS - invite.otpAttempts} attempts remaining.`,
      });
    }

    // Mark as verified
    invite.isVerified = true;
    invite.verifiedAt = new Date();
    invite.verifiedBy = userId;
    invite.status = "verified";
    invite.currentOtp = null;
    invite.otpExpiresAt = null;
    invite.otpAttempts = 0;
    await invite.save();

    // Check if all members are verified
    const allInvites = await TeamMemberInvite.find({
      teamRegistration: invite.teamRegistration._id,
    });

    const totalMembers = allInvites.length;
    const verifiedMembers = allInvites.filter((inv) => inv.isVerified).length;

    let teamStatus = "pending";
    let statusMessage = "";

    if (verifiedMembers === totalMembers) {
      teamStatus = "confirmed";
      statusMessage = "All team members have verified! Your team registration is now confirmed.";
      
      // Update team registration status
      await TeamRegistration.findByIdAndUpdate(invite.teamRegistration._id, {
        status: "confirmed",
      });

      // Send notification to captain
      const captain = await User.findById(invite.teamRegistration.captain);
      if (captain) {
        await sendTeamStatusNotification(captain.email, {
          eventTitle: invite.teamRegistration.eventSnapshot.title,
          teamName: invite.teamRegistration.teamName,
          status: "confirmed",
          message: statusMessage,
        });
      }
    } else {
      teamStatus = "partially_verified";
      statusMessage = `${verifiedMembers} of ${totalMembers} team members have verified.`;
      
      // Update team registration status
      await TeamRegistration.findByIdAndUpdate(invite.teamRegistration._id, {
        status: "partially_verified",
      });

      // Send notification to captain
      const captain = await User.findById(invite.teamRegistration.captain);
      if (captain) {
        await sendTeamStatusNotification(captain.email, {
          eventTitle: invite.teamRegistration.eventSnapshot.title,
          teamName: invite.teamRegistration.teamName,
          status: "partially_verified",
          message: `${user.name || user.email} has verified their participation. ${statusMessage}`,
        });
      }
    }

    res.json({
      success: true,
      message: "Verification successful!",
      data: {
        isVerified: true,
        teamStatus,
        verifiedMembers,
        totalMembers,
      },
    });
  } catch (error) {
    console.error("Verify invite OTP error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify OTP.",
    });
  }
};

/**
 * Get captain's team registrations
 * GET /api/teams/my-teams
 */
export const getMyTeams = async (req, res) => {
  try {
    const userId = req.user._id;

    const teams = await TeamRegistration.find({ captain: userId })
      .populate("event", "title organization start city category")
      .sort("-createdAt");

    // Get invite counts for each team
    const teamsWithInvites = await Promise.all(
      teams.map(async (team) => {
        const invites = await TeamMemberInvite.find({
          teamRegistration: team._id,
        });
        const verifiedCount = invites.filter((inv) => inv.isVerified).length;
        return {
          ...team.toObject(),
          totalInvites: invites.length,
          verifiedInvites: verifiedCount,
        };
      })
    );

    res.json({
      success: true,
      data: teamsWithInvites,
    });
  } catch (error) {
    console.error("Get my teams error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch teams.",
    });
  }
};

/**
 * Resend invitation
 * POST /api/teams/:teamId/resend-invite
 */
export const resendInvite = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email } = req.body;
    const userId = req.user._id;

    const team = await TeamRegistration.findById(teamId).populate("event");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team registration not found.",
      });
    }

    // Check if user is captain
    if (team.captain.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the team captain can resend invitations.",
      });
    }

    // Find the invite
    const invite = await TeamMemberInvite.findOne({
      teamRegistration: teamId,
      inviteEmail: email.toLowerCase(),
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invite not found for this email.",
      });
    }

    if (invite.isVerified) {
      return res.status(400).json({
        success: false,
        message: "This member has already verified.",
      });
    }

    // Update expiry
    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + INVITE_EXPIRY_HOURS);
    invite.expiresAt = newExpiresAt;
    invite.status = "invited";
    await invite.save();

    // Resend email
    const captain = await User.findById(userId);
    const verifyLink = `${APP_URL}/team-invite/${invite.inviteToken}`;
    await sendTeamInvitationEmail(email, {
      eventTitle: team.event.title,
      teamName: team.teamName || "Unnamed Team",
      captainName: captain.name || captain.email,
      verifyLink,
      expiresAt: newExpiresAt,
    });

    res.json({
      success: true,
      message: "Invitation resent successfully.",
    });
  } catch (error) {
    console.error("Resend invite error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to resend invitation.",
    });
  }
};

/**
 * Cancel team registration
 * DELETE /api/teams/:teamId
 */
export const cancelTeamRegistration = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const team = await TeamRegistration.findById(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team registration not found.",
      });
    }

    // Check if user is captain
    if (team.captain.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the team captain can cancel the registration.",
      });
    }

    // Update status
    team.status = "cancelled";
    team.cancelledReason = reason || "Cancelled by captain";
    team.cancelledAt = new Date();
    await team.save();

    // Update all invites
    await TeamMemberInvite.updateMany(
      { teamRegistration: teamId, isVerified: false },
      { status: "expired" }
    );

    res.json({
      success: true,
      message: "Team registration cancelled successfully.",
    });
  } catch (error) {
    console.error("Cancel team registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel team registration.",
    });
  }
};
