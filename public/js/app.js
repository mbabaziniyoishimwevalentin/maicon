// Maicon Application State & UI Logic
const appState = {
  products: [],
  filters: {
    search: '',
    brands: [],
    minPrice: 0,
    maxPrice: 5000000,
    sizes: [],
    colors: [],
    sort: 'popular',
    category: 'all' // Default to all
  },
  availableBrands: [],
  availableCategories: [],
  availableSizes: [],
  availableColors: [],
  cart: JSON.parse(localStorage.getItem('maicon_cart')) || [
    {
      id: 1,
      name: 'Shirt Soft Cotton Polo',
      brand: 'Uniqlo',
      price: 35000,
      size: 'M',
      color: 'Beige',
      quantity: 1,
      image_url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=300'
    }
  ],
  wishlist: JSON.parse(localStorage.getItem('maicon_wishlist')) || [1, 2, 7],
  gridColumns: 3
};

// Hero Carousel State
let currentHeroIndex = 0;
const totalHeroSlides = 3;
let heroAutoPlayTimer = null;

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  if (window.I18N) {
    window.I18N.applyTranslations();
    updateLanguageDropdownUI(window.I18N.currentLang);
  }
  setupHeroCarousel();
  setupPriceSlider();
  setupEventListeners();
  await loadFilterData();
  renderCategoryPills();
  renderCategorySidebar();
  await fetchAndRenderProducts();
  updateCartBadge();
  updateWishlistBadge();
  renderHeaderAuth();
});

// Hero Carousel Controls
function setupHeroCarousel() {
  const container = document.getElementById('hero-carousel');
  if (!container) return;

  startHeroAutoPlay();

  container.addEventListener('mouseenter', stopHeroAutoPlay);
  container.addEventListener('mouseleave', startHeroAutoPlay);
}

function startHeroAutoPlay() {
  stopHeroAutoPlay();
  heroAutoPlayTimer = setInterval(() => {
    nextHeroSlide();
  }, 5000);
}

function stopHeroAutoPlay() {
  if (heroAutoPlayTimer) {
    clearInterval(heroAutoPlayTimer);
    heroAutoPlayTimer = null;
  }
}

function goToHeroSlide(index) {
  currentHeroIndex = (index + totalHeroSlides) % totalHeroSlides;
  const track = document.getElementById('hero-carousel-track');
  const dots = document.querySelectorAll('.hero-dot');

  if (track) {
    track.style.transform = `translateX(-${currentHeroIndex * 100}%)`;
  }

  dots.forEach((dot, idx) => {
    if (idx === currentHeroIndex) {
      dot.classList.add('w-6', 'bg-cyan-400');
      dot.classList.remove('w-2', 'bg-white/40');
    } else {
      dot.classList.remove('w-6', 'bg-cyan-400');
      dot.classList.add('w-2', 'bg-white/40');
    }
  });
}

function nextHeroSlide() {
  goToHeroSlide(currentHeroIndex + 1);
}

function prevHeroSlide() {
  goToHeroSlide(currentHeroIndex - 1);
}

// Language Switcher Handlers
function toggleLanguageMenu() {
  const menu = document.getElementById('lang-dropdown-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

function selectLanguage(lang) {
  if (window.I18N) {
    window.I18N.setLanguage(lang);
    updateLanguageDropdownUI(lang);
  }
  const menu = document.getElementById('lang-dropdown-menu');
  if (menu) menu.classList.add('hidden');
  renderCategoryPills();
  renderCategorySidebar();
  showToast(lang === 'fr' ? 'Langue changée en Français 🇫🇷' : 'Language switched to English 🇺🇸');
}

function updateLanguageDropdownUI(lang) {
  const checkEn = document.getElementById('check-en');
  const checkFr = document.getElementById('check-fr');
  if (checkEn && checkFr) {
    if (lang === 'fr') {
      checkEn.classList.add('hidden');
      checkFr.classList.remove('hidden');
    } else {
      checkEn.classList.remove('hidden');
      checkFr.classList.add('hidden');
    }
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const btn = document.getElementById('lang-dropdown-btn');
  const menu = document.getElementById('lang-dropdown-menu');
  if (btn && menu && !btn.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.add('hidden');
  }
});

// Load Filters & Categories
async function loadFilterData() {
  const data = await API.getFilters();
  if (data && data.success) {
    appState.availableBrands = data.brands;
    appState.availableCategories = data.categories;
    appState.availableSizes = data.sizes;
    appState.availableColors = data.colors;
  } else {
    appState.availableBrands = window.MAICON_INITIAL_DATA.brands;
    appState.availableCategories = window.MAICON_INITIAL_DATA.categories;
    appState.availableSizes = window.MAICON_INITIAL_DATA.sizes;
    appState.availableColors = window.MAICON_INITIAL_DATA.colors;
  }

  renderBrandFilters(appState.availableBrands);
  renderSizeFilters(appState.availableSizes);
  renderColorFilters(appState.availableColors);
}

// Scroll Category Pills
function scrollCategoryPills(offset) {
  const container = document.getElementById('category-pills-bar');
  if (container) {
    container.scrollBy({ left: offset, behavior: 'smooth' });
  }
}

// Render Interactive Category Pills Bar
function renderCategoryPills() {
  const pillsContainer = document.getElementById('category-pills-bar');
  if (!pillsContainer) return;

  const isFr = window.I18N && window.I18N.currentLang === 'fr';

  const icons = {
    all: 'sparkles',
    fashion: 'shirt',
    'food-groceries': 'utensils',
    'events-weddings': 'party-popper',
    'home-furniture': 'home',
    'office-work': 'briefcase',
    electronics: 'smartphone',
    'health-medical': 'heart-pulse',
    'construction-hardware': 'hammer',
    'sports-toys-hobbies': 'dumbbell',
    'motors-mobility': 'car'
  };

  pillsContainer.innerHTML = appState.availableCategories.map(cat => {
    const isActive = (appState.filters.category || 'all').toLowerCase() === cat.slug.toLowerCase();
    const name = isFr ? (cat.nameFr || cat.name) : cat.name;
    const iconName = icons[cat.slug] || 'tag';

    return `
      <button 
        type="button" 
        onclick="setCategory('${cat.slug}')"
        class="category-pill flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
          isActive 
            ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15 border-transparent' 
            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
        }">
        <i data-lucide="${iconName}" class="w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}"></i>
        <span>${name}</span>
      </button>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons({
      root: pillsContainer
    });
  }
}

// Render Category List in Sidebar & Mobile Drawer
function renderCategorySidebar() {
  const container = document.getElementById('category-filter-list');
  const mobileContainer = document.getElementById('mobile-category-filter-list');
  if (!container && !mobileContainer) return;

  const isFr = window.I18N && window.I18N.currentLang === 'fr';

  const html = appState.availableCategories.map(cat => {
    const isSelected = (appState.filters.category || 'all').toLowerCase() === cat.slug.toLowerCase();
    const name = isFr ? (cat.nameFr || cat.name) : cat.name;
    return `
      <button 
        type="button" 
        onclick="setCategory('${cat.slug}')"
        class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
          isSelected 
            ? 'bg-cyan-50 text-cyan-700 font-bold' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }">
        <span>${name}</span>
        ${isSelected ? '<span class="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>' : ''}
      </button>
    `;
  }).join('');

  if (container) container.innerHTML = html;
  if (mobileContainer) mobileContainer.innerHTML = html;
}

// Change Category Filter
function setCategory(slug) {
  appState.filters.category = slug;

  // Update Breadcrumb
  const isFr = window.I18N && window.I18N.currentLang === 'fr';
  const catObj = appState.availableCategories.find(c => c.slug === slug);
  const catName = catObj ? (isFr ? (catObj.nameFr || catObj.name) : catObj.name) : 'All';
  
  const breadcrumb = document.getElementById('breadcrumb-category');
  if (breadcrumb) {
    breadcrumb.textContent = catName;
  }

  renderCategoryPills();
  renderCategorySidebar();
  fetchAndRenderProducts();
}

// Render Brand Checkbox List
function renderBrandFilters(brands, filterTerm = '') {
  const container = document.getElementById('brand-filter-list');
  const mobileContainer = document.getElementById('mobile-brand-filter-list');
  if (!container && !mobileContainer) return;

  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(filterTerm.toLowerCase()));

  const html = filteredBrands.map(brand => {
    const isChecked = appState.filters.brands.includes(brand.name);
    return `
      <label class="flex items-center justify-between cursor-pointer py-1.5 group select-none text-sm">
        <div class="flex items-center gap-3">
          <input type="checkbox" value="${brand.name}" class="brand-checkbox custom-checkbox" ${isChecked ? 'checked' : ''} />
          <span class="font-medium text-slate-700 group-hover:text-slate-950 transition-colors">${brand.name}</span>
        </div>
        <span class="text-xs text-slate-400 font-normal">${brand.count || 24}</span>
      </label>
    `;
  }).join('');

  if (container) container.innerHTML = html;
  if (mobileContainer) mobileContainer.innerHTML = html;

  document.querySelectorAll('.brand-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const brandName = e.target.value;
      if (e.target.checked) {
        if (!appState.filters.brands.includes(brandName)) {
          appState.filters.brands.push(brandName);
        }
      } else {
        appState.filters.brands = appState.filters.brands.filter(b => b !== brandName);
      }
      document.querySelectorAll(`.brand-checkbox[value="${brandName}"]`).forEach(box => {
        box.checked = e.target.checked;
      });
      fetchAndRenderProducts();
    });
  });
}

// Render Size Pills
function renderSizeFilters(sizes) {
  const container = document.getElementById('size-filter-list');
  const mobileContainer = document.getElementById('mobile-size-filter-list');
  if (!container && !mobileContainer) return;

  const html = sizes.map(size => {
    const isSelected = appState.filters.sizes.includes(size);
    return `
      <button type="button" data-size="${size}" class="size-pill-btn px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
        isSelected
          ? 'border-cyan-500 bg-cyan-50 text-cyan-600 shadow-sm'
          : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      }">
        ${size}
      </button>
    `;
  }).join('');

  if (container) container.innerHTML = html;
  if (mobileContainer) mobileContainer.innerHTML = html;

  document.querySelectorAll('.size-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const size = btn.getAttribute('data-size');
      if (appState.filters.sizes.includes(size)) {
        appState.filters.sizes = appState.filters.sizes.filter(s => s !== size);
      } else {
        appState.filters.sizes.push(size);
      }
      renderSizeFilters(appState.availableSizes);
      fetchAndRenderProducts();
    });
  });
}

// Render Color Swatches
function renderColorFilters(colors) {
  const container = document.getElementById('color-filter-list');
  const mobileContainer = document.getElementById('mobile-color-filter-list');
  if (!container && !mobileContainer) return;

  const html = colors.map(col => {
    const isSelected = appState.filters.colors.includes(col.name);
    return `
      <button 
        type="button" 
        data-color="${col.name}" 
        title="${col.name}" 
        class="color-swatch-btn ${isSelected ? 'active' : ''}" 
        style="background-color: ${col.hex}; ${col.hex === '#ffffff' ? 'border: 1px solid #cbd5e1;' : ''}">
      </button>
    `;
  }).join('');

  if (container) container.innerHTML = html;
  if (mobileContainer) mobileContainer.innerHTML = html;

  document.querySelectorAll('.color-swatch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-color');
      if (appState.filters.colors.includes(color)) {
        appState.filters.colors = appState.filters.colors.filter(c => c !== color);
      } else {
        appState.filters.colors.push(color);
      }
      renderColorFilters(appState.availableColors);
      fetchAndRenderProducts();
    });
  });
}

// Fetch products from server and render
async function fetchAndRenderProducts() {
  const gridContainer = document.getElementById('products-grid');
  const resultCountEl = document.getElementById('results-count-text');
  if (!gridContainer) return;

  const t = (key) => window.I18N ? window.I18N.t(key) : key;
  const isFr = window.I18N && window.I18N.currentLang === 'fr';

  gridContainer.innerHTML = `
    <div class="col-span-full py-16 flex flex-col items-center justify-center text-slate-400">
      <svg class="animate-spin h-8 w-8 text-cyan-500 mb-3" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-sm font-medium text-slate-500">Loading...</p>
    </div>
  `;

  const response = await API.getProducts({
    search: appState.filters.search,
    brands: appState.filters.brands,
    minPrice: appState.filters.minPrice,
    maxPrice: appState.filters.maxPrice,
    sizes: appState.filters.sizes,
    colors: appState.filters.colors,
    sort: appState.filters.sort,
    category: appState.filters.category
  });

  let products = [];
  if (response && response.success) {
    products = response.products;
  } else {
    products = [];
  }

  appState.products = products;

  const currentCatObj = appState.availableCategories.find(c => c.slug === appState.filters.category);
  const catLabel = currentCatObj 
    ? (isFr ? (currentCatObj.nameFr || currentCatObj.name) : currentCatObj.name)
    : (isFr ? 'Vêtements' : 'Clothes');

  if (resultCountEl) {
    resultCountEl.innerHTML = `<span class="font-bold text-slate-900">${products.length}</span> ${t('results_for')} <span class="text-cyan-600 font-bold lowercase">${catLabel}</span>`;
  }

  if (products.length === 0) {
    gridContainer.innerHTML = `
      <div class="col-span-full py-16 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
        <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
        <p class="text-base font-semibold text-slate-700">${t('no_results')}</p>
        <p class="text-sm text-slate-400 mt-1">${t('no_results_sub')}</p>
        <button onclick="resetAllFilters()" class="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-600 transition-colors shadow-sm">
          ${t('reset_all_filters')}
        </button>
      </div>
    `;
    return;
  }

  gridContainer.innerHTML = products.map(product => {
    const isWishlisted = appState.wishlist.includes(product.id);
    return `
      <div class="product-card group flex flex-col bg-white rounded-lg overflow-hidden transition-all">
        <!-- Image Container -->
        <div class="product-image-wrap rounded-xl overflow-hidden relative cursor-pointer" onclick="openProductDetail(${product.id})">
          ${product.is_new ? `
            <span class="badge-new-arrival absolute top-3 left-3 z-10 shadow-sm">
              ${t('new_arrival')}
            </span>
          ` : ''}
          
          <button 
            type="button" 
            onclick="event.stopPropagation(); toggleWishlist(${product.id})" 
            aria-label="Add to wishlist"
            class="wishlist-btn absolute bottom-3 right-3 z-10 ${isWishlisted ? 'active' : 'text-slate-400'}">
            <svg class="w-4 h-4" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>

          <img 
            src="${product.image_url}" 
            alt="${product.name}" 
            loading="lazy"
            class="w-full h-full object-contain object-center p-2.5 group-hover:scale-105 transition-transform duration-500" 
          />

          <!-- Quick Add Hover Overlay Button -->
          <div class="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hidden sm:block">
            <button 
              onclick="event.stopPropagation(); addToCart(${product.id})" 
              class="w-full bg-slate-900/90 backdrop-blur-sm text-white py-2 px-3 rounded-lg text-xs font-semibold hover:bg-cyan-600 transition-colors shadow-lg flex items-center justify-center gap-2">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              ${t('quick_add')}
            </button>
          </div>
        </div>

        <!-- Product Details -->
        <div class="pt-3 pb-1 flex flex-col flex-1">
          <p class="text-[11px] text-slate-400 font-medium tracking-wide uppercase">${product.brand || 'Uniqlo'}</p>
          <a href="/product?id=${product.id}" onclick="event.preventDefault(); openProductDetail(${product.id})" class="text-sm font-semibold text-slate-900 line-clamp-1 mt-0.5 hover:text-cyan-600 transition-colors cursor-pointer">
            ${product.name}
          </a>

          <div class="mt-2 flex items-center justify-between">
            <div class="text-sm font-bold text-cyan-600">
              ${parseFloat(product.price).toLocaleString()} RWF
            </div>
            ${product.stock ? `
              <span class="text-[11px] font-semibold text-red-500/90 tracking-tight">
                ${product.stock} ${t('items_left')}
              </span>
            ` : ''}
          </div>

          <!-- Mobile Add button -->
          <button 
            onclick="event.stopPropagation(); addToCart(${product.id})" 
            class="sm:hidden mt-2.5 w-full py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 hover:bg-cyan-50 hover:border-cyan-500 hover:text-cyan-600 transition-colors">
            ${t('add_to_cart')}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openProductDetail(productId) {
  const prod = appState.products.find(p => p.id === productId);
  if (prod) {
    try {
      sessionStorage.setItem('maicon_active_product', JSON.stringify(prod));
    } catch (e) {}
  }
  window.location.href = `/product?id=${productId}`;
}

// Setup Price Dual Range Slider & Histogram
function setupPriceSlider() {
  const minSlider = document.getElementById('price-slider-min');
  const maxSlider = document.getElementById('price-slider-max');
  const minInput = document.getElementById('price-input-min');
  const maxInput = document.getElementById('price-input-max');
  const track = document.getElementById('slider-progress-bar');
  const histogramBars = document.querySelectorAll('.histogram-bar');

  if (!minSlider || !maxSlider) return;

  const minLimit = 0;
  const maxLimit = 5000000;

  function updateSlider() {
    let minVal = parseFloat(minSlider.value);
    let maxVal = parseFloat(maxSlider.value);

    if (minVal > maxVal) {
      const tmp = minVal;
      minVal = maxVal;
      maxVal = tmp;
    }

    if (minInput) minInput.value = minVal.toLocaleString();
    if (maxInput) maxInput.value = maxVal.toLocaleString();

    if (track) {
      const minPercent = ((minVal - minLimit) / (maxLimit - minLimit)) * 100;
      const maxPercent = ((maxVal - minLimit) / (maxLimit - minLimit)) * 100;
      track.style.left = `${minPercent}%`;
      track.style.width = `${maxPercent - minPercent}%`;
    }

    histogramBars.forEach((bar) => {
      bar.classList.add('active');
    });

    appState.filters.minPrice = minVal;
    appState.filters.maxPrice = maxVal;
  }

  minSlider.addEventListener('input', updateSlider);
  maxSlider.addEventListener('input', updateSlider);
  minSlider.addEventListener('change', () => fetchAndRenderProducts());
  maxSlider.addEventListener('change', () => fetchAndRenderProducts());

  if (minInput) {
    minInput.addEventListener('change', () => {
      const val = parseFloat(minInput.value.replace(/,/g, '')) || minLimit;
      minSlider.value = Math.max(minLimit, Math.min(val, parseFloat(maxSlider.value)));
      updateSlider();
      fetchAndRenderProducts();
    });
  }

  if (maxInput) {
    maxInput.addEventListener('change', () => {
      const val = parseFloat(maxInput.value.replace(/,/g, '')) || maxLimit;
      maxSlider.value = Math.min(maxLimit, Math.max(val, parseFloat(minSlider.value)));
      updateSlider();
      fetchAndRenderProducts();
    });
  }

  updateSlider();
}

// Wishlist Logic
function toggleWishlist(productId) {
  const index = appState.wishlist.indexOf(productId);
  if (index > -1) {
    appState.wishlist.splice(index, 1);
    showToast(window.I18N && window.I18N.currentLang === 'fr' ? 'Retiré de la liste de souhaits' : 'Removed from wishlist');
  } else {
    appState.wishlist.push(productId);
    showToast(window.I18N && window.I18N.currentLang === 'fr' ? 'Ajouté à votre liste de souhaits ! ❤️' : 'Saved to your wishlist! ❤️');
  }

  localStorage.setItem('maicon_wishlist', JSON.stringify(appState.wishlist));
  updateWishlistBadge();
  fetchAndRenderProducts();
}

function updateWishlistBadge() {
  const count = appState.wishlist.length;
  document.querySelectorAll('.wishlist-count-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

// Cart Logic
function addToCart(productId) {
  const product = appState.products.find(p => p.id === productId);
  if (!product) return;

  const existing = appState.cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    appState.cart.push({
      id: product.id,
      name: product.name,
      brand: product.brand || 'Uniqlo',
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
      size: 'M',
      color: 'Default'
    });
  }

  localStorage.setItem('maicon_cart', JSON.stringify(appState.cart));
  updateCartBadge();
  renderCartDrawer();
  const addedMsg = window.I18N ? window.I18N.t('cart_added') : 'Added to cart!';
  showToast(`${product.name}: ${addedMsg} 🛍️`);
}

function updateCartBadge() {
  const totalItems = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count-badge').forEach(el => {
    el.textContent = totalItems;
    el.style.display = totalItems > 0 ? 'flex' : 'none';
  });
}

function updateCartItemQty(productId, change) {
  const item = appState.cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    appState.cart = appState.cart.filter(i => i.id !== productId);
  }

  localStorage.setItem('maicon_cart', JSON.stringify(appState.cart));
  updateCartBadge();
  renderCartDrawer();
}

function removeCartItem(productId) {
  appState.cart = appState.cart.filter(i => i.id !== productId);
  localStorage.setItem('maicon_cart', JSON.stringify(appState.cart));
  updateCartBadge();
  renderCartDrawer();
  showToast(window.I18N ? window.I18N.t('item_removed') : 'Item removed from cart');
}

function renderCartDrawer() {
  const listEl = document.getElementById('cart-items-list');
  const subtotalEl = document.getElementById('cart-subtotal-price');
  const totalEl = document.getElementById('cart-total-price');
  if (!listEl) return;

  const t = (key) => window.I18N ? window.I18N.t(key) : key;

  if (appState.cart.length === 0) {
    listEl.innerHTML = `
      <div class="py-12 text-center text-slate-400">
        <svg class="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
        </svg>
        <p class="font-medium text-slate-600">${t('empty_cart')}</p>
        <p class="text-xs text-slate-400 mt-1">${t('empty_cart_sub')}</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '0 RWF';
    if (totalEl) totalEl.textContent = '0 RWF';
    return;
  }

  const subtotal = appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (subtotalEl) subtotalEl.textContent = `${subtotal.toLocaleString()} RWF`;
  if (totalEl) totalEl.textContent = `${subtotal.toLocaleString()} RWF`;

  listEl.innerHTML = appState.cart.map(item => `
    <div class="flex items-center gap-3 py-3 border-b border-slate-100">
      <img src="${item.image_url}" alt="${item.name}" class="w-16 h-20 object-contain p-1 rounded-lg bg-slate-100 flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <h4 class="text-xs font-semibold text-slate-900 truncate">${item.name}</h4>
        <p class="text-[11px] text-slate-400 mt-0.5">${item.brand} · ${t('size')}: ${item.size}</p>
        <p class="text-xs font-bold text-cyan-600 mt-1">${(item.price * item.quantity).toLocaleString()} RWF</p>
        
        <div class="flex items-center gap-2 mt-2">
          <div class="flex items-center border border-slate-200 rounded-md">
            <button onclick="updateCartItemQty(${item.id}, -1)" class="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 text-xs font-bold">−</button>
            <span class="px-2 text-xs font-semibold text-slate-800">${item.quantity}</span>
            <button onclick="updateCartItemQty(${item.id}, 1)" class="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 text-xs font-bold">+</button>
          </div>
          <button onclick="removeCartItem(${item.id})" class="text-[11px] text-red-500 hover:text-red-700 font-medium ml-auto">
            ${t('remove')}
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Drawer Toggles
function toggleCartDrawer(open = true) {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (!drawer || !backdrop) return;

  if (open) {
    renderCartDrawer();
    backdrop.classList.remove('hidden');
    drawer.classList.remove('translate-x-full');
  } else {
    drawer.classList.add('translate-x-full');
    backdrop.classList.add('hidden');
  }
}

function toggleMobileFilterDrawer(open = true) {
  const drawer = document.getElementById('mobile-filter-drawer');
  const backdrop = document.getElementById('mobile-filter-backdrop');
  if (!drawer || !backdrop) return;

  if (open) {
    backdrop.classList.remove('hidden');
    drawer.classList.remove('translate-x-full');
  } else {
    drawer.classList.add('translate-x-full');
    backdrop.classList.add('hidden');
  }
}

// Reset All Filters
function resetAllFilters() {
  appState.filters.search = '';
  appState.filters.brands = [];
  appState.filters.minPrice = 0;
  appState.filters.maxPrice = 5000000;
  appState.filters.sizes = [];
  appState.filters.colors = [];
  appState.filters.sort = 'popular';
  appState.filters.category = 'all';

  const searchInput = document.getElementById('global-search-input');
  const brandSearchInput = document.getElementById('brand-search-input');
  if (searchInput) searchInput.value = '';
  if (brandSearchInput) brandSearchInput.value = '';

  const breadcrumb = document.getElementById('breadcrumb-category');
  if (breadcrumb) {
    breadcrumb.textContent = window.I18N && window.I18N.currentLang === 'fr' ? 'Toutes Catégories' : 'All';
  }

  setupPriceSlider();
  renderCategoryPills();
  renderCategorySidebar();
  renderBrandFilters(appState.availableBrands);
  renderSizeFilters(appState.availableSizes);
  renderColorFilters(appState.availableColors);
  fetchAndRenderProducts();
  showToast(window.I18N && window.I18N.currentLang === 'fr' ? 'Filtres réinitialisés' : 'Filters cleared');
}

// Setup Event Listeners
function setupEventListeners() {
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        appState.filters.search = e.target.value.trim();
        fetchAndRenderProducts();
      }, 300);
    });
  }

  const brandSearchInput = document.getElementById('brand-search-input');
  if (brandSearchInput) {
    brandSearchInput.addEventListener('input', (e) => {
      renderBrandFilters(appState.availableBrands, e.target.value);
    });
  }

  const sortSelect = document.getElementById('sort-by-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      appState.filters.sort = e.target.value;
      fetchAndRenderProducts();
    });
  }

  const gridBtn3 = document.getElementById('grid-view-3');
  const gridBtn4 = document.getElementById('grid-view-4');
  const productsGrid = document.getElementById('products-grid');

  if (gridBtn3 && gridBtn4 && productsGrid) {
    gridBtn3.addEventListener('click', () => {
      gridBtn3.classList.add('text-cyan-600', 'bg-cyan-50');
      gridBtn4.classList.remove('text-cyan-600', 'bg-cyan-50');
      productsGrid.classList.remove('grid-cols-4');
      productsGrid.classList.add('grid-cols-2', 'md:grid-cols-3');
    });

    gridBtn4.addEventListener('click', () => {
      gridBtn4.classList.add('text-cyan-600', 'bg-cyan-50');
      gridBtn3.classList.remove('text-cyan-600', 'bg-cyan-50');
      productsGrid.classList.remove('md:grid-cols-3');
      productsGrid.classList.add('grid-cols-2', 'md:grid-cols-4');
    });
  }

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
      if (appState.cart.length === 0) {
        showToast(window.I18N && window.I18N.currentLang === 'fr' ? 'Votre panier est vide !' : 'Your cart is empty!');
        return;
      }
      const totalAmount = appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const res = await API.checkout({
        customerName: 'Guest Customer',
        customerEmail: 'customer@maicon.com',
        shippingAddress: 'KG 9 Ave, Kigali, Rwanda',
        items: appState.cart,
        totalAmount
      });

      if (res.success) {
        appState.cart = [];
        localStorage.removeItem('maicon_cart');
        updateCartBadge();
        toggleCartDrawer(false);
        showToast(window.I18N && window.I18N.currentLang === 'fr' ? `🎉 Commande validée : #${res.order?.orderNumber || 'MAI-89211'}` : `🎉 Order Placed: #${res.order?.orderNumber || 'MAI-89211'}`);
      } else {
        showToast('Checkout simulated successfully! Thank you!');
      }
    });
  }
}

// Toast notification helper
function showToast(message) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 pointer-events-auto';
  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ========================================================
// USER AUTH & HEADER PROFILE WIDGET
// ========================================================
function renderHeaderAuth() {
  const container = document.getElementById('header-auth-container');
  if (!container) return;

  const userJson = localStorage.getItem('maicon_user');
  let user = null;
  try {
    if (userJson) user = JSON.parse(userJson);
  } catch (e) {
    user = null;
  }

  // IF USER IS LOGGED IN -> Show Profile & Role Dashboard Button
  if (user && user.name) {
    let dashboardUrl = '/account';
    let dashboardLabel = '👤 My Account & Orders';
    let dashboardIcon = 'package';
    let roleBadgeClass = 'bg-blue-50 text-blue-700 border border-blue-200';
    let roleShortBadge = 'Buyer';
    let roleFullName = 'Verified Shopper 🇷🇼';

    if (user.role === 'admin') {
      dashboardUrl = '/admin';
      dashboardLabel = '👑 Admin Operations Portal';
      dashboardIcon = 'layout-dashboard';
      roleBadgeClass = 'bg-purple-50 text-purple-700 border border-purple-200';
      roleShortBadge = 'Admin';
      roleFullName = 'SuperAdmin (Rwanda)';
    } else if (user.role === 'seller') {
      dashboardUrl = '/seller';
      dashboardLabel = '🏪 Merchant Seller Hub';
      dashboardIcon = 'store';
      roleBadgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      roleShortBadge = 'Seller';
      roleFullName = user.storeName ? user.storeName : 'Verified Merchant';
    }

    const firstName = user.name.split(' ')[0];

    container.innerHTML = `
      <div class="relative" id="user-profile-menu-wrapper">
        <button 
          type="button" 
          id="user-profile-btn"
          onclick="toggleUserProfileMenu(event)"
          class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 transition-all text-xs font-semibold shadow-sm group select-none">
          <img 
            src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" 
            alt="${user.name}" 
            class="w-6 h-6 rounded-full object-cover border border-slate-200" 
          />
          <span class="max-w-[90px] sm:max-w-[120px] truncate font-bold text-slate-900">${firstName}</span>
          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${roleBadgeClass} hidden sm:inline-block">${roleShortBadge}</span>
          <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform" id="user-profile-arrow"></i>
        </button>

        <!-- Dropdown Menu -->
        <div 
          id="user-profile-dropdown" 
          class="hidden absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 divide-y divide-slate-100">
          
          <div class="p-3">
            <div class="flex items-center gap-2.5">
              <img 
                src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" 
                alt="${user.name}" 
                class="w-9 h-9 rounded-xl object-cover border border-slate-200" 
              />
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-slate-900 truncate">${user.name}</p>
                <p class="text-[11px] text-slate-500 truncate">${user.email}</p>
              </div>
            </div>
            <div class="mt-2.5">
              <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${roleBadgeClass}">${roleFullName}</span>
            </div>
          </div>

          <div class="py-1.5 space-y-1">
            <a 
              href="${dashboardUrl}" 
              class="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-800 hover:text-cyan-700 hover:bg-cyan-50/60 rounded-xl transition-all">
              <i data-lucide="${dashboardIcon}" class="w-4 h-4 text-cyan-600"></i>
              <span>${dashboardLabel}</span>
            </a>
          </div>

          <div class="pt-1.5">
            <button 
              type="button" 
              onclick="handleSignOut()" 
              class="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all">
              <i data-lucide="log-out" class="w-4 h-4 text-red-500"></i>
              <span>Sign Out / Logout</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons({ root: container });

  } else {
    // IF LOGGED OUT -> Show Clean Login Button
    const loginText = (window.I18N && window.I18N.t('login')) || 'Login';
    container.innerHTML = `
      <a 
        href="/login"
        class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-white bg-slate-900 hover:bg-slate-800 font-semibold rounded-xl shadow-sm transition-all border border-slate-700">
        <i data-lucide="user" class="w-3.5 h-3.5 text-cyan-400"></i>
        <span data-i18n="login">${loginText}</span>
      </a>
    `;
    if (window.lucide) lucide.createIcons({ root: container });
  }
}

function toggleUserProfileMenu(event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById('user-profile-dropdown');
  const arrow = document.getElementById('user-profile-arrow');
  if (!dropdown) return;

  const isHidden = dropdown.classList.contains('hidden');
  dropdown.classList.toggle('hidden', !isHidden);
  if (arrow) {
    arrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
  }
}

// Close user profile dropdown on click outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('user-profile-dropdown');
  const btn = document.getElementById('user-profile-btn');
  if (dropdown && !dropdown.classList.contains('hidden')) {
    if (btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
      const arrow = document.getElementById('user-profile-arrow');
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
  }
});

function handleSignOut() {
  localStorage.removeItem('maicon_user');
  renderHeaderAuth();
  showToast(window.I18N && window.I18N.currentLang === 'fr' ? 'Déconnexion réussie' : 'Signed out successfully');
}

