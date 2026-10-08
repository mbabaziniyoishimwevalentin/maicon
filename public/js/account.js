// Buyer Account Portal UI Logic & API Integration
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  
  // Restore active tab from URL hash or localStorage
  const validTabs = ['orders', 'addresses', 'payments'];
  const hashTab = window.location.hash.replace('#', '').toLowerCase();
  const savedTab = localStorage.getItem('maicon_buyer_tab');
  const initialTab = validTabs.includes(hashTab) ? hashTab : (validTabs.includes(savedTab) ? savedTab : 'orders');

  switchBuyerTab(initialTab);

  loadBuyerOrders();
  loadBuyerAddresses();
});

function switchBuyerTab(tabId) {
  const tabs = ['orders', 'addresses', 'payments'];
  if (!tabs.includes(tabId)) tabId = 'orders';

  // Persist to localStorage and URL hash
  localStorage.setItem('maicon_buyer_tab', tabId);
  try {
    history.replaceState(null, null, '#' + tabId);
  } catch (e) {}

  tabs.forEach(t => {
    const el = document.getElementById(`buyer-tab-${t}`);
    const navEl = document.getElementById(`buyer-nav-${t}`);
    if (el) {
      if (t === tabId) {
        el.classList.remove('hidden');
        el.style.display = 'block';
      } else {
        el.classList.add('hidden');
        el.style.display = 'none';
      }
    }
    if (navEl) {
      if (t === tabId) {
        navEl.className = 'buyer-tab-btn pb-3 text-xs font-bold text-slate-900 border-b-2 border-slate-900 flex items-center gap-2 transition-all flex-shrink-0';
        const icon = navEl.querySelector('i');
        if (icon) icon.className = 'w-4 h-4 text-cyan-600';
      } else {
        navEl.className = 'buyer-tab-btn pb-3 text-xs font-bold text-slate-400 border-b-2 border-transparent hover:text-slate-900 flex items-center gap-2 transition-all flex-shrink-0';
        const icon = navEl.querySelector('i');
        if (icon) icon.className = 'w-4 h-4 text-slate-400';
      }
    }
  });

  const syncStyle = document.getElementById('sync-buyer-active-style');
  if (syncStyle) syncStyle.remove();
  const baseStyle = document.getElementById('base-buyer-tab-style');
  if (baseStyle) baseStyle.remove();
  const legacyStyle = document.getElementById('early-buyer-tab-style');
  if (legacyStyle) legacyStyle.remove();
}

async function loadBuyerOrders() {
  const container = document.getElementById('buyer-orders-container');
  if (!container) return;

  try {
    const res = await fetch('/api/buyer/orders');
    const data = await res.json();
    if (data.success && data.orders) {
      document.getElementById('buyer-orders-stat').textContent = data.orders.length;
      
      container.innerHTML = data.orders.map(order => {
        const statusBadges = {
          in_transit: '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">🚚 In Transit (Dispatched)</span>',
          delivered: '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">✓ Delivered to Doorstep</span>',
          processing: '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">⏳ Processing & Packing</span>'
        };

        return `
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <!-- Order Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <div class="flex items-center gap-3">
                  <span class="font-mono text-sm font-black text-slate-900">Order #${order.id}</span>
                  ${statusBadges[order.status] || ''}
                </div>
                <p class="text-xs text-slate-500 mt-1">Placed on ${new Date(order.date).toLocaleDateString()} · Paid via ${order.paymentMethod}</p>
              </div>

              <div class="text-left sm:text-right">
                <span class="text-xs text-slate-400 block">Total Amount</span>
                <span class="text-lg font-black text-slate-900">${order.totalAmount.toLocaleString()} RWF</span>
              </div>
            </div>

            <!-- Step-by-Step Live Tracking Bar -->
            <div class="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <i data-lucide="navigation" class="w-4 h-4 text-cyan-600"></i>
                  <span>Live Courier Tracking (${order.carrier})</span>
                </span>
                <span class="text-xs font-mono font-bold text-slate-700">Tracking: ${order.trackingNumber}</span>
              </div>

              <!-- Steps Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                ${order.timeline.map((step, idx) => `
                  <div class="flex flex-col p-3 rounded-lg ${step.completed ? 'bg-white border border-cyan-300 text-slate-900 shadow-sm' : 'bg-slate-100 border border-slate-200 text-slate-400'}">
                    <div class="flex items-center gap-1.5 mb-1">
                      <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${step.completed ? 'bg-cyan-500 text-white' : 'bg-slate-200 text-slate-500'}">
                        ${step.completed ? '✓' : idx + 1}
                      </span>
                      <span class="text-[11px] font-bold truncate">${step.status}</span>
                    </div>
                    <span class="text-[10px] opacity-75">${step.time}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Order Items -->
            <div class="space-y-3">
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items</h4>
              <div class="divide-y divide-slate-100">
                ${order.items.map(item => `
                  <div class="py-3 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                      <img src="${item.image_url}" alt="${item.name}" class="w-12 h-14 object-cover rounded-lg bg-slate-100 border border-slate-200" />
                      <div>
                        <h5 class="text-xs font-bold text-slate-900">${item.name}</h5>
                        <p class="text-[11px] text-slate-500 mt-0.5">Qty: ${item.quantity} · Size: ${item.size || 'M'} · Color: ${item.color || 'Default'}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="text-xs font-bold text-slate-900">${(item.price * item.quantity).toLocaleString()} RWF</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Delivery Address Footer -->
            <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-3">
              <div>
                <span class="font-bold text-slate-700">Delivery Destination:</span>
                <span>${order.shippingAddress}</span>
              </div>
              <button onclick="alert('Downloading Official Maicon Tax Invoice #${order.id}.pdf')" class="text-xs text-cyan-700 hover:text-cyan-800 font-bold flex items-center gap-1.5 transition-colors">
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                <span>Download Invoice PDF</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    console.error('Error loading buyer orders', err);
  }
}

async function loadBuyerAddresses() {
  const grid = document.getElementById('buyer-addresses-grid');
  if (!grid) return;

  try {
    const res = await fetch('/api/buyer/addresses');
    const data = await res.json();
    if (data.success && data.addresses) {
      grid.innerHTML = data.addresses.map(addr => `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="map-pin" class="w-4 h-4 text-cyan-600"></i>
                <span>${addr.label}</span>
              </h4>
              ${addr.isDefault ? '<span class="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">Default</span>' : ''}
            </div>
            <p class="text-xs font-bold text-slate-900">${addr.recipientName}</p>
            <p class="text-xs text-slate-600 mt-1">${addr.street}</p>
            <p class="text-xs text-slate-500">${addr.sector}, ${addr.district}, ${addr.province}</p>
            <p class="text-xs text-slate-700 mt-2 font-mono font-bold">${addr.phone}</p>
          </div>
          <div class="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
            <button onclick="alert('Address set as primary delivery destination in Kigali!')" class="text-xs text-slate-900 hover:text-cyan-700 font-bold">
              Select for Next Order
            </button>
          </div>
        </div>
      `).join('');
      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    console.error('Error loading addresses', err);
  }
}

async function handleSaveAddress(e) {
  e.preventDefault();
  const label = document.getElementById('addr-label').value;
  const recipientName = document.getElementById('addr-name').value;
  const phone = document.getElementById('addr-phone').value;
  const district = document.getElementById('addr-district').value;
  const sector = document.getElementById('addr-sector').value;
  const street = document.getElementById('addr-street').value;

  try {
    const res = await fetch('/api/buyer/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, recipientName, phone, district, sector, street })
    });
    const data = await res.json();
    if (data.success) {
      alert(`🎉 ${data.message}`);
      loadBuyerAddresses();
      document.getElementById('addr-label').value = '';
      document.getElementById('addr-sector').value = '';
      document.getElementById('addr-street').value = '';
    }
  } catch (err) {
    console.error('Error saving address', err);
  }
}
