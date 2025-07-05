import express from "express";
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress
} from "../Controller/AddressController.js";
import { isAuthenticated, authorizeRoles } from "../middleware/auth.js";

const addressRouter = express.Router();

addressRouter.post("/", isAuthenticated, authorizeRoles('user'), addAddress);
addressRouter.get("/", isAuthenticated, authorizeRoles('user'), getAddresses);
addressRouter.put("/:id", isAuthenticated, authorizeRoles('user'), updateAddress);
addressRouter.delete("/:id", isAuthenticated, authorizeRoles('user'), deleteAddress);

export default addressRouter;
