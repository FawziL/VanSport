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
    window.addEventListener('cart:updated', handler);
    return () => window.removeEventListener('cart:updated', handler);
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

  const linkStyle = ({ isActive }) => ({
    color: '#fff',
    textDecoration: 'none',
    padding: '0.5rem 0.8rem',
    borderRadius: 8,
    background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
    transition: 'background 0.2s ease',
    fontWeight: 500,
  });

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <nav
        style={{
          background: '#131313',
          color: '#fff',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {/* Brand */}
          <Link
            to="/"
            style={{
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: 0.3,
              marginRight: 42,
            }}
            onClick={() => {
              setMobileOpen(false);
              setUserMenuOpen(false);
            }}
          >
            VanSport
          </Link>

          {/* Desktop: left group (normal links) and right group (auth/user) */}
          <div className="nav-desktop">
            <div className="nav-left">
              <NavLink to="/productos" style={linkStyle}>
                Productos
              </NavLink>
            </div>

            <div className="nav-right">
              <NavLink to="/carrito" style={linkStyle}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <FaShoppingCart />
                  {cartCount > 0 && (
                    <span
                      aria-label={`Productos en el carrito: ${cartCount}`}
                      style={{
                        background: '#e53835',
                        color: '#fff',
                        borderRadius: 999,
                        padding: '0 6px',
                        fontSize: 12,
                        fontWeight: 800,
                        lineHeight: '20px',
                        height: 20,
                        width: 6,
                        textAlign: 'center',
                      }}
                    >
                      {cartCount}
                    </span>
                  )}
                </span>
              </NavLink>
              {!user ? (
                <>
                  <NavLink to="/register" style={linkStyle}>
                    Crear cuenta
                  </NavLink>
                  <NavLink to="/login" style={linkStyle}>
                    Iniciar sesión
                  </NavLink>
                </>
              ) : (
                <div style={{ position: 'relative' }} ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((p) => !p)}
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'transparent',
                      color: '#fff',
                      cursor: 'pointer',
                      padding: '0.4rem 0.8rem',
                      borderRadius: 10,
                    }}
                  >
                    <div
                      aria-hidden
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: '#2b2b2b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}
                    >
                      {(user.nombre || 'U')[0].toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>
                      {user.nombre} {user.apellido}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div
                      role="menu"
                      style={{
                        position: 'absolute',
                        right: 0,
                        marginTop: 8,
                        background: '#1b1b1b',
                        borderRadius: 10,
                        minWidth: 200,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                        overflow: 'hidden',
                        border: 'none',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleNav('/perfil');
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.6rem 0.8rem',
                          background: 'transparent',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Perfil
                      </button>

                      {user?.is_staff && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleNav('/admin/dashboard');
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '0.6rem 0.8rem',
                            background: 'transparent',
                            color: '#b2d8ff',
                            border: 'none',
                            cursor: 'pointer',
                          }}
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
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.6rem 0.8rem',
                          background: 'transparent',
                          color: '#ffb4b4',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Abrir menú"
            className="nav-toggle"
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: 40,
              height: 40,
              background: 'transparent',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              padding: 0,
              outline: 'none',
              boxShadow: 'none',
              transition: 'transform 1s cubic-bezier(.4,2,.6,1)',
              transform: mobileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <span
              style={{
                display: 'block',
                width: 28,
                height: 3,
                background: '#fff',
                margin: '4px 0',
                borderRadius: 2,
                transition: 'background 0.2s',
              }}
            />
            <span
              style={{
                display: 'block',
                width: 28,
                height: 3,
                background: '#fff',
                margin: '4px 0',
                borderRadius: 2,
                transition: 'background 0.2s',
              }}
            />
            <span
              style={{
                display: 'block',
                width: 28,
                height: 3,
                background: '#fff',
                margin: '4px 0',
                borderRadius: 2,
                transition: 'background 0.2s',
              }}
            />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="nav-mobile"
            style={{
              display: 'grid',
              gap: 6,
              padding: '0.5rem 1rem 1rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              background: '#0f0f0f',
            }}
          >
            <NavLink to="/productos" style={linkStyle} onClick={() => setMobileOpen(false)}>
              Productos
            </NavLink>
            <NavLink to="/carrito" style={linkStyle} onClick={() => setMobileOpen(false)}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FaShoppingCart />
                <span>Carrito</span>
                {cartCount > 0 && (
                  <span
                    aria-label={`Productos en el carrito: ${cartCount}`}
                    style={{
                      background: '#e53935',
                      color: '#fff',
                      borderRadius: 999,
                      padding: '0 8px',
                      fontSize: 12,
                      fontWeight: 800,
                      lineHeight: '18px',
                      height: 18,
                      minWidth: 18,
                      textAlign: 'center',
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </span>
            </NavLink>

            {!user ? (
              <>
                <NavLink to="/login" style={linkStyle} onClick={() => setMobileOpen(false)}>
                  Iniciar sesión
                </NavLink>
                <NavLink to="/register" style={linkStyle} onClick={() => setMobileOpen(false)}>
                  Crear cuenta
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/perfil" style={linkStyle} onClick={() => setMobileOpen(false)}>
                  Perfil
                </NavLink>

                {user?.is_staff && (
                  <NavLink to="/admin" style={linkStyle} onClick={() => setMobileOpen(false)}>
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
                  style={{
                    textAlign: 'left',
                    background: 'transparent',
                    color: '#ffb4b4',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        )}

        {/* Responsive rules */}
        <style>
          {`
            .nav-desktop {
              display: flex;
              align-items: center;
              gap: 8px;
              flex: 1;
              justify-content: space-between; /* separa left y right */
            }
            .nav-left, .nav-right {
              display: flex;
              gap: 8px;
              align-items: center;
            }

            .nav-toggle { display: none; }
            .nav-mobile { display: none !important; }

            @media (max-width: 767px) {
              .nav-desktop { display: none !important; }
              .nav-toggle { display: inline-flex; }
              .nav-mobile { display: grid !important; }
            }
          `}
        </style>
      </nav>
    </header>
  );
}
