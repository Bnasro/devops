import Review from '../models/Review.js';
import mongoose from 'mongoose';

export async function listReviews(req, res) {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ message: 'productId invalide' });
    const items = await Review.find({ product: productId, approved: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function addReview(req, res) {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    if (!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ message: 'productId invalide' });
    const item = await Review.create({ product: productId, user: req.userId, rating, comment });
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function moderateReview(req, res) {
  try {
    const { approved } = req.body;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'id invalide' });
    const item = await Review.findByIdAndUpdate(id, { approved }, { new: true });
    if (!item) return res.status(404).json({ message: 'Avis introuvable' });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

export async function listAllReviews(req, res) {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ message: 'productId invalide' });
    const items = await Review.find({ product: productId }).sort({ createdAt: -1 }).limit(200);
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Admin: Liste tous les avis avec informations produit
export async function listAllReviewsForAdmin(req, res) {
  try {
    const items = await Review.find({})
      .populate('product', 'name images')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Client: Liste tous les avis approuvés avec informations produit
export async function listAllApprovedReviews(req, res) {
  try {
    const items = await Review.find({ approved: true })
      .populate('product', 'name images slug')
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}






