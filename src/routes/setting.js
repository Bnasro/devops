import { Router } from 'express';
import { authenticate, authorize } from '../security/authMiddleware.js';
import { getSettings, updateSettings } from '../controllers/settingController.js';

const router = Router();
router.get('/', getSettings);
router.put('/', authenticate, authorize(['admin']), updateSettings);

export default router;
