import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { appService } from '@/services/auth';
import { API_URL } from '@/config/api';
import { useAuth } from '@/context/AuthContext';

function formatPrice(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return '-';
  return num.toLocaleString('es-ES', { style: 'currency', currency: 'USD' });
}

export default function VerProducto() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isAuthenticated } = useAuth ? useAuth() : { isAuthenticated: true }; // Si tienes AuthContext

  const [addMsg, setAddMsg] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [inCart, setInCart] = useState(false); // NUEVO: estado para saber si está en el carrito
  const [qty, setQty] = useState(1); // Cantidad seleccionada
  const [cartQty, setCartQty] = useState(0); // Cantidad actual en el carrito (si existe)

  const resolveImageUrl = (path) => {
    if (!path) return '';
    if (/^https?:/i.test(path)) return path;
    const base = API_URL.replace(/\/+$/, '');
    const rel = String(path).replace(/^\/+/, '');
    return `${base}/${rel}`;
  };

  // Usar appService para obtener el detalle
  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setErrMsg('');
      try {
        const data = await appService.productos.retrieve(id);

        // Normaliza según tu modelo: producto_id, imagen_url, etc.
        const normalized = {
          id: data.producto_id ?? data.id ?? id,
          nombre: data.nombre ?? '',
          descripcion: data.descripcion ?? '',
          precio: data.precio ?? null,
          // Si no tienes precio_oferta en el backend, lo dejamos como null
          precio_oferta: data.precio_oferta ?? null,
          // categoria puede venir como objeto, id o nombre; mostramos algo legible
          categoria:
            typeof data.categoria === 'string'
              ? data.categoria
              : typeof data.categoria === 'object' && data.categoria !== null
                ? (data.categoria.nombre ?? data.categoria.id ?? '')
                : (data.categoria ?? ''),
          stock: data.stock ?? 0,
          imagen: resolveImageUrl(data.imagen_url ?? data.imagen ?? ''),
          // Si no hay galería, dejamos vacío
          imagenes: Array.isArray(data.imagenes)
            ? data.imagenes
                .map((img) => (typeof img === 'string' ? img : img.image_path))
                .filter(Boolean)
                .map((p) => resolveImageUrl(p))
            : [],
          // Atributos opcionales
          atributos: data.atributos ?? null,
        };

        if (!alive) return;
        setProducto(normalized);
        setSelectedImage(normalized.imagen || normalized.imagenes[0] || '');
      } catch (err) {
        if (!alive) return;
        const backendMsg = err?.response?.data;
        const msg =
          typeof backendMsg === 'object'
            ? Object.entries(backendMsg)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                .join(' | ')
            : backendMsg || err.message || 'Error al cargar el producto';
        setErrMsg(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (id) load();
    return () => {
      alive = false;
    };
  }, [id]);

  const allImages = useMemo(() => {
    if (!producto) return [];
    const list = [producto.imagen, ...(producto.imagenes || [])].filter(Boolean);
    return list;
  }, [producto]);

  useEffect(() => {
    // Pre-carga de imágenes para suavidad
    allImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [allImages]);

  // Reiniciar cantidad cuando cambia el producto
  useEffect(() => {
    setQty(1);
  }, [producto?.id]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setCurrentImageIndex(Math.max(0, allImages.indexOf(selectedImage)));
  };

  const shareLink = typeof window !== 'undefined' ? window.location.href : '';

  // Detectar si el producto ya está en el carrito
  useEffect(() => {
    let alive = true;
    async function checkInCart() {
      if (!producto || !isAuthenticated) {
        if (alive) {
          setInCart(false);
          setCartQty(0);
        }
        return;
      }
      try {
        const data = await appService.carrito.list();
        const items = Array.isArray(data) ? data : data.results || [];
        const found = items.some((i) => {
          const pid =
            typeof i.producto === 'number'
              ? i.producto
              : (i.producto?.producto_id ?? i.producto_id);
          return Number(pid) === Number(producto.id);
        });
        if (alive) {
          setInCart(found);
          if (found) {
            const item = items.find((i) => {
              const pid = typeof i.producto === 'number' ? i.producto : (i.producto?.producto_id ?? i.producto_id);
              return Number(pid) === Number(producto.id);
            });
            const c = Number(item?.cantidad) || 1;
            const max = Number(producto.stock) || c;
            setQty(Math.min(c, max));
            setCartQty(Math.min(c, max));
          } else {
            setCartQty(0);
          }
        }
      } catch {
        // Si falla, no bloqueamos la UI; asumimos que no está
        if (alive) {
          setInCart(false);
          setCartQty(0);
        }
      }
    }
    checkInCart();
    return () => {
      alive = false;
    };
  }, [producto, isAuthenticated]);

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 1rem' }}>
        <div
          style={{ width: 120, height: 16, background: '#eee', borderRadius: 6, marginBottom: 16 }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div>
            <div
              style={{
                width: '100%',
                height: 360,
                background: '#eee',
                borderRadius: 12,
                marginBottom: 12,
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{ width: 80, height: 60, background: '#eee', borderRadius: 8 }}
                />
              ))}
            </div>
          </div>
          <div>
            <div
              style={{
                width: '80%',
                height: 24,
                background: '#eee',
                borderRadius: 8,
                marginBottom: 12,
              }}
            />
            <div
              style={{
                width: '60%',
                height: 20,
                background: '#eee',
                borderRadius: 8,
                marginBottom: 12,
              }}
            />
            <div style={{ width: '100%', height: 160, background: '#eee', borderRadius: 12 }} />
          </div>
        </div>
      </div>
    );
  }

  if (errMsg) {
    return (
      <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
        <div
          style={{
            background: '#ffecec',
            border: '1px solid #ffb4b4',
            color: '#c62828',
            borderRadius: 12,
            padding: '1rem',
          }}
        >
          {errMsg}
        </div>
        <div style={{ marginTop: 12 }}>
          <Link
            to="/productos"
            style={{ textDecoration: 'none', color: '#1e88e5', fontWeight: 700 }}
          >
            Volver a productos
          </Link>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem', textAlign: 'center' }}>
        No se encontró el producto.
        <div style={{ marginTop: 12 }}>
          <Link
            to="/productos"
            style={{ textDecoration: 'none', color: '#1e88e5', fontWeight: 700 }}
          >
            Volver a productos
          </Link>
        </div>
      </div>
    );
  }

  const discountPct =
    producto.precio_oferta && producto.precio
      ? Math.round(((producto.precio - producto.precio_oferta) / producto.precio) * 100)
      : null;

  // Estados de deshabilitado del botón principal (añadir/actualizar)
  const stockNum = Number(producto?.stock) || 0;
  const exceedsStock = Number(qty) > stockNum;
  const invalidQty = Number(qty) < 1;
  const noChangeDisabled = inCart && Number(qty) === Number(cartQty);
  const isDisabled = stockNum <= 0 || addLoading || invalidQty || exceedsStock || noChangeDisabled;

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 1rem' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Link to="/" style={{ color: '#1e88e5', textDecoration: 'none', fontWeight: 600 }}>
          Inicio
        </Link>
        <span style={{ color: '#888' }}>/</span>
        <Link to="/productos" style={{ color: '#1e88e5', textDecoration: 'none', fontWeight: 600 }}>
          Productos
        </Link>
        <span style={{ color: '#888' }}>/</span>
        <span style={{ color: '#333', fontWeight: 600 }}>{producto.nombre}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Galería */}
        <div>
          <div style={{ position: 'relative' }}>
            {discountPct !== null && (
              <span
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: '#e53935',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  borderRadius: 8,
                  padding: '2px 10px',
                  zIndex: 2,
                }}
              >
                {discountPct}% OFF
              </span>
            )}
            <div
              onClick={handleOpenModal}
              style={{
                width: '100%',
                height: 420,
                background: '#fafafa',
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'zoom-in',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={producto.nombre}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ color: '#999' }}>Sin imagen</div>
              )}
            </div>
          </div>

          <div
            style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 6 }}
          >
            {allImages.map((img, index) => (
              <button
                key={index}
                onMouseEnter={() => setSelectedImage(img)}
                onClick={() => setSelectedImage(img)}
                style={{
                  width: 90,
                  height: 70,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: selectedImage === img ? '2px solid #131313' : '2px solid transparent',
                  padding: 0,
                  cursor: 'pointer',
                  background: '#fff',
                }}
                aria-label={`Imagen ${index + 1}`}
              >
                <img
                  src={img}
                  alt={`Miniatura ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>

          {/* Descripción y atributos */}
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Descripción</h2>
            <p style={{ color: '#444', lineHeight: 1.6 }}>
              {producto.descripcion || 'Sin descripción.'}
            </p>

            {producto.atributos && Object.keys(producto.atributos).length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Detalles</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {Object.entries(producto.atributos).map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        background: '#f7f7f7',
                        border: '1px solid #eee',
                        borderRadius: 10,
                        padding: '0.75rem',
                      }}
                    >
                      <div style={{ color: '#666', fontSize: 13 }}>{label}</div>
                      <div style={{ fontWeight: 700 }}>{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: precio, stock, acciones */}
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{producto.nombre}</h1>
          <div style={{ color: '#666', marginBottom: 8 }}>{producto.categoria || 'Categoría'}</div>

          <div
            style={{
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 12,
              padding: '1rem',
              boxShadow: '0 2px 12px rgba(30,136,229,0.06)',
              marginBottom: 16,
            }}
          >
            {/* Precio */}
            {producto.precio_oferta ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ textDecoration: 'line-through', color: '#888' }}>
                    {formatPrice(producto.precio)}
                  </span>
                  <span style={{ color: '#e53935', fontWeight: 800, fontSize: 22 }}>
                    {formatPrice(producto.precio_oferta)}
                  </span>
                </div>
                {discountPct !== null && (
                  <div style={{ color: '#e53935', fontWeight: 700, fontSize: 13, marginTop: 4 }}>
                    Ahorra {discountPct}% vs. precio original
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#1e88e5', fontWeight: 800, fontSize: 22 }}>
                {formatPrice(producto.precio)}
              </div>
            )}

            <div
              style={{
                marginTop: 10,
                color: producto.stock > 0 ? '#43a047' : '#e53935',
                fontWeight: 700,
              }}
            >
              {producto.stock > 0 ? 'En stock' : 'Agotado'}
            </div>

            {/* Selector de cantidad */}
            {producto.stock > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Cantidad</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, Number(q) - 1))}
                    aria-label="Disminuir"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: '1px solid #ddd',
                      background: '#fafafa',
                      cursor: 'pointer',
                      fontSize: 18,
                      fontWeight: 800,
                    }}
                  >
                    –
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={Number(producto.stock) || 1}
                    value={qty}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (Number.isNaN(v)) {
                        setQty(1);
                        return;
                      }
                      const max = Number(producto.stock) || 1;
                      setQty(Math.min(Math.max(1, v), max));
                    }}
                    style={{
                      width: 70,
                      height: 36,
                      borderRadius: 8,
                      border: '1px solid #ddd',
                      textAlign: 'center',
                      fontWeight: 700,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setQty((q) => {
                      const max = Number(producto.stock) || 1;
                      return Math.min(max, Number(q) + 1);
                    })}
                    aria-label="Aumentar"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: '1px solid #ddd',
                      background: '#fafafa',
                      cursor: 'pointer',
                      fontSize: 18,
                      fontWeight: 800,
                    }}
                  >
                    +
                  </button>
                </div>
                {qty > (Number(producto.stock) || 0) && (
                  <div style={{ color: '#e53935', fontWeight: 700, marginTop: 6, fontSize: 13 }}>
                    Máximo disponible: {Number(producto.stock)}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '0.7rem 1rem',
                  borderRadius: 10,
                  border: noChangeDisabled ? '2px dashed #90caf9' : 'none',
                  background: producto.stock > 0 ? (noChangeDisabled ? '#e3f2fd' : '#1e88e5') : '#aaa',
                  color: producto.stock > 0 ? (noChangeDisabled ? '#1e88e5' : '#fff') : '#fff',
                  fontWeight: 800,
                  cursor: producto.stock > 0 ? (isDisabled ? 'not-allowed' : 'pointer') : 'not-allowed',
                  transition: 'background 0.2s',
                }}
                title={noChangeDisabled ? 'Sin cambios' : undefined}
                disabled={isDisabled}
                onClick={async () => {
                  if (!isAuthenticated) {
                    window.location.href = '/login';
                    return;
                  }
                  setAddMsg('');
                  setAddLoading(true);
                  try {
                    if (inCart) {
                      // Actualizar cantidad del carrito
                      await appService.carrito.updateQuantity({ producto_id: producto.id, cantidad: Number(qty) || 1 });
                      setCartQty(Number(qty) || 1);
                      setAddMsg('Cantidad actualizada.');
                    } else {
                      // Añadir al carrito
                      await appService.carrito.add({ producto_id: producto.id, cantidad: Number(qty) || 1 });
                      setInCart(true);
                      setCartQty(Number(qty) || 1);
                      setAddMsg('¡Producto añadido al carrito!');
                    }
                    // Actualizar contador global
                    try {
                      const data = await appService.carrito.list();
                      const items = Array.isArray(data) ? data : data?.results || [];
                      const totalQty = items.reduce((acc, it) => acc + (Number(it?.cantidad) || 1), 0);
                      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: totalQty } }));
                    } catch {}
                  } catch (err) {
                    const backendMsg = err?.response?.data;
                    const msg =
                      typeof backendMsg === 'object'
                        ? Object.entries(backendMsg)
                            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                            .join(' | ')
                        : backendMsg || err.message || 'Error al procesar el carrito';
                    setAddMsg(msg);
                  } finally {
                    setAddLoading(false);
                  }
                }}
              >
                {addLoading ? (inCart ? 'Actualizando...' : 'Añadiendo...') : (inCart ? 'Actualizar cantidad' : 'Añadir al carrito')}
              </button>

              {inCart && (
                <button
                  type="button"
                  style={{
                    width: 44,
                    borderRadius: 10,
                    border: '1px solid #f2b8b8',
                    background: '#fff5f5',
                    color: '#c62828',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                  title="Quitar del carrito"
                  onClick={async () => {
                    if (!isAuthenticated) {
                      window.location.href = '/login';
                      return;
                    }
                    setAddMsg('');
                    setAddLoading(true);
                    try {
                      await appService.carrito.remove({ producto_id: producto.id });
                      setInCart(false);
                      setCartQty(0);
                      setQty(1);
                      setAddMsg('Producto quitado del carrito.');
                      try {
                        const data = await appService.carrito.list();
                        const items = Array.isArray(data) ? data : data?.results || [];
                        const totalQty = items.reduce((acc, it) => acc + (Number(it?.cantidad) || 1), 0);
                        window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: totalQty } }));
                      } catch {}
                    } catch (err) {
                      const backendMsg = err?.response?.data;
                      const msg =
                        typeof backendMsg === 'object'
                          ? Object.entries(backendMsg)
                              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                              .join(' | ')
                          : backendMsg || err.message || 'No se pudo quitar del carrito';
                      setAddMsg(msg);
                    } finally {
                      setAddLoading(false);
                    }
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            {addMsg && (
              <div
                style={{
                  marginTop: 8,
                  color: addMsg.startsWith('¡') ? '#43a047' : '#e53935',
                  fontWeight: 700,
                }}
              >
                {addMsg}
              </div>
            )}
          </div>

          {/* Compartir */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 12,
              padding: '1rem',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Compartir</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                }}
                style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: 10,
                  border: '1px solid #ddd',
                  background: '#fafafa',
                  cursor: 'pointer',
                }}
              >
                Copiar enlace
              </button>
              <button
                type="button"
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(shareLink)}`, '_blank');
                }}
                style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: 10,
                  border: '1px solid #ddd',
                  background: '#fafafa',
                  cursor: 'pointer',
                }}
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => {
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
                    '_blank'
                  );
                }}
                style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: 10,
                  border: '1px solid #ddd',
                  background: '#fafafa',
                  cursor: 'pointer',
                }}
              >
                Facebook
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = `mailto:?subject=${encodeURIComponent(
                    `Producto: ${producto.nombre}`
                  )}&body=${encodeURIComponent(`Mira este producto: ${shareLink}`)}`;
                }}
                style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: 10,
                  border: '1px solid #ddd',
                  background: '#fafafa',
                  cursor: 'pointer',
                }}
              >
                Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de imagen ampliada */}
      {isModalOpen && allImages.length > 0 && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', maxWidth: 1200, width: '100%', maxHeight: '90vh' }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                right: 0,
                top: -40,
                color: '#fff',
                fontSize: 28,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <div style={{ position: 'relative', width: '100%', height: '70vh' }}>
              <img
                src={allImages[currentImageIndex]}
                alt={producto.nombre}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* Controles */}
            <button
              type="button"
              onClick={() =>
                setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
              }
              disabled={allImages.length <= 1}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.6)',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                cursor: 'pointer',
              }}
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setCurrentImageIndex((prev) => (prev + 1) % allImages.length)}
              disabled={allImages.length <= 1}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.6)',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                cursor: 'pointer',
              }}
              aria-label="Siguiente"
            >
              ›
            </button>

            <div
              style={{
                position: 'absolute',
                bottom: 12,
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#fff',
                background: 'rgba(0,0,0,0.4)',
                padding: '4px 10px',
                borderRadius: 999,
                fontWeight: 700,
              }}
            >
              {currentImageIndex + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
