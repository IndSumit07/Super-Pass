import crypto from "crypto";
import Razorpay from "razorpay";
import Event from "../models/event.model.js";
import Pass from "../models/pass.model.js";
import { signQR } from "../utils/qrSigner.js";

const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const razorpay = new Razorpay({
  key_id: RZP_KEY_ID,
  key_secret: RZP_KEY_SECRET,
});

// helper to build safe receipts (Razorpay <= 40 chars)
function shortReceipt(eventId) {
  const eid = String(eventId)
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-12);
  const ts = Date.now().toString().slice(-10);
  return `evt-${eid}-${ts}`; // total ~27 chars
}

/* -------------------------------------------------------------------------- */
/* 🧾 Create Razorpay Order (or direct pass for free events) */
/* -------------------------------------------------------------------------- */
export const createOrder = async (req, res) => {
  try {
    const { eventId, quantity = 1 } = req.body;
    const userId = req.user?._id;

    if (!eventId)
      return res
        .status(400)
        .json({ success: false, message: "eventId required." });

    const event = await Event.findById(eventId).lean();
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found." });
    if (event.status !== "published")
      return res
        .status(400)
        .json({ success: false, message: "Event is not published." });

    const basePrice = Number(event.price || 0);
    const isPaid = !!event.isPaid && basePrice > 0;
    const qty = Math.max(1, Number(quantity || 1));
    const amountPaise = basePrice * 100 * qty;

    /* ---------- 🆓 Free Event: Direct Pass Creation ---------- */
    if (!isPaid || amountPaise < 100) {
      const pass = await Pass.create({
        user: userId,
        event: event._id,
        eventSnapshot: {
          title: event.title,
          organization: event.organization,
          start: event.start,
          city: event.city,
          category: event.category,
          price: basePrice,
          logoUrl: event.logoUrl,
          bannerUrl: event.bannerUrl,
          ticketTemplate: event.ticketTemplate || null,
        },
        amount: 0,
        currency: "INR",
        status: "paid",
      });

      // ✅ sign QR securely
      const qr = signQR(pass._id.toString());
      await Pass.findByIdAndUpdate(pass._id, { $set: { qrPayload: qr } });

      return res.json({
        success: true,
        mode: "direct",
        data: pass,
        publicKey: RZP_KEY_ID,
      });
    }

    /* ---------- 💳 Paid Event: Razorpay Order Creation ---------- */
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      notes: { eventId, quantity: String(qty) },
      receipt: shortReceipt(event._id),
    });

    return res.json({ success: true, data: order, publicKey: RZP_KEY_ID });
  } catch (err) {
    const msg =
      err?.error?.description ||
      err?.message ||
      "Failed to create Razorpay order.";
    console.error("💥 createOrder error:", msg);
    return res.status(400).json({ success: false, message: msg });
  }
};

/* -------------------------------------------------------------------------- */
/* 💰 Verify Razorpay Payment and Issue Pass */
/* -------------------------------------------------------------------------- */
export const verifyPayment = async (req, res) => {
  try {
    const userId = req.user?._id;
    const {
      eventId,
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    // validate fields
    if (
      !eventId ||
      !orderId ||
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment fields." });
    }

    // verify signature
    const generatedSignature = crypto
      .createHmac("sha256", RZP_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature." });
    }

    const event = await Event.findById(eventId).lean();
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found." });

    const price = Number(event.price || 0);
    const amountPaise = !!event.isPaid && price > 0 ? price * 100 : 0;

    // ✅ Create pass record
    const pass = await Pass.create({
      user: userId,
      event: event._id,
      eventSnapshot: {
        title: event.title,
        organization: event.organization,
        start: event.start,
        city: event.city,
        category: event.category,
        price,
        logoUrl: event.logoUrl,
        bannerUrl: event.bannerUrl,
        ticketTemplate: event.ticketTemplate || null,
      },
      amount: amountPaise,
      currency: "INR",
      status: "paid",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    // ✅ attach signed QR code
    const qr = signQR(pass._id.toString());
    await Pass.findByIdAndUpdate(pass._id, { $set: { qrPayload: qr } });

    return res.json({ success: true, data: pass });
  } catch (err) {
    const msg = err?.message || "Payment verification failed.";
    console.error("💥 verifyPayment error:", msg);
    return res.status(400).json({ success: false, message: msg });
  }
};
