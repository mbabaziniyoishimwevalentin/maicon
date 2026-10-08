// Maicon Client API
const API = {
  baseUrl: '/api',

  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.brands && params.brands.length) query.append('brand', params.brands.join(','));
    if (params.minPrice) query.append('minPrice', params.minPrice);
    if (params.maxPrice) query.append('maxPrice', params.maxPrice);
    if (params.sizes && params.sizes.length) query.append('size', params.sizes.join(','));
    if (params.colors && params.colors.length) query.append('color', params.colors.join(','));
    if (params.sort) query.append('sort', params.sort);
    if (params.category) query.append('category', params.category);

    try {
      const res = await fetch(`${this.baseUrl}/products?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return await res.json();
    } catch (err) {
      console.warn('API error, using fallback client filtering:', err);
      return null;
    }
  },

  async getFilters() {
    try {
      const res = await fetch(`${this.baseUrl}/filters`);
      if (!res.ok) throw new Error('Failed to fetch filters');
      return await res.json();
    } catch (err) {
      console.warn('API error, using fallback filters:', err);
      return null;
    }
  },

  async getProductById(id) {
    try {
      const res = await fetch(`${this.baseUrl}/products/${id}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      return await res.json();
    } catch (err) {
      console.warn('API error fetching product:', err);
      return null;
    }
  },

  async checkout(orderData) {
    try {
      const res = await fetch(`${this.baseUrl}/cart/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      return await res.json();
    } catch (err) {
      console.error('Checkout failed:', err);
      return { success: false, message: 'Checkout connection failed.' };
    }
  }
};
