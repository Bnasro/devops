import { Router } from 'express';
import { authenticate, authorize } from '../security/authMiddleware.js';
import { segmentation, prediction, timeseries, chatbot } from '../controllers/aiController.js';

const router = Router();
router.use(authenticate, authorize(['admin']));

router.get('/segmentation', segmentation);
router.get('/prediction', prediction);
router.get('/timeseries', timeseries);
router.post('/chatbot', chatbot);

export default router;




