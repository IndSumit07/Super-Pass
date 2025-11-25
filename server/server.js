import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./configs/mongo.config.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import eventRouter from "./routes/event.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import passRouter from "./routes/pass.routes.js";
import checkinRouter from "./routes/checkin.routes.js";
import helpRouter from "./routes/help.routes.js";
import withdrawalRouter from "./routes/withdrawal.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import {
  helmetConfig,
  sanitizeData,
  apiLimiter,
} from "./middlewares/security.middleware.js";

const app = express();
connectDB();
const PORT = process.env.PORT || 4000;

// Security middleware - must be first
app.use(helmetConfig);

// CORS configuration with validation
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser with size limits (prevent DoS)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// MongoDB injection protection
app.use(sanitizeData);

// Global rate limiting
app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.send("Hello from KarigarLink server!");
});

app.get("/ping", (req, res) => res.send("Server is Live ✅"));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/events", eventRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/passes", passRouter);
app.use("/api/checkin", checkinRouter);
app.use("/api/help", helpRouter);
app.use("/api/withdrawals", withdrawalRouter);
app.use("/api/subscriptions", subscriptionRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
