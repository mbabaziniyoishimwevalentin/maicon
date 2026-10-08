-- =============================================
-- Maicon E-Commerce Database Schema
-- Compatible with MySQL 5.7+ / 8.0+
-- =============================================

CREATE DATABASE IF NOT EXISTS `maicon_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `maicon_db`;

-- 1. Brands Table
DROP TABLE IF EXISTS `product_variants`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `brands`;

CREATE TABLE `brands` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `logo_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Categories Table
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Products Table
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `brand_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `original_price` DECIMAL(10, 2) DEFAULT NULL,
  `currency` VARCHAR(10) DEFAULT 'SAR',
  `is_new` BOOLEAN DEFAULT TRUE,
  `stock` INT DEFAULT 12,
  `image_url` VARCHAR(500) NOT NULL,
  `rating` DECIMAL(2,1) DEFAULT 4.8,
  `popularity` INT DEFAULT 100,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Product Variants (Sizes and Colors) Table
CREATE TABLE `product_variants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `size` VARCHAR(10) NOT NULL,
  `color_name` VARCHAR(50) NOT NULL,
  `color_hex` VARCHAR(20) NOT NULL,
  `stock` INT DEFAULT 5,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Orders Table
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_email` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(50) DEFAULT NULL,
  `shipping_address` TEXT NOT NULL,
  `city` VARCHAR(100) DEFAULT 'Riyadh',
  `country` VARCHAR(100) DEFAULT 'Saudi Arabia',
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'SAR',
  `status` ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Order Items Table
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `size` VARCHAR(10) DEFAULT NULL,
  `color` VARCHAR(50) DEFAULT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- SEED DATA (Matching UI Mockup)
-- =============================================

INSERT INTO `brands` (`id`, `name`, `slug`, `logo_url`) VALUES
(1, 'Nike', 'nike', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'),
(2, 'Adidas', 'adidas', 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=100'),
(3, 'Apple', 'apple', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100'),
(4, 'New Balance', 'new-balance', 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=100'),
(5, 'Puma', 'puma', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=100'),
(6, 'Uniqlo', 'uniqlo', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100');

INSERT INTO `categories` (`id`, `name`, `slug`, `description`) VALUES
(1, 'Clothes', 'clothes', 'Men and Women casual fashion and premium apparel'),
(2, 'Shoes', 'shoes', 'Athletic and casual footwear'),
(3, 'Accessories', 'accessories', 'Modern lifestyle accessories');

INSERT INTO `products` (`id`, `brand_id`, `category_id`, `name`, `slug`, `price`, `original_price`, `is_new`, `stock`, `image_url`, `rating`, `popularity`) VALUES
(1, 6, 1, 'Shirt Soft Cotton', 'shirt-soft-cotton', 40.00, 55.00, 1, 12, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80', 4.9, 140),
(2, 6, 1, 'Zip Up Neck Shirt', 'zip-up-neck-shirt', 40.00, 60.00, 1, 12, 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80', 4.8, 130),
(3, 6, 1, 'Classic Long Sleeve', 'classic-long-sleeve', 40.00, 50.00, 1, 12, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80', 4.7, 120),
(4, 1, 1, 'Nike Dri-FIT Training Tee', 'nike-dri-fit-tee', 65.00, 85.00, 1, 8, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80', 4.9, 160),
(5, 2, 1, 'Adidas Essentials Trefoil Crew', 'adidas-essentials-crew', 75.00, 95.00, 1, 15, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80', 4.8, 115),
(6, 4, 1, 'New Balance All-Terrain Sweater', 'new-balance-all-terrain', 89.00, 110.00, 0, 7, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop&q=80', 4.6, 95),
(7, 5, 1, 'Puma Modern Basics Polo', 'puma-modern-basics-polo', 45.00, 60.00, 1, 14, 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&auto=format&fit=crop&q=80', 4.5, 80),
(8, 6, 1, 'Uniqlo AIRism Oversized Tee', 'uniqlo-airism-oversized', 35.00, 45.00, 1, 20, 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&auto=format&fit=crop&q=80', 4.9, 175);

-- Variants with sizes and colors
INSERT INTO `product_variants` (`product_id`, `size`, `color_name`, `color_hex`, `stock`) VALUES
(1, 'M', 'Beige', '#dcd0c0', 5),
(1, 'L', 'White', '#ffffff', 4),
(1, 'S', 'Black', '#111827', 3),
(2, 'M', 'Grey', '#9ca3af', 6),
(2, 'L', 'Charcoal', '#374151', 4),
(2, 'XL', 'Black', '#111827', 2),
(3, 'S', 'Heather Grey', '#e5e7eb', 4),
(3, 'M', 'Sky Blue', '#38bdf8', 5),
(3, 'L', 'Navy', '#1e3a8a', 3);
