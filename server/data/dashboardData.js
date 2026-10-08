const users = [
  {
    id: 1,
    name: 'Abdel Rahman (SuperAdmin)',
    email: 'admin@maicon.com',
    password: 'Admin@Maicon2026',
    role: 'admin',
    phone: '+250 788 123 456',
    status: 'active',
    createdAt: '2026-08-01',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    id: 2,
    name: 'Kigali Urban Trends Ltd',
    email: 'seller@maicon.com',
    password: 'Seller@Maicon2026',
    role: 'seller',
    phone: '+250 788 654 321',
    storeName: 'Kigali Urban Trends Ltd',
    storeSlug: 'kigali-urban-trends',
    category: 'Fashion & Downtown Style',
    tin: 'TIN-98234-RW',
    status: 'active',
    commissionRate: 8,
    createdAt: '2026-08-15',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 3,
    name: 'Jean-Paul Mugisha',
    email: 'buyer@maicon.com',
    password: 'Buyer@Maicon2026',
    role: 'buyer',
    phone: '+250 788 998 877',
    status: 'active',
    createdAt: '2026-08-20',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: 4,
    name: 'Diane Uwase',
    email: 'diane@example.rw',
    password: 'Buyer@Maicon2026',
    role: 'buyer',
    phone: '+250 788 112 233',
    status: 'active',
    createdAt: '2026-08-22',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  {
    id: 5,
    name: 'David Hakizimana',
    email: 'david.gourmet@maicon.com',
    password: 'Seller@Maicon2026',
    role: 'seller',
    phone: '+250 788 771 200',
    storeName: 'Kigali Gourmet Coffee & Raw Foods',
    storeSlug: 'kigali-gourmet',
    category: 'Food, Groceries & Agriculture',
    tin: 'TIN-77120-RW',
    status: 'active',
    commissionRate: 8,
    createdAt: '2026-08-25',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    id: 6,
    name: 'Aline Umutoni',
    email: 'aline.furniture@maicon.com',
    password: 'Seller@Maicon2026',
    role: 'seller',
    phone: '+250 788 332 910',
    storeName: 'Gikondo Modern Furniture & Lighting',
    storeSlug: 'gikondo-furniture',
    category: 'Home, Furniture & Lighting',
    tin: 'TIN-33291-RW',
    status: 'suspended',
    commissionRate: 10,
    createdAt: '2026-08-28',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
  }
];

const sellerApplications = [
  {
    id: 'APP-101',
    applicantName: 'Eric Manzi',
    storeName: 'Nyarugenge Tech & Electronics Hub',
    category: 'Electronics & Smart Tech',
    tin: 'TIN-44582-RW',
    phone: '+250 788 445 821',
    status: 'pending',
    date: '2026-09-01',
    documents: ['Business_Registration.pdf', 'National_ID.pdf']
  },
  {
    id: 'APP-102',
    applicantName: 'Aline Umutoni',
    storeName: 'Gikondo Modern Furniture & Lighting',
    category: 'Home, Furniture & Lighting',
    tin: 'TIN-33291-RW',
    phone: '+250 788 332 910',
    status: 'pending',
    date: '2026-08-30',
    documents: ['RDB_Certificate.pdf', 'Tax_Clearance.pdf']
  },
  {
    id: 'APP-103',
    applicantName: 'David Hakizimana',
    storeName: 'Kigali Gourmet Coffee & Raw Foods',
    category: 'Food, Groceries & Agriculture',
    tin: 'TIN-77120-RW',
    phone: '+250 788 771 200',
    status: 'approved',
    date: '2026-08-25',
    documents: ['NAEB_License.pdf']
  }
];

const dashboardOrders = [
  {
    id: 'MAI-782190',
    date: '2026-09-02T10:30:00Z',
    customerName: 'Jean-Paul Mugisha',
    customerEmail: 'buyer@maicon.com',
    customerPhone: '+250 788 998 877',
    shippingAddress: 'KG 9 Ave, House #24, Nyarugenge, Kigali',
    district: 'Nyarugenge',
    city: 'Kigali',
    items: [
      { id: 1, name: 'Shirt Soft Cotton Polo', price: 35000, quantity: 2, size: 'L', color: 'Beige', image_url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=200' },
      { id: 4, name: 'Artisan Arabica Whole Coffee Beans (1kg)', price: 28000, quantity: 1, size: '1kg Bag', color: 'Rich Roast', image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200' }
    ],
    subtotal: 98000,
    shippingFee: 0,
    totalAmount: 98000,
    currency: 'RWF',
    status: 'in_transit', // pending, processing, in_transit, delivered, cancelled
    trackingNumber: 'RW-EXP-902341',
    carrier: 'Kigali Speed Logistics',
    paymentMethod: 'MTN Mobile Money',
    paymentStatus: 'paid',
    timeline: [
      { status: 'Order Placed', time: '2026-09-02 10:30 AM', completed: true },
      { status: 'Processing & Packed', time: '2026-09-02 11:45 AM', completed: true },
      { status: 'Dispatched for Delivery', time: '2026-09-02 02:15 PM', completed: true },
      { status: 'Delivered', time: 'Estimated Today by 05:00 PM', completed: false }
    ]
  },
  {
    id: 'MAI-654921',
    date: '2026-09-01T14:20:00Z',
    customerName: 'Jean-Paul Mugisha',
    customerEmail: 'buyer@maicon.com',
    customerPhone: '+250 788 998 877',
    shippingAddress: 'KG 549 St, Kacyiru, Gasabo, Kigali',
    district: 'Gasabo',
    city: 'Kigali',
    items: [
      { id: 16, name: 'Sony WH-1000XM5 Wireless Headphones', price: 390000, quantity: 1, size: 'One Size', color: 'Silver', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' }
    ],
    subtotal: 390000,
    shippingFee: 0,
    totalAmount: 390000,
    currency: 'RWF',
    status: 'delivered',
    trackingNumber: 'RW-EXP-889104',
    carrier: 'DHL Rwanda Express',
    paymentMethod: 'Airtel Money',
    paymentStatus: 'paid',
    timeline: [
      { status: 'Order Placed', time: '2026-09-01 02:20 PM', completed: true },
      { status: 'Processing & Packed', time: '2026-09-01 03:10 PM', completed: true },
      { status: 'Dispatched for Delivery', time: '2026-09-01 05:30 PM', completed: true },
      { status: 'Delivered to Doorstep', time: '2026-09-02 09:15 AM', completed: true }
    ]
  },
  {
    id: 'MAI-512093',
    date: '2026-09-02T12:00:00Z',
    customerName: 'Diane Uwase',
    customerEmail: 'diane@example.rw',
    customerPhone: '+250 788 112 233',
    shippingAddress: 'KK 15 Rd, Kicukiro, Kigali',
    district: 'Kicukiro',
    city: 'Kigali',
    items: [
      { id: 7, name: 'Crystal Glass Champagne Flute Set (Set of 6)', price: 65000, quantity: 2, size: 'Set of 6', color: 'Clear', image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200' }
    ],
    subtotal: 130000,
    shippingFee: 0,
    totalAmount: 130000,
    currency: 'RWF',
    status: 'processing',
    trackingNumber: 'RW-EXP-912044',
    carrier: 'Kigali Courier',
    paymentMethod: 'MTN Mobile Money',
    paymentStatus: 'paid',
    timeline: [
      { status: 'Order Placed', time: '2026-09-02 12:00 PM', completed: true },
      { status: 'Processing & Packed', time: 'In Progress', completed: true },
      { status: 'Dispatched for Delivery', time: 'Pending', completed: false },
      { status: 'Delivered', time: 'Pending', completed: false }
    ]
  }
];

const payoutRequests = [
  {
    id: 'PAY-401',
    sellerId: 2,
    sellerName: 'Kigali Urban Trends',
    amount: 450000,
    currency: 'RWF',
    method: 'MTN Mobile Money',
    accountNumber: '+250 788 654 321',
    accountName: 'Kigali Urban Trends Ltd',
    requestDate: '2026-09-02',
    status: 'pending' // pending, completed, rejected
  },
  {
    id: 'PAY-400',
    sellerId: 2,
    sellerName: 'Kigali Urban Trends',
    amount: 1200000,
    currency: 'RWF',
    method: 'Bank of Kigali (BK)',
    accountNumber: '00040-0692134-88',
    accountName: 'Kigali Urban Trends Ltd',
    requestDate: '2026-08-25',
    status: 'completed'
  }
];

const buyerAddresses = [
  {
    id: 'ADDR-1',
    label: 'Home (Nyarugenge)',
    recipientName: 'Jean-Paul Mugisha',
    phone: '+250 788 998 877',
    province: 'Kigali City',
    district: 'Nyarugenge',
    sector: 'Kiyovu',
    street: 'KG 9 Ave, House #24',
    isDefault: true
  },
  {
    id: 'ADDR-2',
    label: 'Office (Gasabo)',
    recipientName: 'Jean-Paul Mugisha',
    phone: '+250 788 998 877',
    province: 'Kigali City',
    district: 'Gasabo',
    sector: 'Kacyiru',
    street: 'KG 549 St, Tech Plaza 3rd Floor',
    isDefault: false
  }
];

module.exports = {
  users,
  sellerApplications,
  dashboardOrders,
  payoutRequests,
  buyerAddresses
};
