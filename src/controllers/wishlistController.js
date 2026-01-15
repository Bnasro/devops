import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

export async function getWishlist(req, res) {
  const doc = await Wishlist.findOne({ user: req.userId }).populate('items.product');
  res.json(doc || { user: req.userId, items: [] });
}

export async function addToWishlist(req, res) {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: 'productId requis' });
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Produit introuvable' });
  let doc = await Wishlist.findOne({ user: req.userId });
  if (!doc) doc = await Wishlist.create({ user: req.userId, items: [] });
  const exists = doc.items.some((it) => String(it.product) === String(productId));
  if (!exists) doc.items.push({ product: productId });
  await doc.save();
  const full = await doc.populate('items.product');
  res.status(201).json(full);
}

export async function removeFromWishlist(req, res) {
  const { id } = req.params; // wishlist item id or product id
  let doc = await Wishlist.findOne({ user: req.userId });
  if (!doc) return res.status(404).json({ message: 'Liste introuvable' });
  const before = doc.items.length;
  doc.items = doc.items.filter((it) => String(it._id) !== id && String(it.product) !== id);
  if (doc.items.length === before) return res.status(404).json({ message: 'Élément introuvable' });
  await doc.save();
  const full = await doc.populate('items.product');
  res.json(full);
}

export async function clearWishlist(req, res) {
  let doc = await Wishlist.findOne({ user: req.userId });
  if (!doc) return res.json({ user: req.userId, items: [] });
  doc.items = [];
  await doc.save();
  res.json({ user: req.userId, items: [] });
}
