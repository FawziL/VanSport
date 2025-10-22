import { http } from '@/config/api';

export const authService = {
  login: (email, password) => http.post('/auth/login/', { email, password }),
  register: (payload) => http.post('/auth/register/', payload),
  me: () => http.get('/auth/me/'),
  passwordReset: (email) => http.post('/auth/password-reset/', { email }),
};

export const appService = {
  categorias: {
    list: (params) => http.get(`/api/categorias/${qs(params)}`),
    retrieve: (id) => http.get(`/api/categorias/${encodeURIComponent(id)}/`),
  },
  productos: {
    list: (params) => http.get(`/api/productos/${qs(params)}`),
    retrieve: (id) => http.get(`/api/productos/${encodeURIComponent(id)}/`),
  },
  usuarios: {
    list: (params) => http.get(`/api/usuarios/${qs(params)}`),
    retrieve: (id) => http.get(`/api/usuarios/${encodeURIComponent(id)}/`),
  },
  pedidos: {
    list: (params) => http.get(`/api/pedidos/${qs(params)}`),
    retrieve: (id) => http.get(`/api/pedidos/${encodeURIComponent(id)}/`),
    checkout: (data) => http.post('/api/pedidos/checkout/', data),
  },
  detallesPedido: {
    list: (params) => http.get(`/api/detalles-pedido/${qs(params)}`),
    retrieve: (id) => http.get(`/api/detalles-pedido/${encodeURIComponent(id)}/`),
  },
  carrito: {
    list: (params) => http.get(`/api/carrito/${qs(params)}`),
    retrieve: (id) => http.get(`/api/carrito/${encodeURIComponent(id)}/`),
    add: (data) => http.post('/api/carrito/add/', data),
    updateQuantity: (data) => http.post('/api/carrito/update-quantity/', data),
    remove: (data) => http.post('/api/carrito/remove/', data),
    clear: () => http.post('/api/carrito/clear/'),
  },
  reseñas: {
    list: (params) => http.get(`/api/resenas/${qs(params)}`),
    retrieve: (id) => http.get(`/api/resenas/${encodeURIComponent(id)}/`),
  },
  notificaciones: {
    list: (params) => http.get(`/api/notificaciones/${qs(params)}`),
    retrieve: (id) => http.get(`/api/notificaciones/${encodeURIComponent(id)}/`),
    latestBanner: () => http.get('/api/notificaciones/latest-banner/'),
  },
  transacciones: {
    list: (params) => http.get(`/api/transacciones/${qs(params)}`),
    retrieve: (id) => http.get(`/api/transacciones/${encodeURIComponent(id)}/`),
    pay: (data) => http.post('/api/transacciones/pay/', data),
  },
  envios: {
    list: (params) => http.get(`/api/envios/${qs(params)}`),
    retrieve: (id) => http.get(`/api/envios/${encodeURIComponent(id)}/`),
  },
  reportes: {
    list: () => http.get('/api/reportes-fallas/'),
    create: (formData) => http.post('/api/reportes-fallas/', formData),
    retrieve: (id) => http.get(`/api/reportes-fallas/${id}/`),
    addFollowUp: (id, formData) => http.post(`/api/reportes-fallas/${id}/followups/`, formData),
  },
};

// ADMIN (/admin/...)
export const adminService = {
  categorias: {
    list: (params) => http.get(`/admin/categorias/${qs(params)}`),
    retrieve: (id) => http.get(`/admin/categorias/${encodeURIComponent(id)}/`),
    create: (data) => http.post('/admin/categorias/', data),
    update: (id, data) => http.put(`/admin/categorias/${encodeURIComponent(id)}/`, data),
    partialUpdate: (id, data) => http.patch(`/admin/categorias/${encodeURIComponent(id)}/`, data),
    remove: (id) => http.delete(`/admin/categorias/${encodeURIComponent(id)}/`),
  },
  productos: {
    list: (params) => http.get(`/admin/productos/${qs(params)}`),
    retrieve: (id) => http.get(`/admin/productos/${encodeURIComponent(id)}/`),
    create: (data) => http.post('/admin/productos/', data),
    update: (id, data) => http.put(`/admin/productos/${encodeURIComponent(id)}/`, data),
    partialUpdate: (id, data) => http.patch(`/admin/productos/${encodeURIComponent(id)}/`, data),
    remove: (id) => http.delete(`/admin/productos/${encodeURIComponent(id)}/`),
  },
  usuarios: {
    list: (params) => http.get(`/admin/usuarios/${qs(params)}`),
    retrieve: (id) => http.get(`/admin/usuarios/${encodeURIComponent(id)}/`),
    create: (data) => http.post('/admin/usuarios/', data),
    update: (id, data) => http.put(`/admin/usuarios/${encodeURIComponent(id)}/`, data),
    partialUpdate: (id, data) => http.patch(`/admin/usuarios/${encodeURIComponent(id)}/`, data),
    remove: (id) => http.delete(`/admin/usuarios/${encodeURIComponent(id)}/`),
  },
  pedidos: {
    list: (params) => http.get(`/admin/pedidos/${qs(params)}`),
    retrieve: (id) => http.get(`/admin/pedidos/${encodeURIComponent(id)}/`),
    create: (data) => http.post('/admin/pedidos/', data),
    update: (id, data) => http.put(`/admin/pedidos/${encodeURIComponent(id)}/`, data),
    partialUpdate: (id, data) => http.patch(`/admin/pedidos/${encodeURIComponent(id)}/`, data),
    remove: (id) => http.delete(`/admin/pedidos/${encodeURIComponent(id)}/`),
  },
  detallesPedido: {
    list: (params) => http.get(`/admin/detalles-pedido/${qs(params)}`),
    retrieve: (id) => http.get(`/admin/detalles-pedido/${encodeURIComponent(id)}/`),
    create: (data) => http.post('/admin/detalles-pedido/', data),
    update: (id, data) => http.put(`/admin/detalles-pedido/${encodeURIComponent(id)}/`, data),
    partialUpdate: (id, data) =>
      http.patch(`/admin/detalles-pedido/${encodeURIComponent(id)}/`, data),
    remove: (id) => http.delete(`/admin/detalles-pedido/${encodeURIComponent(id)}/`),
  },
  carrito: {
    list: (params) => http.get(`/admin/carrito/${qs(params)}`),
    retrieve: (id) => http.get(`/admin/carrito/${encodeURIComponent(id)}/`),
    create: (data) => http.post('/admin/carrito/', data),
    update: (id, data) => http.put(`/admin/carrito/${encodeURIComponent(id)}/`, data),
    partialUpdate: (id, data) => http.patch(`/admin/carrito/${encodeURIComponent(id)}/`, data),
    remove: (id) => http.delete(`/admin/carrito/${encodeURIComponent(id)}/`),
  },
  reseñas: {
    list: (params) => http.get(`/admin/resenas/${qs(params)}`),
    retrieve: (id) => http.get(`/admin/resenas/${encodeURIComponent(id)}/`),
    create: (data) => http.post('/admin/resenas/', data),
    update: (id, data) => http.put(`/admin/resenas/${encodeURIComponent(id)}/`, data),
    partialUpdate: (id, data) => http.patch(`/admin/resenas/${encodeURIComponent(id)}/`, data),
    remove: (id) => http.delete(`/admin/resenas/${encodeURIComponent(id)}/`),
  },
  notificaciones: {
    list: (params) => http.get(`/admin/notificaciones/${qs(params)}`),
    retrieve: (id) => http.get(`/admin/notificaciones/${encodeURIComponent(id)}/`),
    create: (data) => http.post('/admin/notificaciones/', data),
    update: (id, data) => http.put(`/admin/notificaciones/${encodeURIComponent(id)}/`, data),
    partialUpdate: (id, data) =>
      http.patch(`/admin/notificaciones/${encodeURIComponent(id)}/`, data),
    remove: (id) => http.delete(`/admin/notificaciones/${encodeURIComponent(id)}/`),
  },
  transacciones: {
    list: (params) => http.get(`/admin/transacciones/${qs(params)}`),
    retrieve: (id) => http.get(`/admin/transacciones/${encodeURIComponent(id)}/`),
    create: (data) => http.post('/admin/transacciones/', data),
    update: (id, data) => http.put(`/admin/transacciones/${encodeURIComponent(id)}/`, data),
    partialUpdate: (id, data) =>
      http.patch(`/admin/transacciones/${encodeURIComponent(id)}/`, data),
    remove: (id) => http.delete(`/admin/transacciones/${encodeURIComponent(id)}/`),
  },
  envios: {
    list: (params) => http.get(`/admin/envios/${qs(params)}`),
    retrieve: (id) => http.get(`/admin/envios/${encodeURIComponent(id)}/`),
    create: (data) => http.post('/admin/envios/', data),
    update: (id, data) => http.put(`/admin/envios/${encodeURIComponent(id)}/`, data),
    partialUpdate: (id, data) => http.patch(`/admin/envios/${encodeURIComponent(id)}/`, data),
    remove: (id) => http.delete(`/admin/envios/${encodeURIComponent(id)}/`),
  },
  reportes: {
    list: (params) => http.get('/admin/reportes-fallas/', { params }),
    retrieve: (id) => http.get(`/admin/reportes-fallas/${id}/`),
    patch: (id, data) => http.patch(`/admin/reportes-fallas/${id}/`, data),
    addFollowUp: (id, formData) => http.post(`/admin/reportes-fallas/${id}/followups/`, formData),
  },
};

function qs(params) {
  if (!params) return '';
  const entries = Object.entries(params).filter(
    ([_, v]) => v !== undefined && v !== null && v !== ''
  );
  if (entries.length === 0) return '';
  const usp = new URLSearchParams();
  for (const [k, v] of entries) usp.append(k, String(v));
  return `?${usp.toString()}`;
}
