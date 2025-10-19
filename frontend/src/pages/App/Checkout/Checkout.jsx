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
    return () => { alive = false; };
  }, [isAuthenticated]);

  const total = useMemo(() => {
    return items.reduce((acc, it) => {
      const p = it.producto;
      const price = Number(p?.precio_oferta ?? p?.precio ?? it.precio ?? 0);
      return acc + price * it.cantidad;
    }, 0);
  }, [items]);

  const canSubmit = items.length > 0 && (entrega === 'retiro' || (entrega === 'envio' && direccion.trim())) && !placing;

  return (
    <div style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 1rem', color: '#111827' }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 14 }}>Checkout</h1>

      {errMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: 16, fontWeight: 700 }}>{errMsg}</div>
      )}

      {loading ? (
        <div>Cargando…</div>
      ) : items.length === 0 ? (
        <div>
          Tu carrito está vacío.
          <button onClick={() => navigate('/productos')} style={{ marginLeft: 8, background: '#1e88e5', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', fontWeight: 800 }}>Ver productos</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '1rem' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Método de entrega</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="radio" name="entrega" value="envio" checked={entrega === 'envio'} onChange={() => setEntrega('envio')} />
                  Envío a domicilio
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="radio" name="entrega" value="retiro" checked={entrega === 'retiro'} onChange={() => setEntrega('retiro')} />
                  Retiro en tienda
                </label>
              </div>
            </div>

            {entrega === 'envio' && (
              <div style={{ marginBottom: 14 }}>
                <label htmlFor="direccion" style={{ display: 'block', fontWeight: 800, marginBottom: 6 }}>Dirección de envío</label>
                <textarea id="direccion" rows={3} value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, número, ciudad, referencia…" style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.6rem 0.8rem' }} />
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label htmlFor="notas" style={{ display: 'block', fontWeight: 800, marginBottom: 6 }}>Notas (opcional)</label>
              <textarea id="notas" rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Instrucciones para el envío…" style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.6rem 0.8rem' }} />
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '1rem', alignSelf: 'start', position: 'sticky', top: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: '#6b7280' }}>Productos</span>
              <span style={{ fontWeight: 800 }}>{items.reduce((a, it) => a + it.cantidad, 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: '#6b7280' }}>Total</span>
              <span style={{ fontWeight: 900 }}>{formatPrice(total)}</span>
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
                  const pid = res?.pedido?.pedido_id || res?.pedido?.id;
                  // Tras checkout, podrías dirigir a la pantalla de pago
                  navigate(pid ? `/pedidos/${pid}` : '/pedidos');
                } catch (e) {
                  const msg = e?.response?.data?.error || e?.message || 'No se pudo finalizar el pedido';
                  setErrMsg(msg);
                } finally {
                  setPlacing(false);
                }
              }}
              style={{ width: '100%', padding: '0.9rem 1.2rem', borderRadius: 10, border: 'none', background: '#1e88e5', color: '#fff', fontWeight: 900, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
            >
              {placing ? 'Procesando…' : 'Confirmar pedido'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
