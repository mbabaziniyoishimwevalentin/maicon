-- ========================================================
-- MAICON E-COMMERCE DATABASE COMPLETE SCHEMA & SEED DATA
-- Database: maicon_db
-- Currency: Rwandan Franc (RWF)
-- ========================================================

CREATE DATABASE IF NOT EXISTS `maicon_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `maicon_db`;

-- 1. Users Table (Admin, Sellers, Buyers)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'seller', 'buyer') DEFAULT 'buyer',
  `phone` VARCHAR(50) DEFAULT '+250 788 000 000',
  `status` ENUM('active', 'suspended', 'pending') DEFAULT 'active',
  `store_name` VARCHAR(200) NULL,
  `store_slug` VARCHAR(200) NULL,
  `category` VARCHAR(100) NULL,
  `tin` VARCHAR(50) NULL,
  `commission_rate` INT DEFAULT 8,
  `avatar` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `slug` VARCHAR(100) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `name_fr` VARCHAR(150) NOT NULL,
  `icon` VARCHAR(50) NOT NULL,
  `description` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Brands Table
CREATE TABLE IF NOT EXISTS `brands` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `count` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Products Table (24 Products across 10 Life Domains in RWF)
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `category_slug` VARCHAR(100) NOT NULL,
  `brand` VARCHAR(100) NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `rating` DECIMAL(3, 2) DEFAULT 4.8,
  `review_count` INT DEFAULT 120,
  `image_url` TEXT NOT NULL,
  `sizes` TEXT NULL,
  `colors` TEXT NULL,
  `stock` INT DEFAULT 25,
  `is_new` BOOLEAN DEFAULT TRUE,
  `seller_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category_slug`),
  INDEX `idx_brand` (`brand`),
  INDEX `idx_price` (`price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(50) PRIMARY KEY,
  `buyer_id` INT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_email` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `shipping_address` TEXT NOT NULL,
  `district` VARCHAR(100) NOT NULL,
  `city` VARCHAR(100) DEFAULT 'Kigali',
  `subtotal` DECIMAL(12, 2) NOT NULL,
  `shipping_fee` DECIMAL(12, 2) DEFAULT 0,
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'RWF',
  `payment_method` VARCHAR(100) DEFAULT 'MTN Mobile Money',
  `payment_status` VARCHAR(50) DEFAULT 'paid',
  `status` ENUM('processing', 'in_transit', 'delivered', 'cancelled') DEFAULT 'processing',
  `tracking_number` VARCHAR(100) NOT NULL,
  `carrier` VARCHAR(100) DEFAULT 'Kigali Speed Logistics',
  `items_json` JSON NOT NULL,
  `timeline_json` JSON NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Seller KYC Applications Table
CREATE TABLE IF NOT EXISTS `seller_applications` (
  `id` VARCHAR(50) PRIMARY KEY,
  `applicant_name` VARCHAR(150) NOT NULL,
  `store_name` VARCHAR(200) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `tin` VARCHAR(50) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `documents_json` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Payout Requests Table
CREATE TABLE IF NOT EXISTS `payout_requests` (
  `id` VARCHAR(50) PRIMARY KEY,
  `seller_name` VARCHAR(200) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'RWF',
  `method` VARCHAR(100) NOT NULL,
  `account_number` VARCHAR(100) NOT NULL,
  `account_name` VARCHAR(150) NOT NULL,
  `status` ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  `processed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Buyer Addresses Table
CREATE TABLE IF NOT EXISTS `buyer_addresses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `buyer_id` INT NULL,
  `label` VARCHAR(100) NOT NULL,
  `recipient_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `street` VARCHAR(255) NOT NULL,
  `sector` VARCHAR(100) NOT NULL,
  `district` VARCHAR(100) NOT NULL,
  `province` VARCHAR(100) DEFAULT 'Kigali City',
  `is_default` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- SEED DATA INSERTS (Users, Categories, Brands, Products, Orders, Applications, Payouts, Addresses)
-- ========================================================

-- Seed 1: Users
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`, `status`, `store_name`, `store_slug`, `category`, `tin`, `commission_rate`, `avatar`)
VALUES 
(1, 'Abdel Rahman (SuperAdmin)', 'admin@maicon.com', 'Admin@Maicon2026', 'admin', '+250 788 123 456', 'active', NULL, NULL, NULL, NULL, NULL, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
(2, 'Kigali Urban Trends Ltd', 'seller@maicon.com', 'Seller@Maicon2026', 'seller', '+250 788 654 321', 'active', 'Kigali Urban Trends Ltd', 'kigali-urban-trends', 'Fashion & Downtown Style', 'TIN-98234-RW', 8, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(3, 'Jean-Paul Mugisha', 'buyer@maicon.com', 'Buyer@Maicon2026', 'buyer', '+250 788 998 877', 'active', NULL, NULL, NULL, NULL, NULL, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
(4, 'Diane Uwase', 'diane@example.rw', 'Buyer@Maicon2026', 'buyer', '+250 788 112 233', 'active', NULL, NULL, NULL, NULL, NULL, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
(5, 'David Hakizimana', 'david.gourmet@maicon.com', 'Seller@Maicon2026', 'seller', '+250 788 771 200', 'active', 'Kigali Gourmet Coffee & Raw Foods', 'kigali-gourmet', 'Food, Groceries & Agriculture', 'TIN-77120-RW', 8, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
(6, 'Aline Umutoni', 'aline.furniture@maicon.com', 'Seller@Maicon2026', 'seller', '+250 788 332 910', 'suspended', 'Gikondo Modern Furniture & Lighting', 'gikondo-furniture', 'Home, Furniture & Lighting', 'TIN-33291-RW', 10, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `password`=VALUES(`password`), `role`=VALUES(`role`);

-- Seed 2: Categories
INSERT INTO `categories` (`slug`, `name`, `name_fr`, `icon`, `description`)
VALUES 
('fashion', 'Fashion & Downtown Style', 'Mode & Style Urbain', 'shirt', 'Daily streetwear, downtown chic, tailored wedding suits and footwear'),
('food-groceries', 'Food, Groceries & Agriculture', 'Alimentation, Épicerie & Agriculture', 'utensils', 'Fresh groceries, organic coffee, restaurant ingredients & farming machinery'),
('events-weddings', 'Events, Parties & Weddings', 'Événements, Fêtes & Mariages', 'party-popper', 'Wedding decor, birthday supplies, bar glassware & conference equipment'),
('home-furniture', 'Home, Furniture & Lighting', 'Maison, Meubles & Éclairage', 'home', 'Living room sofas, bar stools, dining tables & chandelier lighting'),
('office-work', 'Office, Work & Business', 'Bureau, Travail & Entreprise', 'briefcase', 'Ergonomic office desks, meeting projectors, restaurant POS & business gear'),
('electronics', 'Electronics & Smart Tech', 'Électronique & High-Tech', 'smartphone', 'Smartphones, laptops, venue sound systems, books and gaming consoles'),
('health-medical', 'Health, Medical & Wellness', 'Santé, Médical & Bien-être', 'heart-pulse', 'Medical devices, monitoring gear, air purifiers & daily wellness'),
('construction-hardware', 'Construction, Tools & Hardware', 'Construction, Outils & Bricolage', 'hammer', 'Power tools, building materials, lighting fixtures & safety equipment'),
('sports-toys-hobbies', 'Sports, Toys & Hobbies', 'Sports, Jouets & Loisirs', 'dumbbell', 'Gym gear, kids toys, collector board games, books and outdoor fitness'),
('motors-mobility', 'Motors, Auto & City Mobility', 'Auto, Moto & Mobilité Urbaine', 'car', 'Electric downtown scooters, car parts, motorcycle gear and diagnostics')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Seed 3: Brands
INSERT INTO `brands` (`name`, `slug`, `count`)
VALUES 
('Nike', 'nike', 123),
('Adidas', 'adidas', 55),
('Apple', 'apple', 85),
('Sony', 'sony', 42),
('Dyson', 'dyson', 28),
('Bosch', 'bosch', 34),
('DeWalt', 'dewalt', 22),
('Nespresso', 'nespresso', 30),
('Omron', 'omron', 18)
ON DUPLICATE KEY UPDATE `count`=VALUES(`count`);

-- Seed 4: Products (24 Items across 10 Life Domains)
INSERT INTO `products` (`id`, `name`, `category`, `category_slug`, `brand`, `price`, `rating`, `review_count`, `image_url`, `sizes`, `colors`, `stock`, `is_new`, `seller_id`)
VALUES 
(1, 'Shirt Soft Cotton Polo', 'Fashion & Downtown Style', 'fashion', 'Uniqlo', 35000.00, 4.9, 214, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600', 'S, M, L, XL', '#06B6D4, #3B82F6, #1E293B', 24, TRUE, 2),
(2, 'Classic Tailored Wool Suit Blazer', 'Fashion & Downtown Style', 'fashion', 'Nike', 120000.00, 4.8, 89, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600', 'M, L, XL', '#1E293B, #000000, #CBD5E1', 12, TRUE, 2),
(3, 'Downtown Minimalist Leather Chelsea Boots', 'Fashion & Downtown Style', 'fashion', 'Adidas', 85000.00, 4.7, 142, 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600', '40, 41, 42, 43, 44', '#78350F, #000000', 18, FALSE, 2),
(4, 'Artisan Arabica Whole Coffee Beans (1kg)', 'Food, Groceries & Agriculture', 'food-groceries', 'Nespresso', 28000.00, 5.0, 310, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600', '500g, 1kg, 2.5kg', '#78350F', 50, TRUE, 5),
(5, 'Professional Heavy-Duty Hydraulic Tractor Pump', 'Food, Groceries & Agriculture', 'food-groceries', 'Bosch', 450000.00, 4.9, 32, 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600', 'Standard ISO, Heavy-Duty', '#E2E8F0, #06B6D4', 6, TRUE, 5),
(6, 'Commercial Grade Stainless Steel Espresso Maker', 'Food, Groceries & Agriculture', 'food-groceries', 'Nespresso', 650000.00, 4.9, 78, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600', '1-Group, 2-Group Pro', '#CBD5E1, #000000', 8, FALSE, 5),
(7, 'Luxury Wedding LED Ambient Floral Lighting Set', 'Events, Parties & Weddings', 'events-weddings', 'Sony', 95000.00, 4.9, 115, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', '10m Set, 25m Set, 50m Set', '#FDE047, #FFFFFF', 30, TRUE, 2),
(8, 'Cocktail & Bar Polycarbonate Crystal Glassware (Set of 12)', 'Events, Parties & Weddings', 'events-weddings', 'Uniqlo', 68000.00, 4.8, 64, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600', 'Set of 6, Set of 12', '#FFFFFF, #06B6D4', 22, TRUE, 2),
(9, 'Birthday & Party Event Balloon Garland Arch Kit', 'Events, Parties & Weddings', 'events-weddings', 'Nike', 32000.00, 4.6, 92, 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600', 'Standard Arch, Deluxe 200pc', '#EC4899, #06B6D4, #F59E0B', 45, FALSE, 2),
(10, 'Scandinavian Velvet Lounge Accent Chair', 'Home, Furniture & Lighting', 'home-furniture', 'Dyson', 185000.00, 4.9, 87, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600', 'Standard Single, Wide Armchair', '#06B6D4, #1E293B, #CBD5E1', 15, TRUE, 6),
(11, 'Modern Geometric Dining Pendant Chandelier', 'Home, Furniture & Lighting', 'home-furniture', 'Bosch', 115000.00, 4.8, 56, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600', '3-Light Cluster, 5-Light Strip', '#000000, #F59E0B, #CBD5E1', 14, TRUE, 6),
(12, 'Commercial Bar Stool Solid Ash & Steel (Pair)', 'Home, Furniture & Lighting', 'home-furniture', 'Uniqlo', 140000.00, 4.7, 43, 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600', 'Counter Height 65cm, Bar Height 75cm', '#78350F, #1E293B', 20, FALSE, 6),
(13, 'Ergonomic Mesh High-Back Executive Office Chair', 'Office, Work & Business', 'office-work', 'DeWalt', 165000.00, 4.9, 198, 'https://images.unsplash.com/photo-1580481077195-c999335ef009?w=600', 'Standard Fit, XL Tall', '#000000, #64748B', 25, TRUE, 2),
(14, 'Wireless 4K Conference Meeting Projector & Hub', 'Office, Work & Business', 'office-work', 'Sony', 420000.00, 4.8, 38, 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600', '3500 ANSI Lumens, 5000 ANSI Ultra', '#FFFFFF, #000000', 9, TRUE, 2),
(15, 'Smart All-in-One Touchscreen POS Cashier Terminal', 'Office, Work & Business', 'office-work', 'Apple', 580000.00, 5.0, 72, 'https://images.unsplash.com/photo-1556742049-0a67e55722c6?w=600', '15.6 Inch Dual Screen, Mobile POS', '#000000, #CBD5E1', 11, FALSE, 2),
(16, 'Noise Cancelling Wireless Bluetooth Headphones', 'Electronics & Smart Tech', 'electronics', 'Sony', 210000.00, 4.9, 442, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 'Standard Foldable', '#000000, #CBD5E1, #06B6D4', 35, TRUE, 2),
(17, 'Next-Gen Ultra-Thin 15-inch Pro Workstation Laptop', 'Electronics & Smart Tech', 'electronics', 'Apple', 1550000.00, 5.0, 168, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', '16GB / 512GB SSD, 32GB / 1TB SSD', '#CBD5E1, #1E293B', 10, TRUE, 2),
(18, 'Digital Smart Blood Pressure & Heart Rate Monitor', 'Health, Medical & Wellness', 'health-medical', 'Omron', 65000.00, 4.9, 185, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600', 'Standard Cuff (22-42cm), XL Cuff', '#FFFFFF, #06B6D4', 40, TRUE, 2),
(19, 'Hospital Grade HEPA Air Purifier with UV Sterilizer', 'Health, Medical & Wellness', 'health-medical', 'Dyson', 280000.00, 4.8, 93, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600', 'Coverage 50m², Coverage 95m²', '#FFFFFF, #CBD5E1', 16, FALSE, 2),
(20, '20V Brushless Cordless Drill & Impact Wrench Kit', 'Construction, Tools & Hardware', 'construction-hardware', 'DeWalt', 195000.00, 5.0, 260, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600', '2x 4.0Ah Batteries + Case', '#F59E0B, #000000', 28, TRUE, 2),
(21, 'Heavy Duty Rotary Laser Level with Tripod & Rod', 'Construction, Tools & Hardware', 'construction-hardware', 'Bosch', 340000.00, 4.8, 51, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600', 'Green Beam 500m Range, Red Beam 300m', '#3B82F6, #1E293B', 12, FALSE, 2),
(22, 'Adjustable Quick-Select Dumbbell Set (Pair 24kg)', 'Sports, Toys & Hobbies', 'sports-toys-hobbies', 'Nike', 175000.00, 4.9, 137, 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600', 'Pair 24kg (2.5-24kg), Pair 40kg', '#000000, #EF4444', 18, TRUE, 2),
(23, 'Collector Edition Strategic Board Game & Expansions', 'Sports, Toys & Hobbies', 'sports-toys-hobbies', 'Adidas', 48000.00, 4.9, 88, 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600', 'Core Box + 2 Expansions', '#78350F, #06B6D4', 25, FALSE, 2),
(24, 'High-Torque Dual Motor Electric Commuter Scooter', 'Motors, Auto & City Mobility', 'motors-mobility', 'Nike', 620000.00, 4.9, 104, 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600', 'Range 45km (350W), Range 70km (800W Dual)', '#000000, #06B6D4', 14, TRUE, 2)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `price`=VALUES(`price`), `image_url`=VALUES(`image_url`);

-- Seed 5: Orders
INSERT INTO `orders` (`id`, `buyer_id`, `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `district`, `city`, `subtotal`, `shipping_fee`, `total_amount`, `currency`, `payment_method`, `payment_status`, `status`, `tracking_number`, `carrier`, `items_json`, `timeline_json`)
VALUES 
('MAI-782190', 3, 'Jean-Paul Mugisha', 'buyer@maicon.com', '+250 788 998 877', 'KG 9 Ave, House #24, Nyarugenge, Kigali', 'Nyarugenge', 'Kigali', 98000.00, 0, 98000.00, 'RWF', 'MTN Mobile Money', 'paid', 'in_transit', 'RW-EXP-902341', 'Kigali Speed Logistics',
 '[{"id": 1, "name": "Shirt Soft Cotton Polo", "price": 35000, "quantity": 2, "size": "L", "color": "Beige", "image_url": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=200"}, {"id": 4, "name": "Artisan Arabica Whole Coffee Beans (1kg)", "price": 28000, "quantity": 1, "size": "1kg Bag", "color": "Rich Roast", "image_url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200"}]',
 '[{"status": "Order Placed", "time": "2026-09-02 10:30 AM", "completed": true}, {"status": "Processing & Packed", "time": "2026-09-02 11:45 AM", "completed": true}, {"status": "Dispatched for Delivery", "time": "2026-09-02 02:15 PM", "completed": true}, {"status": "Delivered", "time": "Estimated Today by 05:00 PM", "completed": false}]'),

('MAI-654921', 3, 'Jean-Paul Mugisha', 'buyer@maicon.com', '+250 788 998 877', 'KG 549 St, Kacyiru, Gasabo, Kigali', 'Gasabo', 'Kigali', 210000.00, 0, 210000.00, 'RWF', 'Airtel Money', 'paid', 'delivered', 'RW-EXP-654921', 'Kigali Speed Logistics',
 '[{"id": 16, "name": "Noise Cancelling Wireless Bluetooth Headphones", "price": 21000, "quantity": 1, "size": "Standard", "color": "Black", "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200"}]',
 '[{"status": "Order Placed", "time": "2026-09-01 02:20 PM", "completed": true}, {"status": "Processing & Packed", "time": "2026-09-01 03:00 PM", "completed": true}, {"status": "Dispatched for Delivery", "time": "2026-09-01 04:30 PM", "completed": true}, {"status": "Delivered", "time": "2026-09-01 06:15 PM", "completed": true}]'),

('MAI-512098', 4, 'Diane Uwase', 'diane@example.rw', '+250 788 112 233', 'KK 15 Rd, Niboye, Kicukiro, Kigali', 'Kicukiro', 'Kigali', 310000.00, 0, 310000.00, 'RWF', 'MTN Mobile Money', 'paid', 'processing', 'RW-EXP-512098', 'Kigali Speed Logistics',
 '[{"id": 10, "name": "Scandinavian Velvet Lounge Accent Chair", "price": 185000, "quantity": 1, "size": "Standard Single", "color": "Teal", "image_url": "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=200"}, {"id": 2, "name": "Classic Tailored Wool Suit Blazer", "price": 125000, "quantity": 1, "size": "M", "color": "Navy", "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200"}]',
 '[{"status": "Order Placed", "time": "2026-09-02 09:00 AM", "completed": true}, {"status": "Processing & Packed", "time": "2026-09-02 10:15 AM", "completed": true}, {"status": "Dispatched for Delivery", "time": "In Preparation", "completed": false}, {"status": "Delivered", "time": "Tomorrow", "completed": false}]')
ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

-- Seed 6: Seller KYC Applications
INSERT INTO `seller_applications` (`id`, `applicant_name`, `store_name`, `category`, `tin`, `phone`, `status`, `documents_json`)
VALUES 
('APP-101', 'Eric Manzi', 'Nyarugenge Tech & Electronics Hub', 'Electronics & Smart Tech', 'TIN-44582-RW', '+250 788 445 821', 'pending', '["Business_Registration.pdf", "National_ID.pdf"]'),
('APP-102', 'Aline Umutoni', 'Gikondo Modern Furniture & Lighting', 'Home, Furniture & Lighting', 'TIN-33291-RW', '+250 788 332 910', 'pending', '["RDB_Certificate.pdf", "Tax_Clearance.pdf"]'),
('APP-103', 'David Hakizimana', 'Kigali Gourmet Coffee & Raw Foods', 'Food, Groceries & Agriculture', 'TIN-77120-RW', '+250 788 771 200', 'approved', '["NAEB_License.pdf"]')
ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

-- Seed 7: Payout Requests
INSERT INTO `payout_requests` (`id`, `seller_name`, `amount`, `currency`, `method`, `account_number`, `account_name`, `status`)
VALUES 
('PAY-801', 'Kigali Urban Trends Ltd', 150000.00, 'RWF', 'MTN Mobile Money', '+250 788 654 321', 'Kigali Urban Trends Ltd', 'pending'),
('PAY-802', 'Kigali Gourmet Coffee', 220000.00, 'RWF', 'Bank of Kigali (BK)', '00045-889123-RW', 'Kigali Gourmet Ltd', 'completed')
ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

-- Seed 8: Buyer Addresses
INSERT INTO `buyer_addresses` (`id`, `buyer_id`, `label`, `recipient_name`, `phone`, `street`, `sector`, `district`, `province`, `is_default`)
VALUES 
(1, 3, 'Primary Residence (Home)', 'Jean-Paul Mugisha', '+250 788 998 877', 'KG 9 Ave, House #24', 'Kiyovu', 'Nyarugenge', 'Kigali City', TRUE),
(2, 3, 'Work Office', 'Jean-Paul Mugisha', '+250 788 998 877', 'KG 549 St, Innovation City Tower', 'Kacyiru', 'Gasabo', 'Kigali City', FALSE)
ON DUPLICATE KEY UPDATE `label`=VALUES(`label`);
