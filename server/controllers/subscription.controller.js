import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Pricing plans in INR
const PLANS = {
  free: {
    name: "Free",
    price: 0,
    eventsLimit: 1,
    features: [
      "1 event per month",
      "Basic analytics",
      "QR code generation",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    price: 499, // ₹499/month
    eventsLimit: 5,
    features: [
      "5 events per month",
      "Advanced analytics",
      "QR code generation",
      "Custom branding",
      "Priority support",
      "Revenue tracking",
    ],
  },
  ultra: {
    name: "Ultra",
    price: 999, // ₹999/month
    eventsLimit: Infinity,
    features: [
      "Unlimited events",
      "Advanced analytics",
      "QR code generation",
      "Custom branding",
      "24/7 Priority support",
      "Revenue tracking",
      "API access",
      "White-label option",
    ],
  },
};

// Get pricing plans
export const getPricingPlans = async (req, res) => {
  try {
    res.json({
      success: true,
      data: PLANS,
    });
  } catch (error) {
    console.error("[Get Pricing Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pricing plans",
    });
  }
};

// Get user's current subscription
export const getCurrentSubscription = async (req, res) => {
  try {
    const userId = req.user._id;

    let subscription = await Subscription.findOne({ user: userId });

    // Create free subscription if doesn't exist
    if (!subscription) {
      subscription = await Subscription.create({
        user: userId,
        plan: "free",
        eventsLimit: 1,
      });

      await User.findByIdAndUpdate(userId, { subscription: subscription._id });
    }

    // Reset monthly count if needed
    subscription.resetMonthlyCount();
    await subscription.save();

    res.json({
      success: true,
      data: {
        ...subscription.toObject(),
        planDetails: PLANS[subscription.plan],
        canCreateEvent: subscription.canCreateEvent(),
      },
    });
  } catch (error) {
    console.error("[Get Subscription Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription",
    });
  }
};

// Create subscription order (Razorpay)
export const createSubscriptionOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { plan } = req.body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys are missing in .env");
      return res.status(500).json({
        success: false,
        message: "Payment configuration missing on server",
      });
    }

    if (!["pro", "ultra"].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected",
      });
    }

    const planDetails = PLANS[plan];
    const amount = planDetails.price * 100; // Convert to paise

    // Create Razorpay order
    // Receipt max length is 40 chars. 
    // UserID (24) + Date (13) + prefix is too long.
    // using last 6 chars of user id + timestamp
    const shortUserId = String(userId).slice(-6);
    const receiptId = `sub_${shortUserId}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: receiptId,
      notes: {
        userId: String(userId),
        plan,
      },
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        plan,
        planDetails,
        publicKey: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("[Create Subscription Order Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create subscription order",
    });
  }
};

// Verify subscription payment
export const verifySubscriptionPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      plan,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Update or create subscription
    let subscription = await Subscription.findOne({ user: userId });

    if (!subscription) {
      subscription = new Subscription({ user: userId });
    }

    subscription.plan = plan;
    subscription.eventsLimit = PLANS[plan].eventsLimit;
    subscription.status = "active";
    subscription.razorpay_payment_id = razorpay_payment_id;
    subscription.currentPeriodStart = new Date();
    
    const nextPeriod = new Date();
    nextPeriod.setMonth(nextPeriod.getMonth() + 1);
    subscription.currentPeriodEnd = nextPeriod;

    await subscription.save();

    // Update user reference
    await User.findByIdAndUpdate(userId, { subscription: subscription._id });

    res.json({
      success: true,
      message: `Successfully subscribed to ${PLANS[plan].name} plan`,
      data: subscription,
    });
  } catch (error) {
    console.error("[Verify Subscription Payment Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify subscription payment",
    });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reason } = req.body;

    const subscription = await Subscription.findOne({ user: userId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found",
      });
    }

    if (subscription.plan === "free") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel free plan",
      });
    }

    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
    subscription.cancelReason = reason;

    // Downgrade to free at end of current period
    // For now, immediate downgrade
    subscription.plan = "free";
    subscription.eventsLimit = 1;

    await subscription.save();

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("[Cancel Subscription Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel subscription",
    });
  }
};

// Check if user can create event (middleware)
export const checkEventCreationLimit = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let subscription = await Subscription.findOne({ user: userId });

    if (!subscription) {
      subscription = await Subscription.create({
        user: userId,
        plan: "free",
        eventsLimit: 1,
      });
    }

    if (!subscription.canCreateEvent()) {
      return res.status(403).json({
        success: false,
        message: `You have reached your monthly event limit (${subscription.eventsLimit} events). Please upgrade your plan.`,
        currentPlan: subscription.plan,
        eventsHosted: subscription.eventsHostedThisMonth,
        eventsLimit: subscription.eventsLimit,
      });
    }

    // Increment event count
    subscription.incrementEventCount();
    await subscription.save();

    next();
  } catch (error) {
    console.error("[Check Event Limit Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify subscription",
    });
  }
};
