import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { appService } from '@/services/auth';

function resolveCta(n) {
  const t = String(n?.relacion_tipo || '').toLowerCase();
  const id = n?.relacion_id;
  if (t === 'producto' && id != null) return { to: `/productos/${id}`, label: 'Ver producto' };
  if (t === 'categoria' && id != null) return { to: `/productos?categoria_id=${id}`, label: 'Ver categoría' };
  if (t === 'url' && typeof id === 'string') return { href: id, label: 'Ver más' };
  return null;
}

function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600).toString().padStart(2, '0');
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function makeDismissKey(n) {
  const parts = [
    n.notificacion_id,
    n.tipo || '',
    n.titulo || '',
    n.mensaje || '',
    n.relacion_tipo || '',
    n.relacion_id != null ? String(n.relacion_id) : '',
    n.expira || '',
  ];
  const version = parts.join('|');
  return `banner:dismiss:${version}`;
}

export default function HomeBanner() {
  const [banner, setBanner] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let alive = true;
    appService.notificaciones.latestBanner().then((n) => {
      if (!n || !n.notificacion_id) return;
      const key = makeDismissKey(n);
      if (localStorage.getItem(key)) return;
      if (alive) setBanner(n);
    });
    return () => { alive = false; };
  }, []);

  // Tick solo si hay expira o es oferta
  useEffect(() => {
    const hasExpira = !!banner?.expira;
    const isOffer = banner?.tipo === 'oferta';
    if (!hasExpira && !isOffer) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [banner]);

  const dismiss = useCallback(() => {
    if (!banner) return;
    const key = makeDismissKey(banner);
    localStorage.setItem(key, '1');
    setBanner(null);
  }, [banner]);

  // Calcular deadline/remaining siempre, aunque no haya banner (será null y no hará nada)
  const isOffer = banner?.tipo === 'oferta';
  const startMs = banner?.fecha_creacion ? new Date(banner.fecha_creacion).getTime() : Date.now();
  const fallbackDurationMs = 2 * 60 * 60 * 1000; // 2h para 'oferta' si no hay expira
  const deadlineMs = banner?.expira
    ? new Date(banner.expira).getTime()
    : isOffer
      ? startMs + fallbackDurationMs
      : null;
  const remainingMs = deadlineMs ? Math.max(0, deadlineMs - now) : null;

  // Auto-cierre al expirar (hook siempre presente)
  useEffect(() => {
    if (remainingMs === 0 && banner) dismiss();
  }, [remainingMs, banner, dismiss]);

  // A partir de aquí ya puedes salir si no hay banner
  if (!banner) return null;

  const cta = resolveCta(banner);

  return (
    <div style={{ background: '#131313', color: '#fff', padding: '10px 14px' }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
          <strong style={{ fontWeight: 900 }}>{banner.titulo}</strong>
          <span style={{ opacity: 0.9 }}>{banner.mensaje}</span>
          {remainingMs !== null && remainingMs > 0 && (
            <span
              title="Tiempo restante"
              style={{
                marginLeft: 8,
                background: '#e53935',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: 8,
                fontWeight: 800,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              Termina en {formatDuration(remainingMs)}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {cta && cta.to && (
            <Link
              to={cta.to}
              style={{
                background: '#fff',
                color: '#131313',
                padding: '6px 10px',
                borderRadius: 8,
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              {cta.label} →
            </Link>
          )}
          {cta && cta.href && (
            <a
              href={cta.href}
              target="_blank"
              rel="noreferrer"
              style={{
                background: '#fff',
                color: '#131313',
                padding: '6px 10px',
                borderRadius: 8,
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              {cta.label} ↗
            </a>
          )}
          <button
            onClick={dismiss}
            title="Cerrar"
            style={{
              background: 'transparent',
              border: '1px solid #fff',
              color: '#fff',
              borderRadius: 8,
              padding: '6px 10px',
              fontWeight: 800,
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}