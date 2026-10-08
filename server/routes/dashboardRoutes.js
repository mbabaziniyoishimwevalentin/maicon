const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const sellerController = require('../controllers/sellerController');
const buyerController = require('../controllers/buyerController');

// Auth Routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/current-user', authController.getCurrentUser);

// Admin Routes
router.get('/admin/stats', adminController.getAdminStats);
router.get('/admin/sellers', adminController.getSellers);
router.patch('/admin/sellers/:id/status', adminController.updateSellerStatus);
router.get('/admin/payouts', adminController.getAdminPayouts);
router.patch('/admin/payouts/:id/release', adminController.releasePayout);

// Admin User Management CRUD Routes
router.get('/admin/users', adminController.getUsers);
router.get('/admin/users/:id', adminController.getUserById);
router.post('/admin/users', adminController.createUser);
router.put('/admin/users/:id', adminController.updateUser);
router.delete('/admin/users/:id', adminController.deleteUser);

// Seller Routes
router.get('/seller/stats', sellerController.getSellerStats);
router.get('/seller/products', sellerController.getSellerProducts);
router.post('/seller/products', sellerController.addSellerProduct);
router.get('/seller/orders', sellerController.getSellerOrders);
router.patch('/seller/orders/:id/status', sellerController.updateOrderStatus);
router.post('/seller/payouts/request', sellerController.requestPayout);

// Buyer Routes
router.get('/buyer/orders', buyerController.getBuyerOrders);
router.get('/buyer/orders/:id', buyerController.getBuyerOrderById);
router.get('/buyer/addresses', buyerController.getBuyerAddresses);
router.post('/buyer/addresses', buyerController.addBuyerAddress);

module.exports = router;
