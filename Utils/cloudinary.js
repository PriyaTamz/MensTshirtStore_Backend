import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: "dajorp2fh",
  api_key: "592191868728841",
  api_secret: "4E1UM0JgS_uqpiFBgKWP6EVdh8k"
});

export default cloudinary;