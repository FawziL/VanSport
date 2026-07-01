import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { locPath } from '@/utils/localePath';
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
import { FiTool, FiSettings } from 'react-icons/fi';

const sections = [
  { path: '/admin/dashboard', labelKey: 'sidebar.dashboard', icon: <FaThLarge /> },
  { path: '/admin/usuarios', labelKey: 'sidebar.usuarios', icon: <FaUsers /> },
  { path: '/admin/categorias', labelKey: 'sidebar.categorias', icon: <FaTags /> },
  { path: '/admin/productos', labelKey: 'sidebar.productos', icon: <FaBoxOpen /> },
  { path: '/admin/pedidos', labelKey: 'sidebar.pedidos', icon: <FaClipboardList /> },
  { path: '/admin/envios', labelKey: 'sidebar.envios', icon: <FaTruck /> },
  { path: '/admin/ventas', labelKey: 'sidebar.ventas', icon: <FaChartBar /> },
  { path: '/admin/resenas', labelKey: 'sidebar.resenas', icon: <FaStar /> },
  { path: '/admin/notificaciones', labelKey: 'sidebar.notificaciones', icon: <FaBell /> },
  { path: '/admin/reportes', labelKey: 'sidebar.reportes', icon: <FiTool /> },
  { path: '/admin/metodos-pago', labelKey: 'sidebar.metodosPago', icon: <FaTags /> },
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
  const { t } = useTranslation('admin');
  const sidebarWidth = collapsed ? 70 : 240;
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [openSettings, setOpenSettings] = useState(false);
  const settingsRef = useRef(null);
  const [toggleHover, setToggleHover] = useState(false);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!settingsRef.current) return;
      if (!settingsRef.current.contains(e.target)) setOpenSettings(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const displayName = (() => {
    if (!user) return t('sidebar.usuario');
    const nombre = user.name || user.first_name || user.name || '';
    const apellido = user.lastName || user.last_name || '';
    const combined = `${nombre} ${apellido}`.trim();
    return combined || user.username || t('sidebar.usuario');
  })();

  const displayEmail = user?.email || user?.correo || '';

  const handleLogout = () => {
    setOpenSettings(false);
    logout();
    navigate(locPath('/productos'));
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
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        flex: '0 0 auto',
      }}
    >
      {/* Botón de colapsar/expandir */}
      <button
        onClick={onToggle}
        onMouseEnter={() => setToggleHover(true)}
        onMouseLeave={() => setToggleHover(false)}
        style={{
          position: 'absolute',
          top: 18,
          right: collapsed ? -16 : -20,
          zIndex: 2,
          background: toggleHover ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${toggleHover ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.14)'}`,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          borderRadius: 999,
          width: 34,
          height: 34,
          color: '#f5f5f5',
          cursor: 'pointer',
          boxShadow: toggleHover ? '0 6px 18px rgba(0,0,0,0.28)' : '0 2px 8px rgba(0,0,0,0.14)',
          transition: 'right .5s, background .2s, border-color .2s, box-shadow .2s, transform .15s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateX(${toggleHover ? (collapsed ? 2 : -2) : 0}px)`,
        }}
        aria-label={collapsed ? t('sidebar.expandir') : t('sidebar.colapsar')}
        title={collapsed ? t('sidebar.expandir') : t('sidebar.colapsar')}
      >
        <span style={{ fontSize: 14, lineHeight: 0 }}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </span>
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
        {collapsed ? 'A' : t('sidebar.panelAdmin')}
      </div>

      <nav style={{ display: 'grid', gap: 6 }}>
        {sections.map((s) => (
          <NavLink
            key={s.path}
            to={locPath(s.path)}
            end={s.path === '/admin/dashboard'}
            style={({ isActive }) => linkStyle(isActive, collapsed)}
            title={collapsed ? t(s.labelKey) : undefined}
          >
            <span style={{ fontSize: 20, minWidth: 24, textAlign: 'center' }}>{s.icon}</span>
            {!collapsed && <span>{t(s.labelKey)}</span>}
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
        <div>{!collapsed && t('sidebar.acceso Rapido')}</div>
        <div style={{ marginTop: 6 }}>
          <Link
            to={locPath('/productos')}
            style={{
              color: '#90caf9',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 8,
              fontSize: 16,
            }}
            title={t('sidebar.verTienda')}
          >
            <FaStore />
            {!collapsed && <span>{t('sidebar.verTienda')}</span>}
          </Link>
        </div>
      </div>

      {/* Configuración (engranaje) al final sin superponer contenido */}
      <div style={{ marginTop: 'auto', padding: '8px' }} ref={settingsRef}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <button
            onClick={() => setOpenSettings((v) => !v)}
            aria-label={t('sidebar.configuracion')}
            title={t('sidebar.configuracion')}
            style={{
              background: '#222',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              marginLeft: collapsed ? 0 : -8,
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
                right: collapsed ? 'auto' : -10,
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: '#141414',
                }}
              >
                <FaUserCircle size={26} />
                <div style={{ display: 'grid', gap: 2, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.1 }}>
                    {displayName}
                  </div>
                  {displayEmail && (
                    <div style={{ fontSize: 12, color: '#bdbdbd' }}>{displayEmail}</div>
                  )}
                </div>
              </div>

              {/* Opciones */}
              <div style={{ padding: 6 }}>
                <Link
                  to={locPath('/perfil')}
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
                  <span>{t('sidebar.perfil')}</span>
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
                  <span>{t('sidebar.cerrarSesion')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
