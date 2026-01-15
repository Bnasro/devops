import Category from '../models/Category.js';
import slugify from 'slugify';

export async function listCategories(_req, res) {
  const items = await Category.find().sort({ name: 1 });
  res.json(items);
}

export async function createCategory(req, res) {
  const { name, parent } = req.body;
  if (!name) return res.status(400).json({ message: 'Nom requis' });
  const slug = slugify(name, { lower: true, strict: true });
  const item = await Category.create({ name, slug, parent: parent || null });
  res.status(201).json(item);
}

export async function updateCategory(req, res) {
  const { name, parent } = req.body;
  const updates = {};
  if (name) {
    updates.name = name;
    updates.slug = slugify(name, { lower: true, strict: true });
  }
  if (parent !== undefined) updates.parent = parent || null;
  const item = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!item) return res.status(404).json({ message: 'Catégorie introuvable' });
  res.json(item);
}

export async function removeCategory(req, res) {
  const item = await Category.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Catégorie introuvable' });
  res.json({ ok: true });
}






