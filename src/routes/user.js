import { Router } from 'express';
import { authenticate, authorize } from '../security/authMiddleware.js';
import { listUsers, updateUserRole, deleteUser } from '../controllers/userController.js';

const router = Router();

router.use(authenticate, authorize(['admin']));
router.get('/', listUsers);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
