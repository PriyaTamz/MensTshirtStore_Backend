import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./Database/config.js";
import adminRouter from "./Router/AdminRouter.js";
import userRouter from "./Router/UserRouter.js";
import productRouter from "./Router/ProductRouter.js";
import cartRouter from "./Router/CartRouter.js";
import addressRouter from "./Router/AddressRoutes.js";
import orderRouter from "./Router/RazorpayRouter.js";

dotenv.config();

const app = express();

// Update CORS to allow frontend origin
app.use(
  cors({
    origin: ["http://localhost:5173", "https://styleandstore.netlify.app"], // Allow frontend origins
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

// Log all incoming requests for debugging
app.use((req, res, next) => {
  // console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

connectDB();

app.get("/", (req, res) => {
  res.send("Welcome to server");
});

// Routes
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});