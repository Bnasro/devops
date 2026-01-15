import Translation from '../models/Translation.js';

export async function listTranslations(req, res) {
  const q = (req.query.q || '').toString().trim();
  const filter = q ? { key: { $regex: q, $options: 'i' } } : {};
  const items = await Translation.find(filter).sort({ key: 1 }).limit(1000);
  res.json(items);
}

export async function createTranslation(req, res) {
  const { key, values } = req.body || {};
  if (!key) return res.status(400).json({ message: 'key requis' });
  const doc = await Translation.create({ key, values: values || {} });
  res.status(201).json(doc);
}

export async function updateTranslation(req, res) {
  const { id } = req.params;
  const { values } = req.body || {};
  const doc = await Translation.findByIdAndUpdate(id, { values }, { new: true });
  if (!doc) return res.status(404).json({ message: 'Clé introuvable' });
  res.json(doc);
}

export async function deleteTranslation(req, res) {
  const { id } = req.params;
  const out = await Translation.findByIdAndDelete(id);
  if (!out) return res.status(404).json({ message: 'Clé introuvable' });
  res.json({ ok: true });
}

export async function exportLang(req, res) {
  const lang = (req.query.lang || 'fr').toString();
  const items = await Translation.find({}).select('key values');
  const map = {};
  items.forEach(t => { map[t.key] = (t.values && t.values[lang]) || '' });
  res.json(map);
}
