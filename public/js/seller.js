// Seller Portal UI Logic & API Integration
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  
  // Restore active tab from URL hash or localStorage
  const validTabs = ['dashboard', 'products', 'orders', 'wallet'];
  const hashTab = window.location.hash.replace('#', '').toLowerCase();
  const savedTab = localStorage.getItem('maicon_seller_tab');
  const initialTab = validTabs.includes(hashTab) ? hashTab : (validTabs.includes(savedTab) ? savedTab : 'dashboard');

  switchSellerTab(initialTab);

  loadSellerStats();
  loadSellerProducts();
  loadSellerOrders();
});

function switchSellerTab(tabId) {
  const tabs = ['dashboard', 'products', 'orders', 'wallet'];
  if (!tabs.includes(tabId)) tabId = 'dashboard';

  // Persist to localStorage and URL hash
  localStorage.setItem('maicon_seller_tab', tabId);
  try {
    history.replaceState(null, null, '#' + tabId);
  } catch (e) {}

  tabs.forEach(t => {
    const el = document.getElementById(`seller-tab-${t}`);
    const navEl = document.getElementById(`nav-${t}`);
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
        navEl.className = 'seller-nav-item w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 text-white shadow-sm transition-all';
        const icon = navEl.querySelector('i');
        if (icon) icon.className = 'w-4 h-4 text-emerald-400';
      } else {
        navEl.className = 'seller-nav-item w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all';
        const icon = navEl.querySelector('i');
        if (icon) icon.className = 'w-4 h-4 text-slate-400';
      }
    }
  });

  const syncStyle = document.getElementById('sync-seller-active-style');
  if (syncStyle) syncStyle.remove();
  const baseStyle = document.getElementById('base-seller-tab-style');
  if (baseStyle) baseStyle.remove();
  const legacyStyle = document.getElementById('early-seller-tab-style');
  if (legacyStyle) legacyStyle.remove();

  const titles = {
    dashboard: 'Store Overview',
    products: 'Inventory & Products',
    orders: 'Orders & Fulfillment',
    wallet: 'MoMo Payout Wallet'
  };
  const titleEl = document.getElementById('seller-page-title');
  if (titleEl) titleEl.textContent = titles[tabId] || 'Merchant Hub';
}

async function loadSellerStats() {
  try {
    const res = await fetch('/api/seller/stats');
    const data = await res.json();
    if (data.success && data.stats) {
      const s = data.stats;
      document.getElementById('seller-kpi-revenue').textContent = `${s.storeRevenue.toLocaleString()} RWF`;
      document.getElementById('seller-kpi-available').textContent = `${s.availableBalance.toLocaleString()} RWF`;
      document.getElementById('seller-kpi-products').textContent = `${s.totalProducts} Items`;
      document.getElementById('seller-kpi-orders').textContent = `${s.pendingOrders} Orders`;
      document.getElementById('seller-product-count').textContent = s.totalProducts;
      document.getElementById('seller-pending-orders-count').textContent = s.pendingOrders;
    }
  } catch (err) {
    console.error('Error loading seller stats', err);
  }
}

async function loadSellerProducts() {
  const tbody = document.getElementById('seller-products-table-body');
  if (!tbody) return;

  try {
    const res = await fetch('/api/seller/products');
    const data = await res.json();
    if (data.success && data.products) {
      tbody.innerHTML = data.products.map(p => `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="py-3.5 px-4 flex items-center gap-3">
            <a href="/product?id=${p.id}" target="_blank" class="block flex-shrink-0">
              <img src="${p.image_url}" alt="${p.name}" class="w-10 h-10 rounded-lg object-contain p-0.5 bg-slate-100 border border-slate-200 hover:opacity-80 transition-opacity" />
            </a>
            <div>
              <a href="/product?id=${p.id}" target="_blank" class="font-bold text-slate-900 hover:text-cyan-600 transition-colors block truncate max-w-xs">${p.name}</a>
              <span class="text-[10px] text-slate-500">${p.brand} · ${p.sizes ? p.sizes.join(', ') : 'One Size'}</span>
            </div>
          </td>
          <td class="py-3.5 px-4 text-slate-600">${p.category}</td>
          <td class="py-3.5 px-4 font-bold text-slate-900">${p.price.toLocaleString()} RWF</td>
          <td class="py-3.5 px-4">
            <span class="px-2 py-0.5 rounded text-[11px] font-bold ${
              (p.stock || 10) < 5 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-slate-100 text-slate-700'
            }">
              ${p.stock || 10} units left
            </span>
          </td>
          <td class="py-3.5 px-4">
            <a href="/product?id=${p.id}" target="_blank" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1">
              <span>Live on Storefront ↗</span>
            </a>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading seller products', err);
  }
}

async function loadSellerOrders() {
  const tbody = document.getElementById('seller-orders-table-body');
  if (!tbody) return;

  try {
    const res = await fetch('/api/seller/orders');
    const data = await res.json();
    if (data.success && data.orders) {
      tbody.innerHTML = data.orders.map(o => `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="py-3.5 px-4 font-mono font-bold text-slate-900">${o.id}</td>
          <td class="py-3.5 px-4">
            <span class="font-bold text-slate-900 block">${o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</span>
            <span class="text-[10px] text-slate-500">${o.paymentMethod}</span>
          </td>
          <td class="py-3.5 px-4 text-slate-700">
            <span class="block font-bold text-slate-900">${o.customerName}</span>
            <span class="text-[11px] text-slate-500">${o.customerPhone}</span>
          </td>
          <td class="py-3.5 px-4 text-slate-600">${o.district}, ${o.city}</td>
          <td class="py-3.5 px-4 font-bold text-slate-900">${o.totalAmount.toLocaleString()} RWF</td>
          <td class="py-3.5 px-4">
            ${o.status === 'processing' ? `
              <button onclick="updateOrderStatus('${o.id}', 'in_transit')" class="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm">
                <i data-lucide="truck" class="w-3.5 h-3.5 text-cyan-400"></i>
                <span>Dispatch / Ship</span>
              </button>
            ` : o.status === 'in_transit' ? `
              <button onclick="updateOrderStatus('${o.id}', 'delivered')" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm">
                <i data-lucide="check" class="w-3.5 h-3.5"></i>
                <span>Mark Delivered</span>
              </button>
            ` : `
              <span class="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                <span>Delivered ✓</span>
              </span>
            `}
          </td>
        </tr>
      `).join('');
      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    console.error('Error loading seller orders', err);
  }
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`/api/seller/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      loadSellerOrders();
      loadSellerStats();
    }
  } catch (err) {
    console.error('Error updating status', err);
  }
}

// Device File Upload State
let selectedMainFile = null;
let selectedGalleryFiles = [];

function openAddProductModal() {
  document.getElementById('add-product-modal').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeAddProductModal() {
  document.getElementById('add-product-modal').classList.add('hidden');
  removeMainSelectedFile();
  selectedGalleryFiles = [];
  renderGalleryPreviews();
}

// Main Photo Selected from Device
function handleMainFileSelected(e) {
  const file = e.target.files[0];
  if (!file) return;

  selectedMainFile = file;
  const dropzone = document.getElementById('main-upload-dropzone');
  const previewContainer = document.getElementById('main-image-preview-container');
  const previewImg = document.getElementById('main-image-preview-img');
  const filenameEl = document.getElementById('main-image-filename');

  const reader = new FileReader();
  reader.onload = (event) => {
    if (previewImg) previewImg.src = event.target.result;
    if (filenameEl) filenameEl.textContent = `${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
    if (dropzone) dropzone.classList.add('hidden');
    if (previewContainer) previewContainer.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  };
  reader.readAsDataURL(file);
}

function removeMainSelectedFile() {
  selectedMainFile = null;
  const fileInput = document.getElementById('new-prod-file-main');
  if (fileInput) fileInput.value = '';

  const dropzone = document.getElementById('main-upload-dropzone');
  const previewContainer = document.getElementById('main-image-preview-container');
  if (dropzone) dropzone.classList.remove('hidden');
  if (previewContainer) previewContainer.classList.add('hidden');
}

// Gallery Photos Selected from Device
function handleGalleryFilesSelected(e) {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  // Append new files up to 10 total
  files.forEach(f => {
    if (selectedGalleryFiles.length < 10) {
      selectedGalleryFiles.push(f);
    }
  });

  renderGalleryPreviews();
}

function removeGalleryFile(idx) {
  selectedGalleryFiles.splice(idx, 1);
  renderGalleryPreviews();
}

function renderGalleryPreviews() {
  const grid = document.getElementById('gallery-previews-grid');
  if (!grid) return;

  if (selectedGalleryFiles.length === 0) {
    grid.innerHTML = `
      <div id="gallery-empty-placeholder" class="text-slate-400 text-xs flex items-center gap-2 py-2 px-1">
        <i data-lucide="images" class="w-4 h-4 text-slate-300"></i>
        <span class="text-[11px]">No extra gallery photos selected. Click "Select Photos" to add up to 5 angle shots.</span>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  grid.innerHTML = '';
  selectedGalleryFiles.forEach((file, idx) => {
    const card = document.createElement('div');
    card.className = 'relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group bg-slate-100 flex-shrink-0';
    
    const img = document.createElement('img');
    img.className = 'w-full h-full object-cover';
    img.src = URL.createObjectURL(file);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 text-white flex items-center justify-center text-[10px] hover:bg-red-600 transition-colors shadow-sm';
    removeBtn.innerHTML = '✕';
    removeBtn.onclick = (ev) => {
      ev.stopPropagation();
      removeGalleryFile(idx);
    };

    card.appendChild(img);
    card.appendChild(removeBtn);
    grid.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

// Upload helper function
async function uploadFilesToServer(files) {
  if (!files || files.length === 0) return [];
  const formData = new FormData();
  files.forEach(f => formData.append('photos', f));

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success && data.urls) {
      return data.urls;
    }
    return [];
  } catch (err) {
    console.error('File upload failed:', err);
    return [];
  }
}

async function handleCreateProduct(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Publish Product';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="animate-spin inline-block mr-1">⏳</span> Uploading photos from device...`;
  }

  try {
    let finalImageUrl = document.getElementById('new-prod-image').value;
    let finalGalleryUrls = [];

    // 1. Upload main photo from device if selected
    if (selectedMainFile) {
      const uploadedMain = await uploadFilesToServer([selectedMainFile]);
      if (uploadedMain && uploadedMain.length > 0) {
        finalImageUrl = uploadedMain[0];
      }
    }

    // 2. Upload gallery photos from device if selected
    if (selectedGalleryFiles.length > 0) {
      const uploadedGallery = await uploadFilesToServer(selectedGalleryFiles);
      if (uploadedGallery && uploadedGallery.length > 0) {
        finalGalleryUrls = uploadedGallery;
      }
    }

    if (!finalGalleryUrls.includes(finalImageUrl)) {
      finalGalleryUrls.unshift(finalImageUrl);
    }

    const name = document.getElementById('new-prod-name').value;
    const category_slug = document.getElementById('new-prod-category').value;
    const category = document.getElementById('new-prod-category').selectedOptions[0].text;
    const brand = document.getElementById('new-prod-brand').value;
    const price = document.getElementById('new-prod-price').value;
    const original_price = document.getElementById('new-prod-original-price').value || Math.round(price * 1.25);
    const stock = document.getElementById('new-prod-stock').value;

    const rawSizes = document.getElementById('new-prod-sizes').value;
    const sizes = rawSizes ? rawSizes.split(',').map(s => s.trim()).filter(Boolean) : ['Standard'];

    const rawColors = document.getElementById('new-prod-colors').value;
    const colors = rawColors ? rawColors.split(',').map(c => ({ name: c.trim(), hex: '#0f172a' })).filter(Boolean) : [{ name: 'Default', hex: '#0f172a' }];

    const description = document.getElementById('new-prod-description').value || `${name} by ${brand}. High quality marketplace product available for fast delivery across Rwanda.`;
    
    const rawHighlights = document.getElementById('new-prod-highlights').value;
    const highlights = rawHighlights ? rawHighlights.split('\n').map(h => h.trim()).filter(Boolean) : [
      'Premium quality crafted with high durability materials.',
      'Verified by Maicon Rwanda Quality Assurance inspectors.',
      'Fast delivery across all 30 districts of Rwanda via Kigali Speed Logistics.',
      'Instant PIN checkout enabled via MTN Mobile Money & Airtel Money.'
    ];

    const material = document.getElementById('new-prod-material').value || 'Premium Fabric Blend';
    const warranty = document.getElementById('new-prod-warranty').value || '12 Months Quality Guarantee';
    const origin = document.getElementById('new-prod-origin').value || 'Quality Certified Import';
    const sku = document.getElementById('new-prod-sku').value || `MC-RW-${Math.floor(1000 + Math.random() * 9000)}`;

    const specifications = [
      { label: 'Brand', value: brand },
      { label: 'Category', value: category },
      { label: 'SKU / Model', value: sku },
      { label: 'Material', value: material },
      { label: 'Warranty & Guarantee', value: warranty },
      { label: 'Country of Origin', value: origin },
      { label: 'Rwanda Delivery', value: 'Kigali Doorstep (24-48 hrs)' }
    ];

    const res = await fetch('/api/seller/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        category,
        category_slug,
        brand,
        price,
        original_price,
        stock,
        image_url: finalImageUrl,
        gallery: finalGalleryUrls,
        sizes,
        colors,
        description,
        highlights,
        specifications
      })
    });

    const data = await res.json();
    if (data.success) {
      closeAddProductModal();
      loadSellerProducts();
      loadSellerStats();
      alert(`🎉 ${data.message}`);
    } else {
      alert(`Error: ${data.message || 'Failed to create product'}`);
    }
  } catch (err) {
    console.error('Error creating product', err);
    alert('Failed to publish product. Please check connection and try again.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

async function handleRequestPayout(e) {
  e.preventDefault();
  const amount = document.getElementById('payout-amount-input').value;
  const method = document.getElementById('payout-method-select').value;
  const accountNumber = document.getElementById('payout-account-input').value;
  const accountName = document.getElementById('payout-name-input').value;

  try {
    const res = await fetch('/api/seller/payouts/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, method, accountNumber, accountName })
    });

    const data = await res.json();
    if (data.success) {
      alert(`🎉 ${data.message}`);
      loadSellerStats();
    }
  } catch (err) {
    console.error('Error requesting payout', err);
  }
}
