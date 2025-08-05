import express from "express";
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../Controller/CartController.js';
import { isAuthenticated, authorizeRoles } from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.get("/", isAuthenticated, authorizeRoles('user'), getCart);
cartRouter.post("/add", isAuthenticated, authorizeRoles('user'), addToCart); 
cartRouter.put("/update", isAuthenticated, authorizeRoles('user'), updateCartItem); 
cartRouter.post("/remove",isAuthenticated, authorizeRoles('user'), removeCartItem);

cartRouter.post("/clear", isAuthenticated, authorizeRoles('user'), clearCart);

export default cartRouter;