import Stripe from 'stripe';
import Cart from '../models/Cart.js';

export async function createPaymentIntent(req, res) {
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ message: 'Stripe non configuré' });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  const cart = await Cart.findOne({ user: req.userId });
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Panier vide' });
  const amount = cart.items.reduce((s, it) => s + it.priceAmount * it.quantity, 0);
  const currency = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
  // Stripe impose un montant minimum par devise (ex: 50 cents en USD/EUR)
  const amountInSmallestUnit = Math.max(50, Math.round(amount * 100));
  const intent = await stripe.paymentIntents.create({
    amount: amountInSmallestUnit, // small currency unit (e.g., cents)
    currency,
    automatic_payment_methods: { enabled: true }
  });
  res.json({ clientSecret: intent.client_secret });
}


