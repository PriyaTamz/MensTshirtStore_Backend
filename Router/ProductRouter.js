import express from 'express';
import { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from '../Controller/ProductController.js';
import { isAuthenticated, authorizeRoles } from '../middleware/auth.js';
import upload from '../Utils/multer.js';

const productRouter = express.Router();

// Public routes — no login needed
productRouter.get('/', getAllProducts);
productRouter.get('/:id', getProductById);

// Protected routes for admin 
productRouter.post('/create', isAuthenticated, authorizeRoles('admin'), upload.array("images", 5), addProduct);
productRouter.put('/:id', isAuthenticated, authorizeRoles('admin'), upload.array("images", 5), updateProduct);
productRouter.delete('/:id', isAuthenticated, authorizeRoles('admin'), deleteProduct);

export default productRouter;