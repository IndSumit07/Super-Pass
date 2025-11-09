import Event from "../models/event.model.js";
import Pass from "../models/pass.model.js";
import Checkin from "../models/checkin.model.js";
import { verifyQR } from "../utils/qrSigner.js";

// Ensure user is event owner
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

    const owner = await assertOwner(eventId, userId);
    if (!owner.ok)
      return res
        .status(owner.status)
        .json({ success: false, message: owner.message });

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

    const pass = await Pass.findById(passId)
      .populate("user", "fullname firstName lastName email")
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

    // Mark checkedIn on pass (idempotent)
    await Pass.findByIdAndUpdate(pass._id, { $set: { checkedIn: true } });

    const name =
      pass.user?.fullname?.firstname && pass.user?.fullname?.lastname
        ? `${pass.user.fullname.firstname} ${pass.user.fullname.lastname}`
        : pass.user?.firstName || pass.user?.lastName
        ? `${pass.user.firstName || ""} ${pass.user.lastName || ""}`.trim()
        : "Guest";

    const check = await Checkin.create({
      event: eventId,
      pass: pass._id,
      user: pass.user?._id,
      scannedBy: userId,
      notes: notes || "",
      success: true,
      userSnapshot: { name, email: pass.user?.email || "" },
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

// GET /api/checkin/:eventId
export const listCheckins = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?._id;

    const owner = await assertOwner(eventId, userId);
    if (!owner.ok)
      return res
        .status(owner.status)
        .json({ success: false, message: owner.message });

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
