import { Router } from 'express';
import { authenticate, authorize } from '../security/authMiddleware.js';
import { createFromCart, listMyOrders, updateStatus, getOrder, invoicePdf, listAllPayments, getClientStats } from '../controllers/orderController.js';

const router = Router();

router.post('/', authenticate, createFromCart);
router.get('/me', authenticate, listMyOrders);
router.get('/me/stats', authenticate, getClientStats);
router.get('/admin/payments', authenticate, authorize(['admin']), listAllPayments);
router.get('/:id', authenticate, getOrder);
router.put('/:id/status', authenticate, authorize(['admin']), updateStatus);
router.get('/:id/invoice.pdf', authenticate, invoicePdf);

export default router;


