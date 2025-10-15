import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
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
  FaUserCircle,
  FaUserCog,
  FaSignOutAlt,
} from 'react-icons/fa';
import { FiSettings } from 'react-icons/fi';

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
  const sidebarWidth = collapsed ? 70 : 240;
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [openSettings, setOpenSettings] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!settingsRef.current) return;
      if (!settingsRef.current.contains(e.target)) setOpenSettings(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const displayName = (() => {
    if (!user) return 'Usuario';
    const nombre = user.nombre || user.first_name || user.name || '';
    const apellido = user.apellido || user.last_name || '';
    const combined = `${nombre} ${apellido}`.trim();
    return combined || user.username || 'Usuario';
  })();

  const displayEmail = user?.email || user?.correo || '';

  const handleLogout = () => {
    setOpenSettings(false);
    logout();
    // Llevar al catálogo público como destino seguro
    navigate('/productos');
  };

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
        // Permitimos overflow visible para que el menú no se recorte
        overflow: 'visible',
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

      {/* Configuración (engranaje) pegado abajo */}
      <div style={{ position: 'absolute', left: 8, right: 8, bottom: 12 }} ref={settingsRef}>
        <div style={{ position: 'relative', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <button
            onClick={() => setOpenSettings((v) => !v)}
            aria-label="Configuración"
            title="Configuración"
            style={{
              background: '#222',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >

            <FiSettings />
          </button>

          {openSettings && (
            <div
              style={{
                // Cuando está colapsado, usamos posición fija para que el menú
                // se renderice por encima y no se recorte
                position: collapsed ? 'fixed' : 'absolute',
                bottom: collapsed ? 64 : 46,
                left: collapsed ? sidebarWidth + 8 : 'auto',
                right: collapsed ? 'auto' : 0,
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                minWidth: 240,
                zIndex: 1000,
                overflow: 'hidden',
              }}
            >
              {/* Header con usuario */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#141414' }}>
                <FaUserCircle size={26} />
                <div style={{ display: 'grid', gap: 2, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.1 }}>{displayName}</div>
                  {displayEmail && (
                    <div style={{ fontSize: 12, color: '#bdbdbd' }}>{displayEmail}</div>
                  )}
                </div>
              </div>

              {/* Opciones */}
              <div style={{ padding: 6 }}>
                <Link
                  to="/perfil"
                  onClick={() => setOpenSettings(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    color: '#e0e0e0',
                    textDecoration: 'none',
                    borderRadius: 8,
                  }}
                >
                  <FaUserCog />
                  <span>Perfil</span>
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    color: '#e0e0e0',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    textAlign: 'right',
                  }}
                >
                  <FaSignOutAlt />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
