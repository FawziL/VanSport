import { http } from '@/config/api';

// --- Auth (BetterAuth + NestJS) ---
export const authService = {
  signIn: (email, password) => http.post('/api/auth/sign-in/email', { email, password, rememberMe: true }),
  signUp: (data) => http.post('/api/auth/sign-up/email', data),
  signOut: () => http.post('/api/auth/sign-out'),
  me: () => http.get('/api/auth/get-session'),
  updateProfile: (data) => http.post('/api/auth/update-user', data),
};

// --- Public & Authenticated API ---
export const appService = {
  categories: {
    list: (params) => http.get('/categories', { params }),
    retrieve: (id) => http.get(`/categories/${id}`),
    create: (data) => http.post('/categories', data),
    update: (id, data) => http.put(`/categories/${id}`, data),
    partialUpdate: (id, data) => http.patch(`/categories/${id}`, data),
    remove: (id) => http.delete(`/categories/${id}`),
  },
  products: {
    list: (params) => http.get('/products', { params }),
    listAdmin: (params) => http.get('/products/admin', { params }),
    retrieve: (id) => http.get(`/products/${id}`),
    create: (data) => http.post('/products', data),
    update: (id, data) => http.put(`/products/${id}`, data),
    partialUpdate: (id, data) => http.patch(`/products/${id}`, data),
    remove: (id) => http.delete(`/products/${id}`),
  },
  orders: {
    list: (params) => http.get('/orders', { params }),
    retrieve: (id) => http.get(`/orders/${id}`),
    checkout: (data) => http.post('/orders/checkout', data),
  },
  orderItems: {
    list: (params) => http.get('/order-items', { params }),
    retrieve: (id) => http.get(`/order-items/${id}`),
    remove: (id) => http.delete(`/order-items/${id}`),
  },
  cart: {
    list: (params) => http.get('/cart', { params }),
    add: (data) => http.post('/cart/add', data),
    updateQuantity: (data) => http.post('/cart/update-quantity', data),
    remove: (data) => http.post('/cart/remove', data),
    clear: () => http.post('/cart/clear'),
  },
  reviews: {
    list: (params) => http.get('/reviews', { params }),
    retrieve: (id) => http.get(`/reviews/${id}`),
    create: (data) => http.post('/reviews', data),
  },
  notifications: {
    list: (params) => http.get('/notifications', { params }),
    retrieve: (id) => http.get(`/notifications/${id}`),
    latestBanner: () => http.get('/notifications/latest-banner'),
    create: (data) => http.post('/notifications', data),
    update: (id, data) => http.put(`/notifications/${id}`, data),
    partialUpdate: (id, data) => http.patch(`/notifications/${id}`, data),
    remove: (id) => http.delete(`/notifications/${id}`),
    markRead: (id) => http.post(`/notifications/${id}/mark-read`),
  },
  transactions: {
    list: (params) => http.get('/transactions', { params }),
    retrieve: (id) => http.get(`/transactions/${id}`),
    create: (data) => http.post('/transactions', data),
    pay: (data) => http.post('/transactions/pay', data),
    update: (id, data) => http.put(`/transactions/${id}`, data),
    partialUpdate: (id, data) => http.patch(`/transactions/${id}`, data),
    remove: (id) => http.delete(`/transactions/${id}`),
  },
  shipments: {
    list: (params) => http.get('/shipments', { params }),
    retrieve: (id) => http.get(`/shipments/${id}`),
    create: (data) => http.post('/shipments', data),
  },
  bugReports: {
    list: () => http.get('/bug-reports'),
    create: (formData) => http.post('/bug-reports', formData),
    retrieve: (id) => http.get(`/bug-reports/${id}`),
    update: (id, data) => http.put(`/bug-reports/${id}`, data),
    partialUpdate: (id, data) => http.patch(`/bug-reports/${id}`, data),
    remove: (id) => http.delete(`/bug-reports/${id}`),
    addFollowUp: (id, formData) => http.post(`/bug-reports/${id}/followups`, formData),
    findFollowups: (id) => http.get(`/bug-reports/${id}/followups`),
  },
  paymentMethods: {
    listPublic: () => http.get('/payment-methods'),
  },
  exchangeRate: {
    dolarBcv: () => http.get('/exchange-rate/dolar-bcv'),
    dolarBcvHoy: () => http.get('/exchange-rate/dolar-bcv'),
  },
  users: {
    list: (params) => http.get('/users', { params }),
    retrieve: (id) => http.get(`/users/${id}`),
    update: (id, data) => http.put(`/users/${id}`, data),
    partialUpdate: (id, data) => http.patch(`/users/${id}`, data),
    remove: (id) => http.delete(`/users/${id}`),
  },
  paymentMethodsAdmin: {
    list: (params) => http.get('/payment-methods', { params }),
    retrieve: (id) => http.get(`/payment-methods/${id}`),
    create: (data) => http.post('/payment-methods', data),
    update: (id, data) => http.put(`/payment-methods/${id}`, data),
    partialUpdate: (id, data) => http.patch(`/payment-methods/${id}`, data),
    remove: (id) => http.delete(`/payment-methods/${id}`),
  },
};

// Re-export appService as adminService for backward compat in pages
// Admin pages use the same endpoints (auth guards on backend)
export const adminService = appService;

export default authService;
