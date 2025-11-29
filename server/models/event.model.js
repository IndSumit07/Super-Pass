// models/event.model.js
import mongoose from "mongoose";
import slugify from "slugify";

const StageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    start: { type: Date },
    end: { type: Date },
    mode: {
      type: String,
      enum: ["Offline", "Online", "Hybrid"],
      default: "Offline",
    },
    description: { type: String, trim: true },
  },
  { _id: false }
);

const TimelineItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    note: { type: String, trim: true },
  },
  { _id: false }
);

const SocialSchema = new mongoose.Schema(
  { label: { type: String, trim: true }, url: { type: String, trim: true } },
  { _id: false }
);

// NEW: Embedded ticket template
const TicketTemplateSchema = new mongoose.Schema(
  {
    key: { type: String, default: "classic" },
    name: { type: String, default: "Classic" },
    palette: {
      bg: { type: String, default: "#0b1020" },
      card: { type: String, default: "#11172c" },
      accent: { type: String, default: "#19cfbc" },
      text: { type: String, default: "#ffffff" },
    },
    layout: { type: String, default: "left-logo-right-qr" },
    cornerStyle: { type: String, default: "rounded-xl" },
  },
  { _id: false }
);

const EventSchema = new mongoose.Schema(
  {
    // basics
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    subtitle: { type: String, trim: true },
    organization: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Conference",
        "Workshop",
        "Meetup",
        "Hackathon",
        "College Fest",
        "Webinar",
        "Competition",
      ],
    },
    description: { type: String, trim: true },
    mode: {
      type: String,
      enum: ["Offline", "Online", "Hybrid"],
      default: "Offline",
    },

    // schedule
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    regDeadline: { type: Date },

    // venue
    venueName: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },

    // ticketing
    isPaid: { type: Boolean, default: false },
    price: { type: Number, min: 0, default: 0 },
    perPersonFee: { type: Number, min: 0 }, // For team events, price per person
    capacity: { type: Number, min: 0 },

    // team
    isTeamEvent: { type: Boolean, default: false },
    teamMin: { type: Number, min: 0 },
    teamMax: { type: Number, min: 0 },

    // dynamic lists
    tags: [{ type: String, trim: true }],
    eligibility: [{ type: String, trim: true }],
    stages: [StageSchema],
    timeline: [TimelineItemSchema],
    registered: {
      type: Number,
      default: 0,
    },

    // extras
    prizes: { type: String, trim: true },
    rewards: { type: String, trim: true },
    submissionFormat: { type: String, trim: true },
    judgingCriteria: { type: String, trim: true },
    resources: { type: String, trim: true },
    contactName: { type: String, trim: true },
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    faqLink: { type: String, trim: true },
    website: { type: String, trim: true },
    socials: [SocialSchema],
    status: {
      type: String,
      enum: ["draft", "published", "private"],
      default: "draft",
    },

    // theme/style
    bannerColor: { type: String, default: "#0ea5e9" },

    // media
    bannerUrl: { type: String, trim: true },
    bannerPublicId: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    logoPublicId: { type: String, trim: true },

    // owner
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // NEW: ticket template selection
    ticketTemplate: { type: TicketTemplateSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// text index
EventSchema.index({ title: "text", description: "text", tags: "text" });

// slug
EventSchema.pre("save", async function (next) {
  if (!this.isModified("title") && this.slug) return next();
  const base = slugify(this.title, { lower: true, strict: true });
  let slug = base;
  let i = 1;
  while (await this.constructor.findOne({ slug })) {
    slug = `${base}-${i++}`;
  }
  this.slug = slug;
  next();
});

const Event = mongoose.model("Event", EventSchema);
export default Event;
