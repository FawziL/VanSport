import { NavLink, Link } from 'react-router-dom';
import {
  FaThLarge,
  FaTags,
  FaBoxOpen,
  FaClipboardList,
  FaUsers,
  FaChartBar,
  FaStar,
  FaTruck,
  FaBell,
  FaChevronLeft,
  FaChevronRight,
  FaStore,
} from 'react-icons/fa';

const sections = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <FaThLarge /> },
  { to: '/admin/categorias', label: 'Categorias', icon: <FaTags /> },
  { to: '/admin/productos', label: 'Productos', icon: <FaBoxOpen /> },
  { to: '/admin/pedidos', label: 'Pedidos', icon: <FaClipboardList /> },
  { to: '/admin/usuarios', label: 'Usuarios', icon: <FaUsers /> },
  { to: '/admin/ventas', label: 'Ventas', icon: <FaChartBar /> },
  { to: '/admin/resenas', label: 'Reseñas', icon: <FaStar /> },
  { to: '/admin/envios', label: 'Envíos', icon: <FaTruck /> },
  { to: '/admin/notificaciones', label: 'Notificaciones', icon: <FaBell /> },
];

const linkStyle = (isActive, collapsed) => ({
  display: 'flex',
  alignItems: 'center',
  gap: collapsed ? 0 : 12,
  justifyContent: collapsed ? 'center' : 'flex-start',
  padding: '0.6rem 0.8rem',
  borderRadius: 8,
  color: isActive ? '#fff' : '#e0e0e0',
  textDecoration: 'none',
  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
  transition: 'background 0.2s, color 0.2s, gap .5s',
  fontWeight: 600,
  fontSize: 17,
});

export default function AdminSidebar({ collapsed, onToggle }) {
  const sidebarWidth = collapsed ? 70 : 220;

  return (
    <aside
      style={{
        background: '#121212',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        padding: '1rem 0.5rem',
        minHeight: '100%',
        width: sidebarWidth,
        transition: 'width .5s',
        position: 'relative',
        overflow: 'hidden',
        flex: '0 0 auto',
      }}
    >
      {/* Botón de colapsar/expandir */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          top: 18,
          right: collapsed ? -18 : -22,
          zIndex: 2,
          background: '#222',
          border: '1px solid #444',
          borderRadius: '50%',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          transition: 'right .5s',
        }}
        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      <div
        style={{
          color: '#fff',
          fontWeight: 800,
          fontSize: 18,
          marginBottom: 18,
          textAlign: collapsed ? 'center' : 'left',
          transition: 'all .5s',
          whiteSpace: 'nowrap',
        }}
      >
        {collapsed ? 'A' : 'Panel Admin'}
      </div>

      <nav style={{ display: 'grid', gap: 6 }}>
        {sections.map((s) => (
          <NavLink
            key={s.to}
            to={s.to}
            end={s.to === '/admin/dashboard'}
            style={({ isActive }) => linkStyle(isActive, collapsed)}
            title={collapsed ? s.label : undefined}
          >
            <span style={{ fontSize: 20, minWidth: 24, textAlign: 'center' }}>{s.icon}</span>
            {!collapsed && <span>{s.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          marginTop: 16,
          color: '#9e9e9e',
          fontSize: 12,
          textAlign: collapsed ? 'center' : 'left',
          transition: 'all .5s',
        }}
      >
        <div>{!collapsed && 'Acceso rápido'}</div>
        <div style={{ marginTop: 6 }}>
          <Link
            to="/productos"
            style={{
              color: '#90caf9',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 8,
              fontSize: 16,
            }}
            title="Ver tienda"
          >
            <FaStore />
            {!collapsed && <span>Ver tienda</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}