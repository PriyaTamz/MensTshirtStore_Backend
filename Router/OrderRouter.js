import express from "express";
import {
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} from "../Controller/OrderController.js";
import { isAuthenticated, authorizeRoles } from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.post("/place", isAuthenticated, placeOrder);
orderRouter.get("/user", isAuthenticated, getUserOrders);
orderRouter.get("/admin", isAuthenticated, authorizeRoles("admin"), getAllOrders);
orderRouter.put("/:id", isAuthenticated, authorizeRoles("admin"), updateOrderStatus);

export default router;