const { getDBStatus, getPool } = require('../config/db');
const mockData = require('../data/productsData');

// POST /api/cart/checkout
const checkout = async (req, res) => {
  try {
    const {
      customerName = 'Jean-Paul Mugisha',
      customerEmail = 'buyer@maicon.com',
      customerPhone = '+250 788 998 877',
      shippingAddress = 'KG 9 Ave, House #24',
      district = 'Nyarugenge',
      city = 'Kigali',
      paymentMethod = 'MTN Mobile Money',
      items = [],
      totalAmount
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    const orderId = 'RW-' + Math.floor(1000 + Math.random() * 9000);
    const trackingNumber = 'KGL-' + Math.floor(100000 + Math.random() * 900000);
    const subtotal = items.reduce((sum, it) => sum + (parseFloat(it.price) * (parseInt(it.quantity) || 1)), 0);
    const finalTotal = totalAmount ? parseFloat(totalAmount) : subtotal;

    const timeline = [
      { status: 'Order Placed & Escrow Secured', completed: true, date: new Date().toISOString() },
      { status: 'Kigali Fulfillment Hub Packing', completed: true, date: new Date().toISOString() },
      { status: 'Dispatched with Courier', completed: false, date: 'Pending' },
      { status: 'Delivered to Doorstep', completed: false, date: 'Pending' }
    ];

    const isConnected = getDBStatus();

    if (isConnected) {
      const pool = getPool();
      await pool.query(
        `INSERT INTO orders (id, customer_name, customer_email, customer_phone, shipping_address, district, city, subtotal, total_amount, currency, payment_method, payment_status, status, tracking_number, carrier, items_json, timeline_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          district,
          city,
          subtotal,
          finalTotal,
          'RWF',
          paymentMethod,
          'paid',
          'processing',
          trackingNumber,
          'Kigali Speed Logistics',
          JSON.stringify(items),
          JSON.stringify(timeline)
        ]
      );
    }

    // Also update in-memory mockData for fallback consistency
    if (mockData.buyerOrders) {
      mockData.buyerOrders.unshift({
        id: orderId,
        date: new Date().toISOString().split('T')[0],
        status: 'processing',
        totalAmount: finalTotal,
        paymentMethod: paymentMethod,
        carrier: 'Kigali Speed Logistics',
        trackingNumber: trackingNumber,
        items: items,
        timeline: timeline
      });
    }

    if (mockData.adminOrders) {
      mockData.adminOrders.unshift({
        id: orderId,
        customer: customerName,
        location: `${city} - ${district}`,
        total: finalTotal,
        payment: paymentMethod,
        status: 'Processing',
        itemsCount: items.reduce((s, it) => s + (parseInt(it.quantity) || 1), 0)
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed and escrow secured successfully!',
      order: {
        id: orderId,
        trackingNumber,
        customerName,
        totalAmount: finalTotal,
        currency: 'RWF',
        itemCount: items.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0),
        status: 'processing'
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ success: false, message: 'Server error during checkout' });
  }
};

module.exports = {
  checkout
};
