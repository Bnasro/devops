import User from '../models/User.js';

export async function getProfile(req, res) {
  const user = await User.findById(req.userId).select('-passwordHash');
  res.json(user);
}

export async function addAddress(req, res) {
  const user = await User.findById(req.userId);
  user.addresses.push({ ...req.body });
  await user.save();
  res.json(user.addresses);
}

export async function updateAddress(req, res) {
  const user = await User.findById(req.userId);
  const addr = user.addresses.id(req.params.id);
  if (!addr) return res.status(404).json({ message: 'Adresse introuvable' });
  Object.assign(addr, req.body);
  await user.save();
  res.json(user.addresses);
}

export async function removeAddress(req, res) {
  const user = await User.findById(req.userId);
  const addr = user.addresses.id(req.params.id);
  if (!addr) return res.status(404).json({ message: 'Adresse introuvable' });
  addr.deleteOne();
  await user.save();
  res.json(user.addresses);
}

export async function addPayment(req, res) {
  const user = await User.findById(req.userId);
  user.paymentMethods.push({ ...req.body });
  await user.save();
  res.json(user.paymentMethods);
}

export async function removePayment(req, res) {
  const user = await User.findById(req.userId);
  const pm = user.paymentMethods.id(req.params.id);
  if (!pm) return res.status(404).json({ message: 'Méthode introuvable' });
  pm.deleteOne();
  await user.save();
  res.json(user.paymentMethods);
}






