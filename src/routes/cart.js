import { Router } from 'express';
import { authenticate } from '../security/authMiddleware.js';
import { getCart, addItem, updateItem, removeItem, clearCart, applyCoupon, removeCoupon } from '../controllers/cartController.js';

const router = Router();

router.use(authenticate);
router.get('/', getCart);
router.post('/items', addItem);
router.put('/items/:productId', updateItem);
router.delete('/items/:productId', removeItem);
router.delete('/', clearCart);
router.post('/coupon', applyCoupon);
router.delete('/coupon', removeCoupon);

export default router;


