import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { appService } from '@/services/routes';

function resolveCta(n) {
  const t = String(n?.relacion_tipo || '').toLowerCase();
  const id = n?.relacion_id;
  if (t === 'producto' && id != null) return { to: `/productos/${id}`, label: 'Ver producto' };
  if (t === 'categoria' && id != null)
    return { to: `/productos?categoria_id=${id}`, label: 'Ver categoría' };
  if (t === 'url' && typeof id === 'string') return { href: id, label: 'Ver más' };
  return null;
}

function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((total % 3600) / 60)
    .toString()
    .padStart(2, '0');
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
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let alive = true;
    appService.notificaciones.latestBanner().then((n) => {
      if (!n || !n.notificacion_id) return;
      const key = makeDismissKey(n);
      if (localStorage.getItem(key)) return;
      if (alive) setBanner(n);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Tick solo si hay expira o es oferta
  useEffect(() => {
    const hasExpira = !!banner?.expira;
    const isOffer = banner?.tipo === 'oferta';
    if (!hasExpira && !isOffer) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [banner]);

  // Efecto para iniciar la animación después de que el contenido se renderice
  useEffect(() => {
    if (!banner) return;

    const checkAnimation = () => {
      if (contentRef.current && containerRef.current) {
        const contentWidth = contentRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;

        if (contentWidth > containerWidth) {
          setIsAnimating(true);
        } else {
          setIsAnimating(false);
        }
      }
    };

    // Pequeño delay para asegurar que el DOM se ha renderizado
    const timeoutId = setTimeout(checkAnimation, 100);

    // También verificar en resize
    window.addEventListener('resize', checkAnimation);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkAnimation);
    };
  }, [banner]);

  const dismiss = useCallback(() => {
    if (!banner) return;
    const key = makeDismissKey(banner);
    localStorage.setItem(key, '1');
    setBanner(null);
  }, [banner]);

  // Calcular deadline/remaining
  const isOffer = banner?.tipo === 'oferta';
  const startMs = banner?.fecha_creacion ? new Date(banner.fecha_creacion).getTime() : Date.now();
  const fallbackDurationMs = 2 * 60 * 60 * 1000;
  const deadlineMs = banner?.expira
    ? new Date(banner.expira).getTime()
    : isOffer
      ? startMs + fallbackDurationMs
      : null;
  const remainingMs = deadlineMs ? Math.max(0, deadlineMs - now) : null;

  // Auto-cierre al expirar
  useEffect(() => {
    if (remainingMs === 0 && banner) dismiss();
  }, [remainingMs, banner, dismiss]);

  if (!banner) return null;
  const cta = resolveCta(banner);

  return (
    <div style={{ background: '#131313', color: '#fff', padding: '10px 14px' }}>
      <div
        style={{
          margin: '0 auto',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            animation: 'scrollBanner 10s linear infinite',
            flex: 1,
          }}
        >
          {/* Múltiples repeticiones para efecto continuo */}

          <div style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}>
            <strong style={{ fontWeight: 900 }}>{banner.titulo}</strong>
            <span style={{ opacity: 0.9 }}>{banner.mensaje}</span>
            {remainingMs !== null && remainingMs > 0 && (
              <span
                style={{
                  background: '#e53935',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: 8,
                  fontWeight: 800,
                }}
              >
                Termina en {formatDuration(remainingMs)}
              </span>
            )}
            <span style={{ opacity: 0.5 }}>•</span>
          </div>
        </div>

        <div
          style={{
            marginLeft: 20,
            flexShrink: 0,
          }}
        >
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
        </div>

        <style>
          {`
            @keyframes scrollBanner {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(100%);
              }
            }
          `}
        </style>
      </div>
    </div>
  );
}
