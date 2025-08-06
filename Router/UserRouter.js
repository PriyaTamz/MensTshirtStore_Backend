import express from 'express';
import { 
  userLogout, 
  userRegister,
  checkAuthStatus,
  userLogin,
  forgotPassword,
  resetPassword
} from '../Controller/UserController.js';
// import { isAuthenticated, authorizeRoles } from '../middleware/auth.js';

const userRouter = express.Router();

// Public routes
userRouter.post('/register', userRegister); 
userRouter.post('/login', userLogin); 

userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:token", resetPassword);

// Protected routes
userRouter.post('/logout', userLogout); 
userRouter.get('/check-auth', checkAuthStatus);

export default userRouter;