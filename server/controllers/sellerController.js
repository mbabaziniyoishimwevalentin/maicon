const { getDBStatus, getPool } = require('../config/db');
const mockData = require('../data/productsData');
const { dashboardOrders, payoutRequests } = require('../data/dashboardData');

// GET /api/seller/stats
const getSellerStats = async (req, res) => {
  let totalProducts = mockData.products.length;
  let totalOrders = dashboardOrders.length;
  let pendingOrders = dashboardOrders.filter(o => o.status === 'processing' || o.status === 'pending').length;
  let storeRevenue = dashboardOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

  const isConnected = getDBStatus();
  if (isConnected) {
    try {
      const pool = getPool();
      const [prodRows] = await pool.query('SELECT COUNT(*) as cnt FROM products');
      const [orderRows] = await pool.query('SELECT COUNT(*) as total, SUM(total_amount) as gmv, SUM(CASE WHEN status = "processing" THEN 1 ELSE 0 END) as pending FROM orders');
      if (prodRows[0]) totalProducts = prodRows[0].cnt;
      if (orderRows[0]) {
        totalOrders = orderRows[0].total || totalOrders;
        storeRevenue = parseFloat(orderRows[0].gmv) || storeRevenue;
        pendingOrders = orderRows[0].pending || 0;
      }
    } catch (e) {}
  }

  const availableBalance = Math.round(storeRevenue * 0.85);
  const escrowBalance = Math.round(storeRevenue * 0.15);

  return res.json({
    success: true,
    stats: {
      storeRevenue,
      currency: 'RWF',
      totalProducts,
      pendingOrders,
      availableBalance,
      escrowBalance
    }
  });
};

// GET /api/seller/products
const getSellerProducts = async (req, res) => {
  const isConnected = getDBStatus();
  if (isConnected) {
    try {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
      const formatted = rows.map(r => ({
        ...r,
        price: parseFloat(r.price),
        sizes: typeof r.sizes === 'string' ? r.sizes.split(',').map(s => s.trim()) : r.sizes,
        colors: typeof r.colors === 'string' ? r.colors.split(',').map(c => ({ name: c.trim(), hex: '#0f172a' })) : r.colors
      }));
      return res.json({ success: true, products: formatted });
    } catch (e) {}
  }

  return res.json({
    success: true,
    products: mockData.products
  });
};

// POST /api/seller/products (Add New Product)
const addSellerProduct = async (req, res) => {
  const {
    name,
    brand = 'Kigali Urban',
    category = 'Fashion & Downtown Style',
    category_slug = 'fashion',
    price,
    original_price,
    stock = 15,
    description = '',
    image_url,
    gallery = [],
    sizes = ['S', 'M', 'L'],
    colors = [{ name: 'Black', hex: '#111827' }],
    highlights = [],
    specifications = []
  } = req.body;

  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'Product name and price in RWF are required.' });
  }

  const formattedSizes = Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim());
  const formattedColors = Array.isArray(colors) ? colors.map(c => typeof c === 'object' ? c.name : c) : colors.split(',').map(c => c.trim());

  const isConnected = getDBStatus();
  let newId = Date.now();

  if (isConnected) {
    try {
      const pool = getPool();
      const [insertRes] = await pool.query(
        `INSERT INTO products (name, category, category_slug, brand, price, rating, review_count, image_url, sizes, colors, stock, is_new)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          category,
          category_slug,
          brand,
          parseFloat(price),
          5.0,
          0,
          image_url || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700',
          formattedSizes.join(', '),
          formattedColors.join(', '),
          parseInt(stock, 10),
          1
        ]
      );
      newId = insertRes.insertId;
    } catch (err) {
      console.error('Error inserting product in MySQL:', err);
    }
  }

  const newProduct = {
    id: newId,
    name,
    brand,
    category,
    category_slug,
    price: parseFloat(price),
    original_price: original_price ? parseFloat(original_price) : parseFloat(price) * 1.25,
    currency: 'RWF',
    is_new: true,
    stock: parseInt(stock, 10),
    rating: 5.0,
    review_count: 0,
    popularity: 100,
    image_url: image_url || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700',
    gallery: gallery.length ? gallery : [image_url || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700'],
    description: description || `${name} by ${brand}. Quality marketplace item available in Rwanda.`,
    sizes: formattedSizes,
    colors: formattedColors.map(c => ({ name: c, hex: '#0f172a' })),
    highlights,
    specifications
  };

  mockData.products.unshift(newProduct);

  if (brand) {
    const existingBrand = mockData.brands.find(b => b.name.toLowerCase() === brand.toLowerCase());
    if (existingBrand) {
      existingBrand.count = (existingBrand.count || 0) + 1;
    } else {
      mockData.brands.unshift({
        id: mockData.brands.length + 1,
        name: brand,
        slug: brand.toLowerCase().replace(/\s+/g, '-'),
        count: 1
      });
    }
  }

  return res.status(201).json({
    success: true,
    message: `"${name}" published to Maicon storefront successfully!`,
    product: newProduct
  });
};

// GET /api/seller/orders
const getSellerOrders = (req, res) => {
  return res.json({
    success: true,
    orders: dashboardOrders
  });
};

// PATCH /api/seller/orders/:id/status
const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status, trackingNumber, carrier } = req.body;

  const order = dashboardOrders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (carrier) order.carrier = carrier;

  // Add timeline entry
  if (status === 'in_transit') {
    order.timeline[2].completed = true;
    order.timeline[2].time = new Date().toLocaleTimeString();
  } else if (status === 'delivered') {
    order.timeline[3].completed = true;
    order.timeline[3].time = new Date().toLocaleTimeString();
  }

  return res.json({
    success: true,
    message: `Order #${id} status updated to ${status}`,
    order
  });
};

// POST /api/seller/payouts/request
const requestPayout = (req, res) => {
  const { amount, method = 'MTN Mobile Money', accountNumber, accountName } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Valid payout amount in RWF is required.' });
  }

  const newPayout = {
    id: `PAY-${Math.floor(400 + Math.random() * 500)}`,
    sellerId: 2,
    sellerName: 'Kigali Urban Trends',
    amount: parseFloat(amount),
    currency: 'RWF',
    method,
    accountNumber: accountNumber || '+250 788 654 321',
    accountName: accountName || 'Kigali Urban Trends Ltd',
    requestDate: new Date().toISOString().split('T')[0],
    status: 'pending'
  };

  payoutRequests.unshift(newPayout);

  return res.status(201).json({
    success: true,
    message: `Payout request for ${newPayout.amount.toLocaleString()} RWF submitted successfully!`,
    payout: newPayout
  });
};

module.exports = {
  getSellerStats,
  getSellerProducts,
  addSellerProduct,
  getSellerOrders,
  updateOrderStatus,
  requestPayout
};
