import { Router } from 'express';
import { authenticate, authorize } from '../security/authMiddleware.js';
import { listCampaigns, createCampaign, updateCampaign, sendCampaign } from '../controllers/marketingController.js';

const router = Router();

router.use(authenticate, authorize(['admin']));
router.get('/', listCampaigns);
router.post('/', createCampaign);
router.put('/:id', updateCampaign);
router.post('/:id/send', sendCampaign);

export default router;
