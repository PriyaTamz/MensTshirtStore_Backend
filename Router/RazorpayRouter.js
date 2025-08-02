import express from "express";
import { checkoutOrder, verifyRazorpayPayment, getUserOrders, getAllOrders, updateOrderStatus, returnProduct, refundPayment, getAllUsers } from "../Controller/RazorpayController.js";
import { isAuthenticated, authorizeRoles } from "../middleware/auth.js";

const orderRouter = express.Router();

// Razorpay Payment Flow
orderRouter.post("/checkout", isAuthenticated, authorizeRoles("user"), checkoutOrder);
orderRouter.post("/verify", isAuthenticated, authorizeRoles("user"), verifyRazorpayPayment);

// User Orders
orderRouter.get("/user-order", isAuthenticated, authorizeRoles("user"), getUserOrders);

// Admin Orders
orderRouter.get("/admin/orders", isAuthenticated, authorizeRoles("admin"), getAllOrders);
orderRouter.put("/admin/update-orders/:id", isAuthenticated, authorizeRoles("admin"), updateOrderStatus);
orderRouter.get("/admin/all-usersData", isAuthenticated, authorizeRoles("admin"), getAllUsers);

// Return & Refund
orderRouter.post("/return", isAuthenticated, authorizeRoles("user"), returnProduct);
orderRouter.post("/admin/refund", isAuthenticated, authorizeRoles("admin"), refundPayment);

export default orderRouter;
