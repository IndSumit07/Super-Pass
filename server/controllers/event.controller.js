// controllers/event.controller.js
import Event from "../models/event.model.js";
import { uploadBuffer, deleteByPublicId } from "../utils/cloudinaryUpload.js";

const FOLDER = process.env.CLOUDINARY_FOLDER || "superpaas";

/** Safely parse JSON-like fields if they came as strings from multipart */
const parseMaybeJSON = (val) => {
  if (val == null) return val;
  if (typeof val === "string") {
    try {
      const t = val.trim();
      if (
        (t.startsWith("[") && t.endsWith("]")) ||
        (t.startsWith("{") && t.endsWith("}"))
      ) {
        return JSON.parse(t);
      }
      return val;
    } catch {
      return val;
    }
  }
  return val;
};

/** Normalize booleans/numbers from form-data */
const normalizeBody = (body) => {
  const b = { ...body };

  // arrays/objects possibly sent as JSON strings
  [
    "tags",
    "eligibility",
    "stages",
    "timeline",
    "socials",
    "ticketTemplate",
  ].forEach((k) => {
    const parsed = parseMaybeJSON(b[k]);
    if (parsed !== undefined) b[k] = parsed;
  });

  // booleans
  if (b.isPaid !== undefined)
    b.isPaid = b.isPaid === true || b.isPaid === "true";
  if (b.isTeamEvent !== undefined)
    b.isTeamEvent = b.isTeamEvent === true || b.isTeamEvent === "true";

  // numbers
  ["price", "capacity", "teamMin", "teamMax"].forEach((k) => {
    if (b[k] !== undefined && b[k] !== "") b[k] = Number(b[k]);
  });

  // dates
  ["start", "end", "regDeadline"].forEach((k) => {
    if (b[k]) b[k] = new Date(b[k]);
  });

  return b;
};

export const createEvent = async (req, res) => {
  try {
    const body = normalizeBody(req.body);

    if (
      !body.title ||
      !body.organization ||
      !body.category ||
      !body.start ||
      !body.end ||
      !body.city
    ) {
      return res
        .status(422)
        .json({ success: false, message: "Missing required fields." });
    }

    if (req.user?._id) body.createdBy = req.user._id;

    // default ticket template if not provided
    if (!body.ticketTemplate || typeof body.ticketTemplate !== "object") {
      body.ticketTemplate = {
        key: "classic",
        name: "Classic",
        palette: {
          bg: "#0b1020",
          card: "#11172c",
          accent: "#19cfbc",
          text: "#ffffff",
        },
        layout: "left-logo-right-qr",
        cornerStyle: "rounded-xl",
      };
    }

    // Upload images (multer memoryStorage)
    if (req.files?.banner?.[0]) {
      const file = req.files.banner[0];
      const result = await uploadBuffer(file.buffer, {
        folder: `${FOLDER}/events/banners`,
        resource_type: "image",
        transformation: [{ fetch_format: "auto", quality: "auto" }],
      });
      body.bannerUrl = result.secure_url;
      body.bannerPublicId = result.public_id;
    }

    if (req.files?.logo?.[0]) {
      const file = req.files.logo[0];
      const result = await uploadBuffer(file.buffer, {
        folder: `${FOLDER}/events/logos`,
        resource_type: "image",
        transformation: [{ fetch_format: "auto", quality: "auto" }],
      });
      body.logoUrl = result.secure_url;
      body.logoPublicId = result.public_id;
    }

    const event = await Event.create(body);
    return res.status(201).json({ success: true, data: event });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const current = await Event.findOne({
      $or: [{ _id: idOrSlug }, { slug: idOrSlug }],
    });
    if (!current) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const body = normalizeBody(req.body);

    // Upload new images if provided, delete old assets
    if (req.files?.banner?.[0]) {
      const file = req.files.banner[0];
      const result = await uploadBuffer(file.buffer, {
        folder: `${FOLDER}/events/banners`,
        resource_type: "image",
        transformation: [{ fetch_format: "auto", quality: "auto" }],
      });
      if (current.bannerPublicId)
        await deleteByPublicId(current.bannerPublicId);
      body.bannerUrl = result.secure_url;
      body.bannerPublicId = result.public_id;
    }

    if (req.files?.logo?.[0]) {
      const file = req.files.logo[0];
      const result = await uploadBuffer(file.buffer, {
        folder: `${FOLDER}/events/logos`,
        resource_type: "image",
        transformation: [{ fetch_format: "auto", quality: "auto" }],
      });
      if (current.logoPublicId) await deleteByPublicId(current.logoPublicId);
      body.logoUrl = result.secure_url;
      body.logoPublicId = result.public_id;
    }

    const updated = await Event.findByIdAndUpdate(current._id, body, {
      new: true,
      runValidators: true,
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const {
      q,
      category,
      city,
      mode,
      status,
      isPaid,
      startFrom,
      startTo,
      page = 1,
      limit = 12,
      sort = "start",
    } = req.query;

    const filter = {};
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (city) filter.city = city;
    if (mode) filter.mode = mode;
    if (status) filter.status = status;
    if (isPaid !== undefined) filter.isPaid = isPaid === "true";

    if (startFrom || startTo) {
      filter.start = {};
      if (startFrom) filter.start.$gte = new Date(startFrom);
      if (startTo) filter.start.$lte = new Date(startTo);
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));

    const [items, total] = await Promise.all([
      Event.find(filter)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Event.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const event = await Event.findOne({
      $or: [{ _id: idOrSlug }, { slug: idOrSlug }],
    }).lean();
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const event = await Event.findOneAndDelete({
      $or: [{ _id: idOrSlug }, { slug: idOrSlug }],
    });
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    // Clean Cloudinary assets if present
    if (event.bannerPublicId) await deleteByPublicId(event.bannerPublicId);
    if (event.logoPublicId) await deleteByPublicId(event.logoPublicId);

    res.json({ success: true, message: "Event deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
