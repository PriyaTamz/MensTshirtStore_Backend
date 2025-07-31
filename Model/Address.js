import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["home", "work", "other"], default: "home" },
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: Number, required: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

const Address = mongoose.model("Address", addressSchema, "addresses");
export default Address;
