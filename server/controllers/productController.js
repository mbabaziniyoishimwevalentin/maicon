const { getDBStatus, getPool } = require('../config/db');
const mockData = require('../data/productsData');

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const {
      search,
      brand,
      minPrice,
      maxPrice,
      size,
      color,
      sort = 'popular',
      category
    } = req.query;

    const isConnected = getDBStatus();

    if (isConnected) {
      const pool = getPool();
      let query = `SELECT * FROM products WHERE 1=1`;
      const params = [];

      if (search) {
        query += ` AND (name LIKE ? OR brand LIKE ? OR category LIKE ?)`;
        const s = `%${search}%`;
        params.push(s, s, s);
      }

      if (brand) {
        const brandList = Array.isArray(brand) ? brand : brand.split(',').map(b => b.trim());
        query += ` AND brand IN (${brandList.map(() => '?').join(',')})`;
        params.push(...brandList);
      }

      if (category && category.toLowerCase() !== 'all') {
        query += ` AND (category_slug = ? OR category = ?)`;
        params.push(category.toLowerCase(), category);
      }

      if (minPrice && parseFloat(minPrice) > 0) {
        query += ` AND price >= ?`;
        params.push(parseFloat(minPrice));
      }

      if (maxPrice && parseFloat(maxPrice) < 5000000) {
        query += ` AND price <= ?`;
        params.push(parseFloat(maxPrice));
      }

      if (sort === 'price-low') {
        query += ` ORDER BY price ASC`;
      } else if (sort === 'price-high') {
        query += ` ORDER BY price DESC`;
      } else if (sort === 'newest') {
        query += ` ORDER BY id DESC`;
      } else {
        query += ` ORDER BY id DESC`;
      }

      const [rows] = await pool.query(query, params);

      // Parse sizes and colors strings into arrays
      const formattedRows = rows.map(r => {
        const mem = mockData.products.find(m => m.id === r.id);
        return {
          ...(mem || {}),
          ...r,
          price: parseFloat(r.price),
          sizes: typeof r.sizes === 'string' ? r.sizes.split(',').map(s => s.trim()) : (r.sizes || (mem && mem.sizes) || ['Standard']),
          colors: typeof r.colors === 'string' ? r.colors.split(',').map(c => ({ name: c.trim(), hex: '#0f172a' })) : (r.colors || (mem && mem.colors) || [{ name: 'Default', hex: '#0f172a' }])
        };
      });

      return res.json({
        success: true,
        count: formattedRows.length,
        products: formattedRows
      });
    }

    // Fallback in-memory filtering
    let filtered = [...mockData.products];

    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.brand && p.brand.toLowerCase().includes(term)) ||
        (p.category && p.category.toLowerCase().includes(term))
      );
    }

    if (brand) {
      const brandList = Array.isArray(brand) ? brand.map(b => b.toLowerCase()) : brand.split(',').map(b => b.trim().toLowerCase());
      filtered = filtered.filter(p => p.brand && brandList.includes(p.brand.toLowerCase()));
    }

    if (minPrice && parseFloat(minPrice) > 0) {
      filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
    }

    if (maxPrice && parseFloat(maxPrice) < 5000000) {
      filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
    }

    if (size) {
      const sizeList = Array.isArray(size) ? size : size.split(',').map(s => s.trim().toUpperCase());
      filtered = filtered.filter(p => p.sizes && p.sizes.some(s => sizeList.includes(s.toUpperCase())));
    }

    if (color) {
      const colorList = Array.isArray(color) ? color : color.split(',').map(c => c.trim().toLowerCase());
      filtered = filtered.filter(p => p.colors && p.colors.some(c => (c.name || c).toLowerCase().includes(colorList[0])));
    }

    if (category && category.toLowerCase() !== 'all') {
      const cat = category.toLowerCase();
      filtered = filtered.filter(p => 
        (p.category && p.category.toLowerCase() === cat) || 
        (p.category_slug && p.category_slug.toLowerCase() === cat)
      );
    }

    // Sorting
    if (sort === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
      filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else {
      // Popular (Default): Prioritize new arrivals, then rating and id
      filtered.sort((a, b) => {
        if (b.is_new && !a.is_new) return -1;
        if (!b.is_new && a.is_new) return 1;
        return (b.rating || 0) - (a.rating || 0) || (b.id || 0) - (a.id || 0);
      });
    }

    return res.json({
      success: true,
      count: filtered.length,
      products: filtered
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

// Helper to enrich product details for PDP (Product Details Page)
function enrichProductDetails(prod, allProducts = []) {
  const originalPrice = prod.original_price || Math.round(prod.price * 1.25);
  const discountPercent = Math.max(5, Math.round(((originalPrice - prod.price) / originalPrice) * 100));

  const baseImg = prod.image_url || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700';
  let gallery = [];
  if (Array.isArray(prod.gallery) && prod.gallery.length > 0) {
    gallery = prod.gallery.filter(Boolean);
  } else {
    // Generate clean views of the ACTUAL product photo
    gallery = [
      baseImg,
      baseImg.includes('?') ? baseImg.replace('q=80', 'q=90&fit=crop&crop=center') : baseImg,
      baseImg.includes('?') ? baseImg.replace('q=80', 'q=90&fit=crop&crop=top') : baseImg,
      baseImg
    ];
  }

  const sizesFormatted = (prod.sizes && Array.isArray(prod.sizes)) ? prod.sizes.join(', ') : (prod.sizes || 'Standard');
  const colorsFormatted = (prod.colors && Array.isArray(prod.colors)) ? prod.colors.map(c => typeof c === 'object' ? c.name : c).join(', ') : 'Standard';

  const specs = (Array.isArray(prod.specifications) && prod.specifications.length > 0)
    ? prod.specifications
    : [
        { label: 'Brand', value: prod.brand || 'Authentic Marketplace' },
        { label: 'Category', value: prod.category || 'General Merchandise' },
        { label: 'Product Name', value: prod.name },
        { label: 'Available Sizes', value: sizesFormatted },
        { label: 'Available Colors', value: colorsFormatted },
        { label: 'SKU / Model', value: `MC-RW-${(prod.id || 1).toString().padStart(4, '0')}` },
        { label: 'Condition', value: '100% Brand New · Factory Sealed' },
        { label: 'Country of Origin', value: 'Imported / Quality Certified' },
        { label: 'Rwanda Delivery', value: 'Kigali Doorstep (24-48 hrs)' },
        { label: 'Warranty & Guarantee', value: '12 Months Official Manufacturer Warranty' },
        { label: 'Payment Channels', value: 'MTN Mobile Money, Airtel Money, Visa, Mastercard' }
      ];

  const highlights = (Array.isArray(prod.highlights) && prod.highlights.length > 0)
    ? prod.highlights
    : [
        `Authentic ${prod.name} verified by Maicon Rwanda Quality Assurance inspectors.`,
        `Directly supplied by ${prod.brand || 'authorized Rwanda merchant'}.`,
        'Fast doorstep delivery across all 30 districts of Rwanda via Kigali Speed Logistics.',
        'Instant PIN checkout enabled via MTN Mobile Money, Airtel Money & Bank Cards.',
        '7-Day Return & Escrow Protection guarantee.'
      ];

  const seller = prod.seller || {
    name: `${prod.brand || 'Kigali'} Official Store`,
    badge: 'Verified Rwanda Merchant ✓',
    location: 'Kigali CBD Hub, Rwanda',
    rating: 4.9,
    ordersCompleted: 1420,
    responseTime: '< 15 mins'
  };

  const reviews = (Array.isArray(prod.reviews) && prod.reviews.length > 0) ? prod.reviews : [
    {
      id: 1,
      author: 'Emile Mugisha',
      location: 'Kigali - Nyarugenge',
      rating: 5,
      date: '3 days ago',
      title: `Exceeded my expectations for ${prod.name}!`,
      comment: `The quality of this ${prod.name} is top notch. Arrived right at my doorstep in Kigali the next day. Paid easily with MTN MoMo.`,
      verified: true,
      helpfulCount: 24
    },
    {
      id: 2,
      author: 'Diane Uwase',
      location: 'Kigali - Gasabo',
      rating: 5,
      date: '1 week ago',
      title: 'Original and authentic',
      comment: `Matches the description and photos perfectly. Very durable and great quality from ${prod.brand || 'the merchant'}. Recommended 100%!`,
      verified: true,
      helpfulCount: 17
    },
    {
      id: 3,
      author: 'Fabrice Nkurunziza',
      location: 'Musanze District',
      rating: 4,
      date: '2 weeks ago',
      title: 'Great purchase & fast delivery',
      comment: `Delivery to Musanze took less than 48 hours. The customer support team was very responsive and helpful.`,
      verified: true,
      helpfulCount: 9
    }
  ];

  const description = (prod.description && prod.description.trim())
    ? prod.description
    : `${prod.name} by ${prod.brand || 'Verified Merchant'}. High quality marketplace product available for instant checkout and fast doorstep delivery across Rwanda.`;

  const related = allProducts
    .filter(p => p.id !== prod.id && (p.category_slug === prod.category_slug || p.brand === prod.brand))
    .slice(0, 4);

  return {
    ...prod,
    description,
    original_price: originalPrice,
    discount_percent: discountPercent,
    gallery,
    specifications: specs,
    highlights,
    seller,
    reviews,
    related_products: related
  };
}

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const isConnected = getDBStatus();

    if (isConnected) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
      const fallbackProd = mockData.products.find(p => p.id === id);

      if (rows.length === 0 && !fallbackProd) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const [allRows] = await pool.query('SELECT * FROM products');
      
      const prod = {
        ...(fallbackProd || {}),
        ...(rows[0] || {})
      };

      if (!prod.description && fallbackProd && fallbackProd.description) {
        prod.description = fallbackProd.description;
      }
      if ((!prod.gallery || prod.gallery.length === 0) && fallbackProd && fallbackProd.gallery) {
        prod.gallery = fallbackProd.gallery;
      }
      if ((!prod.specifications || prod.specifications.length === 0) && fallbackProd && fallbackProd.specifications) {
        prod.specifications = fallbackProd.specifications;
      }
      if ((!prod.highlights || prod.highlights.length === 0) && fallbackProd && fallbackProd.highlights) {
        prod.highlights = fallbackProd.highlights;
      }

      prod.price = parseFloat(prod.price);
      prod.sizes = typeof prod.sizes === 'string' ? prod.sizes.split(',').map(s => s.trim()) : (prod.sizes || (fallbackProd && fallbackProd.sizes) || ['Standard']);
      prod.colors = typeof prod.colors === 'string' ? prod.colors.split(',').map(c => ({ name: c.trim(), hex: '#0f172a' })) : (prod.colors || (fallbackProd && fallbackProd.colors) || [{ name: 'Default', hex: '#0f172a' }]);

      const formattedAll = allRows.map(r => {
        const mem = mockData.products.find(m => m.id === r.id);
        return {
          ...(mem || {}),
          ...r,
          price: parseFloat(r.price),
          sizes: typeof r.sizes === 'string' ? r.sizes.split(',').map(s => s.trim()) : (r.sizes || ['Standard']),
          colors: typeof r.colors === 'string' ? r.colors.split(',').map(c => ({ name: c.trim(), hex: '#0f172a' })) : (r.colors || [{ name: 'Default', hex: '#0f172a' }])
        };
      });

      const enriched = enrichProductDetails(prod, formattedAll);
      return res.json({ success: true, product: enriched });
    }

    const product = mockData.products.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const enriched = enrichProductDetails(product, mockData.products);
    return res.json({ success: true, product: enriched });
  } catch (error) {
    console.error('Error fetching product by id:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/filters
const getFilters = async (req, res) => {
  try {
    // Generate brands dynamically with accurate counts
    const brandMap = {};
    mockData.products.forEach(p => {
      const b = p.brand || 'Unbranded';
      brandMap[b] = (brandMap[b] || 0) + 1;
    });

    const dynamicBrands = Object.keys(brandMap).map((name, idx) => ({
      id: idx + 1,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      count: brandMap[name]
    }));

    return res.json({
      success: true,
      brands: dynamicBrands.length > 0 ? dynamicBrands : mockData.brands,
      categories: mockData.categories,
      sizes: mockData.availableSizes,
      colors: mockData.availableColors,
      priceHistogram: [
        { bin: '0-50k', count: 35 },
        { bin: '50k-150k', count: 50 },
        { bin: '150k-300k', count: 75 },
        { bin: '300k-600k', count: 40 },
        { bin: '600k-1M', count: 25 },
        { bin: '1M-5M', count: 18 }
      ],
      minPriceDefault: 0,
      maxPriceDefault: 5000000
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getFilters
};
