import rateLimit from "express-rate-limit";
import helmet from "helmet";

// Rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    message: "Too many attempts, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Rate limiting for general API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for payment endpoints (stricter)
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 payment attempts per window
  message: {
    success: false,
    message: "Too many payment attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helmet configuration for security headers (environment-aware)
const isProduction = process.env.NODE_ENV === "production";

export const helmetConfig = helmet({
  contentSecurityPolicy: isProduction
    ? {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "https://checkout.razorpay.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: ["'self'", "https://api.razorpay.com"],
          frameSrc: ["'self'", "https://api.razorpay.com"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      }
    : false, // Disable CSP in development to avoid issues
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// Custom MongoDB sanitization middleware (Express v5 compatible)
// Removes $ and . from user input to prevent NoSQL injection
export const sanitizeData = (req, res, next) => {
  try {
    const sanitize = (obj) => {
      if (obj && typeof obj === "object") {
        Object.keys(obj).forEach((key) => {
          // Remove keys that start with $ or contain .
          if (key.startsWith("$") || key.includes(".")) {
            console.warn(`[Security] Blocked NoSQL injection attempt: ${key}`);
            delete obj[key];
          } else if (typeof obj[key] === "object" && obj[key] !== null) {
            sanitize(obj[key]);
          }
        });
      }
      return obj;
    };

    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);

    next();
  } catch (error) {
    console.error("[Sanitization Error]:", error);
    next();
  }
};

