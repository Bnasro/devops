import { Router } from 'express';
import { authenticate, authorize } from '../security/authMiddleware.js';
import { listMyReturns, createReturn, adminList, adminUpdateStatus } from '../controllers/returnController.js';

const router = Router();

router.use(authenticate);
router.get('/', listMyReturns);
router.post('/', createReturn);
router.get('/admin', authorize(['admin']), adminList);
router.patch('/:id/status', authorize(['admin']), adminUpdateStatus);

export default router;
