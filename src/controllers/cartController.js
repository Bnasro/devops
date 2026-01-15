import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

export async function getCart(req, res) {
  const cart = await getOrCreateCart(req.userId);
  const { discount, final, shipping } = await computeTotals(cart);
  res.json({ ...cart.toObject(), totalAmount: cart.totalAmount(), discount, shipping, finalAmount: final });
}

export async function addItem(req, res) {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Produit introuvable' });
  const cart = await getOrCreateCart(req.userId);
  const existing = cart.items.find((it) => String(it.product) === String(product._id));
  if (existing) existing.quantity += Number(quantity);
  else cart.items.push({ product: product._id, name: product.name, priceAmount: product.price?.amount || 0, currency: product.price?.currency || 'TND', quantity });
  await cart.save();
  const { discount, final, shipping } = await computeTotals(cart);
  res.json({ ...cart.toObject(), totalAmount: cart.totalAmount(), discount, shipping, finalAmount: final });
}

export async function updateItem(req, res) {
  const { quantity } = req.body;
  const cart = await getOrCreateCart(req.userId);
  const item = cart.items.find((it) => String(it.product) === req.params.productId);
  if (!item) return res.status(404).json({ message: 'Article non trouvé' });
  item.quantity = Math.max(1, Number(quantity || 1));
  await cart.save();
  const { discount, final, shipping } = await computeTotals(cart);
  res.json({ ...cart.toObject(), totalAmount: cart.totalAmount(), discount, shipping, finalAmount: final });
}

export async function removeItem(req, res) {
  const cart = await getOrCreateCart(req.userId);
  cart.items = cart.items.filter((it) => String(it.product) !== req.params.productId);
  await cart.save();
  const { discount, final } = await computeTotals(cart);
  res.json({ ...cart.toObject(), totalAmount: cart.totalAmount(), discount, finalAmount: final });
}

export async function clearCart(req, res) {
  const cart = await getOrCreateCart(req.userId);
  cart.items = [];
  await cart.save();
  const { discount, final, shipping } = await computeTotals(cart);
  res.json({ ...cart.toObject(), totalAmount: cart.totalAmount(), discount, shipping, finalAmount: final });
}

export async function applyCoupon(req, res) {
  const { code } = req.body;
  const cart = await getOrCreateCart(req.userId);
  const coupon = await findValidCoupon(code, cart.totalAmount());
  if (!coupon) return res.status(400).json({ message: 'Coupon invalide' });
  cart.coupon = coupon.code;
  await cart.save();
  const { discount, final, shipping } = await computeTotals(cart);
  res.json({ ...cart.toObject(), totalAmount: cart.totalAmount(), discount, shipping, finalAmount: final });
}

export async function removeCoupon(req, res) {
  const cart = await getOrCreateCart(req.userId);
  cart.coupon = null;
  await cart.save();
  const { discount, final, shipping } = await computeTotals(cart);
  res.json({ ...cart.toObject(), totalAmount: cart.totalAmount(), discount, shipping, finalAmount: final });
}

async function findValidCoupon(code, amount) {
  if (!code) return null;
  const c = await Coupon.findOne({ code: String(code).toUpperCase().trim(), active: true });
  if (!c) return null;
  if (c.expiresAt && c.expiresAt.getTime() < Date.now()) return null;
  if (amount < (c.minAmount || 0)) return null;
  return c;
}

async function computeTotals(cart) {
  const amount = cart.totalAmount();
  if (!cart.coupon) return { discount: 0, final: amount };
  const c = await findValidCoupon(cart.coupon, amount);
  if (!c) return { discount: 0, final: amount };
  const discount = c.type === 'percent' ? Math.round((amount * c.value) / 100) : Math.min(c.value, amount);
  const subTotal = Math.max(0, amount - discount);
  const flat = Number(process.env.SHIPPING_FLAT || 10);
  const freeOver = Number(process.env.SHIPPING_FREE_OVER || 100);
  const shipping = subTotal >= freeOver ? 0 : flat;
  return { discount, final: Math.max(0, subTotal + shipping), shipping };
}


