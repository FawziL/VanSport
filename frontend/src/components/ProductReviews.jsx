import { useEffect, useMemo, useState } from 'react';
import { appService } from '@/services/routes';
import { useAuth } from '@/context/AuthContext';
import { StarRow, StarInput } from '@/utils/reviews';

export default function ProductReviews({ productoId, nombre }) {
  const { isAuthenticated } = useAuth ? useAuth() : { isAuthenticated: false };
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(0); // permite 0.5 pasos en UI
  const [hoverRating, setHoverRating] = useState(null);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setErr('');
      try {
        const data = await appService.reseñas.list({ producto_id: productoId });
        const arr = Array.isArray(data) ? data : data.results || [];
        if (alive) setItems(arr);
      } catch {
        if (alive) setErr('No se pudieron cargar las reseñas');
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (productoId) load();
    return () => {
      alive = false;
    };
  }, [productoId]);

  const avg = useMemo(() => {
    if (!items.length) return 0;
    const sum = items.reduce((acc, it) => acc + (Number(it.calificacion) || 0), 0);
    return sum / items.length;
  }, [items]);

  const displayed = hoverRating != null ? hoverRating : rating;

  const onSubmit = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    if (displayed < 1) {
      setErr('Selecciona una calificación de al menos 1 estrella.');
      return;
    }
    setSubmitting(true);
    setErr('');
    try {
      // Backend actual usa IntegerField; redondeamos la media estrella al entero más cercano.
      const entero = Math.round(displayed);
      await appService.reseñas.create({
        producto: productoId,
        calificacion: entero,
        comentario: comentario || '',
      });
      // recargar
      const data = await appService.reseñas.list({ producto_id: productoId });
      const arr = Array.isArray(data) ? data : data.results || [];
      setItems(arr);
      setRating(0);
      setComentario('');
    } catch (e) {
      const data = e?.response?.data;
      const msg =
        data && typeof data === 'object'
          ? Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
              .join(' | ')
          : e?.message || 'No se pudo enviar la reseña';
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Reseñas</h2>
      <div style={{ color: '#666', marginBottom: 12 }}>
        {items.length > 0 ? (
          <span>
            Promedio: <StarRow value={avg} size={18} /> ({avg.toFixed(1)}) · {items.length}{' '}
            {items.length === 1 ? 'reseña' : 'reseñas'}
          </span>
        ) : (
          <span>Aún no hay reseñas para este producto.</span>
        )}
      </div>

      {/* Formulario de nueva reseña */}
      <div style={{ marginTop: 4, marginBottom: 16 }}>
        {isAuthenticated ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Tu calificación</div>
              <StarInput
                value={displayed}
                onChange={setRating}
                onHover={setHoverRating}
                onLeave={() => setHoverRating(null)}
                size={28}
              />
              <div>
                {displayed > 0 && (
                  <span style={{ marginLeft: 8, color: '#555', fontWeight: 700 }}>
                    {displayed.toFixed(1)} / 5
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                Puedes seleccionar medias estrellas; por ahora se guardará como entero.
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Comentario (opcional)</div>
              <textarea
                rows={3}
                placeholder={`Comparte tu experiencia con ${nombre}...`}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                style={{ width: '100%', border: '1px solid #ddd', borderRadius: 8, padding: 10 }}
              />
            </div>
            {err && <div style={{ color: '#e53935', fontWeight: 700 }}>{err}</div>}
            <div>
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting || displayed < 1}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: 8,
                  background: displayed >= 1 ? '#1e88e5' : '#9ec9f5',
                  color: '#fff',
                  fontWeight: 800,
                  border: 'none',
                  cursor: submitting || displayed < 1 ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Enviando…' : 'Enviar reseña'}
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              padding: 12,
              borderRadius: 10,
              color: '#475569',
            }}
          >
            Debes iniciar sesión para dejar una reseña.{' '}
            <a href="/login" style={{ color: '#1e88e5', fontWeight: 700 }}>
              Iniciar sesión
            </a>
          </div>
        )}
      </div>

      {/* Listado de reseñas */}
      <div style={{ display: 'grid', gap: 10, textAlign: 'start' }}>
        {loading ? (
          <div style={{ color: '#999' }}>Cargando reseñas…</div>
        ) : items.length === 0 ? (
          <div style={{ color: '#666' }}>Sé el primero en opinar.</div>
        ) : (
          items.map((r) => (
            <div
              key={r.resena_id || r.id}
              style={{
                border: '1px solid #eee',
                borderRadius: 10,
                padding: 12,
                background: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <StarRow value={Number(r.calificacion) || 0} size={16} />
                <span style={{ color: '#666', fontSize: 12 }}>
                  {new Date(r.fecha_creacion).toLocaleDateString()}
                </span>
              </div>
              <div style={{ color: '#555', marginTop: 16, fontSize: 10 }}>
                {r.usuario_nombre || ''} {r.usuario_apellido || ''}{' '}
              </div>
              <div style={{ color: '#111', marginTop: 1, whiteSpace: 'pre-wrap' }}>
                {r.comentario || <span style={{ color: '#777' }}>(Sin comentario)</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
