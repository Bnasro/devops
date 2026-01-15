import { Router } from 'express';
import { authenticate } from '../security/authMiddleware.js';
import { listMyAddresses, createAddress, updateAddress, removeAddress } from '../controllers/addressController.js';

const router = Router();

router.use(authenticate);
router.get('/', listMyAddresses);
router.post('/', createAddress);
router.patch('/:id', updateAddress);
router.delete('/:id', removeAddress);

export default router;
