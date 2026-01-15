import { Router } from 'express';
import { authenticate } from '../security/authMiddleware.js';
import { getProfile, addAddress, updateAddress, removeAddress, addPayment, removePayment } from '../controllers/profileController.js';

const router = Router();
router.use(authenticate);

router.get('/', getProfile);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', removeAddress);
router.post('/payments', addPayment);
router.delete('/payments/:id', removePayment);

export default router;






