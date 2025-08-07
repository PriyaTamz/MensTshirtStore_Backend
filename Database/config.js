import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoDB_URL = process.env.MONGODB_URL;

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(mongoDB_URL);
    console.log("MongoDB Connected successfully");
    return connection;
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "MongoDB connection Error" });
    process.exit(1);
  }
};
export default connectDB;
