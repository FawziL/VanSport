import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { appService } from '@/services/auth';
import { resolveImageUrl } from '@/utils/resolveUrl';
import { useAuth } from '@/context/AuthContext';
import ProductReviews from '@/components/ProductReviews';
import { StarRow } from '@/utils/reviews';
import { toast } from 'react-toastify';

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
  const { isAuthenticated } = useAuth ? useAuth() : { isAuthenticated: true };

  const [addMsg, setAddMsg] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [qty, setQty] = useState(1);
  const [cartQty, setCartQty] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);

  // Usar appService para obtener el detalle
  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setErrMsg('');
      try {
        const data = await appService.productos.retrieve(id);

        // Normaliza imagenes_adicionales en array de strings
        let extras = [];
        const rawExtras = data.imagenes_adicionales ?? data.imagenes ?? null;
        if (Array.isArray(rawExtras)) {
          extras = rawExtras;
        } else if (typeof rawExtras === 'string') {
          const s = rawExtras.trim();
          try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) extras = parsed;
          } catch {
            // fallback CSV
            extras = s ? s.split(',').map((p) => p.trim()).filter(Boolean) : [];
          }
        }

        const normalized = {
          id: data.producto_id ?? data.id ?? id,
          nombre: data.nombre ?? '',
          descripcion: data.descripcion ?? '',
          precio: data.precio ?? null,
          precio_oferta: data.precio_oferta ?? null,
          categoria:
            typeof data.categoria === 'string'
              ? data.categoria
              : typeof data.categoria === 'object' && data.categoria !== null
                ? (data.categoria.nombre ?? data.categoria.id ?? '')
                : (data.categoria ?? ''),
          stock: data.stock ?? 0,
          imagen: resolveImageUrl(data.imagen_url ?? data.imagen ?? ''),
          imagenes: extras.map((p) => resolveImageUrl(p)),
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
    return () => { alive = false; };
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
              const pid =
                typeof i.producto === 'number'
                  ? i.producto
                  : (i.producto?.producto_id ?? i.producto_id);
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

  // Cargar promedio y conteo de reseñas para este producto
  useEffect(() => {
    let alive = true;
    async function loadAvg() {
      if (!producto?.id) return;
      try {
        const data = await appService.reseñas.list({ producto_id: producto.id });
        const arr = Array.isArray(data) ? data : data?.results || [];
        if (!alive) return;
        if (arr.length > 0) {
          const sum = arr.reduce((acc, r) => acc + (Number(r.calificacion) || 0), 0);
          setAvgRating(sum / arr.length);
          setReviewsCount(arr.length);
        } else {
          setAvgRating(0);
          setReviewsCount(0);
        }
      } catch {
        if (alive) {
          setAvgRating(0);
          setReviewsCount(0);
        }
      }
    }
    loadAvg();
    return () => {
      alive = false;
    };
  }, [producto?.id]);

  // Función para manejar añadir/actualizar carrito
  const handleCartAction = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setAddMsg('');
    setAddLoading(true);
    try {
      if (inCart) {
        // Actualizar cantidad del carrito
        await appService.carrito.updateQuantity({
          producto_id: producto.id,
          cantidad: Number(qty) || 1,
        });
        setCartQty(Number(qty) || 1);
        toast.success('Cantidad actualizada en el carrito');
      } else {
        // Añadir al carrito
        await appService.carrito.add({
          producto_id: producto.id,
          cantidad: Number(qty) || 1,
        });
        setInCart(true);
        setCartQty(Number(qty) || 1);
        toast.success('¡Producto añadido al carrito!');
      }
      // Actualizar contador global
      try {
        const data = await appService.carrito.list();
        const items = Array.isArray(data) ? data : data?.results || [];
        const totalQty = items.reduce(
          (acc, it) => acc + (Number(it?.cantidad) || 1),
          0
        );
        window.dispatchEvent(
          new CustomEvent('cart:updated', { detail: { count: totalQty } })
        );
      } catch {}
    } catch (err) {
      const backendMsg = err?.response?.data;
      const msg =
        typeof backendMsg === 'object'
          ? Object.entries(backendMsg)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
              .join(' | ')
          : backendMsg || err.message || 'Error al procesar el carrito';
      toast.error(msg);
    } finally {
      setAddLoading(false);
    }
  };

  // Función para eliminar del carrito
  const handleRemoveFromCart = async () => {
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
      toast.success('Producto eliminado del carrito');
      try {
        const data = await appService.carrito.list();
        const items = Array.isArray(data) ? data : data?.results || [];
        const totalQty = items.reduce(
          (acc, it) => acc + (Number(it?.cantidad) || 1),
          0
        );
        window.dispatchEvent(
          new CustomEvent('cart:updated', { detail: { count: totalQty } })
        );
      } catch {}
    } catch (err) {
      const backendMsg = err?.response?.data;
      const msg =
        typeof backendMsg === 'object'
          ? Object.entries(backendMsg)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
              .join(' | ')
          : backendMsg || err.message || 'No se pudo quitar del carrito';
      toast.error(msg);
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto my-8 px-4">
        <div className="w-32 h-4 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="w-full h-96 bg-gray-200 rounded-xl mb-3"></div>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-20 h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
          <div>
            <div className="w-4/5 h-6 bg-gray-200 rounded mb-3"></div>
            <div className="w-3/5 h-5 bg-gray-200 rounded mb-3"></div>
            <div className="w-full h-40 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (errMsg) {
    return (
      <div className="max-w-4xl mx-auto my-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {errMsg}
        </div>
        <div className="mt-3">
          <Link to="/productos" className="text-blue-600 font-bold no-underline hover:text-blue-800">
            Volver a productos
          </Link>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="max-w-4xl mx-auto my-8 px-4 text-center">
        No se encontró el producto.
        <div className="mt-3">
          <Link to="/productos" className="text-blue-600 font-bold no-underline hover:text-blue-800">
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
    <div className="max-w-7xl mx-auto my-8 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <Link to="/" className="text-blue-600 font-semibold no-underline hover:text-blue-800">
          Inicio
        </Link>
        <span className="text-gray-500">/</span>
        <Link to="/productos" className="text-blue-600 font-semibold no-underline hover:text-blue-800">
          Productos
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-gray-800 font-semibold">{producto.nombre}</span>
      </div>

      <div className="flex justify-between gap-6">
        {/* Galería */}
        <div className='w-full'>
          <div className="relative">
            {discountPct !== null && (
              <span className="absolute top-3 right-3 bg-red-600 text-white font-bold text-sm rounded-lg px-2 py-1 z-10">
                {discountPct}% OFF
              </span>
            )}
            <div
              onClick={handleOpenModal}
              className="w-full h-96 bg-gray-100 rounded-xl overflow-hidden cursor-zoom-in flex items-center justify-center"
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={producto.nombre}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-500">Sin imagen</div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 bg-gray-100">
            {allImages.map((img, index) => (
              <button
                key={index}
                onMouseEnter={() => setSelectedImage(img)}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-16 rounded-lg overflow-hidden border-2 p-0 cursor-pointer bg-white ${
                  selectedImage === img ? 'border-gray-900' : 'border-transparent'
                }`}
                aria-label={`Imagen ${index + 1}`}
              >
                <img
                  src={img}
                  alt={`Miniatura ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Descripción y atributos */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Descripción</h2>
            <p className="text-gray-700 leading-relaxed">
              {producto.descripcion || 'Sin descripción.'}
            </p>

            {producto.atributos && Object.keys(producto.atributos).length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Detalles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(producto.atributos).map(([label, value]) => (
                    <div
                      key={label}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                    >
                      <div className="text-gray-600 text-sm">{label}</div>
                      <div className="font-semibold">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reseñas */}
            <div className="mt-7">
              <ProductReviews productoId={producto.id} nombre={producto.nombre} />
            </div>
          </div>
        </div>

        {/* Sidebar: precio, stock, acciones */}
        <div className='w-1/2'>
          <h1 className="text-2xl font-bold mb-2">{producto.nombre}</h1>
          <div className="text-gray-600 mb-2">{producto.categoria || 'Categoría'}</div>

          {/* Promedio de estrellas (solo si hay reseñas) */}
          {reviewsCount > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <StarRow value={avgRating} size={16} />
              <span className="text-gray-800 font-bold">{avgRating.toFixed(1)}</span>
              <span className="text-gray-500">({reviewsCount})</span>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4">
            {/* Precio */}
            {producto.precio_oferta ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-gray-500 line-through">
                    {formatPrice(producto.precio)}
                  </span>
                  <span className="text-red-600 font-bold text-xl">
                    {formatPrice(producto.precio_oferta)}
                  </span>
                </div>
                {discountPct !== null && (
                  <div className="text-red-600 font-semibold text-sm mt-1">
                    Ahorra {discountPct}% vs. precio original
                  </div>
                )}
              </div>
            ) : (
              <div className="text-blue-600 font-bold text-xl">
                {formatPrice(producto.precio)}
              </div>
            )}

            <div className={`mt-2 font-semibold ${
              producto.stock > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {producto.stock > 0 ? 'En stock' : 'Agotado'}
            </div>

            {/* Selector de cantidad */}
            {producto.stock > 0 && (
              <div className="mt-3">
                <div className="font-semibold mb-1">Cantidad</div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, Number(q) - 1))}
                    aria-label="Disminuir"
                    className="w-9 h-9 rounded-lg border border-gray-300 bg-gray-50 cursor-pointer text-lg font-bold hover:bg-gray-100"
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
                    className="w-20 h-9 rounded-lg border border-gray-300 text-center font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setQty((q) => {
                        const max = Number(producto.stock) || 1;
                        return Math.min(max, Number(q) + 1);
                      })
                    }
                    aria-label="Aumentar"
                    className="w-9 h-9 rounded-lg border border-gray-300 bg-gray-50 cursor-pointer text-lg font-bold hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                {qty > (Number(producto.stock) || 0) && (
                  <div className="text-red-600 font-semibold mt-1 text-sm">
                    Máximo disponible: {Number(producto.stock)}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-lg font-bold transition-colors ${
                  noChangeDisabled
                    ? 'border-2 border-dashed border-blue-300 bg-blue-50 text-blue-600'
                    : producto.stock > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-400 text-white'
                } ${
                  isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
                title={noChangeDisabled ? 'Sin cambios' : undefined}
                disabled={isDisabled}
                onClick={handleCartAction}
              >
                {addLoading
                  ? inCart
                    ? 'Actualizando...'
                    : 'Añadiendo...'
                  : inCart
                    ? 'Actualizar cantidad'
                    : 'Añadir al carrito'}
              </button>

              {inCart && (
                <button
                  type="button"
                  className="w-11 rounded-lg border border-red-300 bg-red-50 text-red-700 font-bold cursor-pointer hover:bg-red-100"
                  title="Quitar del carrito"
                  onClick={handleRemoveFromCart}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Compartir (mejor estilo) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-900">Compartir</div>
                <div className="text-xs text-gray-500">Comparte este producto con tus clientes o amigos</div>
              </div>

              <div className="flex items-center gap-2">
                {/* Native share (si está disponible) */}
                {typeof navigator !== 'undefined' && navigator.share ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigator.share({
                        title: `Producto: ${producto.nombre}`,
                        text: `Mira este producto: ${producto.nombre}`,
                        url: shareLink,
                      }).catch(() => {})
                    }
                    title="Compartir (nativo)"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                    aria-label="Compartir"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 6l-4-4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 2v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Compartir
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  toast.success('Enlace copiado al portapapeles');
                }}
                title="Copiar enlace"
                className="flex items-center gap-2 justify-center px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition text-sm"
                aria-label="Copiar enlace"
              >
                <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M8 7h8a1 1 0 011 1v10a1 1 0 01-1 1H8a1 1 0 01-1-1V8a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 7V5a2 2 0 00-2-2H6a2 2 0 00-2 2v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Copiar
              </button>

              <button
                type="button"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareLink)}`, '_blank')}
                title="Compartir por WhatsApp"
                className="flex items-center gap-2 justify-center px-3 py-2 rounded-lg border border-gray-100 bg-green-50 hover:bg-green-100 transition text-sm text-green-700"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M21 12.08A9 9 0 1111.92 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 21l-5.2-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                WhatsApp
              </button>

              <button
                type="button"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`, '_blank')}
                title="Compartir en Facebook"
                className="flex items-center gap-2 justify-center px-3 py-2 rounded-lg border border-gray-100 bg-blue-50 hover:bg-blue-100 transition text-sm text-blue-700"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M18 2h-3a4 4 0 00-4 4v3H8v3h3v7h3v-7h2.5L18 9h-2.5V6.5A1.5 1.5 0 0117 5h1V2z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Facebook
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = `mailto:?subject=${encodeURIComponent(`Producto: ${producto.nombre}`)}&body=${encodeURIComponent(`Mira este producto: ${shareLink}`)}`;
                }}
                title="Enviar por email"
                className="flex items-center gap-2 justify-center px-3 py-2 rounded-lg border border-gray-100 bg-indigo-50 hover:bg-indigo-100 transition text-sm text-indigo-700"
                aria-label="Email"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-6xl w-full max-h-[90vh]"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-10 right-0 text-white text-2xl bg-transparent border-none cursor-pointer"
            >
              ✕
            </button>

            <div className="relative w-full h-[70vh]">
              <img
                src={allImages[currentImageIndex]}
                alt={producto.nombre}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Controles */}
            <button
              type="button"
              onClick={() =>
                setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
              }
              disabled={allImages.length <= 1}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-60 border-none rounded-full w-10 h-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setCurrentImageIndex((prev) => (prev + 1) % allImages.length)}
              disabled={allImages.length <= 1}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-60 border-none rounded-full w-10 h-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Siguiente"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-40 px-3 py-1 rounded-full font-semibold">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
