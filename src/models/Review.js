import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const reviewSchema = new Schema({
  product: { type: Types.ObjectId, ref: 'Product', required: true, index: true },
  user: { type: Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true },
  approved: { type: Boolean, default: true }
}, { timestamps: true });

export default model('Review', reviewSchema);







