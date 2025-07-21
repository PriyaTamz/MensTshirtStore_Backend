import express from 'express';
import { adminLogin, adminLogout, adminRegister } from '../Controller/AdminController.js';

const adminRouter = express.Router();

// Public routes for admin authentication
adminRouter.post('/register', adminRegister);
adminRouter.post('/login', adminLogin);

// Route to log out
adminRouter.post('/logout', adminLogout);

export default adminRouter;