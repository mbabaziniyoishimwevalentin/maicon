// Admin Portal UI Logic & API Integration (with Full User Management CRUD)
let currentRoleFilter = 'all';
let currentSearchQuery = '';
let allLoadedUsers = [];

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  
  // Restore active tab from URL hash or localStorage
  const validTabs = ['overview', 'users', 'sellers', 'products', 'payouts'];
  const hashTab = window.location.hash.replace('#', '').toLowerCase();
  const savedTab = localStorage.getItem('maicon_admin_tab');
  const initialTab = validTabs.includes(hashTab) ? hashTab : (validTabs.includes(savedTab) ? savedTab : 'overview');
  
  switchAdminTab(initialTab);

  loadAdminStats();
  loadAdminUsers();
  loadAdminOrders();
  loadAdminSellers();
  loadAdminProducts();
  loadAdminPayouts();
});

function switchAdminTab(tabId) {
  const tabs = ['overview', 'users', 'sellers', 'products', 'payouts'];
  if (!tabs.includes(tabId)) tabId = 'overview';

  // Persist to localStorage and URL hash
  localStorage.setItem('maicon_admin_tab', tabId);
  try {
    history.replaceState(null, null, '#' + tabId);
  } catch (e) {}

  tabs.forEach(t => {
    const el = document.getElementById(`tab-${t}`);
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
        navEl.className = 'admin-nav-item w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 text-white shadow-sm transition-all';
        const icon = navEl.querySelector('i');
        if (icon) icon.className = 'w-4 h-4 text-cyan-400';
      } else {
        navEl.className = 'admin-nav-item w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all';
        const icon = navEl.querySelector('i');
        if (icon) icon.className = 'w-4 h-4 text-slate-400';
      }
    }
  });

  // Remove early style tags once standard DOM classes are hydrated
  const syncStyle = document.getElementById('sync-admin-active-style');
  if (syncStyle) syncStyle.remove();
  const baseStyle = document.getElementById('base-admin-tab-style');
  if (baseStyle) baseStyle.remove();
  const legacyStyle = document.getElementById('early-admin-tab-style');
  if (legacyStyle) legacyStyle.remove();

  const titles = {
    overview: 'Executive Overview',
    users: 'User Management & Seller Onboarding',
    sellers: 'Seller KYC & Approvals',
    products: 'Catalog & Product Moderation',
    payouts: 'Escrow & MoMo Payouts'
  };
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = titles[tabId] || 'Admin Portal';
}

async function loadAdminStats() {
  try {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    if (data.success && data.stats) {
      const s = data.stats;
      document.getElementById('kpi-gmv').textContent = `${s.totalGMV.toLocaleString()} RWF`;
      document.getElementById('kpi-commission').textContent = `${s.netCommission.toLocaleString()} RWF`;
      document.getElementById('kpi-sellers').textContent = `${s.totalSellers} Sellers`;
      document.getElementById('kpi-orders').textContent = `${s.totalOrders} Active Orders`;
      document.getElementById('badge-pending-sellers').textContent = s.pendingApprovals;
      document.getElementById('badge-pending-payouts').textContent = s.pendingPayouts;
      const totalUsersBadge = document.getElementById('badge-total-users');
      if (totalUsersBadge) totalUsersBadge.textContent = s.totalUsers || 6;
    }
  } catch (err) {
    console.error('Error loading admin stats', err);
  }
}

// ========================================================
// USER MANAGEMENT CRUD UI FUNCTIONS
// ========================================================

async function loadAdminUsers(role = currentRoleFilter, search = currentSearchQuery) {
  const tbody = document.getElementById('admin-users-table-body');
  if (!tbody) return;

  try {
    let url = `/api/admin/users?role=${role}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.success && data.users) {
      allLoadedUsers = data.users;
      const totalUsersBadge = document.getElementById('badge-total-users');
      if (totalUsersBadge) totalUsersBadge.textContent = data.users.length;

      if (data.users.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="py-8 text-center text-slate-400">
              No users found matching your criteria.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = data.users.map(u => {
        const roleBadges = {
          admin: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">👑 Admin</span>',
          seller: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">🏪 Seller / Merchant</span>',
          buyer: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">👤 Buyer</span>'
        };

        const statusBadges = {
          active: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>',
          suspended: '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">Suspended</span>'
        };

        return `
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="py-3.5 px-4 flex items-center gap-3">
              <img src="${u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" alt="${u.name}" class="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200" />
              <div>
                <span class="font-bold text-slate-900 block">${u.name}</span>
                <span class="text-[11px] text-slate-500">${u.email}</span>
              </div>
            </td>
            <td class="py-3.5 px-4">${roleBadges[u.role] || u.role}</td>
            <td class="py-3.5 px-4">
              ${u.storeName ? `
                <span class="font-bold text-slate-900 block">${u.storeName}</span>
                <span class="text-[10px] font-mono text-slate-500">${u.tin || 'No TIN'} · ${u.commissionRate || 8}% Comm.</span>
              ` : '<span class="text-slate-400">—</span>'}
            </td>
            <td class="py-3.5 px-4 font-mono text-slate-600">${u.phone || '—'}</td>
            <td class="py-3.5 px-4">${statusBadges[u.status] || u.status}</td>
            <td class="py-3.5 px-4 text-right space-x-1.5">
              <button 
                onclick="openEditUserModal(${u.id})" 
                title="Edit User"
                class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center justify-center">
                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              </button>
              
              <button 
                onclick="toggleUserStatus(${u.id}, '${u.status}')" 
                title="${u.status === 'active' ? 'Suspend Access' : 'Activate Access'}"
                class="p-1.5 rounded-lg ${u.status === 'active' ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'} transition-colors inline-flex items-center justify-center">
                <i data-lucide="${u.status === 'active' ? 'pause-circle' : 'play-circle'}" class="w-3.5 h-3.5"></i>
              </button>

              ${u.id !== 1 ? `
                <button 
                  onclick="deleteUser(${u.id}, '${u.name}')" 
                  title="Delete User"
                  class="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors inline-flex items-center justify-center">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              ` : ''}
            </td>
          </tr>
        `;
      }).join('');

      if (window.lucide) lucide.createIcons({ root: tbody });
    }
  } catch (err) {
    console.error('Error loading users', err);
  }
}

function filterUsersByRole(role) {
  currentRoleFilter = role;
  const roles = ['all', 'seller', 'buyer', 'admin'];
  roles.forEach(r => {
    const btn = document.getElementById(`user-role-${r}`);
    if (btn) {
      if (r === role) {
        btn.className = 'user-role-btn px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white shadow-sm transition-all';
      } else {
        btn.className = 'user-role-btn px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all';
      }
    }
  });

  loadAdminUsers(role, currentSearchQuery);
}

let searchTimeout = null;
function handleUserSearch(query) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentSearchQuery = query.trim();
    loadAdminUsers(currentRoleFilter, currentSearchQuery);
  }, 300);
}

function openCreateUserModal() {
  document.getElementById('user-modal-title').textContent = '+ Register New Seller / User';
  document.getElementById('modal-user-id').value = '';
  document.getElementById('modal-user-name').value = '';
  document.getElementById('modal-user-email').value = '';
  document.getElementById('modal-user-phone').value = '+250 788 000 000';
  document.getElementById('modal-user-role').value = 'seller';
  document.getElementById('modal-seller-store').value = '';
  document.getElementById('modal-seller-tin').value = '';
  document.getElementById('modal-seller-commission').value = '8';
  document.getElementById('modal-user-status').value = 'active';

  toggleModalSellerFields();
  document.getElementById('user-modal').classList.remove('hidden');
}

function openEditUserModal(userId) {
  const user = allLoadedUsers.find(u => u.id === userId);
  if (!user) return;

  document.getElementById('user-modal-title').textContent = `Edit User: ${user.name}`;
  document.getElementById('modal-user-id').value = user.id;
  document.getElementById('modal-user-name').value = user.name;
  document.getElementById('modal-user-email').value = user.email;
  document.getElementById('modal-user-phone').value = user.phone || '';
  document.getElementById('modal-user-role').value = user.role;
  document.getElementById('modal-seller-store').value = user.storeName || '';
  document.getElementById('modal-seller-tin').value = user.tin || '';
  document.getElementById('modal-seller-category').value = user.category || 'Fashion & Downtown Style';
  document.getElementById('modal-seller-commission').value = user.commissionRate || '8';
  document.getElementById('modal-user-status').value = user.status || 'active';

  toggleModalSellerFields();
  document.getElementById('user-modal').classList.remove('hidden');
}

function closeUserModal() {
  document.getElementById('user-modal').classList.add('hidden');
}

function toggleModalSellerFields() {
  const role = document.getElementById('modal-user-role').value;
  const section = document.getElementById('modal-seller-section');
  if (section) {
    section.classList.toggle('hidden', role !== 'seller');
  }
}

async function handleSaveUser(e) {
  e.preventDefault();
  const userId = document.getElementById('modal-user-id').value;
  const name = document.getElementById('modal-user-name').value;
  const email = document.getElementById('modal-user-email').value;
  const phone = document.getElementById('modal-user-phone').value;
  const role = document.getElementById('modal-user-role').value;
  const storeName = document.getElementById('modal-seller-store').value;
  const tin = document.getElementById('modal-seller-tin').value;
  const category = document.getElementById('modal-seller-category').value;
  const commissionRate = document.getElementById('modal-seller-commission').value;
  const status = document.getElementById('modal-user-status').value;

  const payload = {
    name,
    email,
    phone,
    role,
    status,
    storeName,
    tin,
    category,
    commissionRate
  };

  try {
    let res, data;
    if (userId) {
      // UPDATE (PUT)
      res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      // CREATE (POST)
      res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    data = await res.json();
    if (data.success) {
      closeUserModal();
      loadAdminUsers();
      loadAdminStats();
      alert(`🎉 ${data.message}`);
    } else {
      alert(`⚠️ ${data.message || 'Action failed'}`);
    }
  } catch (err) {
    console.error('Error saving user', err);
  }
}

async function deleteUser(userId, userName) {
  if (!confirm(`Are you sure you want to delete user "${userName}"? This cannot be undone.`)) {
    return;
  }

  try {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      loadAdminUsers();
      loadAdminStats();
      alert(`✓ ${data.message}`);
    } else {
      alert(`⚠️ ${data.message}`);
    }
  } catch (err) {
    console.error('Error deleting user', err);
  }
}

async function toggleUserStatus(userId, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
  try {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      loadAdminUsers();
    }
  } catch (err) {
    console.error('Error toggling user status', err);
  }
}

// ========================================================
// REMAINING ADMIN PORTAL MODULES
// ========================================================

async function loadAdminOrders() {
  const tbody = document.getElementById('admin-orders-table-body');
  if (!tbody) return;

  try {
    const res = await fetch('/api/seller/orders');
    const data = await res.json();
    if (data.success && data.orders) {
      tbody.innerHTML = data.orders.map(order => {
        const statusColors = {
          in_transit: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          processing: 'bg-amber-50 text-amber-700 border-amber-200'
        };
        const badgeClass = statusColors[order.status] || 'bg-slate-100 text-slate-700';

        return `
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="py-3.5 px-4 font-mono font-bold text-slate-900">${order.id}</td>
            <td class="py-3.5 px-4">
              <span class="font-bold text-slate-900 block">${order.customerName}</span>
              <span class="text-[11px] text-slate-500">${order.customerPhone}</span>
            </td>
            <td class="py-3.5 px-4 text-slate-600">${order.district}, ${order.city}</td>
            <td class="py-3.5 px-4 font-bold text-slate-900">${order.totalAmount.toLocaleString()} RWF</td>
            <td class="py-3.5 px-4">
              <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 border border-slate-200 text-slate-700">${order.paymentMethod}</span>
            </td>
            <td class="py-3.5 px-4">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badgeClass}">
                ${order.status.replace('_', ' ')}
              </span>
            </td>
          </tr>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('Error loading admin orders', err);
  }
}

async function loadAdminSellers() {
  const tbody = document.getElementById('admin-sellers-table-body');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/sellers');
    const data = await res.json();
    if (data.success && data.applications) {
      tbody.innerHTML = data.applications.map(app => `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="py-3.5 px-4 font-mono font-bold text-slate-500">${app.id}</td>
          <td class="py-3.5 px-4">
            <span class="font-bold text-slate-900 block">${app.storeName}</span>
            <span class="text-[11px] text-slate-500">Applicant: ${app.applicantName}</span>
          </td>
          <td class="py-3.5 px-4 text-slate-600">${app.category}</td>
          <td class="py-3.5 px-4 font-mono text-slate-700">${app.tin}</td>
          <td class="py-3.5 px-4 text-slate-600">${app.phone}</td>
          <td class="py-3.5 px-4">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              app.status === 'approved' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }">
              ${app.status}
            </span>
          </td>
          <td class="py-3.5 px-4 text-right space-x-2">
            ${app.status === 'pending' ? `
              <button onclick="updateSellerStatus('${app.id}', 'approved')" class="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors">
                Approve
              </button>
              <button onclick="updateSellerStatus('${app.id}', 'rejected')" class="px-2.5 py-1 bg-white hover:bg-red-50 text-red-600 font-bold rounded-lg text-xs border border-red-200 transition-colors">
                Reject
              </button>
            ` : `
              <span class="text-xs text-emerald-600 font-bold">Verified ✓</span>
            `}
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading sellers', err);
  }
}

async function updateSellerStatus(id, status) {
  try {
    const res = await fetch(`/api/admin/sellers/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      loadAdminSellers();
      loadAdminStats();
    }
  } catch (err) {
    console.error('Error updating seller status', err);
  }
}

async function loadAdminProducts() {
  const tbody = document.getElementById('admin-products-table-body');
  if (!tbody) return;

  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success && data.products) {
      document.getElementById('product-count-badge').textContent = `${data.products.length} Active Products`;
      tbody.innerHTML = data.products.map(p => `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="py-3.5 px-4 flex items-center gap-3">
            <img src="${p.image_url}" alt="${p.name}" class="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200" />
            <div>
              <span class="font-bold text-slate-900 block truncate max-w-xs">${p.name}</span>
              <span class="text-[10px] text-slate-400">ID: #${p.id}</span>
            </div>
          </td>
          <td class="py-3.5 px-4 text-slate-600">${p.category}</td>
          <td class="py-3.5 px-4 text-slate-800 font-semibold">${p.brand}</td>
          <td class="py-3.5 px-4 font-bold text-slate-900">${p.price.toLocaleString()} RWF</td>
          <td class="py-3.5 px-4 text-slate-600">${p.stock || 10} units</td>
          <td class="py-3.5 px-4 text-right">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Approved & Live
            </span>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading admin products', err);
  }
}

async function loadAdminPayouts() {
  const tbody = document.getElementById('admin-payouts-table-body');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/payouts');
    const data = await res.json();
    if (data.success && data.payouts) {
      tbody.innerHTML = data.payouts.map(p => `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="py-3.5 px-4 font-mono font-bold text-slate-500">${p.id}</td>
          <td class="py-3.5 px-4 font-bold text-slate-900">${p.sellerName}</td>
          <td class="py-3.5 px-4 font-black text-slate-900">${p.amount.toLocaleString()} RWF</td>
          <td class="py-3.5 px-4 text-slate-700">${p.method}</td>
          <td class="py-3.5 px-4 font-mono text-slate-600">${p.accountNumber}</td>
          <td class="py-3.5 px-4">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              p.status === 'completed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }">
              ${p.status}
            </span>
          </td>
          <td class="py-3.5 px-4 text-right">
            ${p.status === 'pending' ? `
              <button onclick="releasePayout('${p.id}')" class="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 ml-auto shadow-sm">
                <i data-lucide="send" class="w-3.5 h-3.5 text-cyan-400"></i>
                <span>Release Funds</span>
              </button>
            ` : `
              <span class="text-xs text-emerald-600 font-bold">Disbursed ✓</span>
            `}
          </td>
        </tr>
      `).join('');
      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    console.error('Error loading payouts', err);
  }
}

async function releasePayout(id) {
  try {
    const res = await fetch(`/api/admin/payouts/${id}/release`, {
      method: 'PATCH'
    });
    const data = await res.json();
    if (data.success) {
      loadAdminPayouts();
      loadAdminStats();
    }
  } catch (err) {
    console.error('Error releasing payout', err);
  }
}

function refreshAdminData() {
  loadAdminStats();
  loadAdminUsers();
  loadAdminOrders();
  loadAdminSellers();
  loadAdminProducts();
  loadAdminPayouts();
}
