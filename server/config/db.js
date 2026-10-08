const mysql = require('mysql2/promise');
const { products, categories, brands } = require('../data/productsData');
const { users, dashboardOrders, sellerApplications, payoutRequests, buyerAddresses } = require('../data/dashboardData');
require('dotenv').config();

let pool = null;
let isConnected = false;

const initDB = async () => {
  try {
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'maicon_db';
    const port = process.env.DB_PORT || 3306;

    // Step 1: Connect to server and create database if not existing
    const initialConnection = await mysql.createConnection({
      host,
      user,
      password,
      port,
      connectTimeout: 2000
    });

    await initialConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await initialConnection.end();

    // Step 2: Create connection pool with database
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 2000
    });

    const conn = await pool.getConnection();
    console.log(`✅ Connected to MySQL Database (${database}) successfully.`);
    isConnected = true;

    // Step 3: Create Tables
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(150) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('admin', 'seller', 'buyer') DEFAULT 'buyer',
        \`phone\` VARCHAR(50) DEFAULT '+250 788 000 000',
        \`status\` ENUM('active', 'suspended', 'pending') DEFAULT 'active',
        \`store_name\` VARCHAR(200) NULL,
        \`store_slug\` VARCHAR(200) NULL,
        \`category\` VARCHAR(100) NULL,
        \`tin\` VARCHAR(50) NULL,
        \`commission_rate\` INT DEFAULT 8,
        \`avatar\` VARCHAR(255) NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`slug\` VARCHAR(100) PRIMARY KEY,
        \`name\` VARCHAR(150) NOT NULL,
        \`name_fr\` VARCHAR(150) NOT NULL,
        \`icon\` VARCHAR(50) NOT NULL,
        \`description\` TEXT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`brands\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`slug\` VARCHAR(100) NOT NULL UNIQUE,
        \`count\` INT DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`products\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`category\` VARCHAR(100) NOT NULL,
        \`category_slug\` VARCHAR(100) NOT NULL,
        \`brand\` VARCHAR(100) NOT NULL,
        \`price\` DECIMAL(12, 2) NOT NULL,
        \`rating\` DECIMAL(3, 2) DEFAULT 4.8,
        \`review_count\` INT DEFAULT 120,
        \`image_url\` TEXT NOT NULL,
        \`sizes\` TEXT NULL,
        \`colors\` TEXT NULL,
        \`stock\` INT DEFAULT 25,
        \`is_new\` BOOLEAN DEFAULT TRUE,
        \`seller_id\` INT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`buyer_id\` INT NULL,
        \`customer_name\` VARCHAR(150) NOT NULL,
        \`customer_email\` VARCHAR(150) NOT NULL,
        \`customer_phone\` VARCHAR(50) NOT NULL,
        \`shipping_address\` TEXT NOT NULL,
        \`district\` VARCHAR(100) NOT NULL,
        \`city\` VARCHAR(100) DEFAULT 'Kigali',
        \`subtotal\` DECIMAL(12, 2) NOT NULL,
        \`shipping_fee\` DECIMAL(12, 2) DEFAULT 0,
        \`total_amount\` DECIMAL(12, 2) NOT NULL,
        \`currency\` VARCHAR(10) DEFAULT 'RWF',
        \`payment_method\` VARCHAR(100) DEFAULT 'MTN Mobile Money',
        \`payment_status\` VARCHAR(50) DEFAULT 'paid',
        \`status\` ENUM('processing', 'in_transit', 'delivered', 'cancelled') DEFAULT 'processing',
        \`tracking_number\` VARCHAR(100) NOT NULL,
        \`carrier\` VARCHAR(100) DEFAULT 'Kigali Speed Logistics',
        \`items_json\` JSON NOT NULL,
        \`timeline_json\` JSON NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`seller_applications\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`applicant_name\` VARCHAR(150) NOT NULL,
        \`store_name\` VARCHAR(200) NOT NULL,
        \`category\` VARCHAR(100) NOT NULL,
        \`tin\` VARCHAR(50) NOT NULL,
        \`phone\` VARCHAR(50) NOT NULL,
        \`status\` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        \`documents_json\` JSON NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`payout_requests\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`seller_name\` VARCHAR(200) NOT NULL,
        \`amount\` DECIMAL(12, 2) NOT NULL,
        \`currency\` VARCHAR(10) DEFAULT 'RWF',
        \`method\` VARCHAR(100) NOT NULL,
        \`account_number\` VARCHAR(100) NOT NULL,
        \`account_name\` VARCHAR(150) NOT NULL,
        \`status\` ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
        \`processed_at\` TIMESTAMP NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`buyer_addresses\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`buyer_id\` INT NULL,
        \`label\` VARCHAR(100) NOT NULL,
        \`recipient_name\` VARCHAR(150) NOT NULL,
        \`phone\` VARCHAR(50) NOT NULL,
        \`street\` VARCHAR(255) NOT NULL,
        \`sector\` VARCHAR(100) NOT NULL,
        \`district\` VARCHAR(100) NOT NULL,
        \`province\` VARCHAR(100) DEFAULT 'Kigali City',
        \`is_default\` BOOLEAN DEFAULT FALSE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Step 4: Auto-seed Users
    for (const u of users) {
      await conn.query(`
        INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password\`, \`role\`, \`phone\`, \`status\`, \`store_name\`, \`store_slug\`, \`category\`, \`tin\`, \`commission_rate\`, \`avatar\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`), \`password\`=VALUES(\`password\`), \`role\`=VALUES(\`role\`), \`status\`=VALUES(\`status\`);
      `, [u.id, u.name, u.email, u.password || 'Admin@Maicon2026', u.role, u.phone, u.status || 'active', u.storeName || null, u.storeSlug || null, u.category || null, u.tin || null, u.commissionRate || 8, u.avatar || null]);
    }

    // Step 5: Auto-seed Categories
    for (const cat of categories) {
      if (cat.id === 'all') continue;
      await conn.query(`
        INSERT INTO \`categories\` (\`slug\`, \`name\`, \`name_fr\`, \`icon\`, \`description\`)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`), \`name_fr\`=VALUES(\`name_fr\`);
      `, [cat.slug, cat.name, cat.nameFr, cat.icon, cat.description]);
    }

    // Step 6: Auto-seed Brands
    for (const b of brands) {
      await conn.query(`
        INSERT INTO \`brands\` (\`id\`, \`name\`, \`slug\`, \`count\`)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`), \`count\`=VALUES(\`count\`);
      `, [b.id, b.name, b.slug, b.count]);
    }

    // Step 7: Auto-seed all 24 Products
    for (const p of products) {
      await conn.query(`
        INSERT INTO \`products\` (\`id\`, \`name\`, \`category\`, \`category_slug\`, \`brand\`, \`price\`, \`rating\`, \`review_count\`, \`image_url\`, \`sizes\`, \`colors\`, \`stock\`, \`is_new\`, \`seller_id\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`), \`price\`=VALUES(\`price\`), \`image_url\`=VALUES(\`image_url\`), \`stock\`=VALUES(\`stock\`);
      `, [p.id, p.name, p.category, p.category_slug, p.brand, p.price, p.rating || 4.8, p.reviews_count || 100, p.image_url, (p.sizes || []).join(', '), (p.colors || []).join(', '), p.stock || 20, p.is_new ? 1 : 0, 2]);
    }

    // Step 8: Auto-seed Orders
    for (const o of dashboardOrders) {
      await conn.query(`
        INSERT INTO \`orders\` (\`id\`, \`customer_name\`, \`customer_email\`, \`customer_phone\`, \`shipping_address\`,\`district\`, \`city\`, \`subtotal\`, \`shipping_fee\`, \`total_amount\`, \`currency\`, \`payment_method\`, \`payment_status\`, \`status\`, \`tracking_number\`, \`carrier\`, \`items_json\`, \`timeline_json\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE \`status\`=VALUES(\`status\`);
      `, [o.id, o.customerName, o.customerEmail, o.customerPhone, o.shippingAddress, o.district, o.city, o.subtotal, o.shippingFee, o.totalAmount, o.currency, o.paymentMethod, o.paymentStatus, o.status, o.trackingNumber, o.carrier, JSON.stringify(o.items), JSON.stringify(o.timeline)]);
    }

    // Step 9: Auto-seed Applications
    for (const app of sellerApplications) {
      await conn.query(`
        INSERT INTO \`seller_applications\` (\`id\`, \`applicant_name\`, \`store_name\`, \`category\`, \`tin\`, \`phone\`, \`status\`, \`documents_json\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE \`status\`=VALUES(\`status\`);
      `, [app.id, app.applicantName, app.storeName, app.category, app.tin, app.phone, app.status, JSON.stringify(app.documents)]);
    }

    // Step 10: Auto-seed Payouts
    for (const pay of payoutRequests) {
      await conn.query(`
        INSERT INTO \`payout_requests\` (\`id\`, \`seller_name\`, \`amount\`, \`currency\`, \`method\`, \`account_number\`, \`account_name\`, \`status\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE \`status\`=VALUES(\`status\`);
      `, [pay.id, pay.sellerName, pay.amount, pay.currency, pay.method, pay.accountNumber, pay.accountName, pay.status]);
    }

    // Step 11: Auto-seed Buyer Addresses
    for (const addr of buyerAddresses) {
      await conn.query(`
        INSERT INTO \`buyer_addresses\` (\`id\`, \`label\`, \`recipient_name\`, \`phone\`, \`street\`, \`sector\`, \`district\`, \`province\`, \`is_default\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE \`label\`=VALUES(\`label\`);
      `, [addr.id, addr.label, addr.recipientName, addr.phone, addr.street, addr.sector, addr.district, addr.province, addr.isDefault ? 1 : 0]);
    }

    console.log('📦 Complete marketplace data (24 Products, Users, Orders, KYC Applications, Payouts, Addresses) seeded in MySQL.');
    conn.release();
    return true;
  } catch (error) {
    console.warn('⚠️  MySQL Database server not active. Operating with full built-in persistent seeded data layer.');
    console.warn('   Reason:', error.message);
    isConnected = false;
    return false;
  }
};

const getDBStatus = () => isConnected;
const getPool = () => pool;

module.exports = {
  initDB,
  getDBStatus,
  getPool
};
