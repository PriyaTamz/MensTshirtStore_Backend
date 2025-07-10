import express from 'express';
import { requestOtp, verifyOtp, userLogout, userRegister } from '../Controller/UserController.js';
//import { isAuthenticated, authorizeRoles } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', userRegister); 
userRouter.post('/request-otp', requestOtp ); 
userRouter.post('/verify-otp', verifyOtp ); 

userRouter.post('/logout', userLogout); 

export default userRouter;