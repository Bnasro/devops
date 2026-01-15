import TaxRule from '../models/TaxRule.js';

export async function listRules(_req, res) {
  const items = await TaxRule.find({}).sort({ country: 1 });
  res.json(items);
}

export async function createRule(req, res) {
  const { country, rate, active } = req.body || {};
  if (!country || typeof rate !== 'number') return res.status(400).json({ message: 'country et rate requis' });
  try {
    const doc = await TaxRule.create({ country: String(country).toUpperCase(), rate, active: active !== false });
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: 'Création impossible', error: e.message });
  }
}

export async function updateRule(req, res) {
  const { id } = req.params;
  const payload = req.body || {};
  if (payload.country) payload.country = String(payload.country).toUpperCase();
  const doc = await TaxRule.findByIdAndUpdate(id, payload, { new: true });
  if (!doc) return res.status(404).json({ message: 'Règle introuvable' });
  res.json(doc);
}

export async function removeRule(req, res) {
  const { id } = req.params;
  const out = await TaxRule.findByIdAndDelete(id);
  if (!out) return res.status(404).json({ message: 'Règle introuvable' });
  res.json({ ok: true });
}
