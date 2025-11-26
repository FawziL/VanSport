import { useEffect, useState } from 'react';
import { appService } from '@/services/routes';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { resolveImageUrl } from '@/utils/resolveUrl';
import { toast } from 'react-toastify';

function formatPrice(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return '-';
  return num.toLocaleString('es-ES', { style: 'currency', currency: 'USD' });
}

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

      // Éxito: mostrar toast
      if (delta > 0) {
        toast.success('Cantidad aumentada');
      } else {
        toast.success('Cantidad reducida');
      }

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
      toast.error('No se pudo actualizar la cantidad');
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
      toast.success('Producto eliminado del carrito');
      const newCount = items.reduce((acc, i) => acc + (i === item ? 0 : i.cantidad), 0);
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: newCount } }));
    } catch {
      toast.error('No se pudo eliminar el producto');
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
      toast.success('Carrito vaciado correctamente');
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: 0 } }));
    } catch {
      toast.error('No se pudo vaciar el carrito');
    } finally {
      setUpdating(false);
    }
  };

  const total = items.reduce(
    (acc, item) => acc + Number(item.producto?.precio ?? item.precio ?? 0) * item.cantidad,
    0
  );

  // UI helpers con Tailwind
  const QtyButton = ({ disabled, onClick, children, ariaLabel }) => (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className="px-2 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 font-bold min-w-9 disabled:bg-gray-100 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
    >
      {children}
    </button>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto my-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 mb-4">
                <div className="w-20 h-20 bg-gray-200 rounded-xl" />
                <div className="flex-1">
                  <div className="w-3/5 h-5 bg-gray-200 rounded mb-2" />
                  <div className="w-2/5 h-4 bg-gray-200 rounded mb-2" />
                  <div className="w-1/4 h-4 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 h-56">
            <div className="w-3/4 h-5 bg-gray-200 rounded mb-3" />
            <div className="w-1/2 h-4 bg-gray-200 rounded mb-3" />
            <div className="w-full h-11 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-10 px-4">
      <div className="mb-5">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Mi carrito</h1>
        <p className="text-gray-600">Revisa tu selección antes de finalizar la compra.</p>
      </div>

      {errMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 font-bold">
          {errMsg}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
          <div className="text-xl font-black text-gray-900 mb-2">Tu carrito está vacío</div>
          <p className="text-gray-600 mb-4">Explora los productos y añade tus favoritos.</p>
          <Link
            to="/productos"
            className="inline-block px-5 py-3 rounded-lg bg-blue-600 text-white! font-bold no-underline hover:bg-blue-700 transition-colors"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Listado de items */}
          <div className="w-2/3 bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            {items.map((item) => {
              const producto = item.producto || {};
              const precioUnit = Number(producto.precio ?? item.precio ?? 0);
              const subtotal = precioUnit * item.cantidad;

              return (
                <div
                  key={item.carrito_id ?? item.id}
                  className="flex gap-3 p-3 rounded-xl border border-gray-200 mb-3 items-center"
                >
                  <img
                    src={resolveImageUrl(producto.imagen_url)}
                    alt={producto.nombre || `Producto ${producto.producto_id ?? ''}`}
                    className="w-20 h-20 object-cover rounded-xl bg-gray-100 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = '';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <div
                          className="font-black text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis"
                          title={producto.nombre}
                        >
                          {producto.nombre ?? `Producto #${producto.producto_id ?? ''}`}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {producto.categoria?.nombre || producto.categoria || ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-900 font-black">{formatPrice(precioUnit)}</div>
                        <div className="text-gray-600 text-xs">Precio unitario</div>
                      </div>
                    </div>

                    <div className="flex justify-between mt-3 items-center">
                      <div className="flex items-center gap-2">
                        <QtyButton
                          ariaLabel="Disminuir cantidad"
                          disabled={item.cantidad <= 1 || updating}
                          onClick={() => handleChangeCantidad(item, -1)}
                        >
                          −
                        </QtyButton>
                        <span className="min-w-8 text-center font-black text-gray-900">
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

                      <div className="flex items-center gap-3">
                        <div className="font-black text-gray-900">{formatPrice(subtotal)}</div>
                        <button
                          onClick={() => handleRemove(item)}
                          disabled={updating}
                          title="Eliminar"
                          className="px-3 py-1 rounded-lg border border-red-300 bg-red-50 text-red-700 font-bold disabled:cursor-not-allowed hover:bg-red-100 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen */}
          <div className="w-1/3 bg-white border border-gray-200 rounded-xl shadow-sm p-4 sticky top-6 self-start">
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Productos</span>
              <span className="font-black text-gray-900">
                {items.reduce((acc, i) => acc + i.cantidad, 0)}
              </span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-black text-gray-900">{formatPrice(total)}</span>
            </div>
            <hr className="border-t border-gray-200 my-3" />
            <div className="flex justify-between mb-4">
              <span className="font-black text-gray-900">Total</span>
              <span className="font-black text-gray-900">{formatPrice(total)}</span>
            </div>

            <button
              className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-black text-lg disabled:cursor-not-allowed disabled:opacity-80 hover:bg-blue-700 transition-colors"
              disabled={updating || placing || items.length === 0}
              onClick={() => navigate('/checkout')}
            >
              Ir a checkout
            </button>

            <button
              onClick={handleVaciar}
              disabled={updating}
              className="w-full mt-3 py-2 px-4 rounded-lg border border-red-600 bg-white text-red-600 font-bold disabled:cursor-not-allowed hover:bg-red-50 transition-colors"
            >
              Vaciar carrito
            </button>

            <div className="mt-3 text-center">
              <Link
                to="/productos"
                className="text-blue-600 font-bold no-underline hover:text-blue-800"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
