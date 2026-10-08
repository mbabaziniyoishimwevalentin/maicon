const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDB } = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static frontend files and uploads
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// API Routes
app.use('/api', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', uploadRoutes);

// Dedicated Portal Page Routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/auth.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('/seller', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/seller.html'));
});

app.get('/account', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/account.html'));
});

app.get('/product', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/product.html'));
});

app.get('/product.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/product.html'));
});

// Health check & DB status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Maicon E-Commerce Storefront & Multi-Role Portals',
    timestamp: new Date().toISOString()
  });
});

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize Database connection and start server
const startServer = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`===========================================`);
    console.log(`🚀 Maicon E-Commerce & Multi-Portals running!`);
    console.log(`🌐 Storefront:  http://localhost:${PORT}`);
    console.log(`🔐 Login:       http://localhost:${PORT}/login`);
    console.log(`👑 Admin:       http://localhost:${PORT}/admin`);
    console.log(`🏪 Seller:      http://localhost:${PORT}/seller`);
    console.log(`👤 Buyer:       http://localhost:${PORT}/account`);
    console.log(`===========================================`);
  });
};

startServer();
