// middleware/isEventOwner.js
import Event from "../models/event.model.js";

export const isEventOwner = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    if (!eventId)
      return res
        .status(400)
        .json({ success: false, message: "eventId required" });

    const ev = await Event.findById(eventId).lean();
    if (!ev)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    const uid = req.user?._id?.toString();
    const createdBy = (ev.createdBy?._id || ev.createdBy)?.toString();
    if (uid && createdBy && uid === createdBy) {
      req.event = ev;
      return next();
    }
    return res
      .status(403)
      .json({ success: false, message: "Not authorized for this event" });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};
