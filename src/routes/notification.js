import { Router } from 'express';
import { authenticate, authorize } from '../security/authMiddleware.js';
import { listMyNotifications, markRead, markAllRead, createForUser } from '../controllers/notificationController.js';

const router = Router();

router.use(authenticate);
router.get('/', listMyNotifications);
router.patch('/:id/read', markRead);
router.post('/read-all', markAllRead);
// Admin utility to create notifications for any user
router.post('/', authorize(['admin']), createForUser);

export default router;
