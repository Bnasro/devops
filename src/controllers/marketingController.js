import Campaign from '../models/Campaign.js';

export async function listCampaigns(_req, res) {
  const items = await Campaign.find({}).sort({ createdAt: -1 });
  res.json(items);
}

export async function createCampaign(req, res) {
  const { name, subject, audience, scheduledAt, contentHtml } = req.body || {};
  if (!name || !subject) return res.status(400).json({ message: 'name et subject requis' });
  const payload = { name, subject, audience, contentHtml };
  if (scheduledAt) payload.scheduledAt = new Date(scheduledAt);
  const doc = await Campaign.create(payload);
  res.status(201).json(doc);
}

export async function updateCampaign(req, res) {
  const { id } = req.params;
  const { name, subject, audience, status, scheduledAt, contentHtml } = req.body || {};
  const payload = { name, subject, audience, status, contentHtml };
  if (scheduledAt !== undefined) payload.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
  const doc = await Campaign.findByIdAndUpdate(id, payload, { new: true });
  if (!doc) return res.status(404).json({ message: 'Campagne introuvable' });
  res.json(doc);
}

export async function sendCampaign(req, res) {
  const { id } = req.params;
  // NOTE: Simule l'envoi (à implémenter via un provider email réel)
  const doc = await Campaign.findByIdAndUpdate(id, { status: 'sent', sentAt: new Date() }, { new: true });
  if (!doc) return res.status(404).json({ message: 'Campagne introuvable' });
  res.json({ message: 'Envoi simulé', campaign: doc });
}
