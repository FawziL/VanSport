import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appService } from '@/services/auth';
import { useAuth } from '@/context/AuthContext';

function formatPrice(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return '-';
  return num.toLocaleString('es-ES', { style: 'currency', currency: 'USD' });
}

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated, ensureUserLoaded } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  const [entrega, setEntrega] = useState('envio'); // 'envio' | 'retiro'
  const [direccion, setDireccion] = useState('');
  const [notas, setNotas] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    let alive = true;
    ensureUserLoaded().then(async (ok) => {
      if (!ok) {
        navigate('/login', { replace: true });
        return;
      }
      setLoading(true);
      setErrMsg('');
      try {
        const data = await appService.carrito.list();
        const baseItems = Array.isArray(data) ? data : data.results || [];
        // Enriquecer con datos de producto si viene solo el ID
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
                  cache.set(prodVal, { producto_id: prodVal, nombre: 'Producto', precio: 0 });
                }
              }
              return { ...item, producto: cache.get(prodVal) };
            }
            return item;
          })
        );
        if (alive) setItems(enriched);
      } catch (e) {
        if (alive) setErrMsg('No se pudo cargar el carrito para checkout');
      } finally {
        if (alive) setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

  const total = useMemo(() => {
    return items.reduce((acc, it) => {
      const p = it.producto;
      const price = Number(p?.precio_oferta ?? p?.precio ?? it.precio ?? 0);
      return acc + price * it.cantidad;
    }, 0);
  }, [items]);

  const canSubmit =
    items.length > 0 &&
    (entrega === 'retiro' || (entrega === 'envio' && direccion.trim())) &&
    !placing;

  // Loader que solicitaste
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-gray-900">
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>

      {errMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 font-semibold">
          {errMsg}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p>Tu carrito está vacío.</p>
          <button
            onClick={() => navigate('/productos')}
            className="ml-2 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition-colors"
          >
            Ver productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal - Formulario */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
            {/* Método de entrega */}
            <div className="mb-6">
              <div className="font-bold mb-3">Método de entrega</div>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="entrega"
                    value="envio"
                    checked={entrega === 'envio'}
                    onChange={() => setEntrega('envio')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  Envío a domicilio
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="entrega"
                    value="retiro"
                    checked={entrega === 'retiro'}
                    onChange={() => setEntrega('retiro')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  Retiro en tienda
                </label>
              </div>
            </div>

            {/* Dirección de envío */}
            {entrega === 'envio' && (
              <div className="mb-6">
                <label htmlFor="direccion" className="block font-bold mb-2">
                  Dirección de envío
                </label>
                <textarea
                  id="direccion"
                  rows={3}
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Calle, número, ciudad, referencia…"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            )}

            {/* Notas */}
            <div className="mb-6">
              <label htmlFor="notas" className="block font-bold mb-2">
                Notas (opcional)
              </label>
              <textarea
                id="notas"
                rows={2}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Instrucciones para el envío…"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Columna lateral - Resumen */}
          <div className="h-50 bg-white border border-gray-200 rounded-xl p-6 lg:sticky lg:top-6">
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Productos</span>
                <span className="font-bold">{items.reduce((a, it) => a + it.cantidad, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-bold text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              disabled={!canSubmit}
              onClick={async () => {
                setErrMsg('');
                setPlacing(true);
                try {
                  const payload = {
                    direccion_envio: entrega === 'envio' ? direccion.trim() : '',
                    notas: notas?.trim() || '',
                  };
                  const res = await appService.pedidos.checkout(payload);

                  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: 0 } }));
                  window.dispatchEvent(new Event('order:placed'));

                  const pid = res?.pedido?.pedido_id || res?.pedido?.id;

                  navigate(pid ? `/pedidos/${pid}` : '/pedidos');
                } catch (e) {
                  const msg =
                    e?.response?.data?.error || e?.message || 'No se pudo finalizar el pedido';
                  setErrMsg(msg);
                } finally {
                  setPlacing(false);
                }
              }}
              className={`
                w-full py-4 px-6 rounded-xl font-bold transition-all duration-200
                ${
                  canSubmit
                    ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }
              `}
            >
              {placing ? 'Procesando…' : 'Confirmar pedido'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
