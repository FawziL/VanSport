import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { appService } from '@/services/auth';
import { FaShoppingCart } from 'react-icons/fa';

export default function NavBar() {
  const { user, logout } = useAuth();
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
        const data = await appService.carrito.list();
        const items = Array.isArray(data) ? data : data?.results || [];
        const totalQty = items.reduce((acc, it) => acc + (Number(it?.cantidad) || 1), 0);
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
    navigate(to);
  };

  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link
            to="/"
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
                to="/productos"
                className={({ isActive }) => 
                  `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-gray-800 bg-opacity-10' : 'hover:bg-gray-800 hover:bg-opacity-10'
                  }`
                }
              >
                Productos
              </NavLink>
            </div>

            {/* Right Group */}
            <div className="flex items-center gap-2">
              <NavLink
                to="/carrito"
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
                      aria-label={`Productos en el carrito: ${cartCount}`}
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
                    to="/register"
                    className={({ isActive }) => 
                      `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                        isActive ? 'bg-gray-800 bg-opacity-10' : 'hover:bg-gray-800 hover:bg-opacity-10'
                      }`
                    }
                  >
                    Crear cuenta
                  </NavLink>
                  <NavLink
                    to="/login"
                    className={({ isActive }) => 
                      `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                        isActive ? 'bg-gray-800 bg-opacity-10' : 'hover:bg-gray-800 hover:bg-opacity-10'
                      }`
                    }
                  >
                    Iniciar sesión
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
                      {(user.nombre || 'U')[0].toUpperCase()}
                    </div>
                    <span className="font-semibold">
                      {user.nombre} {user.apellido}
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
                        Perfil
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleNav('/pedidos');
                        }}
                        className="w-full text-left px-4 py-2 bg-transparent text-white! border-none cursor-pointer hover:bg-gray-700 transition-colors"
                      >
                        Mis pedidos
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleNav('/reportes');
                        }}
                        className="w-full text-left px-4 py-2 bg-transparent text-white! border-none cursor-pointer hover:bg-gray-700 transition-colors"
                      >
                        Reporte de fallas
                      </button>

                      {user?.is_staff && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleNav('/admin/dashboard');
                          }}
                          className="w-full text-left px-4 py-2 bg-transparent text-white! border-none cursor-pointer hover:bg-gray-700 transition-colors"
                        >
                          Dashboard Admin
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
                        Cerrar sesión
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
            aria-label="Abrir menú"
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
              to="/productos"
              className={({ isActive }) => 
                `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-gray-800 bg-opacity-10' : 'hover:bg-gray-800 hover:bg-opacity-10'
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              Productos
            </NavLink>

            <NavLink
              to="/carrito"
              className={({ isActive }) => 
                `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-gray-800 bg-opacity-10' : 'hover:bg-gray-800 hover:bg-opacity-10'
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              <span className="inline-flex items-center gap-2">
                <FaShoppingCart />
                <span>Carrito</span>
                {cartCount > 0 && (
                  <span
                    aria-label={`Productos en el carrito: ${cartCount}`}
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
                  to="/login"
                  className={({ isActive }) => 
                    `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-gray-800 bg-opacity-10' : 'hover:bg-gray-800 hover:bg-opacity-10'
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  Iniciar sesión
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) => 
                    `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-gray-800 bg-opacity-10' : 'hover:bg-gray-800 hover:bg-opacity-10'
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  Crear cuenta
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/perfil"
                  className={({ isActive }) => 
                    `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-gray-800 bg-opacity-10' : 'hover:bg-gray-800 hover:bg-opacity-10'
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  Perfil
                </NavLink>
                <NavLink
                  to="/pedidos"
                  className={({ isActive }) => 
                    `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-gray-800 bg-opacity-10' : 'hover:bg-gray-800 hover:bg-opacity-10'
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  Mis pedidos
                </NavLink>
                <NavLink
                  to="/reportes"
                  className={({ isActive }) => 
                    `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-gray-800 bg-opacity-10' : 'hover:bg-gray-800 hover:bg-opacity-10'
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  Reporte de fallas
                </NavLink>
                {user?.is_staff && (
                  <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) => 
                      `text-white! no-underline px-3 py-2 rounded-lg transition-colors ${
                        isActive ? 'bg-gray-800 bg-opacity-10' : 'hover:bg-gray-800 hover:bg-opacity-10'
                      }`
                    }
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard Admin
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
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}