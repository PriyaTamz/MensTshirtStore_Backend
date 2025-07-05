import express from 'express';
import { userLogin, userLogout, userRegister } from '../Controller/UserController.js';
//import { isAuthenticated, authorizeRoles } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', userRegister); 
userRouter.post('/login', userLogin); 


userRouter.post('/logout', userLogout); 

export default userRouter;