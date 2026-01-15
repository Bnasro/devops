import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const categorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, trim: true, unique: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null }
}, { timestamps: true });

export default model('Category', categorySchema);







