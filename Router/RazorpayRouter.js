import express from "express";
import { checkoutOrder, verifyRazorpayPayment, placeOrder, getUserOrders, getAllOrders, updateOrderStatus, returnProduct, refundPayment } from "../Controller/RazorpayController.js";
import { isAuthenticated, authorizeRoles } from "../middleware/auth.js";

const orderRouter = express.Router();

// Razorpay Payment Flow
orderRouter.post("/checkout", isAuthenticated, authorizeRoles("user"), checkoutOrder);
orderRouter.post("/verify", isAuthenticated, authorizeRoles("user"), verifyRazorpayPayment);

// Place order after successful payment
orderRouter.post("/place", isAuthenticated, authorizeRoles("user"), placeOrder);

// User Orders
orderRouter.get("/orders", isAuthenticated, authorizeRoles("user"), getUserOrders);

// Admin Orders
orderRouter.get("/admin/orders", isAuthenticated, authorizeRoles("admin"), getAllOrders);
orderRouter.put("/admin/update-orders/:id", isAuthenticated, authorizeRoles("admin"), updateOrderStatus);

// Return & Refund
orderRouter.post("/return", isAuthenticated, authorizeRoles("user"), returnProduct);
orderRouter.post("/admin/refund", isAuthenticated, authorizeRoles("admin"), refundPayment);

export default orderRouter;
