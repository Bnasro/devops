import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const meetingSchema = new Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  participants: [{ type: Types.ObjectId, ref: 'User' }],
  notes: { type: String }
}, { timestamps: true });

export default model('Meeting', meetingSchema);





