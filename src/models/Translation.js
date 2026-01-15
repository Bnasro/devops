import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const TranslationSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    values: {
      fr: { type: String, default: '' },
      en: { type: String, default: '' },
      ar: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

export default model('Translation', TranslationSchema);

