// controllers/checkin.controller.js
import Pass from "../models/pass.model.js";
import { verifyQR } from "../utils/qrSigner.js";

export const scanPass = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { code, notes } = req.body;

    if (!code)
      return res
        .status(422)
        .json({ success: false, message: "QR code text required" });

    const vr = verifyQR(code);
    if (!vr.ok)
      return res.status(400).json({ success: false, message: "Invalid QR" });

    // Only allow scanning passes for THIS event, and that are paid
    const pass = await Pass.findOne({
      _id: vr.passId,
      event: eventId,
      status: "paid",
    })
      .populate("user", "fullname firstName lastName name email")
      .populate("event", "title city start end createdBy")
      .lean();

    if (!pass) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Pass not found for this event or not paid",
        });
    }

    // If already checked in, we still return success but flag it
    const already = !!pass.checkedIn;

    // Optional audit fields if you added them in the model
    const update = {
      checkedIn: true,
    };
    if (!already) {
      update.checkedInAt = new Date();
      update.checkedInBy = req.user?._id;
    }

    const updated = await Pass.findByIdAndUpdate(
      pass._id,
      { $set: update },
      { new: true }
    )
      .populate("user", "fullname firstName lastName name email")
      .populate("event", "title city start end");

    return res.json({
      success: true,
      data: updated,
      alreadyChecked: already,
      message: already ? "Already checked in earlier" : "Checked in",
    });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

export const getEventCheckins = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { q } = req.query;

    const filter = { event: eventId, checkedIn: true, status: "paid" };
    if (q) {
      // light filter on populated user fields via regex – for large data sets use Atlas Search/Text index
      // This works only if user fields are stored/denormalized; safer way:
      // fetch all and filter in-memory, or perform two-step search
    }

    const rows = await Pass.find(filter)
      .populate("user", "fullname firstName lastName name email")
      .populate("event", "title city start end")
      .sort("-checkedInAt")
      .lean();

    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
