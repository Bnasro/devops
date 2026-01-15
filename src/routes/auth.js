import { Router } from 'express';
import { register, login, me, requestPasswordReset, resetPassword } from '../controllers/authController.js';
import { authenticate } from '../security/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;


