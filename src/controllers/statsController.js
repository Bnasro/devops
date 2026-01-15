import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Category from '../models/Category.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';

// Dashboard: statistiques générales
export async function getDashboardStats(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Ventes du jour
    const todaySales = await Order.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);
    const salesToday = todaySales[0]?.total || 0;
    const ordersToday = todaySales[0]?.count || 0;

    // Commandes ouvertes (pending, paid, shipped)
    const openOrders = await Order.countDocuments({ status: { $in: ['pending', 'paid', 'shipped'] } });

    // Produits en rupture
    const outOfStock = await Product.countDocuments({ $or: [{ stock: 0 }, { stock: { $exists: false } }], active: true });

    // Avis récents (7 derniers jours)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const recentReviews = await Review.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Dernières commandes (10)
    const lastOrders = await Order.find({}).sort({ createdAt: -1 }).limit(10).select('_id createdAt totalAmount status user items').lean();

    // Produits les plus vendus (par quantité dans les commandes)
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalQuantity: { $sum: '$items.quantity' }, totalRevenue: { $sum: { $multiply: ['$items.priceAmount', '$items.quantity'] } } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    // Total utilisateurs
    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } });
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Statistiques commandes par statut
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Total produits
    const totalProducts = await Product.countDocuments({ active: true });
    const totalCategories = await Category.countDocuments();

    // CA mensuel (ce mois vs mois précédent)
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    const thisMonthRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: thisMonth, $lt: thisMonthEnd }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: lastMonth, $lt: lastMonthEnd }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Graphique ventes hebdomadaire (dernières 4 semaines)
    const weeklySales = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const weekResult = await Order.aggregate([
        { $match: { createdAt: { $gte: weekStart, $lt: weekEnd }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]);
      
      weeklySales.push({
        week: `Semaine ${i + 1}`,
        startDate: weekStart.toISOString().split('T')[0],
        revenue: weekResult[0]?.total || 0,
        orders: weekResult[0]?.count || 0
      });
    }

    // Taux de satisfaction (avis >= 4 étoiles)
    const totalReviews = await Review.countDocuments();
    const positiveReviews = await Review.countDocuments({ rating: { $gte: 4 } });
    const satisfactionRate = totalReviews > 0 ? ((positiveReviews / totalReviews) * 100).toFixed(1) : 0;

    // Moyenne des avis
    const avgRating = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);

    res.json({
      salesToday,
      ordersToday,
      openOrders,
      outOfStock,
      recentReviews,
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      totalProducts,
      totalCategories,
      thisMonthRevenue: thisMonthRevenue[0]?.total || 0,
      lastMonthRevenue: lastMonthRevenue[0]?.total || 0,
      ordersByStatus: ordersByStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      satisfactionRate: parseFloat(satisfactionRate),
      avgRating: Math.round((avgRating[0]?.avg || 0) * 10) / 10,
      weeklySales,
      lastOrders: lastOrders.map(o => ({
        _id: o._id,
        createdAt: o.createdAt,
        totalAmount: o.totalAmount,
        status: o.status,
        itemsCount: o.items?.length || 0
      })),
      topProducts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Analytics: KPIs détaillés
export async function getAnalyticsStats(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);

    // Chiffre d'affaires aujourd'hui
    const caTodayResult = await Order.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const caToday = caTodayResult[0]?.total || 0;

    // Commandes aujourd'hui
    const ordersToday = await Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } });

    // Taux de conversion (commandes / paniers créés sur 7 jours)
    const cartsCreated = await Cart.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const ordersPlaced = await Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const conversionRate = cartsCreated > 0 ? ((ordersPlaced / cartsCreated) * 100).toFixed(1) : 0;

    // Panier moyen (7 jours)
    const avgCartResult = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, avg: { $avg: '$totalAmount' }, count: { $sum: 1 } } }
    ]);
    const avgCart = avgCartResult[0]?.avg || 0;

    // Ventes par jour (7 derniers jours pour graphique)
    const salesByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayResult = await Order.aggregate([
        { $match: { createdAt: { $gte: date, $lt: nextDay }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]);
      
      salesByDay.push({
        date: date.toISOString().split('T')[0],
        revenue: dayResult[0]?.total || 0,
        orders: dayResult[0]?.count || 0
      });
    }

    // Répartition par catégorie
    const categoryStats = await Order.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$product.categories', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'categories', localField: 'product.categories', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$category.name', revenue: { $sum: { $multiply: ['$items.priceAmount', '$items.quantity'] } }, count: { $sum: '$items.quantity' } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // Statistiques utilisateurs
    const totalUsers = await User.countDocuments();
    const newUsers7Days = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Statistiques produits
    const totalProducts = await Product.countDocuments({ active: true });
    const lowStockProducts = await Product.countDocuments({ stock: { $gt: 0, $lte: 10 }, active: true });

    // Ventes mensuelles (6 derniers mois)
    const monthlySales = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      
      const monthResult = await Order.aggregate([
        { $match: { createdAt: { $gte: monthStart, $lt: monthEnd }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]);
      
      monthlySales.push({
        month: monthStart.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        revenue: monthResult[0]?.total || 0,
        orders: monthResult[0]?.count || 0
      });
    }

    // Top clients (par CA)
    const topClients = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$user', totalSpent: { $sum: '$totalAmount' }, orderCount: { $sum: 1 } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } },
      { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } }
    ]);

    // Répartition des statuts de commandes
    const ordersStatusBreakdown = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Moyenne des avis par catégorie
    const reviewsByCategory = await Review.aggregate([
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$product.categories', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'categories', localField: 'product.categories', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$category.name', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      { $sort: { avgRating: -1 } },
      { $limit: 10 }
    ]);

    // Tendance commandes (hier vs aujourd'hui)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);
    
    const yesterdayOrders = await Order.countDocuments({ createdAt: { $gte: yesterday, $lt: yesterdayEnd } });
    const ordersGrowth = yesterdayOrders > 0 ? (((ordersToday - yesterdayOrders) / yesterdayOrders) * 100).toFixed(1) : 0;

    // CA par méthode de paiement
    const revenueByPayment = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$payment', total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    res.json({
      caToday,
      ordersToday,
      conversionRate: parseFloat(conversionRate),
      avgCart: Math.round(avgCart * 100) / 100,
      totalUsers,
      newUsers7Days,
      usersByRole: usersByRole.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
      totalProducts,
      lowStockProducts,
      ordersGrowth: parseFloat(ordersGrowth),
      salesByDay,
      monthlySales,
      topClients: topClients.map(c => ({
        userId: c._id,
        name: c.userInfo?.name || 'Utilisateur supprimé',
        email: c.userInfo?.email || '',
        totalSpent: c.totalSpent,
        orderCount: c.orderCount
      })),
      ordersStatusBreakdown: ordersStatusBreakdown.map(s => ({ status: s._id, count: s.count })),
      categoryStats: categoryStats.map(c => ({ name: c._id || 'Sans catégorie', revenue: c.revenue, count: c.count })),
      reviewsByCategory: reviewsByCategory.map(r => ({ category: r._id || 'Sans catégorie', avgRating: Math.round(r.avgRating * 10) / 10, count: r.count })),
      revenueByPayment: revenueByPayment.map(p => ({ method: p._id || 'Non spécifié', revenue: p.total, count: p.count }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Catalog: overview lists for admin catalog page
export async function getCatalogStats(req, res) {
  try {
    // Produits récents
    const recentProducts = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name slug stock price createdAt')
      .lean();

    // Stocks faibles (<= 10 et > 0)
    const lowStockList = await Product.find({ active: true, stock: { $gt: 0, $lte: 10 } })
      .sort({ stock: 1 })
      .limit(20)
      .select('name slug stock')
      .lean();

    // SEO en attente: pas de slug ou pas de description ou pas d'images
    const seoPending = await Product.find({
      $or: [
        { slug: { $in: [null, ''] } },
        { description: { $in: [null, ''] } },
        { images: { $size: 0 } }
      ]
    })
      .limit(20)
      .select('name slug description images')
      .lean();

    // Catégories principales (par nombre de produits)
    const topCategoriesAgg = await Product.aggregate([
      { $unwind: { path: '$categories', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
      { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, categoryId: '$cat._id', name: '$cat.name', count: 1 } }
    ]);

    res.json({
      recentProducts,
      lowStockList,
      seoPending,
      topCategories: topCategoriesAgg
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

