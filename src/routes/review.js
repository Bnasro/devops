import { Router } from 'express';
import { authenticate, authorize } from '../security/authMiddleware.js';
import { listReviews, addReview, moderateReview, listAllReviews, listAllReviewsForAdmin, listAllApprovedReviews } from '../controllers/reviewController.js';

const router = Router({ mergeParams: true });

// Routes spécifiques (avant les routes dynamiques)
router.get('/admin/all/list', authenticate, authorize(['admin']), listAllReviewsForAdmin);
router.get('/all/list', authenticate, listAllApprovedReviews);
router.put('/moderate/:id', authenticate, authorize(['admin']), moderateReview);

// Routes pour un produit spécifique
router.get('/:productId', listReviews);
router.post('/:productId', authenticate, addReview);
router.get('/admin/:productId', authenticate, authorize(['admin']), listAllReviews);

export default router;






