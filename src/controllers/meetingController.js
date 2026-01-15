import Meeting from '../models/Meeting.js';

export async function listMeetings(_req, res) {
  const items = await Meeting.find().sort({ date: -1 });
  res.json(items);
}

export async function createMeeting(req, res) {
  const { title, date, participants, notes } = req.body;
  if (!title || !date) return res.status(400).json({ message: 'title et date requis' });
  const item = await Meeting.create({ title, date, participants, notes });
  res.status(201).json(item);
}

export async function removeMeeting(req, res) {
  const item = await Meeting.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Réunion introuvable' });
  res.json({ ok: true });
}




