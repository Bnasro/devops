import { Router } from 'express';
import { authenticate, authorize } from '../security/authMiddleware.js';
import { listCategories, createCategory, updateCategory, removeCategory } from '../controllers/categoryController.js';

const router = Router();

router.get('/', listCategories);
router.post('/', authenticate, authorize(['admin']), createCategory);
router.put('/:id', authenticate, authorize(['admin']), updateCategory);
router.delete('/:id', authenticate, authorize(['admin']), removeCategory);

export default router;






