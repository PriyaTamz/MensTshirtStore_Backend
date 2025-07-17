import express from 'express';
import { 
  requestOtp, 
  verifyOtp, 
  userLogout, 
  userRegister,
  checkAuthStatus 
} from '../Controller/UserController.js';
// import { isAuthenticated, authorizeRoles } from '../middleware/auth.js';

const userRouter = express.Router();

// Public routes
userRouter.post('/register', userRegister); 
userRouter.post('/request-otp', requestOtp); 
userRouter.post('/verify-otp', verifyOtp); 

// Protected routes
userRouter.post('/logout', userLogout); 
userRouter.get('/check-auth', checkAuthStatus);

export default userRouter;