import express from 'express';
import { adminLogin, adminLogout, adminRegister , checkAdminAuth } from '../Controller/AdminController.js';

const adminRouter = express.Router();

// Public routes for admin authentication
adminRouter.post('/register', adminRegister);
adminRouter.post('/login', adminLogin);

// Route to log out
adminRouter.post('/logout', adminLogout);
adminRouter.get("/check-auth", checkAdminAuth);

export default adminRouter;