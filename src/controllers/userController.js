import User from '../models/User.js';

export async function listUsers(req, res) {
  const q = (req.query.q || '').toString().trim();
  const page = Math.max(1, parseInt((req.query.page || '1').toString(), 10));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit || '20').toString(), 10)));
  const sort = (req.query.sort || 'createdAt').toString();
  const order = (req.query.order || 'desc').toString().toLowerCase() === 'asc' ? 1 : -1;
  const filter = q ? { $or: [ { name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } } ] } : {};
  const total = await User.countDocuments(filter);
  const items = await User.find(filter)
    .select('-passwordHash')
    .sort({ [sort]: order })
    .skip((page - 1) * limit)
    .limit(limit);
  res.json({ items, total, page, limit });
}

export async function updateUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body || {};
  if (!['admin','client'].includes(role)) return res.status(400).json({ message: 'Rôle invalide' });
  if (String(id) === String(req.userId)) return res.status(400).json({ message: 'Impossible de changer votre propre rôle' });
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
  res.json(user);
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  if (String(id) === String(req.userId)) return res.status(400).json({ message: 'Impossible de supprimer votre propre compte' });
  const out = await User.findByIdAndDelete(id);
  if (!out) return res.status(404).json({ message: 'Utilisateur introuvable' });
  res.json({ ok: true });
}
