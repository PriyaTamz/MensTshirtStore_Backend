import express from 'express';
import { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from '../Controller/ProductController.js';
import { isAuthenticated, authorizeRoles } from '../middleware/auth.js';

const productRouter = express.Router();

// Public routes — no login needed
productRouter.get('/', getAllProducts);
productRouter.get('/:id', getProductById);

// Protected routes for admin 
productRouter.post('/create', isAuthenticated, authorizeRoles('admin'), addProduct);
productRouter.put('/:id', isAuthenticated, authorizeRoles('admin'), updateProduct);
productRouter.delete('/:id', isAuthenticated, authorizeRoles('admin'), deleteProduct);

export default productRouter;