import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  size: String,
  color: String,
  quantity: { type: Number, required: true, min: 1 }
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [cartItemSchema],
  updatedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model("Cart", cartSchema, "carts");
export default Cart;
