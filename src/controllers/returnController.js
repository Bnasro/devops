import Return from '../models/Return.js';
import Order from '../models/Order.js';

export async function listMyReturns(req, res) {
  const items = await Return.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(items);
}

export async function createReturn(req, res) {
  const { order, items, notes } = req.body || {};
  if (!order || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'order et items requis' });
  }
  const o = await Order.findById(order);
  if (!o) return res.status(404).json({ message: 'Commande introuvable' });
  if (String(o.user) !== String(req.userId)) return res.status(403).json({ message: 'Accès refusé' });
  const doc = await Return.create({ user: req.userId, order, items, notes });
  res.status(201).json(doc);
}

export async function adminList(req, res) {
  const items = await Return.find({}).sort({ createdAt: -1 });
  res.json(items);
}

export async function adminUpdateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body || {};
  const allowed = ['requested','approved','rejected','received','refunded'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Statut invalide' });
  const doc = await Return.findByIdAndUpdate(id, { status }, { new: true });
  if (!doc) return res.status(404).json({ message: 'Retour introuvable' });
  res.json(doc);
}
