const { getDBStatus, getPool } = require('../config/db');
const { dashboardOrders, buyerAddresses } = require('../data/dashboardData');

// GET /api/buyer/orders
const getBuyerOrders = async (req, res) => {
  try {
    const isConnected = getDBStatus();
    if (isConnected) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      const formatted = rows.map(r => ({
        id: r.id,
        date: r.created_at,
        customerName: r.customer_name,
        customerEmail: r.customer_email,
        customerPhone: r.customer_phone,
        shippingAddress: r.shipping_address,
        district: r.district,
        city: r.city,
        items: typeof r.items_json === 'string' ? JSON.parse(r.items_json) : (r.items_json || []),
        subtotal: parseFloat(r.subtotal),
        shippingFee: parseFloat(r.shipping_fee || 0),
        totalAmount: parseFloat(r.total_amount),
        currency: r.currency || 'RWF',
        status: r.status,
        trackingNumber: r.tracking_number,
        carrier: r.carrier || 'Kigali Speed Logistics',
        paymentMethod: r.payment_method,
        paymentStatus: r.payment_status,
        timeline: typeof r.timeline_json === 'string' ? JSON.parse(r.timeline_json) : (r.timeline_json || [])
      }));
      return res.json({ success: true, orders: formatted });
    }

    return res.json({
      success: true,
      orders: dashboardOrders
    });
  } catch (err) {
    console.error('Error fetching buyer orders:', err);
    return res.json({ success: true, orders: dashboardOrders });
  }
};

// GET /api/buyer/orders/:id
const getBuyerOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const isConnected = getDBStatus();
    if (isConnected) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
      if (rows.length > 0) {
        const r = rows[0];
        const formatted = {
          id: r.id,
          date: r.created_at,
          customerName: r.customer_name,
          customerEmail: r.customer_email,
          customerPhone: r.customer_phone,
          shippingAddress: r.shipping_address,
          district: r.district,
          city: r.city,
          items: typeof r.items_json === 'string' ? JSON.parse(r.items_json) : (r.items_json || []),
          subtotal: parseFloat(r.subtotal),
          shippingFee: parseFloat(r.shipping_fee || 0),
          totalAmount: parseFloat(r.total_amount),
          currency: r.currency || 'RWF',
          status: r.status,
          trackingNumber: r.tracking_number,
          carrier: r.carrier || 'Kigali Speed Logistics',
          paymentMethod: r.payment_method,
          paymentStatus: r.payment_status,
          timeline: typeof r.timeline_json === 'string' ? JSON.parse(r.timeline_json) : (r.timeline_json || [])
        };
        return res.json({ success: true, order: formatted });
      }
    }

    const order = dashboardOrders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/buyer/addresses
const getBuyerAddresses = (req, res) => {
  return res.json({
    success: true,
    addresses: buyerAddresses
  });
};

// POST /api/buyer/addresses
const addBuyerAddress = (req, res) => {
  const { label, recipientName, phone, province = 'Kigali City', district, sector, street } = req.body;

  if (!recipientName || !district || !street) {
    return res.status(400).json({ success: false, message: 'Recipient name, district, and street are required.' });
  }

  const newAddr = {
    id: `ADDR-${buyerAddresses.length + 1}`,
    label: label || 'Delivery Address',
    recipientName,
    phone: phone || '+250 788 000 000',
    province,
    district,
    sector: sector || 'Center',
    street,
    isDefault: buyerAddresses.length === 0
  };

  buyerAddresses.push(newAddr);

  return res.status(201).json({
    success: true,
    message: 'New address in Rwanda saved successfully!',
    address: newAddr
  });
};

module.exports = {
  getBuyerOrders,
  getBuyerOrderById,
  getBuyerAddresses,
  addBuyerAddress
};
