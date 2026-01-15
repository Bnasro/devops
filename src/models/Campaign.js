import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const CampaignSchema = new Schema(
  {
    name: { type: String, required: true },
    subject: { type: String, required: true },
    audience: { type: String, default: 'Tous les clients' },
    status: { type: String, enum: ['draft','scheduled','sending','sent'], default: 'draft', index: true },
    scheduledAt: { type: Date, default: null, index: true },
    sentAt: { type: Date, default: null },
    contentHtml: { type: String, default: '' }
  },
  { timestamps: true }
);

export default model('Campaign', CampaignSchema);

