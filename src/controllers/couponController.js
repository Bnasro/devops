import Coupon from '../models/Coupon.js';

export async function listCoupons(_req, res) {
  const items = await Coupon.find().sort({ createdAt: -1 });
  res.json(items);
}

export async function listPublicCoupons(_req, res) {
  const now = new Date();
  const items = await Coupon.find({
    active: true,
    $or: [ { expiresAt: null }, { expiresAt: { $gt: now } } ]
  }).sort({ createdAt: -1 });
  res.json(items);
}

export async function createCoupon(req, res) {
  const { code, type, value, minAmount, active, expiresAt } = req.body;
  const item = await Coupon.create({ code, type, value, minAmount, active, expiresAt });
  res.status(201).json(item);
}

export async function updateCoupon(req, res) {
  const { code, type, value, minAmount, active, expiresAt } = req.body;
  const item = await Coupon.findByIdAndUpdate(req.params.id, { code, type, value, minAmount, active, expiresAt }, { new: true });
  if (!item) return res.status(404).json({ message: 'Coupon introuvable' });
  res.json(item);
}

export async function removeCouponAdmin(req, res) {
  const item = await Coupon.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Coupon introuvable' });
  res.json({ ok: true });
}






