const { products } = require('../data/productsData');
const { sellerApplications, dashboardOrders, payoutRequests, users } = require('../data/dashboardData');

// GET /api/admin/stats
const getAdminStats = (req, res) => {
  const totalGMV = dashboardOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const netCommission = Math.round(totalGMV * 0.08); // 8% avg commission
  const totalSellers = users.filter(u => u.role === 'seller').length;
  const totalBuyers = users.filter(u => u.role === 'buyer').length + 420; // Active demo shopper count
  const pendingApprovals = sellerApplications.filter(a => a.status === 'pending').length;
  const pendingPayouts = payoutRequests.filter(p => p.status === 'pending').length;

  return res.json({
    success: true,
    stats: {
      totalGMV,
      currency: 'RWF',
      netCommission,
      totalOrders: dashboardOrders.length,
      totalSellers,
      totalBuyers,
      totalUsers: users.length,
      pendingApprovals,
      pendingPayouts
    }
  });
};

// ========================================================
// USER MANAGEMENT CRUD OPERATIONS
// ========================================================

// 1. GET /api/admin/users (List users with optional role & search filter)
const getUsers = (req, res) => {
  const { role, search } = req.query;
  let filtered = [...users];

  if (role && role !== 'all') {
    filtered = filtered.filter(u => u.role.toLowerCase() === role.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) ||
      (u.storeName && u.storeName.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q))
    );
  }

  return res.json({
    success: true,
    count: filtered.length,
    users: filtered
  });
};

// 2. GET /api/admin/users/:id (Single user details)
const getUserById = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  return res.json({ success: true, user });
};

// 3. POST /api/admin/users (Create / Register New Seller or User by Admin)
const createUser = (req, res) => {
  const {
    name,
    email,
    phone,
    role = 'seller',
    storeName,
    category = 'Fashion & Downtown Style',
    tin,
    commissionRate = 8,
    status = 'active',
    avatar
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Full Name and Email are required.' });
  }

  // Check email uniqueness
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
  }

  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const storeSlug = storeName ? storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined;

  const newUser = {
    id: newId,
    name,
    email,
    phone: phone || '+250 788 000 000',
    role: role.toLowerCase(),
    status,
    createdAt: new Date().toISOString().split('T')[0],
    avatar: avatar || (role === 'seller' 
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' 
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'),
    ...(role === 'seller' ? {
      storeName: storeName || `${name}'s Store`,
      storeSlug,
      category,
      tin: tin || `TIN-${Math.floor(10000 + Math.random() * 90000)}-RW`,
      commissionRate: parseInt(commissionRate, 10) || 8
    } : {})
  };

  users.unshift(newUser);

  return res.status(201).json({
    success: true,
    message: `${role === 'seller' ? 'Seller registered' : 'User created'} successfully by Admin!`,
    user: newUser
  });
};

// 4. PUT /api/admin/users/:id (Update User / Seller Profile)
const updateUser = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const {
    name,
    email,
    phone,
    role,
    status,
    storeName,
    category,
    tin,
    commissionRate
  } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (role) user.role = role.toLowerCase();
  if (status) user.status = status;

  if (user.role === 'seller' || role === 'seller') {
    if (storeName) user.storeName = storeName;
    if (category) user.category = category;
    if (tin) user.tin = tin;
    if (commissionRate !== undefined) user.commissionRate = parseInt(commissionRate, 10);
  }

  return res.json({
    success: true,
    message: `User #${id} updated successfully!`,
    user
  });
};

// 5. DELETE /api/admin/users/:id (Delete User / Seller)
const deleteUser = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Prevent deleting primary superadmin
  if (users[index].id === 1) {
    return res.status(403).json({ success: false, message: 'Primary SuperAdmin cannot be deleted.' });
  }

  const deleted = users.splice(index, 1)[0];

  return res.json({
    success: true,
    message: `User "${deleted.name}" (${deleted.role}) has been removed.`,
    user: deleted
  });
};

// GET /api/admin/sellers
const getSellers = (req, res) => {
  return res.json({
    success: true,
    applications: sellerApplications
  });
};

// PATCH /api/admin/sellers/:id/status
const updateSellerStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const app = sellerApplications.find(a => a.id === id);
  if (!app) {
    return res.status(404).json({ success: false, message: 'Seller application not found' });
  }

  app.status = status;
  return res.json({
    success: true,
    message: `Seller application ${id} marked as ${status}`,
    application: app
  });
};

// GET /api/admin/payouts
const getAdminPayouts = (req, res) => {
  return res.json({
    success: true,
    payouts: payoutRequests
  });
};

// PATCH /api/admin/payouts/:id/release
const releasePayout = (req, res) => {
  const { id } = req.params;
  const payout = payoutRequests.find(p => p.id === id);
  if (!payout) {
    return res.status(404).json({ success: false, message: 'Payout request not found' });
  }

  payout.status = 'completed';
  payout.processedAt = new Date().toISOString();

  return res.json({
    success: true,
    message: `Payout of ${payout.amount.toLocaleString()} RWF to ${payout.sellerName} successfully released!`,
    payout
  });
};

module.exports = {
  getAdminStats,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getSellers,
  updateSellerStatus,
  getAdminPayouts,
  releasePayout
};
