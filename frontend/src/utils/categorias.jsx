export const CATEGORIAS_FALLA = [
  { value: 'ui', label: 'Interfaz (UI)' },
  { value: 'backend', label: 'Backend' },
  { value: 'rendimiento', label: 'Rendimiento' },
  { value: 'seguridad', label: 'Seguridad' },
  { value: 'pago', label: 'Pagos' },
  { value: 'envios', label: 'Envíos' },
  { value: 'productos', label: 'Productos' },
  { value: 'cuenta', label: 'Cuenta' },
  { value: 'notificaciones', label: 'Notificaciones' },
  { value: 'otros', label: 'Otros' },
];

// Nuevas categorías para reportes internos de admin
export const CATEGORIAS_ADMIN = [
  { value: 'seguridad', label: '🔒 Seguridad', severidad: 'alta' },
  { value: 'rendimiento', label: '⚡ Rendimiento', severidad: 'media' },
  { value: 'inventario', label: '📦 Inventario', severidad: 'alta' },
  { value: 'ventas', label: '💰 Ventas', severidad: 'alta' },
  { value: 'usuarios', label: '👥 Usuarios', severidad: 'media' },
  { value: 'logistica', label: '🚚 Logística', severidad: 'media' },
  { value: 'sistema', label: '🖥️ Sistema', severidad: 'alta' },
  { value: 'proveedores', label: '🏢 Proveedores', severidad: 'baja' },
];