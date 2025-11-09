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

const app = express();
connectDB();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
