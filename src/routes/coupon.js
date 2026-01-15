import { Router } from 'express';
import { authenticate, authorize } from '../security/authMiddleware.js';
import { listCoupons, listPublicCoupons, createCoupon, updateCoupon, removeCouponAdmin } from '../controllers/couponController.js';

const router = Router();

// Public: list active & non-expired coupons
router.get('/public', listPublicCoupons);

router.get('/', authenticate, authorize(['admin']), listCoupons);
router.post('/', authenticate, authorize(['admin']), createCoupon);
router.put('/:id', authenticate, authorize(['admin']), updateCoupon);
router.delete('/:id', authenticate, authorize(['admin']), removeCouponAdmin);

export default router;






