// controllers/checkin.controller.js
import Event from "../models/event.model.js";
import Pass from "../models/pass.model.js";
import Checkin from "../models/checkin.model.js";
import { verifyQR } from "../utils/qrSigner.js";
import { User } from "../models/user.model.js";

/** Ensure the current user owns the event */
async function assertOwner(eventId, userId) {
  const ev = await Event.findById(eventId).select("_id createdBy").lean();
  if (!ev) return { ok: false, status: 404, message: "Event not found" };
  if (String(ev.createdBy) !== String(userId)) {
    return {
      ok: false,
      status: 403,
      message: "Only organizer can scan/check-ins",
    };
  }
  return { ok: true, ev };
}

// POST /api/checkin/:eventId/scan
export const scanPass = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { code, notes } = req.body;
    const userId = req.user?._id;

    // Only event owner can scan
    const owner = await assertOwner(eventId, userId);
    if (!owner.ok) {
      return res
        .status(owner.status)
        .json({ success: false, message: owner.message });
    }

    // Verify QR
    const { valid, passId, reason } = verifyQR(code);
    if (!valid) {
      await Checkin.create({
        event: eventId,
        pass: null,
        user: null,
        scannedBy: userId,
        notes: `Invalid QR: ${reason || "unknown"}`,
        success: false,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid QR code." });
    }

    // ✅ Atomic organizer metric: increment qrValidated
    await User.updateOne({ _id: userId }, { $inc: { qrValidated: 1 } });

    // Lookup pass + user
    const pass = await Pass.findById(passId)
      .populate("user", "fullname firstName lastName email phone")
      .lean();

    if (!pass) {
      await Checkin.create({
        event: eventId,
        pass: passId,
        user: null,
        scannedBy: userId,
        notes: "Pass not found",
        success: false,
      });
      return res
        .status(404)
        .json({ success: false, message: "Pass not found." });
    }

    // Ensure pass belongs to this event
    if (String(pass.event) !== String(eventId)) {
      await Checkin.create({
        event: eventId,
        pass: pass._id,
        user: pass.user,
        scannedBy: userId,
        notes: "Pass belongs to different event",
        success: false,
      });
      return res.status(400).json({
        success: false,
        message: "Pass belongs to a different event.",
      });
    }

    // Idempotent mark: checkedIn = true
    await Pass.findByIdAndUpdate(pass._id, { $set: { checkedIn: true } });

    // Build a friendly name snapshot
    const name =
      (pass.user?.fullname?.firstname || pass.user?.firstName || "")
        .toString()
        .trim() +
      (pass.user?.fullname?.lastname || pass.user?.lastName
        ? " " + (pass.user?.fullname?.lastname || pass.user?.lastName)
        : "");

    const check = await Checkin.create({
      event: eventId,
      pass: pass._id,
      user: pass.user?._id || null,
      scannedBy: userId,
      notes: notes || "",
      success: true,
      userSnapshot: {
        name: name || "Guest",
        email: pass.user?.email || "",
        phone: pass.user?.phone || "",
      },
    });

    return res.json({
      success: true,
      data: {
        passId: pass._id,
        user: check.userSnapshot,
        checkedIn: true,
        checkinId: check._id,
        at: check.createdAt,
      },
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/checkin/:eventId/participants
export const listParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?._id;

    const event = await Event.findById(eventId).lean();
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    const ownerId =
      (typeof event.createdBy === "object" && event.createdBy?._id) ||
      event.createdBy?.toString?.() ||
      event.createdBy;

    if (!ownerId || String(ownerId) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const passes = await Pass.find({ event: eventId })
      .populate("user", "email phone fullname firstname lastname")
      .sort("-createdAt")
      .lean();

    // Normalize a stable shape
    const out = passes.map((p) => ({
      _id: p._id,
      checkedIn: !!p.checkedIn,
      createdAt: p.createdAt,
      userSnapshot: {
        name:
          p.userSnapshot?.name ||
          [p.user?.fullname?.firstname, p.user?.fullname?.lastname]
            .filter(Boolean)
            .join(" ") ||
          [p.user?.firstname, p.user?.lastname].filter(Boolean).join(" "),
        email: p.userSnapshot?.email || p.user?.email || "",
        phone: p.userSnapshot?.phone || p.user?.phone || "",
      },
      eventSnapshot: p.eventSnapshot || {},
    }));

    res.json({ success: true, data: out });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/checkin/:eventId
export const listCheckins = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?._id;

    const owner = await assertOwner(eventId, userId);
    if (!owner.ok) {
      return res
        .status(owner.status)
        .json({ success: false, message: owner.message });
    }

    const rows = await Checkin.find({ event: eventId })
      .sort("-createdAt")
      .lean();

    res.json({
      success: true,
      data: rows.map((r) => ({
        _id: r._id,
        success: r.success,
        notes: r.notes,
        at: r.createdAt,
        pass: r.pass,
        user: r.user,
        userSnapshot: r.userSnapshot,
      })),
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
