import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import connectDB from "./Database/config.js";
import adminRouter from "./Router/AdminRouter.js";
import userRouter from "./Router/UserRouter.js";
import productRouter from "./Router/ProductRouter.js";
import cartRouter from "./Router/CartRouter.js";
import addressRouter from "./Router/AddressRoutes.js";
import orderRouter from "./Router/RazorpayRouter.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:3001",
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); 
app.use(cookieParser()); 

connectDB();

app.get("/", (req, res) => {
  res.send("Welcome to server");
});

app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
