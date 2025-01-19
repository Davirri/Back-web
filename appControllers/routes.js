import express from 'express';
import { 
  registerUser, loginUser, getProducts, addProduct, updateProduct, deleteProduct, 
  getNews, getMerch, addMerch, updateMerch, deleteMerch 
} from './controllers.js';
import authenticate from '../middleware/authenticate.js';
import authorizeAdmin from '../middleware/authorize.js';

const router = express.Router();

// Rutas de usuarios
router.post('/register', registerUser);
router.post('/login', loginUser);

// Rutas de productos
router.get('/products', getProducts);
router.post('/products/add', authenticate, authorizeAdmin, addProduct);
router.put('/products/:id', authenticate, authorizeAdmin, updateProduct);
router.delete('/products/:id', authenticate, authorizeAdmin, deleteProduct);

// Rutas de noticias
router.get('/news', getNews);

// Rutas de merch
router.get('/merch', getMerch);
router.post('/merch/add', authenticate, authorizeAdmin, addMerch);
router.put('/merch/:id', authenticate, authorizeAdmin, updateMerch);
router.delete('/merch/:id', authenticate, authorizeAdmin, deleteMerch);

export default router;
