import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    cartItems: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        size: String,
        returnRequested: { type: Boolean, default: false },
        returnReason: { type: String },
      },
    ],
    totalAmount: { type: Number, required: true },
    method: { type: String, enum: ["cod", "razorpay"], required: true },
    status: {
      type: String,
      enum: ["Initiated", "Pending", "Paid", "Failed", "Delivered", "Refunded"],
      default: "Initiated",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema, "orders");
export default Order;
