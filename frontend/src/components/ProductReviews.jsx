import { useEffect, useMemo, useState } from 'react';
import { appService } from '@/services/routes';
import { useAuth } from '@/context/AuthContext';
import { StarRow, StarInput } from '@/utils/reviews';
import { useTranslation } from 'react-i18next';

export default function ProductReviews({ productoId, nombre }) {
  const { t } = useTranslation('producto');
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
        const data = await appService.reviews.list({ productId: productoId });
        const arr = Array.isArray(data) ? data : data.results || [];
        if (alive) setItems(arr);
      } catch {
        if (alive) setErr(t('reviews.errorCargar'));
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
    const sum = items.reduce((acc, it) => acc + (Number(it.rating) || 0), 0);
    return sum / items.length;
  }, [items]);

  const displayed = hoverRating != null ? hoverRating : rating;

  const onSubmit = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    if (displayed < 1) {
      setErr(t('reviews.errorCalificacion'));
      return;
    }
    setSubmitting(true);
    setErr('');
    try {
      // Backend actual usa IntegerField; redondeamos la media estrella al entero más cercano.
      const entero = Math.round(displayed);
      await appService.reviews.create({
        productId: productoId,
        rating: entero,
        comment: comentario || '',
      });
      // recargar
      const data = await appService.reviews.list({ productId: productoId });
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
          : e?.message || t('reviews.errorEnviar');
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{t('reviews.titulo')}</h2>
      <div style={{ color: '#666', marginBottom: 12 }}>
        {items.length > 0 ? (
          <span>
            {t('reviews.promedio')} <StarRow value={avg} size={18} /> ({avg.toFixed(1)}) · {items.length}{' '}
            {items.length === 1 ? t('reviews.resena') : t('reviews.resenas')}
          </span>
        ) : (
          <span>{t('reviews.sinResenas')}</span>
        )}
      </div>

      {/* Formulario de nueva reseña */}
      <div style={{ marginTop: 4, marginBottom: 16 }}>
        {isAuthenticated ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{t('reviews.tuCalificacion')}</div>
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
                {t('reviews.mediaEstrella')}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{t('reviews.comentario')}</div>
              <textarea
                rows={3}
                placeholder={t('reviews.comentarioPlaceholder', { nombre })}
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
                {submitting ? t('reviews.enviando') : t('reviews.enviar')}
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
            {t('reviews.requiereSesion')}{' '}
            <a href="/login" style={{ color: '#1e88e5', fontWeight: 700 }}>
              {t('reviews.iniciarSesion')}
            </a>
          </div>
        )}
      </div>

      {/* Listado de reseñas */}
      <div style={{ display: 'grid', gap: 10, textAlign: 'start' }}>
        {loading ? (
          <div style={{ color: '#999' }}>{t('reviews.cargando')}</div>
        ) : items.length === 0 ? (
          <div style={{ color: '#666' }}>{t('reviews.sePrimero')}</div>
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
                <StarRow value={Number(r.rating) || 0} size={16} />
                <span style={{ color: '#666', fontSize: 12 }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div style={{ color: '#555', marginTop: 16, fontSize: 10 }}>
                {r.userId ?? ''}
              </div>
              <div style={{ color: '#111', marginTop: 1, whiteSpace: 'pre-wrap' }}>
                {r.comment || <span style={{ color: '#777' }}>{t('reviews.sinComentario')}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
