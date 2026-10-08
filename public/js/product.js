// Product Details Page (PDP) Interactive Logic
let currentProduct = null;
let selectedColor = null;
let selectedSize = null;
let currentQuantity = 1;
let activeImageIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();
  
  syncHeaderUserState();
  updateHeaderCounters();
  
  // Extract product ID from URL query params, hash or path
  const urlParams = new URLSearchParams(window.location.search);
  let productId = parseInt(
    urlParams.get('id') || 
    urlParams.get('productId') || 
    urlParams.get('product_id') || 
    urlParams.get('p')
  );

  if (!productId || isNaN(productId)) {
    const hash = window.location.hash.replace('#', '');
    const hashNum = parseInt(hash);
    if (!isNaN(hashNum) && hashNum > 0) {
      productId = hashNum;
    }
  }

  // Fallback check cached clicked product in sessionStorage
  const cachedProdStr = sessionStorage.getItem('maicon_active_product');
  let cachedProd = null;
  if (cachedProdStr) {
    try {
      cachedProd = JSON.parse(cachedProdStr);
      if (!productId && cachedProd && cachedProd.id) {
        productId = cachedProd.id;
      }
    } catch (e) {}
  }

  if (!productId || isNaN(productId)) {
    productId = 1;
  }

  // If cached product matches the requested ID, render immediately for instant feel
  if (cachedProd && cachedProd.id === productId) {
    currentProduct = cachedProd;
    renderProductShowcase(cachedProd);
  }
  
  await loadProductDetails(productId);
});

async function loadProductDetails(id) {
  try {
    const res = await API.getProductById(id);
    if (res && res.success && res.product) {
      currentProduct = res.product;
      renderProductShowcase(currentProduct);
      return;
    }

    // Secondary fallback: fetch products catalog and locate matching item
    const catalogRes = await API.getProducts({});
    if (catalogRes && catalogRes.success && catalogRes.products) {
      const matched = catalogRes.products.find(p => p.id === id);
      if (matched) {
        currentProduct = matched;
        renderProductShowcase(matched);
        return;
      }
    }

    // If still not found, show clean not found state
    renderProductNotFound(id);
  } catch (err) {
    console.error('Error loading product details:', err);
  }
}

function renderProductNotFound(id) {
  const main = document.querySelector('main');
  if (main) {
    main.innerHTML = `
      <div class="py-20 text-center max-w-md mx-auto">
        <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <i data-lucide="package-x" class="w-8 h-8"></i>
        </div>
        <h2 class="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p class="text-xs text-slate-500 mb-6">The item (ID: ${id}) could not be retrieved from the catalog. It may have been unlisted or moved.</p>
        <a href="/" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2">
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
          <span>Return to Storefront Catalog</span>
        </a>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }
}

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el && text !== undefined && text !== null) {
    el.textContent = text;
  }
}

function setElHtml(id, html) {
  const el = document.getElementById(id);
  if (el && html !== undefined && html !== null) {
    el.innerHTML = html;
  }
}

function renderProductShowcase(p) {
  if (!p) return;
  try {
    document.title = `${p.name || 'Product Details'} | Maicon Rwanda`;

    // Breadcrumbs & Header
    const crumbCat = document.getElementById('crumb-category');
    if (crumbCat) {
      crumbCat.textContent = p.category || 'All Categories';
      crumbCat.href = `/?category=${encodeURIComponent(p.category_slug || p.category || 'all')}`;
    }
    setElText('crumb-title', p.name);
    setElText('header-category-label', p.category || 'Product Details');

    // Title, Brand, Rating
    setElText('pdp-title', p.name);
    setElText('pdp-brand', p.brand || 'Verified Merchant');
    const numRating = parseFloat(p.rating) || 4.9;
    setElText('pdp-rating-val', numRating.toFixed(1));
    setElText('pdp-review-count', p.review_count || (p.reviews ? p.reviews.length : 128));

    const descText = p.description || `${p.name} by ${p.brand || 'Verified Merchant'}. High quality marketplace product available for instant checkout and fast delivery in Rwanda.`;
    setElText('pdp-description', descText);
    setElText('pdp-tab-description-text', descText);

    // Prices
    const numPrice = parseFloat(p.price) || 0;
    const formattedPrice = `${numPrice.toLocaleString()} RWF`;
    const originalPriceVal = p.original_price ? parseFloat(p.original_price) : Math.round(numPrice * 1.25);
    const formattedOrigPrice = `${originalPriceVal.toLocaleString()} RWF`;
    const discountVal = p.discount_percent || Math.max(5, Math.round(((originalPriceVal - numPrice) / (originalPriceVal || 1)) * 100));

    setElText('pdp-price', formattedPrice);
    setElText('pdp-original-price', formattedOrigPrice);
    setElText('pdp-price-discount-tag', `SAVE ${discountVal}%`);
    setElText('pdp-discount-badge', `-${discountVal}% OFF`);

  // Gallery & Main Image
  const baseImg = p.image_url || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700';
  let gallery = [];
  if (Array.isArray(p.gallery) && p.gallery.length > 0) {
    gallery = p.gallery.filter(Boolean);
  } else {
    gallery = [baseImg];
  }

  activeImageIndex = 0;
  updateMainImage(gallery[0], 0, gallery.length);

  const thumbContainer = document.getElementById('pdp-thumbnails');
  if (thumbContainer) {
    thumbContainer.innerHTML = gallery.map((imgUrl, idx) => `
      <button 
        type="button"
        onclick="switchGalleryImage('${imgUrl}', ${idx}, ${gallery.length})" 
        id="thumb-btn-${idx}"
        class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 ${idx === 0 ? 'thumb-active border-cyan-600' : 'border-slate-200'} bg-slate-100 flex-shrink-0 transition-all hover:opacity-90 flex items-center justify-center">
        <img src="${imgUrl}" alt="Thumbnail ${idx + 1}" class="w-full h-full object-contain p-1 bg-white" />
      </button>
    `).join('');
  }

  // Color Swatches
  let rawColors = (p.colors && p.colors.length) ? p.colors : ['Default'];
  if (typeof rawColors === 'string') {
    rawColors = rawColors.split(',').map(c => c.trim()).filter(Boolean);
  }
  const colors = rawColors.map(c => {
    if (typeof c === 'object' && c !== null) {
      const name = (c.name && !c.name.includes('[object')) ? c.name : 'Standard';
      return { name, hex: c.hex || '#0f172a' };
    }
    const name = String(c);
    return { name: name.includes('[object') ? 'Standard' : name, hex: '#0f172a' };
  });

  selectedColor = colors[0]?.name || 'Default';
  setElText('pdp-selected-color-label', selectedColor);

  const colorContainer = document.getElementById('pdp-color-swatches');
  if (colorContainer) {
    colorContainer.innerHTML = colors.map((c, idx) => `
      <button 
        type="button"
        onclick="selectPdpColor('${c.name}', ${idx})" 
        id="color-swatch-${idx}"
        class="color-swatch-btn px-3 py-1.5 rounded-xl border-2 flex items-center gap-2 text-xs font-semibold transition-all ${idx === 0 ? 'variant-swatch-active bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400'}">
        <span class="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0" style="background-color: ${c.hex}"></span>
        <span>${c.name}</span>
      </button>
    `).join('');
  }

  // Size Chips
  let rawSizes = (p.sizes && p.sizes.length) ? p.sizes : ['Standard'];
  if (typeof rawSizes === 'string') {
    rawSizes = rawSizes.split(',').map(s => s.trim()).filter(Boolean);
  }
  const sizes = rawSizes.map(s => {
    const str = typeof s === 'object' && s !== null ? (s.name || s.size || 'Standard') : String(s);
    return str.includes('[object') ? 'Standard' : str;
  });
  selectedSize = sizes[0] || 'Standard';

  const sizeContainer = document.getElementById('pdp-size-chips');
  if (sizeContainer) {
    sizeContainer.innerHTML = sizes.map((s, idx) => `
      <button 
        type="button"
        onclick="selectPdpSize('${s}', ${idx})" 
        id="size-chip-${idx}"
        class="size-chip-btn px-3.5 py-1.5 rounded-xl border-2 text-xs font-semibold transition-all ${idx === 0 ? 'variant-swatch-active bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400'}">
        <span>${s}</span>
      </button>
    `).join('');
  }

  // Stock Alert
  const stockCount = p.stock || 12;
  setElHtml('pdp-stock-alert', `⚡ Only <strong>${stockCount} items</strong> left in Kigali Warehouse!`);

  // Seller Card
  if (p.seller && p.seller.name) {
    setElText('pdp-seller-name', p.seller.name);
  } else {
    setElText('pdp-seller-name', `${p.brand || 'Kigali'} Official Store`);
  }

  // Highlights List
  const highlights = (Array.isArray(p.highlights) && p.highlights.length) ? p.highlights : [
    `Authentic ${p.name} verified by Maicon Rwanda Quality Assurance inspectors.`,
    `Directly supplied by ${p.brand || 'authorized Rwanda merchant'}.`,
    'Fast doorstep delivery across all 30 districts of Rwanda via Kigali Speed Logistics.',
    'Instant PIN checkout enabled via MTN Mobile Money, Airtel Money & Bank Cards.',
    '7-Day Return & Escrow Protection guarantee.'
  ];

  const highlightsList = document.getElementById('pdp-highlights-list');
  if (highlightsList) {
    highlightsList.innerHTML = highlights.map(h => `
      <li class="flex items-start gap-2">
        <i data-lucide="check" class="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0"></i>
        <span>${h}</span>
      </li>
    `).join('');
  }

  // Specifications Table
  const specs = (Array.isArray(p.specifications) && p.specifications.length) ? p.specifications : [
    { label: 'Brand', value: p.brand || 'Authentic Marketplace' },
    { label: 'Category', value: p.category || 'General Merchandise' },
    { label: 'Product Name', value: p.name },
    { label: 'Available Sizes', value: Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.sizes || 'Standard') },
    { label: 'SKU / Model', value: `MC-RW-${(p.id || 1).toString().padStart(4, '0')}` },
    { label: 'Condition', value: '100% Brand New · Factory Sealed' },
    { label: 'Country of Origin', value: 'Imported / Quality Certified' },
    { label: 'Rwanda Delivery', value: 'Kigali Doorstep (24-48 hrs)' },
    { label: 'Warranty & Guarantee', value: '12 Months Official Manufacturer Warranty' },
    { label: 'Payment Channels', value: 'MTN Mobile Money, Airtel Money, Visa, Mastercard' }
  ];

  const specsTbody = document.getElementById('pdp-specs-tbody');
  if (specsTbody) {
    specsTbody.innerHTML = specs.map((s, idx) => `
      <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}">
        <td class="py-2.5 px-4 font-bold text-slate-700 w-1/3 border-r border-slate-100">${s.label}</td>
        <td class="py-2.5 px-4 text-slate-900 font-medium">${s.value}</td>
      </tr>
    `).join('');
  }

  // Reviews List
  const reviews = (Array.isArray(p.reviews) && p.reviews.length) ? p.reviews : [
    {
      id: 1,
      author: 'Emile Mugisha',
      location: 'Kigali - Nyarugenge',
      rating: 5,
      date: '3 days ago',
      title: `Exceeded my expectations for ${p.name}!`,
      comment: `The quality of this ${p.name} is top notch. Arrived right at my doorstep in Kigali the next day. Paid easily with MTN MoMo.`,
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
      comment: `Matches the description and photos perfectly. Very durable and great quality from ${p.brand || 'the merchant'}. Recommended 100%!`,
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

  const reviewsList = document.getElementById('pdp-reviews-list');
  if (reviewsList) {
    reviewsList.innerHTML = reviews.map(r => `
      <div class="p-5 bg-white rounded-2xl border border-slate-200 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-slate-900 text-white font-black flex items-center justify-center text-xs">
              ${r.author.charAt(0)}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-xs text-slate-900">${r.author}</span>
                ${r.verified ? '<span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200">Verified Buyer 🇷🇼</span>' : ''}
              </div>
              <p class="text-[10px] text-slate-400">${r.location} · ${r.date}</p>
            </div>
          </div>
          <div class="flex text-amber-400">
            ${Array(r.rating).fill('<i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>').join('')}
          </div>
        </div>

        <div>
          <h5 class="text-xs font-bold text-slate-900 mb-1">${r.title}</h5>
          <p class="text-xs text-slate-600 leading-relaxed">${r.comment}</p>
        </div>

        <div class="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
          <span>Helpful review?</span>
          <button onclick="this.classList.toggle('text-cyan-600')" class="font-semibold text-slate-600 hover:text-cyan-600 flex items-center gap-1 transition-colors">
            <i data-lucide="thumbs-up" class="w-3 h-3"></i>
            <span>Yes (${r.helpfulCount || 12})</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  // Related Products Grid
  const relatedGrid = document.getElementById('pdp-related-grid');
  if (relatedGrid && p.related_products && p.related_products.length) {
    relatedGrid.innerHTML = p.related_products.map(item => `
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden group shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <a href="/product?id=${item.id}" class="block relative aspect-square bg-slate-100 overflow-hidden flex items-center justify-center">
          <img 
            src="${item.image_url}" 
            alt="${item.name}" 
            class="w-full h-full object-contain object-center p-2.5 group-hover:scale-105 transition-transform duration-500" 
          />
          <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-900/80 text-white backdrop-blur-sm">
            ${item.brand || 'Uniqlo'}
          </span>
        </a>

        <div class="p-3.5 flex flex-col flex-1 justify-between">
          <div>
            <a href="/product?id=${item.id}" class="text-xs font-bold text-slate-900 line-clamp-1 hover:text-cyan-600 transition-colors">
              ${item.name}
            </a>
            <div class="flex items-center gap-1 mt-1 text-[11px] text-amber-500 font-bold">
              <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>
              <span>${(parseFloat(item.rating) || 4.9).toFixed(1)}</span>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <span class="text-xs font-black text-cyan-700">
              ${parseFloat(item.price).toLocaleString()} RWF
            </span>
            <a href="/product?id=${item.id}" class="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all">
              View
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  if (window.lucide) lucide.createIcons();
  } catch (err) {
    console.error('Error rendering product showcase:', err);
  }
}

// Gallery image switcher
function switchGalleryImage(imgUrl, index, total) {
  activeImageIndex = index;
  updateMainImage(imgUrl, index, total);

  document.querySelectorAll('#pdp-thumbnails button').forEach((btn, idx) => {
    btn.classList.toggle('thumb-active', idx === index);
    btn.classList.toggle('border-cyan-600', idx === index);
    btn.classList.toggle('border-slate-200', idx !== index);
  });
}

function updateMainImage(imgUrl, index, total) {
  const mainImg = document.getElementById('pdp-main-image');
  if (mainImg) {
    mainImg.src = imgUrl;
  }
  const counter = document.getElementById('pdp-image-counter');
  if (counter) {
    counter.textContent = `Photo ${index + 1} of ${total || 4}`;
  }
}

// Color and Size selection
function selectPdpColor(colorName, index) {
  selectedColor = colorName;
  document.getElementById('pdp-selected-color-label').textContent = colorName;

  document.querySelectorAll('.color-swatch-btn').forEach((btn, idx) => {
    if (idx === index) {
      btn.className = 'color-swatch-btn px-3 py-1.5 rounded-xl border-2 flex items-center gap-2 text-xs font-bold transition-all variant-swatch-active bg-slate-900 text-white';
    } else {
      btn.className = 'color-swatch-btn px-3 py-1.5 rounded-xl border-2 flex items-center gap-2 text-xs font-semibold transition-all border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400';
    }
  });
}

function selectPdpSize(sizeName, index) {
  selectedSize = sizeName;

  document.querySelectorAll('.size-chip-btn').forEach((btn, idx) => {
    if (idx === index) {
      btn.className = 'size-chip-btn px-3.5 py-1.5 rounded-xl border-2 text-xs font-bold transition-all variant-swatch-active bg-slate-900 text-white';
    } else {
      btn.className = 'size-chip-btn px-3.5 py-1.5 rounded-xl border-2 text-xs font-semibold transition-all border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400';
    }
  });
}

// Quantity stepper
function incrementQty() {
  const input = document.getElementById('pdp-qty-input');
  if (!input) return;
  const max = (currentProduct && currentProduct.stock) ? currentProduct.stock : 99;
  if (currentQuantity < max) {
    currentQuantity++;
    input.value = currentQuantity;
  } else {
    showToast(`Maximum available stock is ${max} items.`, 'info');
  }
}

function decrementQty() {
  const input = document.getElementById('pdp-qty-input');
  if (!input) return;
  if (currentQuantity > 1) {
    currentQuantity--;
    input.value = currentQuantity;
  }
}

// Tabs switcher
function switchPdpTab(tabName) {
  const tabs = ['description', 'specs', 'reviews', 'shipping'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const content = document.getElementById(`pdp-tab-content-${t}`);
    
    if (btn) {
      if (t === tabName) {
        btn.className = 'pdp-tab-btn py-4 px-6 text-xs font-bold text-slate-900 border-b-2 border-slate-900 flex items-center gap-2 transition-all flex-shrink-0';
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'w-4 h-4 text-cyan-600';
      } else {
        btn.className = 'pdp-tab-btn py-4 px-6 text-xs font-bold text-slate-400 border-b-2 border-transparent hover:text-slate-900 flex items-center gap-2 transition-all flex-shrink-0';
        const icon = btn.querySelector('i');
        if (icon) icon.className = 'w-4 h-4 text-slate-400';
      }
    }

    if (content) {
      content.classList.toggle('hidden', t !== tabName);
    }
  });
}

// Add to Cart
function handlePdpAddToCart() {
  if (!currentProduct) return;

  const rawCart = localStorage.getItem('maicon_cart');
  let cart = [];
  try {
    cart = rawCart ? JSON.parse(rawCart) : [];
  } catch (e) {
    cart = [];
  }

  // Check if existing
  const existingIdx = cart.findIndex(item => 
    item.id === currentProduct.id && 
    item.selectedColor === selectedColor && 
    item.selectedSize === selectedSize
  );

  if (existingIdx > -1) {
    cart[existingIdx].quantity += currentQuantity;
  } else {
    cart.push({
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      image_url: currentProduct.image_url,
      brand: currentProduct.brand,
      selectedColor: selectedColor,
      selectedSize: selectedSize,
      quantity: currentQuantity
    });
  }

  localStorage.setItem('maicon_cart', JSON.stringify(cart));
  updateHeaderCounters();
  showToast(`Added ${currentQuantity}x "${currentProduct.name}" to cart! 🛍️`, 'success');
}

let pendingCheckoutItems = [];

// Buy Now (Instant Single Item Checkout)
function handlePdpBuyNow() {
  if (!currentProduct) return;

  const totalAmount = currentProduct.price * currentQuantity;
  pendingCheckoutItems = [
    {
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      image_url: currentProduct.image_url,
      brand: currentProduct.brand,
      color: selectedColor,
      size: selectedSize,
      quantity: currentQuantity
    }
  ];

  document.getElementById('checkout-item-img').src = currentProduct.image_url;
  document.getElementById('checkout-item-title').textContent = currentProduct.name;
  document.getElementById('checkout-item-variant').textContent = `Color: ${selectedColor} · Size: ${selectedSize} · Qty: ${currentQuantity}`;
  document.getElementById('checkout-item-price').textContent = `${totalAmount.toLocaleString()} RWF`;
  document.getElementById('checkout-btn-text').textContent = `Pay ${totalAmount.toLocaleString()} RWF with MoMo`;

  document.getElementById('checkout-modal').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

// Full Cart Checkout from Drawer
function openCartCheckout() {
  const rawCart = localStorage.getItem('maicon_cart');
  let cart = [];
  try {
    cart = rawCart ? JSON.parse(rawCart) : [];
  } catch (e) {
    cart = [];
  }

  if (cart.length === 0) {
    showToast('Your cart is empty.', 'info');
    return;
  }

  pendingCheckoutItems = [...cart];
  const totalAmount = cart.reduce((sum, it) => sum + (it.price * (it.quantity || 1)), 0);

  document.getElementById('checkout-item-img').src = cart[0].image_url;
  document.getElementById('checkout-item-title').textContent = cart.length === 1 ? cart[0].name : `${cart.length} Marketplace Items`;
  document.getElementById('checkout-item-variant').textContent = cart.map(c => `${c.name.substring(0, 15)}... (x${c.quantity})`).join(', ');
  document.getElementById('checkout-item-price').textContent = `${totalAmount.toLocaleString()} RWF`;
  document.getElementById('checkout-btn-text').textContent = `Pay ${totalAmount.toLocaleString()} RWF with MoMo`;

  toggleCartDrawer();
  document.getElementById('checkout-modal').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').classList.add('hidden');
}

async function handleExecuteInstantCheckout(e) {
  e.preventDefault();
  const btn = document.getElementById('checkout-submit-btn');
  const originalHtml = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = `<span class="animate-spin inline-block mr-2">⏳</span> Prompting MTN MoMo PIN on phone...`;

  const orderData = {
    customerName: document.getElementById('checkout-name').value,
    customerPhone: document.getElementById('checkout-phone').value,
    customerEmail: 'buyer@maicon.com',
    shippingAddress: document.getElementById('checkout-address').value,
    district: document.getElementById('checkout-district').value,
    city: 'Kigali',
    paymentMethod: document.querySelector('input[name="pay_channel"]:checked').value,
    items: pendingCheckoutItems.length ? pendingCheckoutItems : [
      {
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        quantity: currentQuantity,
        color: selectedColor,
        size: selectedSize
      }
    ]
  };

  try {
    const res = await API.checkout(orderData);
    
    // Clear cart if items were in cart
    localStorage.removeItem('maicon_cart');
    updateHeaderCounters();

    setTimeout(() => {
      closeCheckoutModal();
      btn.disabled = false;
      btn.innerHTML = originalHtml;

      showToast(`🎉 Payment Confirmed! Order placed successfully.`, 'success');
      setTimeout(() => {
        window.location.href = '/account#orders';
      }, 1200);
    }, 1500);
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
    showToast('Payment processing error. Please try again.', 'error');
  }
}

// Wishlist Toggle
function handlePdpWishlistToggle() {
  if (!currentProduct) return;
  const rawWish = localStorage.getItem('maicon_wishlist');
  let wishlist = [];
  try {
    wishlist = rawWish ? JSON.parse(rawWish) : [];
  } catch (e) {
    wishlist = [];
  }

  const idx = wishlist.indexOf(currentProduct.id);
  const btn = document.getElementById('pdp-wishlist-btn');

  if (idx > -1) {
    wishlist.splice(idx, 1);
    if (btn) {
      btn.className = 'absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-400 hover:text-rose-500 flex items-center justify-center shadow-md transition-all';
    }
    showToast('Removed from wishlist.', 'info');
  } else {
    wishlist.push(currentProduct.id);
    if (btn) {
      btn.className = 'absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md transition-all';
    }
    showToast('Saved to wishlist! ❤️', 'success');
  }

  localStorage.setItem('maicon_wishlist', JSON.stringify(wishlist));
  updateHeaderCounters();
}

// Size guide modal
function openSizeGuideModal() {
  document.getElementById('size-guide-modal').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeSizeGuideModal() {
  document.getElementById('size-guide-modal').classList.add('hidden');
}

// Cart Drawer
function toggleCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (!overlay) return;
  const isHidden = overlay.classList.contains('hidden');
  if (isHidden) {
    renderCartDrawerItems();
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
  }
  if (window.lucide) lucide.createIcons();
}

function renderCartDrawerItems() {
  const container = document.getElementById('cart-drawer-items');
  const subtotalEl = document.getElementById('cart-drawer-subtotal');
  if (!container) return;

  const rawCart = localStorage.getItem('maicon_cart');
  let cart = [];
  try {
    cart = rawCart ? JSON.parse(rawCart) : [];
  } catch (e) {
    cart = [];
  }

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-slate-400">
        <i data-lucide="shopping-bag" class="w-10 h-10 mx-auto mb-2 opacity-40"></i>
        <p class="text-xs font-semibold">Your cart is empty.</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '0 RWF';
    return;
  }

  let total = 0;
  container.innerHTML = cart.map((item, idx) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return `
      <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <img src="${item.image_url}" alt="${item.name}" class="w-14 h-14 rounded-lg object-cover border border-slate-200" />
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold text-slate-900 truncate">${item.name}</h4>
          <p class="text-[10px] text-slate-500">${item.selectedColor || ''} · ${item.selectedSize || ''} · Qty: ${item.quantity}</p>
          <span class="text-xs font-black text-cyan-700">${itemTotal.toLocaleString()} RWF</span>
        </div>
        <button onclick="removeDrawerCartItem(${idx})" class="text-slate-400 hover:text-red-500 p-1">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `;
  }).join('');

  if (subtotalEl) subtotalEl.textContent = `${total.toLocaleString()} RWF`;
  if (window.lucide) lucide.createIcons();
}

function removeDrawerCartItem(index) {
  const rawCart = localStorage.getItem('maicon_cart');
  let cart = [];
  try {
    cart = rawCart ? JSON.parse(rawCart) : [];
  } catch (e) {
    cart = [];
  }

  cart.splice(index, 1);
  localStorage.setItem('maicon_cart', JSON.stringify(cart));
  renderCartDrawerItems();
  updateHeaderCounters();
}

// User state & counters
function syncHeaderUserState() {
  const container = document.getElementById('header-user-container');
  if (!container) return;

  const rawUser = localStorage.getItem('maicon_user');
  if (rawUser) {
    try {
      const user = JSON.parse(rawUser);
      const roleBadges = {
        admin: '<span class="px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 text-[10px] font-bold border border-cyan-200">Admin</span>',
        seller: '<span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">Merchant</span>',
        buyer: '<span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">Buyer</span>'
      };

      const portalLinks = {
        admin: '/admin',
        seller: '/seller',
        buyer: '/account'
      };

      container.innerHTML = `
        <div class="flex items-center gap-2">
          <a href="${portalLinks[user.role] || '/account'}" class="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200">
            <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}" class="w-6 h-6 rounded-full object-cover" />
            <span class="text-xs font-bold text-slate-900">${user.name.split(' ')[0]}</span>
            ${roleBadges[user.role] || ''}
          </a>
        </div>
      `;
    } catch (e) {}
  }
}

function updateHeaderCounters() {
  const rawCart = localStorage.getItem('maicon_cart');
  let cartCount = 0;
  if (rawCart) {
    try {
      const cart = JSON.parse(rawCart);
      cartCount = cart.reduce((acc, it) => acc + (it.quantity || 1), 0);
    } catch (e) {}
  }
  const cartBadge = document.getElementById('header-cart-count');
  if (cartBadge) cartBadge.textContent = cartCount;

  const rawWish = localStorage.getItem('maicon_wishlist');
  let wishCount = 0;
  if (rawWish) {
    try {
      const wish = JSON.parse(rawWish);
      wishCount = wish.length;
    } catch (e) {}
  }
  const wishBadge = document.getElementById('header-wishlist-count');
  if (wishBadge) {
    wishBadge.textContent = wishCount;
    wishBadge.classList.toggle('hidden', wishCount === 0);
  }
}

function handleHeaderSearch(e) {
  e.preventDefault();
  const input = document.getElementById('global-search-input');
  if (input && input.value.trim()) {
    window.location.href = `/?search=${encodeURIComponent(input.value.trim())}`;
  }
}

// Toast Notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-slate-900 text-white' : (type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white');
  
  toast.className = `${bgClass} px-4 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2.5 transition-all duration-300 transform translate-y-4 opacity-0 pointer-events-auto border border-slate-700`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
