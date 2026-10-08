# Maicon E-Commerce Storefront

A modern, high-performance E-Commerce platform called **Maicon**, featuring a clean minimalist aesthetic inspired by the provided design mockup ("Simple is More").

## Tech Stack
- **Frontend**: HTML5, Tailwind CSS, JavaScript (Vanilla ES6+), Lucide Icons
- **Backend**: Node.js, Express.js REST API
- **Database**: MySQL (with automated fallback data when MySQL server is offline)

---

## Quick Start

### 1. Start the Server
```bash
npm start
```
or with auto-reload:
```bash
npm run dev
```

The application will be available at: **[http://localhost:3000](http://localhost:3000)**

---

## Connecting to MySQL Database (Optional)

1. Open your MySQL client (e.g. phpMyAdmin, MySQL Workbench, or CLI).
2. Execute the included SQL file:
   ```bash
   mysql -u root -p < schema.sql
   ```
3. Update your `.env` file with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=maicon_db
   DB_PORT=3306
   ```
4. Restart the server (`npm start`). The server will automatically connect to MySQL!

---

## Features Implemented
- **Top Announcement Bar**: Ship to KSA, Trusted Shipping, Easy Returns, Secure Shopping.
- **Header**: Logo, live product search bar, interactive Cart & Wishlist counters, Language toggles (English / AR), User profile.
- **Hero Banner ("Simple is More")**: Editorial typography, high-res model photography, "Designed to stand out / Limited-editions styles".
- **Dynamic Filter Sidebar**:
  - Brand search and multi-checkbox filter (Nike, Adidas, Apple, New Balance, Puma, Uniqlo).
  - Price histogram with dual-slider range and numeric min/max inputs (SAR 29 to SAR 300,000).
  - Size pills (XXS to XXL).
  - Color swatches palette.
- **Product Grid**:
  - `+ New Arrival` badge in cyan.
  - Brand labels & product names.
  - SAR currency pricing.
  - Urgency indicators (`12 items left!`).
  - Interactive Wishlist heart button (with localStorage sync).
  - Quick Add-to-Cart with hover button.
- **Cart Slide-over Drawer**:
  - Quantity controls (+/-).
  - Real-time subtotal and total calculation.
  - Checkout API integration.
- **Mobile Responsive Layout**:
  - Mobile slide-in filter drawer.
  - 2-column mobile product grid matching the mobile mockup.
