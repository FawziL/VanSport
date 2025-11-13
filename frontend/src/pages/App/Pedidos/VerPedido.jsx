import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { appService } from '@/services/auth';
import { useAuth } from '@/context/AuthContext';

function formatPrice(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return '-';
  return num.toLocaleString('es-ES', { style: 'currency', currency: 'USD' });
}

export default function VerPedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, ensureUserLoaded } = useAuth();

  const [pedido, setPedido] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [metodoPago, setMetodoPago] = useState('transferencia');
  const [referencia, setReferencia] = useState('');

  // NUEVO: métodos de pago dinámicos
  const [metodos, setMetodos] = useState([]);
  const [metodoSel, setMetodoSel] = useState(null);

  // NUEVO: BCV y total en Bs
  const [bcv, setBcv] = useState(null);
  const [bcvLoading, setBcvLoading] = useState(false);
  const [bcvErr, setBcvErr] = useState('');
  const [totalBs, setTotalBs] = useState(null);

  const formatBs = (n) => {
    const num = Number(n);
    if (Number.isNaN(num)) return '-';
    try {
      return num.toLocaleString('es-VE', { style: 'currency', currency: 'VES', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch {
      return `Bs ${num.toFixed(2)}`;
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
        return;
      }
      const ok = await ensureUserLoaded();
      if (!ok) {
        navigate('/login', { replace: true });
        return;
      }
      setLoading(true);
      setErrMsg('');
      try {
        const p = await appService.pedidos.retrieve(id);
        if (alive) {
          setPedido(p);
          setDetalles(Array.isArray(p.detalles) ? p.detalles : []);
        }
      } catch (e) {
        if (alive) setErrMsg('No se pudo cargar el pedido');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    // NUEVO: cargar métodos de pago públicos (para este pedido)
    appService.pagos
      ?.listarPublicos()
      .then((arr) => {
        const list = Array.isArray(arr) ? arr : arr?.results || [];
        if (alive) {
          setMetodos(list);
          if (list.length) {
            setMetodoSel(list[0]);
            setMetodoPago(list[0].codigo); // mantener compat con variable existente
          }
        }
      })
      .catch(() => { if (alive) setMetodos([]); });

    return () => { alive = false; };
  }, [id, isAuthenticated]);

  const enRevision = !!pedido?.ultima_transaccion && pedido?.ultima_transaccion?.estado === 'pendiente';
  const mostrarFormulario = !!pedido && pedido.estado === 'pendiente' && !enRevision;

  // NUEVO: referencia requerida solo si el método lo pide (por convención en config o por tipo)
  const requiereReferencia = !!(metodoSel?.config?.requiere_referencia || metodoSel?.tipo === 'pago_movil');
  const canPay = mostrarFormulario && !paying && !!metodoSel && (!requiereReferencia || referencia.trim().length > 0);

  // NUEVO: cuando el método es Pago Móvil, obtener BCV y calcular total en Bs
  useEffect(() => {
    let alive = true;
    setTotalBs(null);
    setBcv(null);
    setBcvErr('');
    if (metodoSel?.tipo === 'pago_movil' && pedido?.total != null) {
      setBcvLoading(true);
      appService.utils
        .dolarBcvHoy()
        .then((data) => {
          if (!alive) return;
          setBcv(data);
          const tasa = Number(data?.valor);
          const total = Number(pedido.total);
          if (!Number.isNaN(tasa) && !Number.isNaN(total)) {
            setTotalBs(total * tasa);
          } else {
            setBcvErr('Tasa inválida');
          }
        })
        .catch(() => {
          if (alive) setBcvErr('No se pudo obtener la tasa BCV');
        })
        .finally(() => alive && setBcvLoading(false));
    }
    return () => {
      alive = false;
    };
  }, [metodoSel?.tipo, pedido?.total]);

  // Loader que solicitaste
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Pedido #{id}</h1>
        <Link 
          to="/pedidos" 
          className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
        >
          Volver a mis pedidos
        </Link>
      </div>

      {/* Error Message */}
      {errMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 font-semibold">
          {errMsg}
        </div>
      )}

      {!pedido ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p>No se pudo cargar el pedido.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal - Detalles del pedido */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
            {/* Información del pedido */}
            <div className="space-y-3 mb-6">
              <div className="text-gray-600">
                Estado: <span className="text-gray-900 font-semibold capitalize">{pedido.estado}</span>
              </div>
              {pedido.transaccion_id && (
                <div className="text-gray-600">
                  Transacción: <span className="text-gray-900 font-semibold">#{pedido.transaccion_id}</span>
                </div>
              )}
              {pedido.direccion_envio && (
                <div className="text-gray-600">
                  Dirección: <span className="text-gray-900">{pedido.direccion_envio}</span>
                </div>
              )}
              {pedido.notas && (
                <div className="text-gray-600">
                  Notas: <span className="text-gray-900">{pedido.notas}</span>
                </div>
              )}
            </div>

            {/* Artículos */}
            <div className="font-bold text-lg mb-4">Artículos</div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-semibold">Producto</th>
                    <th className="text-right p-3 font-semibold">Precio</th>
                    <th className="text-right p-3 font-semibold">Cant.</th>
                    <th className="text-right p-3 font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalles.map((d, idx) => {
                    const name = d.producto_nombre || `#${d.producto || d.producto_id}`;
                    const price = d.precio_unitario ?? 0;
                    const subtotal = d.subtotal ?? Number(price) * Number(d.cantidad || 0);
                    return (
                      <tr 
                        key={d.detalle_id || d.detalle_pedido_id || `${d.producto_id || d.producto}-${idx}`}
                        className="border-t border-gray-200"
                      >
                        <td className="p-3">{name}</td>
                        <td className="p-3 text-right">{formatPrice(price)}</td>
                        <td className="p-3 text-right">{d.cantidad}</td>
                        <td className="p-3 text-right font-semibold">{formatPrice(subtotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Columna lateral - Resumen y pago */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 lg:sticky lg:top-6 space-y-6">
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="text-xl font-bold">{formatPrice(pedido.total)}</span>
            </div>

            {/* Total en Bs para Pago Móvil */}
            {metodoSel?.tipo === 'pago_movil' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">
                    Total en Bs (BCV hoy{bcv?.desactualizado ? ' – anterior' : ''})
                  </span>
                  <span className="font-bold">
                    {bcvLoading ? 'Calculando…' : (bcvErr ? '—' : formatBs(totalBs))}
                  </span>
                </div>
                {bcv?.fecha && (
                  <div className="text-gray-500 text-xs">
                    Tasa: {Number(bcv.valor).toFixed(2)} Bs/USD · Fecha: {bcv.fecha}
                  </div>
                )}
                {bcvErr && (
                  <div className="text-red-500 text-xs">{bcvErr}</div>
                )}
              </div>
            )}

            {/* Último pago */}
            {pedido.ultima_transaccion && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="font-bold mb-2">Último pago</div>
                <div className="space-y-1 text-sm">
                  <div className="text-gray-600">
                    Método: <span className="text-gray-900 capitalize">{pedido.ultima_transaccion.metodo_pago}</span>
                  </div>
                  <div className="text-gray-600">
                    Referencia: <span className="text-gray-900">{pedido.ultima_transaccion.codigo_transaccion || '-'}</span>
                  </div>
                  <div className="text-gray-600">
                    Estado: <span className="text-gray-900 capitalize">{pedido.ultima_transaccion.estado}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Formulario de pago */}
            {mostrarFormulario && (
              <div className="space-y-4">
                {/* Métodos de pago dinámicos */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block font-bold">Método de pago</label>
                    {metodos.length === 0 && (
                      <span className="text-gray-500 text-sm">No hay métodos disponibles</span>
                    )}
                  </div>
                  {metodos.length > 0 && (
                    <div className="space-y-3">
                      {metodos.map((m) => (
                        <label 
                          key={m.codigo}
                          className="flex gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                        >
                          <input
                            type="radio"
                            name="metodo_pago"
                            value={m.codigo}
                            checked={metodoSel?.codigo === m.codigo}
                            onChange={() => { setMetodoSel(m); setMetodoPago(m.codigo); }}
                            className="text-blue-600 focus:ring-blue-500 mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-semibold">
                              {m.nombre} <span className="text-gray-600 font-normal">({m.descripcion})</span>
                            </div>
                            {m.instrucciones && (
                              <div className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">
                                {m.instrucciones}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Referencia si aplica */}
                {requiereReferencia && (
                  <div>
                    <label className="block font-bold mb-2">
                      Número de referencia / comprobante
                    </label>
                    <input
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder="# de operación o referencia"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="text-gray-500 text-sm mt-2">
                      Ingresa la referencia del pago. El admin validará tu comprobante.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botón de pago */}
            <button
              disabled={!canPay}
              onClick={async () => {
                setErrMsg('');
                setPaying(true);
                try {
                  await appService.transacciones.pay({
                    pedido_id: id,
                    metodo_pago: metodoSel?.nombre || metodoPago,
                    referencia: requiereReferencia ? referencia : '',
                    codigo_transaccion: requiereReferencia ? referencia : '',
                    monto: pedido.total,
                  });
                  const p = await appService.pedidos.retrieve(id);
                  setPedido(p);
                } catch (e) {
                  const msg = e?.response?.data?.error || e?.message || 'No se pudo procesar el pago';
                  setErrMsg(msg);
                } finally {
                  setPaying(false);
                }
              }}
              className={`
                w-full py-4 px-6 rounded-xl font-bold transition-all duration-200
                ${canPay 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }
              `}
            >
              {paying
                ? 'Enviando pago…'
                : pedido.estado === 'completado'
                ? 'Completado'
                : pedido.estado === 'pagado'
                ? 'Pagado'
                : enRevision
                ? 'Pago en revisión'
                : (metodoSel?.tipo === 'paypal' ? 'Registrar pago (PayPal)' : 'Enviar comprobante')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}