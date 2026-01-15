import { Router } from 'express';
import { authenticate, authorize } from '../security/authMiddleware.js';
import { listTranslations, createTranslation, updateTranslation, deleteTranslation, exportLang } from '../controllers/translationController.js';

const router = Router();

// Public export for a language
router.get('/export', exportLang);

// Admin management
router.use(authenticate, authorize(['admin']));
router.get('/', listTranslations);
router.post('/', createTranslation);
router.patch('/:id', updateTranslation);
router.delete('/:id', deleteTranslation);

export default router;
