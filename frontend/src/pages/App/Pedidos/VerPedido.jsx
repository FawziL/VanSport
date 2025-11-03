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
  const mostrarFormulario = !!pedido && pedido.estado === 'creado' && !enRevision;

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

  return (
    <div style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 1rem', color: '#111827' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>Pedido #{id}</h1>
        <Link to="/pedidos" style={{ textDecoration: 'none', color: '#1e88e5', fontWeight: 800 }}>Volver a mis pedidos</Link>
      </div>

      {errMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: 16, fontWeight: 700 }}>{errMsg}</div>
      )}

      {loading || !pedido ? (
        <div>Cargando…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '1rem' }}>
            <div style={{ marginBottom: 12, color: '#6b7280' }}>Estado: <span style={{ textTransform: 'capitalize', color: '#111827', fontWeight: 800 }}>{pedido.estado}</span></div>
            {pedido.transaccion_id && (
              <div style={{ marginBottom: 12, color: '#6b7280' }}>Transacción: <span style={{ color: '#111827', fontWeight: 800 }}>#{pedido.transaccion_id}</span></div>
            )}
            {pedido.direccion_envio && (
              <div style={{ marginBottom: 12, color: '#6b7280' }}>Dirección: <span style={{ color: '#111827' }}>{pedido.direccion_envio}</span></div>
            )}
            {pedido.notas && (
              <div style={{ marginBottom: 12, color: '#6b7280' }}>Notas: <span style={{ color: '#111827' }}>{pedido.notas}</span></div>
            )}

            <div style={{ marginTop: 8, fontWeight: 800, marginBottom: 8 }}>Artículos</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa' }}>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Producto</th>
                    <th style={{ textAlign: 'right', padding: '10px' }}>Precio</th>
                    <th style={{ textAlign: 'right', padding: '10px' }}>Cant.</th>
                    <th style={{ textAlign: 'right', padding: '10px' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalles.map((d, idx) => {
                    const name = d.producto_nombre || `#${d.producto || d.producto_id}`;
                    const price = d.precio_unitario ?? 0;
                    const subtotal = d.subtotal ?? Number(price) * Number(d.cantidad || 0);
                    return (
                      <tr key={d.detalle_id || d.detalle_pedido_id || `${d.producto_id || d.producto}-${idx}`} style={{ borderTop: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{name}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>{formatPrice(price)}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>{d.cantidad}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 800 }}>{formatPrice(subtotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '1rem', alignSelf: 'start', position: 'sticky', top: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: '#6b7280' }}>Total</span>
              <span style={{ fontWeight: 900 }}>{formatPrice(pedido.total)}</span>
            </div>

            {/* NUEVO: mostrar total en Bs solo si es Pago Móvil */}
            {metodoSel?.tipo === 'pago_movil' && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>
                    Total en Bs (BCV hoy{bcv?.desactualizado ? ' – anterior' : ''})
                  </span>
                  <span style={{ fontWeight: 900 }}>
                    {bcvLoading ? 'Calculando…' : (bcvErr ? '—' : formatBs(totalBs))}
                  </span>
                </div>
                {bcv?.fecha && (
                  <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>
                    Tasa: {Number(bcv.valor).toFixed(2)} Bs/USD · Fecha: {bcv.fecha}
                  </div>
                )}
                {bcvErr && (
                  <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 4 }}>{bcvErr}</div>
                )}
              </div>
            )}

            {pedido.ultima_transaccion && (
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.75rem 0.9rem', marginBottom: 12 }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Último pago</div>
                <div style={{ color: '#6b7280' }}>Método: <span style={{ color: '#111827', textTransform: 'capitalize' }}>{pedido.ultima_transaccion.metodo_pago}</span></div>
                <div style={{ color: '#6b7280' }}>Referencia: <span style={{ color: '#111827' }}>{pedido.ultima_transaccion.codigo_transaccion || '-'}</span></div>
                <div style={{ color: '#6b7280' }}>Estado: <span style={{ color: '#111827', textTransform: 'capitalize' }}>{pedido.ultima_transaccion.estado}</span></div>
              </div>
            )}
            {mostrarFormulario && (
              <>
                {/* NUEVO: métodos de pago dinámicos */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ display: 'block', fontWeight: 800, marginBottom: 6 }}>Método de pago</label>
                    {metodos.length === 0 && <span style={{ color: '#6b7280', fontSize: 13 }}>No hay métodos disponibles</span>}
                  </div>
                  {metodos.length > 0 && (
                    <div style={{ display: 'grid', gap: 8 }}>
                      {metodos.map((m) => (
                        <label key={m.codigo} style={{ display: 'flex', gap: 8, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 10 }}>
                          <input
                            type="radio"
                            name="metodo_pago"
                            value={m.codigo}
                            checked={metodoSel?.codigo === m.codigo}
                            onChange={() => { setMetodoSel(m); setMetodoPago(m.codigo); }}
                          />
                          <div>
                            <div style={{ fontWeight: 800 }}>
                              {m.nombre} <span style={{ color: '#6b7280', fontWeight: 400 }}>({m.descripcion})</span>
                            </div>
                            {m.instrucciones && (
                              <div style={{ color: '#64748b', fontSize: 13, whiteSpace: 'pre-wrap' }}>{m.instrucciones}</div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* NUEVO: referencia solo si aplica */}
                {requiereReferencia && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontWeight: 800, marginBottom: 6 }}>Número de referencia / comprobante</label>
                    <input
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder="# de operación o referencia"
                      style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.6rem 0.8rem' }}
                    />
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
                      Ingresa la referencia del pago. El admin validará tu comprobante.
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              disabled={!canPay}
              onClick={async () => {
                setErrMsg('');
                setPaying(true);
                try {
                  await appService.transacciones.pay({
                    pedido_id: id,
                    // enviar el código del método seleccionado
                    metodo_pago: metodoSel?.codigo || metodoPago,
                    // si no se requiere, enviamos vacío
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
              style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: 10, border: 'none', background: canPay ? '#1e88e5' : '#9ca3af', color: '#fff', fontWeight: 900, cursor: canPay ? 'pointer' : 'not-allowed' }}
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
