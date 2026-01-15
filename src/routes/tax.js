import { Router } from 'express';
import { authenticate, authorize } from '../security/authMiddleware.js';
import { listRules, createRule, updateRule, removeRule } from '../controllers/taxController.js';

const router = Router();

router.use(authenticate, authorize(['admin']));
router.get('/', listRules);
router.post('/', createRule);
router.patch('/:id', updateRule);
router.delete('/:id', removeRule);

export default router;
