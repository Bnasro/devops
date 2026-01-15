import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Wishlist from '../models/Wishlist.js';
import PDFDocument from 'pdfkit';

export async function createFromCart(req, res) {
  const cart = await Cart.findOne({ user: req.userId });
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Panier vide' });
  const total = cart.items.reduce((s, it) => s + it.priceAmount * it.quantity, 0);
  const { address, payment, paymentIntentId } = req.body || {};
  const order = await Order.create({
    user: req.userId,
    items: cart.items.map((it) => ({ product: it.product, name: it.name, priceAmount: it.priceAmount, currency: it.currency, quantity: it.quantity })),
    totalAmount: total,
    currency: 'TND',
    shippingAddress: address || undefined,
    paymentSummary: paymentIntentId ? { ...payment, paymentIntentId } : (payment || undefined),
    status: paymentIntentId ? 'paid' : 'pending',
    payment: paymentIntentId ? 'card' : 'cash_on_delivery'
  });
  cart.items = [];
  await cart.save();
  res.status(201).json(order);
}

export async function listMyOrders(req, res) {
  const items = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(items);
}

export async function getOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Commande introuvable' });
  if (String(order.user) !== String(req.userId) && req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  res.json(order);
}

export async function updateStatus(req, res) {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) return res.status(404).json({ message: 'Commande introuvable' });
  res.json(order);
}

export async function invoicePdf(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Commande introuvable' });
  if (String(order.user) !== String(req.userId) && req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=invoice-${order._id}.pdf`);
  doc.pipe(res);
  doc.fontSize(20).text('Facture', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Commande: ${order._id}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  doc.text(`Statut: ${order.status}`);
  if (order.shippingAddress) {
    const a = order.shippingAddress || {};
    doc.moveDown().text('Livraison:');
    doc.text(`${a.fullName || ''}`);
    doc.text(`${a.line1 || ''} ${a.city || ''} ${a.postalCode || ''}`);
  }
  doc.moveDown();
  order.items.forEach((it) => {
    doc.text(`${it.name} x${it.quantity} - ${it.priceAmount} ${it.currency}`);
  })
  doc.moveDown();
  doc.fontSize(14).text(`Total: ${order.totalAmount} TND`, { align: 'right' });
  doc.end();
}

// Admin: Liste tous les paiements avec informations clients
export async function listAllPayments(req, res) {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Grouper par client
    const paymentsByUser = orders.reduce((acc, order) => {
      const userId = String(order.user?._id || order.user || 'unknown');
      if (!acc[userId]) {
        acc[userId] = {
          user: order.user || { name: 'Utilisateur supprimé', email: 'N/A' },
          transactions: [],
          totalSpent: 0,
          totalOrders: 0,
          paidOrders: 0,
          pendingOrders: 0
        };
      }
      acc[userId].transactions.push({
        _id: order._id,
        orderId: order._id,
        amount: order.totalAmount,
        currency: order.currency || 'TND',
        paymentMethod: order.payment || 'cash_on_delivery',
        status: order.status,
        paymentSummary: order.paymentSummary || null,
        createdAt: order.createdAt,
        itemsCount: order.items?.length || 0
      });
      acc[userId].totalSpent += order.totalAmount;
      acc[userId].totalOrders += 1;
      if (order.status === 'paid') acc[userId].paidOrders += 1;
      if (order.status === 'pending') acc[userId].pendingOrders += 1;
      return acc;
    }, {});

    // Convertir en array et trier par montant total dépensé
    const result = Object.values(paymentsByUser)
      .map((item) => ({
        user: item.user,
        totalSpent: item.totalSpent,
        totalOrders: item.totalOrders,
        paidOrders: item.paidOrders,
        pendingOrders: item.pendingOrders,
        transactions: item.transactions.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Client: Statistiques personnelles
export async function getClientStats(req, res) {
  try {
    const userId = req.userId;
    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .lean();

    // Statistiques générales
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'delivered').length;
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'shipped').length;

    // Répartition par statut (pour pie chart)
    const statusBreakdown = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    // Dépenses par mois (6 derniers mois)
    const monthlySpending = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthOrders = orders.filter(o => {
        const date = new Date(o.createdAt);
        return date >= monthStart && date < monthEnd;
      });
      const monthTotal = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      monthlySpending.push({
        month: monthStart.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        amount: monthTotal,
        orders: monthOrders.length
      });
    }

    // Répartition par catégorie (dépenses)
    const categorySpending = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        const product = item.product;
        if (product && product.categories) {
          const cats = Array.isArray(product.categories) ? product.categories : [product.categories];
          cats.forEach(cat => {
            const catName = typeof cat === 'object' && cat.name ? cat.name : 'Sans catégorie';
            const amount = (item.priceAmount || 0) * (item.quantity || 1);
            categorySpending[catName] = (categorySpending[catName] || 0) + amount;
          });
        }
      });
    });

    // Répartition par méthode de paiement
    const paymentMethods = orders.reduce((acc, o) => {
      const method = o.payment || 'cash_on_delivery';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    // Dépenses par jour (7 derniers jours)
    const dailySpending = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= date && orderDate < nextDay;
      });
      const dayTotal = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      dailySpending.push({
        date: date.toISOString().split('T')[0],
        amount: dayTotal,
        orders: dayOrders.length
      });
    }

    // Dernières commandes (5)
    const lastOrders = orders.slice(0, 5).map(o => ({
      _id: o._id,
      createdAt: o.createdAt,
      totalAmount: o.totalAmount,
      status: o.status,
      itemsCount: o.items?.length || 0
    }));

    // Avis donnés
    const reviews = await Review.find({ user: userId }).populate('product', 'name').sort({ createdAt: -1 }).limit(10).lean();
    const reviewsCount = await Review.countDocuments({ user: userId });
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length 
      : 0;

    // Produits favoris
    const wishlist = await Wishlist.findOne({ user: userId }).populate('items.product', 'name images price').lean();
    const wishlistCount = wishlist?.items?.length || 0;

    // Catégories préférées (top 5)
    const topCategories = Object.entries(categorySpending)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Commande la plus importante
    const biggestOrder = orders.length > 0 
      ? orders.reduce((max, o) => (o.totalAmount || 0) > (max.totalAmount || 0) ? o : max, orders[0])
      : null;

    // Tendance d'achat (mois actuel vs mois précédent)
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const thisMonthSpending = orders
      .filter(o => new Date(o.createdAt) >= thisMonth)
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    const lastMonthSpending = orders
      .filter(o => {
        const date = new Date(o.createdAt);
        return date >= lastMonth && date < thisMonth;
      })
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const spendingTrend = lastMonthSpending > 0 
      ? (((thisMonthSpending - lastMonthSpending) / lastMonthSpending) * 100).toFixed(1)
      : 0;

    res.json({
      totalOrders,
      totalSpent,
      paidOrders,
      pendingOrders,
      statusBreakdown: Object.entries(statusBreakdown).map(([status, count]) => ({ status, count })),
      monthlySpending,
      categorySpending: Object.entries(categorySpending).map(([category, amount]) => ({ category, amount })),
      paymentMethods: Object.entries(paymentMethods).map(([method, count]) => ({ method, count })),
      dailySpending,
      lastOrders,
      reviewsCount,
      avgRating: Math.round(avgRating * 10) / 10,
      wishlistCount,
      topCategories,
      biggestOrder: biggestOrder ? {
        _id: biggestOrder._id,
        totalAmount: biggestOrder.totalAmount,
        createdAt: biggestOrder.createdAt,
        itemsCount: biggestOrder.items?.length || 0
      } : null,
      spendingTrend: parseFloat(spendingTrend),
      thisMonthSpending,
      lastMonthSpending
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


