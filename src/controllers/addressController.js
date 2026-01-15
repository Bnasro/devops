import Address from '../models/Address.js';

export async function listMyAddresses(req, res) {
  const items = await Address.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(items);
}

export async function createAddress(req, res) {
  const { name, street, city, zip, country, label, isDefault } = req.body || {};
  if (!name || !street || !city || !zip || !country) return res.status(400).json({ message: 'Champs requis manquants' });
  const addr = await Address.create({ user: req.userId, name, street, city, zip, country, label, isDefault: !!isDefault });
  if (isDefault) {
    await Address.updateMany({ user: req.userId, _id: { $ne: addr._id } }, { isDefault: false });
  }
  res.status(201).json(addr);
}

export async function updateAddress(req, res) {
  const { id } = req.params;
  const payload = req.body || {};
  const addr = await Address.findOneAndUpdate({ _id: id, user: req.userId }, payload, { new: true });
  if (!addr) return res.status(404).json({ message: 'Adresse introuvable' });
  if (payload.isDefault) {
    await Address.updateMany({ user: req.userId, _id: { $ne: id } }, { isDefault: false });
  }
  res.json(addr);
}

export async function removeAddress(req, res) {
  const { id } = req.params;
  const out = await Address.findOneAndDelete({ _id: id, user: req.userId });
  if (!out) return res.status(404).json({ message: 'Adresse introuvable' });
  res.json({ ok: true });
}
