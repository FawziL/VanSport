import { useEffect, useState } from 'react';
import { appService } from '@/services/routes';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { resolveImageUrl } from '@/utils/resolveUrl';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { locPath } from '@/utils/localePath';

function formatPrice(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return '-';
  return num.toLocaleString('es-ES', { style: 'currency', currency: 'USD' });
}

export default function Carrito() {
  const navigate = useNavigate();
  const { isAuthenticated, ensureUserLoaded } = useAuth();
  const { t } = useTranslation('carrito');

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
      const data = await appService.cart.list();
      const baseItems = Array.isArray(data) ? data : data.results || [];

      // Enriquecer: si item.producto es un ID, traer detalle del producto
      const cache = new Map();
      const enriched = await Promise.all(
        baseItems.map(async (item) => {
          const prodId = item.productId;
          if (prodId && typeof prodId === 'number') {
            if (!cache.has(prodId)) {
              try {
                const p = await appService.products.retrieve(prodId);
                cache.set(prodId, p);
              } catch {
                cache.set(prodId, {
                  productId: prodId,
                  name: 'Producto',
                  price: 0,
                  imageUrl: '',
                });
              }
            }
            return { ...item, producto: cache.get(prodId) };
          }
          return item;
        })
      );

      setItems(enriched);
    } catch (err) {
      setErrMsg(t('errorCargar'));
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
    const nuevaCantidad = item.quantity + delta;
    if (nuevaCantidad < 1) return;

    setUpdating(true);
    setErrMsg('');

    // Optimista: actualiza en memoria sin refetch
    const key = item.cartId ?? item.id ?? item.producto?.productId ?? item.productId;
    const prevCantidad = item.quantity;
    setItems((prev) =>
      prev.map((i) =>
        (i.cartId ?? i.id ?? i.producto?.productId ?? i.productId) === key
          ? { ...i, quantity: nuevaCantidad }
          : i
      )
    );

    try {
      await appService.cart.updateQuantity({
        productId: item.producto?.productId ?? item.productId,
        quantity: nuevaCantidad,
      });

      // Éxito: mostrar toast
      if (delta > 0) {
        toast.success(t('cantidadAumentada'));
      } else {
        toast.success(t('cantidadReducida'));
      }

      const newCount = items.reduce((acc, i) => acc + (i === item ? nuevaCantidad : i.quantity), 0);
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: newCount } }));
    } catch (err) {
      // Revertir si falla
      setItems((prev) =>
        prev.map((i) =>
          (i.cartId ?? i.id ?? i.producto?.productId ?? i.productId) === key
            ? { ...i, quantity: prevCantidad }
            : i
        )
      );
      toast.error(t('errorActualizar'));
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async (item) => {
    if (updating) return;
    setUpdating(true);
    try {
      await appService.cart.remove({
        productId: item.producto?.productId ?? item.productId,
      });
      await fetchCarrito();
      toast.success(t('productoEliminado'));
      const newCount = items.reduce((acc, i) => acc + (i === item ? 0 : i.quantity), 0);
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: newCount } }));
    } catch {
      toast.error(t('errorEliminar'));
    } finally {
      setUpdating(false);
    }
  };

  const handleVaciar = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      await appService.cart.clear();
      await fetchCarrito();
      toast.success(t('carritoVaciado'));
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: 0 } }));
    } catch {
      toast.error(t('errorVaciar'));
    } finally {
      setUpdating(false);
    }
  };

  const total = items.reduce(
    (acc, item) => acc + Number(item.producto?.price ?? item.price ?? 0) * item.quantity,
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
        <h1 className="text-3xl font-black text-gray-900 mb-2">{t('titulo')}</h1>
        <p className="text-gray-600">{t('subtitulo')}</p>
      </div>

      {errMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 font-bold">
          {errMsg}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
          <div className="text-xl font-black text-gray-900 mb-2">{t('vacio')}</div>
          <p className="text-gray-600 mb-4">{t('vacioDesc')}</p>
          <Link
            to={locPath('/productos')}
            className="inline-block px-5 py-3 rounded-lg bg-blue-600 text-white! font-bold no-underline hover:bg-blue-700 transition-colors"
          >
            {t('verProductos')}
          </Link>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Listado de items */}
          <div className="w-2/3 bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            {items.map((item) => {
              const producto = item.producto || {};
              const precioUnit = Number(producto.price ?? item.price ?? 0);
              const subtotal = precioUnit * item.quantity;

              return (
                <div
                  key={item.cartId ?? item.id}
                  className="flex gap-3 p-3 rounded-xl border border-gray-200 mb-3 items-center"
                >
                  <img
                    src={resolveImageUrl(producto.imageUrl)}
                    alt={producto.name || `Producto ${producto.productId ?? ''}`}
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
                          title={producto.name}
                        >
                          {producto.name ?? `Producto #${producto.productId ?? ''}`}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {producto.category?.name || producto.category || ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-900 font-black">{formatPrice(precioUnit)}</div>
                        <div className="text-gray-600 text-xs">{t('precioUnitario')}</div>
                      </div>
                    </div>

                    <div className="flex justify-between mt-3 items-center">
                      <div className="flex items-center gap-2">
                        <QtyButton
                          ariaLabel={t('disminuirCantidad')}
                          disabled={item.quantity <= 1 || updating}
                          onClick={() => handleChangeCantidad(item, -1)}
                        >
                          −
                        </QtyButton>
                        <span className="min-w-8 text-center font-black text-gray-900">
                          {item.quantity}
                        </span>
                        <QtyButton
                          ariaLabel={t('aumentarCantidad')}
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
                          title={t('eliminar')}
                          className="px-3 py-1 rounded-lg border border-red-300 bg-red-50 text-red-700 font-bold disabled:cursor-not-allowed hover:bg-red-100 transition-colors"
                        >
                          {t('eliminar')}
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
              <span className="text-gray-600">{t('productos')}</span>
              <span className="font-black text-gray-900">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">{t('subtotal')}</span>
              <span className="font-black text-gray-900">{formatPrice(total)}</span>
            </div>
            <hr className="border-t border-gray-200 my-3" />
            <div className="flex justify-between mb-4">
              <span className="font-black text-gray-900">{t('total')}</span>
              <span className="font-black text-gray-900">{formatPrice(total)}</span>
            </div>

            <button
              className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-black text-lg disabled:cursor-not-allowed disabled:opacity-80 hover:bg-blue-700 transition-colors"
              disabled={updating || placing || items.length === 0}
              onClick={() => navigate(locPath('/checkout'))}
            >
              {t('irCheckout')}
            </button>

            <button
              onClick={handleVaciar}
              disabled={updating}
              className="w-full mt-3 py-2 px-4 rounded-lg border border-red-600 bg-white text-red-600 font-bold disabled:cursor-not-allowed hover:bg-red-50 transition-colors"
            >
              {t('vaciar')}
            </button>

            <div className="mt-3 text-center">
              <Link
                to={locPath('/productos')}
                className="text-blue-600 font-bold no-underline hover:text-blue-800"
              >
                {t('seguirComprando')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
