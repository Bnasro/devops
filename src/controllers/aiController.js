import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Segmentation simple: regrouper les produits par tranche de prix
export async function segmentation(_req, res) {
  const products = await Product.find({}).select('name price');
  const segments = { low: [], mid: [], high: [] };
  for (const p of products) {
    const amount = p.price?.amount || 0;
    if (amount < 20) segments.low.push(p);
    else if (amount < 100) segments.mid.push(p);
    else segments.high.push(p);
  }
  res.json({ segments, counts: { low: segments.low.length, mid: segments.mid.length, high: segments.high.length } });
}

// Prédiction naive: moyenne mobile des 7 derniers jours pour la demande
export async function prediction(_req, res) {
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const orders = await Order.find({ createdAt: { $gte: since } }).select('createdAt totalAmount');
  const perDay = new Map();
  for (const o of orders) {
    const day = new Date(o.createdAt); day.setHours(0,0,0,0);
    const key = day.toISOString();
    perDay.set(key, (perDay.get(key) || 0) + (o.totalAmount || 0));
  }
  const days = Array.from(perDay.keys()).sort();
  const series = days.map(d => ({ date: d, amount: perDay.get(d) }));
  const window = 7;
  const ma = series.map((_, i) => {
    const slice = series.slice(Math.max(0, i - window + 1), i + 1);
    const avg = slice.reduce((s, x) => s + x.amount, 0) / slice.length;
    return { date: series[i].date, movingAvg: Math.round(avg * 100) / 100 };
  });
  const next = ma.length ? ma[ma.length - 1].movingAvg : 0;
  res.json({ series, movingAverage: ma, nextDayPrediction: next });
}

// Série temporelle: agrégations par jour/semaine/mois
export async function timeseries(_req, res) {
  const since = new Date(Date.now() - 90 * 24 * 3600 * 1000);
  const orders = await Order.find({ createdAt: { $gte: since } }).select('createdAt totalAmount');
  const aggregate = (bucket) => {
    const m = new Map();
    for (const o of orders) {
      const d = new Date(o.createdAt);
      if (bucket === 'week') {
        const first = new Date(d); first.setDate(d.getDate() - d.getDay()); first.setHours(0,0,0,0);
        const key = first.toISOString();
        m.set(key, (m.get(key) || 0) + (o.totalAmount || 0));
      } else if (bucket === 'month') {
        const first = new Date(d.getFullYear(), d.getMonth(), 1);
        const key = first.toISOString();
        m.set(key, (m.get(key) || 0) + (o.totalAmount || 0));
      } else {
        const day = new Date(d); day.setHours(0,0,0,0);
        const key = day.toISOString();
        m.set(key, (m.get(key) || 0) + (o.totalAmount || 0));
      }
    }
    return Array.from(m.entries()).sort((a,b)=>a[0].localeCompare(b[0])).map(([date, amount]) => ({ date, amount }));
  };
  res.json({ daily: aggregate('day'), weekly: aggregate('week'), monthly: aggregate('month') });
}

// Chatbot simple: répondre aux questions basiques sur le catalogue
export async function chatbot(req, res) {
  const { question } = req.body || {};
  if (!question) return res.status(400).json({ message: 'Question requise' });

  const q = question.toLowerCase();
  let response = '';

  // Recherche de produits
  if (q.includes('produit') || q.includes('article')) {
    const count = await Product.countDocuments({ active: true });
    response = `Il y a ${count} produit${count > 1 ? 's' : ''} actif${count > 1 ? 's' : ''} dans le catalogue.`;
  } else if (q.includes('prix') || q.includes('tarif')) {
    const products = await Product.find({ active: true }).select('name price').limit(5);
    if (products.length > 0) {
      const list = products.map(p => `${p.name}: ${p.price?.amount || 0} ${p.price?.currency || 'TND'}`).join(', ');
      response = `Voici quelques produits et leurs prix: ${list}.`;
    } else {
      response = 'Aucun produit trouvé.';
    }
  } else if (q.includes('commande') || q.includes('order')) {
    const count = await Order.countDocuments();
    const recent = await Order.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } });
    response = `Total: ${count} commande${count > 1 ? 's' : ''}. ${recent} dans les 7 derniers jours.`;
  } else {
    response = 'Je peux vous aider avec des questions sur les produits, les prix, ou les commandes. Posez-moi une question !';
  }

  res.json({ response });
}




