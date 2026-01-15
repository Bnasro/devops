import { Router } from 'express';
import Stripe from 'stripe';
import { authenticate } from '../security/authMiddleware.js';
import { createPaymentIntent } from '../controllers/paymentController.js';

const router = Router();
router.post('/intent', authenticate, createPaymentIntent);

// Optional webhook (dev friendly - no signature if missing)
router.post('/webhook', async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });
    const event = req.body; // In prod, verify signature via STRIPE_WEBHOOK_SECRET
    if (event.type === 'payment_intent.succeeded') {
      // Here we could update orders based on metadata if used
    }
    res.json({ received: true });
  } catch (e) {
    res.status(400).json({ message: 'Webhook error' });
  }
});

export default router;


