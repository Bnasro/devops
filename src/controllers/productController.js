import Product from "../models/Product.js";
import slugify from "slugify";

export async function listProducts(req, res) {
  const { q, category, ids } = req.query;
  const filter = {};
  if (q) Object.assign(filter, { name: { $regex: q, $options: "i" } });
  if (category) Object.assign(filter, { categories: category });
  if (ids) {
    const arr = String(ids)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (arr.length) Object.assign(filter, { _id: { $in: arr } });
  }
  const items = await Product.find(filter)
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("categories", "name");
  res.json(items);
}

export async function getProduct(req, res) {
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Produit introuvable" });
  res.json(item);
}

export async function getBySlug(req, res) {
  const item = await Product.findOne({ slug: req.params.slug });
  if (!item) return res.status(404).json({ message: "Produit introuvable" });
  res.json(item);
}

export async function createProduct(req, res) {
  const { name, priceAmount, currency = "TND" } = req.body;
  if (!name) return res.status(400).json({ message: "Nom requis" });
  const slug = slugify(name, { lower: true, strict: true });
  const images = Array.isArray(req.files?.images)
    ? req.files.images.map((f) => `/uploads/${f.filename}`)
    : [];
  const videoFile = Array.isArray(req.files?.video) ? req.files.video[0] : null;
  const variants = req.body.variants ? JSON.parse(req.body.variants) : [];
  const categories = req.body.categories ? JSON.parse(req.body.categories) : [];
  const item = await Product.create({
    name,
    slug,
    price: { amount: Number(priceAmount || 0), currency },
    images,
    videoUrl: videoFile
      ? `/uploads/${videoFile.filename}`
      : req.body.videoUrl || undefined,
    variants,
    categories,
  });
  res.status(201).json(item);
}

export async function updateProduct(req, res) {
  const { name, priceAmount, currency = "TND", active } = req.body;
  const images = Array.isArray(req.files?.images)
    ? req.files.images.map((f) => `/uploads/${f.filename}`)
    : [];
  const updates = {};
  if (name) {
    updates.name = name;
    updates.slug = slugify(name, { lower: true, strict: true });
  }
  if (priceAmount !== undefined)
    updates.price = { amount: Number(priceAmount), currency };
  if (active !== undefined) updates.active = active;
  if (req.body.variants) {
    try {
      updates.variants = JSON.parse(req.body.variants);
    } catch {
      return res
        .status(400)
        .json({ message: "variants invalide (JSON requis)" });
    }
  }
  if (req.body.categories) {
    try {
      updates.categories = JSON.parse(req.body.categories);
    } catch {
      return res
        .status(400)
        .json({ message: "categories invalide (JSON requis)" });
    }
  }
  if (images.length) updates.$push = { images: { $each: images } };
  const videoFileUpdate = Array.isArray(req.files?.video)
    ? req.files.video[0]
    : null;
  if (req.body.videoUrl) updates.videoUrl = req.body.videoUrl;
  if (videoFileUpdate)
    updates.videoUrl = `/uploads/${videoFileUpdate.filename}`;
  const item = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  });
  if (!item) return res.status(404).json({ message: "Produit introuvable" });
  res.json(item);
}

export async function removeProduct(req, res) {
  const item = await Product.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Produit introuvable" });
  res.json({ ok: true });
}

export async function updateStock(req, res) {
  const { stock } = req.body || {};
  if (stock === undefined || stock < 0)
    return res.status(400).json({ message: "stock requis (>=0)" });
  const item = await Product.findByIdAndUpdate(
    req.params.id,
    { stock: Number(stock) },
    { new: true }
  );
  if (!item) return res.status(404).json({ message: "Produit introuvable" });
  res.json(item);
}

export async function updateVariantStock(req, res) {
  const { idx } = req.params;
  const { stock } = req.body || {};
  if (stock === undefined || stock < 0)
    return res.status(400).json({ message: "stock requis (>=0)" });
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Produit introuvable" });
  const i = Number(idx);
  if (!item.variants || i < 0 || i >= item.variants.length)
    return res.status(400).json({ message: "Index de variante invalide" });
  item.variants[i].stock = Number(stock);
  await item.save();
  res.json(item);
}
