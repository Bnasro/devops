import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
const { connect } = mongoose;

import authRouter from "./routes/auth.js";
import productRouter from "./routes/product.js";
import categoryRouter from "./routes/category.js";
import cartRouter from "./routes/cart.js";
import orderRouter from "./routes/order.js";
import couponRouter from "./routes/coupon.js";
import reviewRouter from "./routes/review.js";
import profileRouter from "./routes/profile.js";
import paymentRouter from "./routes/payment.js";
import aiRouter from "./routes/ai.js";
import meetingRouter from "./routes/meeting.js";
import wishlistRouter from "./routes/wishlist.js";
import addressRouter from "./routes/address.js";
import notificationRouter from "./routes/notification.js";
import returnRouter from "./routes/return.js";
import taxRouter from "./routes/tax.js";
import userRouter from "./routes/user.js";
import settingRouter from "./routes/setting.js";
import translationRouter from "./routes/translation.js";
import marketingRouter from "./routes/marketing.js";
import statsRouter from "./routes/stats.js";
import path from "path";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/profile", profileRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/ai", aiRouter);
app.use("/api/meetings", meetingRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/addresses", addressRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/returns", returnRouter);
app.use("/api/taxes", taxRouter);
app.use("/api/users", userRouter);
app.use("/api/settings", settingRouter);
app.use("/api/translations", translationRouter);
app.use("/api/marketing", marketingRouter);
app.use("/api/stats", statsRouter);

// static uploads
app.use("/uploads", express.static(path.resolve("uploads")));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nasr";

async function start() {
  await connect(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
