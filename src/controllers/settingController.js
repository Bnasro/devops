import Setting from '../models/Setting.js';

export async function getSettings(_req, res) {
  const doc = await Setting.findById('global');
  if (!doc) {
    const created = await Setting.create({ _id: 'global' });
    return res.json(created);
  }
  res.json(doc);
}

export async function updateSettings(req, res) {
  const payload = req.body || {};
  const doc = await Setting.findByIdAndUpdate('global', payload, { upsert: true, new: true, setDefaultsOnInsert: true });
  res.json(doc);
}
