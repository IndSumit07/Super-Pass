import HelpTicket from "../models/helpTicket.model.js";

/** POST /api/help  -> create a ticket */
export const createTicket = async (req, res) => {
  try {
    const userId = req.user?._id || null;
    const {
      name,
      email,
      subject,
      message,
      priority = "low",
      tags = [],
    } = req.body;

    if (!subject?.trim() || !message?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Subject and message are required." });
    }

    const doc = await HelpTicket.create({
      user: userId,
      name: name?.trim() || undefined,
      email: email?.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
      priority,
      tags,
    });

    res.json({ success: true, data: doc });
  } catch (err) {
    res
      .status(400)
      .json({
        success: false,
        message: err.message || "Failed to submit query.",
      });
  }
};

/** GET /api/help/mine -> list tickets created by current user */
export const myTickets = async (req, res) => {
  try {
    const uid = req.user?._id;
    if (!uid) return res.json({ success: true, data: [] });
    const list = await HelpTicket.find({ user: uid }).sort("-createdAt").lean();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/** (Optional Admin) GET /api/help -> all tickets */
export const allTickets = async (req, res) => {
  try {
    // gate however you gate admin in your app; for now return none if not admin
    const role = req.user?.role;
    if (role !== "admin")
      return res.status(403).json({ success: false, message: "Forbidden" });
    const list = await HelpTicket.find().sort("-createdAt").lean();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
