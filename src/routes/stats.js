import { Router } from 'express';
import { authenticate, authorize } from '../security/authMiddleware.js';
import { getDashboardStats, getAnalyticsStats, getCatalogStats } from '../controllers/statsController.js';

const router = Router();
router.use(authenticate, authorize(['admin']));

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalyticsStats);
router.get('/catalog', getCatalogStats);

export default router;

