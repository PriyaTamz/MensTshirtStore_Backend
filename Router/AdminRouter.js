import express from 'express';
import { adminLogin, adminLogout, adminRegister } from '../Controller/AdminController.js';
//import { isAuthenticated, authorizeRoles } from '../middleware/auth.js';

const adminRouter = express.Router();

adminRouter.post('/register', adminRegister); 
adminRouter.post('/login', adminLogin); 


adminRouter.post('/logout', adminLogout); 

export default adminRouter;