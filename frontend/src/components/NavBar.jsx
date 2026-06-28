import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { appService } from '@/services/routes';
import { FaShoppingCart } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '@/components/LanguageToggle';
import { locPath } from '@/utils/localePath';

export default function NavBar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  // Escuchar eventos globales de carrito para actualizar en tiempo real
  useEffect(() => {
    const handler = (e) => {
      const n = Number(e?.detail?.count);
      if (!Number.isNaN(n)) setCartCount(n);
    };
    const orderPlacedHandler = () => {
      // cuando se coloca un pedido, limpiamos contador inmediatamente
      setCartCount(0);
    };
    window.addEventListener('cart:updated', handler);
    window.addEventListener('order:placed', orderPlacedHandler);
    return () => {
      window.removeEventListener('cart:updated', handler);
      window.removeEventListener('order:placed', orderPlacedHandler);
    };
  }, []);

  // Cargar cantidad del carrito (sumando cantidades) cuando hay usuario y al recuperar foco
  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!user) {
        if (alive) setCartCount(0);
        return;
      }
      try {
        const data = await appService.cart.list();
        const items = Array.isArray(data) ? data : data?.results || [];
        const totalQty = items.reduce((acc, it) => acc + (Number(it?.quantity) || 1), 0);
        if (alive) setCartCount(totalQty);
      } catch {
        if (alive) setCartCount(0);
      }
    };
    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => {
      alive = false;
      window.removeEventListener('focus', onFocus);
    };
  }, [user]);

  const handleNav = (to) => {
    setMobileOpen(false);
    navigate(locPath(to));
  };

  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link
            to={locPath('/')}
            className="text-white! no-underline font-black text-2xl tracking-wide mr-10"
            onClick={() => {
              setMobileOpen(false);
              setUserMenuOpen(false);
            }}
          >
            VanSport
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 flex-1 justify-between">
            {/* Left Group */}
            <div className="flex items-center gap-2">
              <NavLink
                to={locPath('/productos')}
                className={({ isActive }) =>
                  `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-gray-800 bg-opacity-10' : 'hover:bg-gray-800 hover:bg-opacity-10'
                  }`
                }
              >
                  {t('nav.productos')}
              </NavLink>
            </div>

            {/* Right Group */}
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <NavLink
                to={locPath('/carrito')}
                className={({ isActive }) =>
                  `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-gray-800 bg-opacity-10' : 'hover:bg-gray-800 hover:bg-opacity-10'
                  }`
                }
              >
                <span className="inline-flex items-center gap-2">
                  <FaShoppingCart />
                  {cartCount > 0 && (
                    <span
                      aria-label={t('nav.ariaLabelCarrito', { count: cartCount })}
                      className="bg-red-600 text-white! rounded-full px-2 py-0 text-xs font-black h-5 min-w-5 flex items-center justify-center"
                    >
                      {cartCount}
                    </span>
                  )}
                </span>
              </NavLink>

              {!user ? (
                <>
                  <NavLink
                    to={locPath('/register')}
                    className={({ isActive }) =>
                      `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-gray-800 bg-opacity-10'
                          : 'hover:bg-gray-800 hover:bg-opacity-10'
                      }`
                    }
                  >
                    {t('nav.crearCuenta')}
                  </NavLink>
                  <NavLink
                    to={locPath('/login')}
                    className={({ isActive }) =>
                      `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-gray-800 bg-opacity-10'
                          : 'hover:bg-gray-800 hover:bg-opacity-10'
                      }`
                    }
                  >
                    {t('nav.iniciarSesion')}
                  </NavLink>
                </>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((p) => !p)}
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                    className="flex items-center gap-2 bg-transparent text-white! cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-800 hover:bg-opacity-10 transition-colors"
                  >
                    <div
                      aria-hidden
                      className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center font-bold"
                    >
                      {(user.name || 'U')[0].toUpperCase()}
                    </div>
                    <span className="font-semibold">
                      {user.name} {user.lastName}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div
                      role="menu"
                      className="absolute left-0 mt-2 bg-black rounded-xl min-w-48 shadow-2xl overflow-hidden border-none"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleNav('/perfil');
                        }}
                        className="w-full text-left px-4 py-2 bg-transparent text-white! border-none cursor-pointer hover:bg-gray-700 transition-colors"
                      >
                        {t('nav.perfil')}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleNav('/pedidos');
                        }}
                        className="w-full text-left px-4 py-2 bg-transparent text-white! border-none cursor-pointer hover:bg-gray-700 transition-colors"
                      >
                        {t('nav.misPedidos')}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleNav('/reportes');
                        }}
                        className="w-full text-left px-4 py-2 bg-transparent text-white! border-none cursor-pointer hover:bg-gray-700 transition-colors"
                      >
                        {t('nav.reporteFallas')}
                      </button>

                      {user?.isStaff && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleNav('/admin/dashboard');
                          }}
                          className="w-full text-left px-4 py-2 bg-transparent text-white! border-none cursor-pointer hover:bg-gray-700 transition-colors"
                        >
                          {t('nav.dashboardAdmin')}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                          setCartCount(0);
                        }}
                        className="w-full text-left px-4 py-2 bg-transparent text-red-300! border-none cursor-pointer hover:bg-gray-700 transition-colors"
                      >
                        {t('nav.cerrarSesion')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label={t('nav.ariaLabelMenu')}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 bg-transparent border-none rounded-lg cursor-pointer p-0 outline-none shadow-none transition-transform duration-300"
            style={{ transform: mobileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <span className="block w-7 h-0.5 bg-white! my-1 rounded transition-colors" />
            <span className="block w-7 h-0.5 bg-white! my-1 rounded transition-colors" />
            <span className="block w-7 h-0.5 bg-white! my-1 rounded transition-colors" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden grid gap-2 px-4 py-3 border-t border-gray-800 bg-gray-950">
            <NavLink
              to={locPath('/productos')}
              className={({ isActive }) =>
                `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-gray-800 bg-opacity-10' : 'hover:bg-gray-800 hover:bg-opacity-10'
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              {t('nav.productos')}
            </NavLink>

            <NavLink
              to={locPath('/carrito')}
              className={({ isActive }) =>
                `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-gray-800 bg-opacity-10' : 'hover:bg-gray-800 hover:bg-opacity-10'
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              <span className="inline-flex items-center gap-2">
                <FaShoppingCart />
                <span>{t('nav.carrito')}</span>
                {cartCount > 0 && (
                  <span
                    aria-label={t('nav.ariaLabelCarrito', { count: cartCount })}
                    className="bg-red-600 text-white! rounded-full px-2 py-0 text-xs font-black h-5 min-w-5 flex items-center justify-center"
                  >
                    {cartCount}
                  </span>
                )}
              </span>
            </NavLink>

            {!user ? (
              <>
                <NavLink
                  to={locPath('/login')}
                  className={({ isActive }) =>
                    `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gray-800 bg-opacity-10'
                        : 'hover:bg-gray-800 hover:bg-opacity-10'
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {t('nav.iniciarSesion')}
                </NavLink>
                <NavLink
                  to={locPath('/register')}
                  className={({ isActive }) =>
                    `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gray-800 bg-opacity-10'
                        : 'hover:bg-gray-800 hover:bg-opacity-10'
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {t('nav.crearCuenta')}
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to={locPath('/perfil')}
                  className={({ isActive }) =>
                    `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gray-800 bg-opacity-10'
                        : 'hover:bg-gray-800 hover:bg-opacity-10'
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {t('nav.perfil')}
                </NavLink>
                <NavLink
                  to={locPath('/pedidos')}
                  className={({ isActive }) =>
                    `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gray-800 bg-opacity-10'
                        : 'hover:bg-gray-800 hover:bg-opacity-10'
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {t('nav.misPedidos')}
                </NavLink>
                <NavLink
                  to={locPath('/reportes')}
                  className={({ isActive }) =>
                    `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gray-800 bg-opacity-10'
                        : 'hover:bg-gray-800 hover:bg-opacity-10'
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {t('nav.reporteFallas')}
                </NavLink>
                {user?.isStaff && (
                  <NavLink
                    to={locPath('/admin/dashboard')}
                    className={({ isActive }) =>
                      `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-gray-800 bg-opacity-10'
                          : 'hover:bg-gray-800 hover:bg-opacity-10'
                      }`
                    }
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('nav.dashboardAdmin')}
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                    setCartCount(0);
                  }}
                  className="text-center bg-transparent text-red-300! border-none px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-800 hover:bg-opacity-10 transition-colors"
                >
                  {t('nav.cerrarSesion')}
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
