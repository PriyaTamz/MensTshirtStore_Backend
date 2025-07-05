import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  category: { type: [String], required: true },
  size: { type: [String], required: true }, 
  colors: [String],
  images: [String], // image URLs (from S3/Cloudinary)
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", ProductSchema, "products");
export default Product;