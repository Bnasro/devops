import Notification from '../models/Notification.js';

export async function listMyNotifications(req, res) {
  const items = await Notification.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(items);
}

export async function markRead(req, res) {
  const { id } = req.params;
  const n = await Notification.findOneAndUpdate({ _id: id, user: req.userId }, { read: true }, { new: true });
  if (!n) return res.status(404).json({ message: 'Notification introuvable' });
  res.json(n);
}

export async function markAllRead(req, res) {
  await Notification.updateMany({ user: req.userId, read: false }, { read: true });
  res.json({ ok: true });
}

// utilitaire optionnel: créer une notification (admin ou dev)
export async function createForUser(req, res) {
  const { userId, message, type } = req.body || {};
  if (!userId || !message) return res.status(400).json({ message: 'userId et message requis' });
  const n = await Notification.create({ user: userId, message, type: type || 'info' });
  res.status(201).json(n);
}
