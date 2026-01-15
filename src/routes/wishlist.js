import { Router } from 'express';
import { authenticate } from '../security/authMiddleware.js';
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist } from '../controllers/wishlistController.js';

const router = Router();

router.use(authenticate);
router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/clear', clearWishlist);
router.delete('/:id', removeFromWishlist);

export default router;
