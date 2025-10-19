import { useEffect, useState } from 'react';
import { appService } from '@/services/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/api';

function formatPrice(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return '-';
  return num.toLocaleString('es-ES', { style: 'currency', currency: 'USD' });
}

const resolveImageUrl = (path) => {
  if (!path) return '';
  if (/^https?:/i.test(path)) return path;
  const base = API_URL.replace(/\/+$/, '');
  const rel = String(path).replace(/^\/+/, '');
  return `${base}/${rel}`;
};
export default function Carrito() {
  const navigate = useNavigate();
  const { isAuthenticated, ensureUserLoaded } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [updating, setUpdating] = useState(false);
  const [placing, setPlacing] = useState(false);

  // Cargar carrito + enriquecer con datos de producto
  const fetchCarrito = async () => {
    setLoading(true);
    setErrMsg('');
    try {
      const data = await appService.carrito.list();
      const baseItems = Array.isArray(data) ? data : data.results || [];

      // Enriquecer: si item.producto es un ID, traer detalle del producto
      const cache = new Map();
      const enriched = await Promise.all(
        baseItems.map(async (item) => {
          const prodVal = item.producto;
          if (prodVal && typeof prodVal === 'number') {
            if (!cache.has(prodVal)) {
              try {
                const p = await appService.productos.retrieve(prodVal);
                cache.set(prodVal, p);
              } catch {
                cache.set(prodVal, {
                  producto_id: prodVal,
                  nombre: 'Producto',
                  precio: 0,
                  imagen_url: '',
                });
              }
            }
            return { ...item, producto: cache.get(prodVal) };
          }
          return item;
        })
      );

      setItems(enriched);
    } catch (err) {
      setErrMsg('No se pudo cargar el carrito');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Bloquea si no hay sesión
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    ensureUserLoaded().then((ok) => {
      if (ok) fetchCarrito();
      else navigate('/login', { replace: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleChangeCantidad = async (item, delta) => {
    if (updating) return;
    const nuevaCantidad = item.cantidad + delta;
    if (nuevaCantidad < 1) return;

    setUpdating(true);
    setErrMsg('');

    // Optimista: actualiza en memoria sin refetch
    const key = item.carrito_id ?? item.id ?? item.producto?.producto_id ?? item.producto_id;
    const prevCantidad = item.cantidad;
    setItems((prev) =>
      prev.map((i) =>
        (i.carrito_id ?? i.id ?? i.producto?.producto_id ?? i.producto_id) === key
          ? { ...i, cantidad: nuevaCantidad }
          : i
      )
    );

    try {
      await appService.carrito.updateQuantity({
        producto_id: item.producto?.producto_id ?? item.producto_id,
        cantidad: nuevaCantidad,
      });
      // Éxito: ya está actualizado en memoria; no hacemos nada más
      const newCount = items.reduce((acc, i) => acc + (i === item ? nuevaCantidad : i.cantidad), 0);
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: newCount } }));
    } catch (err) {
      // Revertir si falla
      setItems((prev) =>
        prev.map((i) =>
          (i.carrito_id ?? i.id ?? i.producto?.producto_id ?? i.producto_id) === key
            ? { ...i, cantidad: prevCantidad }
            : i
        )
      );
      setErrMsg('No se pudo actualizar la cantidad');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async (item) => {
    if (updating) return;
    setUpdating(true);
    try {
      await appService.carrito.remove({
        producto_id: item.producto?.producto_id ?? item.producto_id,
      });
      await fetchCarrito();
      const newCount = items.reduce((acc, i) => acc + (i === item ? 0 : i.cantidad), 0);
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: newCount } }));
    } catch {
      setErrMsg('No se pudo eliminar el producto');
    } finally {
      setUpdating(false);
    }
  };

  const handleVaciar = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      await appService.carrito.clear();
      await fetchCarrito();
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: 0 } }));
    } catch {
      setErrMsg('No se pudo vaciar el carrito');
    } finally {
      setUpdating(false);
    }
  };

  const total = items.reduce(
    (acc, item) => acc + Number(item.producto?.precio ?? item.precio ?? 0) * item.cantidad,
    0
  );

  // UI helpers
  const Section = ({ children, style }) => (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(17,24,39,0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  );

  const QtyButton = ({ disabled, onClick, children, ariaLabel }) => (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '6px 10px',
        borderRadius: 8,
        border: '1px solid #d1d5db',
        background: disabled ? '#f3f4f6' : '#f9fafb',
        color: '#111827',
        cursor: disabled ? 'not-allowed' : 'pointer',
        minWidth: 36,
        fontWeight: 800,
      }}
    >
      {children}
    </button>
  );

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <Section style={{ padding: '1rem' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 84, height: 84, borderRadius: 12, background: '#f3f4f6' }} />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      width: '60%',
                      height: 18,
                      background: '#f3f4f6',
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      width: '40%',
                      height: 14,
                      background: '#f3f4f6',
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{ width: '30%', height: 16, background: '#f3f4f6', borderRadius: 8 }}
                  />
                </div>
              </div>
            ))}
          </Section>
          <Section style={{ padding: '1rem', height: 220 }}>
            <div
              style={{
                width: '70%',
                height: 18,
                background: '#f3f4f6',
                borderRadius: 8,
                marginBottom: 12,
              }}
            />
            <div
              style={{
                width: '50%',
                height: 16,
                background: '#f3f4f6',
                borderRadius: 8,
                marginBottom: 12,
              }}
            />
            <div style={{ width: '100%', height: 44, background: '#f3f4f6', borderRadius: 10 }} />
          </Section>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '2.5rem auto', padding: '0 1rem' }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: '#111827', margin: 0 }}>Mi carrito</h1>
        <p style={{ color: '#6b7280', marginTop: 6 }}>
          Revisa tu selección antes de finalizar la compra.
        </p>
      </div>

      {errMsg && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: 12,
            padding: '0.75rem 1rem',
            marginBottom: 16,
            fontWeight: 700,
          }}
        >
          {errMsg}
        </div>
      )}

      {items.length === 0 ? (
        <Section style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
            Tu carrito está vacío
          </div>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>
            Explora los productos y añade tus favoritos.
          </p>
          <Link
            to="/productos"
            style={{
              display: 'inline-block',
              padding: '0.7rem 1.4rem',
              borderRadius: 10,
              background: '#1e88e5',
              color: '#fff',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            Ver productos
          </Link>
        </Section>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          {/* Listado de items */}
          <Section style={{ padding: '1rem' }}>
            {items.map((item) => {
              const producto = item.producto || {};
              const precioUnit = Number(producto.precio ?? item.precio ?? 0);
              const subtotal = precioUnit * item.cantidad;

              return (
                <div
                  key={item.carrito_id ?? item.id}
                  style={{
                    display: 'flex',
                    gap: 14,
                    padding: '0.75rem',
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    marginBottom: 12,
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={resolveImageUrl(producto.imagen_url)}
                    alt={producto.nombre || `Producto ${producto.producto_id ?? ''}`}
                    style={{
                      width: 84,
                      height: 84,
                      objectFit: 'cover',
                      borderRadius: 12,
                      background: '#f3f4f6',
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      e.target.src = '';
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 800,
                            color: '#111827',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={producto.nombre}
                        >
                          {producto.nombre ?? `Producto #${producto.producto_id ?? ''}`}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: 13 }}>
                          {producto.categoria?.nombre || producto.categoria || ''}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#111827', fontWeight: 800 }}>
                          {formatPrice(precioUnit)}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>Precio unitario</div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 10,
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <QtyButton
                          ariaLabel="Disminuir cantidad"
                          disabled={item.cantidad <= 1 || updating}
                          onClick={() => handleChangeCantidad(item, -1)}
                        >
                          −
                        </QtyButton>
                        <span
                          style={{
                            minWidth: 32,
                            textAlign: 'center',
                            fontWeight: 800,
                            color: '#111827',
                          }}
                        >
                          {item.cantidad}
                        </span>
                        <QtyButton
                          ariaLabel="Aumentar cantidad"
                          disabled={updating}
                          onClick={() => handleChangeCantidad(item, 1)}
                        >
                          +
                        </QtyButton>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontWeight: 900, color: '#111827' }}>
                          {formatPrice(subtotal)}
                        </div>
                        <button
                          onClick={() => handleRemove(item)}
                          disabled={updating}
                          title="Eliminar"
                          style={{
                            padding: '6px 10px',
                            borderRadius: 8,
                            border: '1px solid #fecaca',
                            background: '#fef2f2',
                            color: '#b91c1c',
                            fontWeight: 800,
                            cursor: updating ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Section>

          {/* Resumen */}
          <Section style={{ padding: '1rem', position: 'sticky', top: 24, alignSelf: 'start' }}>
            {/* Dirección y notas ahora se piden en Checkout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: '#6b7280' }}>Productos</span>
              <span style={{ fontWeight: 800, color: '#111827' }}>
                {items.reduce((acc, i) => acc + i.cantidad, 0)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: '#6b7280' }}>Subtotal</span>
              <span style={{ fontWeight: 800, color: '#111827' }}>{formatPrice(total)}</span>
            </div>
            {/* Si agregas costos de envío/impuestos, colócalos aquí */}
            <hr style={{ border: 0, borderTop: '1px solid #e5e7eb', margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontWeight: 900, color: '#111827' }}>Total</span>
              <span style={{ fontWeight: 900, color: '#111827' }}>{formatPrice(total)}</span>
            </div>

            <button
              style={{
                width: '100%',
                padding: '0.8rem 1.2rem',
                borderRadius: 10,
                border: 'none',
                background: '#1e88e5',
                color: '#fff',
                fontWeight: 900,
                fontSize: 16,
                cursor: placing ? 'not-allowed' : 'pointer',
                opacity: placing ? 0.8 : 1,
              }}
              disabled={updating || placing || items.length === 0}
              onClick={() => navigate('/checkout')}
            >
              Ir a checkout
            </button>

            <button
              onClick={handleVaciar}
              disabled={updating}
              style={{
                width: '100%',
                marginTop: 10,
                padding: '0.7rem 1.2rem',
                borderRadius: 10,
                border: '1px solid #e53935',
                background: '#fff',
                color: '#e53935',
                fontWeight: 800,
                cursor: updating ? 'not-allowed' : 'pointer',
              }}
            >
              Vaciar carrito
            </button>

            <div style={{ marginTop: 10, textAlign: 'center' }}>
              <Link
                to="/productos"
                style={{ color: '#1e88e5', fontWeight: 800, textDecoration: 'none' }}
              >
                Seguir comprando
              </Link>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
