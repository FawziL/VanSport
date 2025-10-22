import { Link } from 'react-router-dom';
import { useMemo } from 'react';

function SocialIcon({ type = 'facebook', href = '#', label, size = 22 }) {
  const icon = useMemo(() => {
    const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor' };
    switch (type) {
      case 'instagram':
        return (
          <svg {...common} aria-hidden="true">
            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm5.75-2.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z" />
          </svg>
        );
      case 'twitter':
      case 'x':
        return (
          <svg {...common} aria-hidden="true">
            <path d="M3 3h5.3l4.1 6 4.6-6H23l-8 10.5L22 21h-5.3l-4.3-6.3L7.6 21H1l8.8-11.6z" />
          </svg>
        );
      case 'youtube':
        return (
          <svg {...common} aria-hidden="true">
            <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.8 31.8 0 0 0 0 12a31.8 31.8 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.8 31.8 0 0 0 24 12a31.8 31.8 0 0 0-.5-5.8zM9.8 15.6V8.4L16 12z" />
          </svg>
        );
      case 'tiktok':
        return (
          <svg {...common} aria-hidden="true">
            <path d="M16.5 3.5c1 .9 2.2 1.6 3.5 1.9V9c-1.9-.1-3.4-.7-4.7-1.7v6.2a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.2a3 3 0 1 0 2 2.8V3h4.2z" />
          </svg>
        );
      case 'whatsapp':
        return (
          <svg {...common} aria-hidden="true">
            <path d="M20.5 3.5A10.5 10.5 0 0 0 3.8 19.1L2 22l3-1.7A10.5 10.5 0 1 0 20.5 3.5zM12 20.1a8.1 8.1 0 1 1 0-16.2 8.1 8.1 0 0 1 0 16.2zm4.5-5.6c-.3-.2-1.6-.8-1.8-.9s-.4-.1-.6.1c-.2.3-.7.9-.9 1.1s-.3.2-.6.1a6.6 6.6 0 0 1-3.9-3.4c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.1-.3-.3-.3-.5-.3h-.5c-.2 0-.6.1-.9.4-.9.9-1.3 2.1-1.3 3.3 0 2.3 1.6 4.6 4.7 6.3 2.9 1.5 4.2 1.4 4.9 1.3.8-.1 1.6-.7 1.8-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.4-.3z" />
          </svg>
        );
      default:
        return (
          <svg {...common} aria-hidden="true">
            <path d="M15 3h4V0h-4c-2.8 0-5 2.2-5 5v3H6v4h4v12h4V12h4l1-4h-5V5c0-.6.4-1 1-1z" />
          </svg>
        );
    }
  }, [type, size]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label || type}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 10,
        color: '#e5e7eb',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        transition: 'all .2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.16)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
    >
      {icon}
    </a>
  );
}

export default function Footer({
  brand = { name: 'VanSport', slogan: 'Tu tienda deportiva online' },
  internalLinks = {
    tienda: [
      { label: 'Inicio', to: '/' },
      { label: 'Productos', to: '/productos' },
    ],
    soporte: [
      // Puedes completar con rutas reales si existen
      // { label: 'Ayuda', to: '/ayuda' },
      // { label: 'Reportar falla', to: '/reportar-falla' },
      { label: 'Iniciar sesión', to: '/login' },
    ],
  },
  externalLinks = {
    empresa: [
      { label: 'Nosotros', href: 'https://example.com/nosotros' },
      { label: 'Contacto', href: 'mailto:contacto@example.com' },
    ],
    legal: [
      { label: 'Términos', href: 'https://example.com/terminos' },
      { label: 'Privacidad', href: 'https://example.com/privacidad' },
    ],
  },
  socials = [
    { type: 'instagram', href: 'https://instagram.com/', label: 'Instagram' },
    { type: 'facebook', href: 'https://facebook.com/', label: 'Facebook' },
    { type: 'tiktok', href: 'https://tiktok.com/@', label: 'TikTok' },
    { type: 'whatsapp', href: 'https://wa.me/0000000000', label: 'WhatsApp' },
  ],
  address = {
    line1: 'Calle y número',
    city: 'Ciudad',
    country: 'País',
    phone: '+0 000 000 000',
    email: 'contacto@example.com',
  },
}) {
  const year = new Date().getFullYear();

  const colTitle = (text) => (
    <div style={{ color: '#f1f5f9', fontWeight: 900, marginBottom: 12, letterSpacing: 0.2 }}>
      {text}
    </div>
  );

  const linkStyle = {
    color: '#cbd5e1',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 0',
  };

  return (
    <footer style={{ background: '#0f172a', color: '#e2e8f0' }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '32px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
        }}
      >
        {/* Brand + Socials */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{brand.name}</div>
            {brand.slogan && <div style={{ color: '#94a3b8' }}>· {brand.slogan}</div>}
          </div>
          <div style={{ color: '#94a3b8', marginBottom: 12 }}>
            Artículos deportivos, ofertas y lo último en tendencias.
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
            {socials.map((s, i) => (
              <SocialIcon key={i} type={s.type} href={s.href} label={s.label} />
            ))}
          </div>

          {/* Contacto */}
          <div style={{ marginTop: 14, color: '#cbd5e1', fontSize: 14 }}>
            {address.line1 && <div>{address.line1}</div>}
            {(address.city || address.country) && (
              <div>
                {address.city} {address.country ? `· ${address.country}` : ''}
              </div>
            )}
            {address.phone && <div>Tel: {address.phone}</div>}
            {address.email && (
              <div>
                Email:{' '}
                <a href={`mailto:${address.email}`} style={{ color: '#93c5fd' }}>
                  {address.email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Tienda */}
        <div>
          {colTitle('Tienda')}
          <nav style={{ display: 'grid' }}>
            {internalLinks.tienda?.map((l, i) => (
              <Link key={i} to={l.to} style={linkStyle}>
                <span>›</span>
                <span>{l.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Soporte */}
        <div>
          {colTitle('Soporte')}
          <nav style={{ display: 'grid' }}>
            {internalLinks.soporte?.map((l, i) => (
              <Link key={i} to={l.to} style={linkStyle}>
                <span>›</span>
                <span>{l.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Empresa */}
        <div>
          {colTitle('Empresa')}
          <nav style={{ display: 'grid' }}>
            {externalLinks.empresa?.map((l, i) => (
              <a key={i} href={l.href} target="_blank" rel="noreferrer" style={linkStyle}>
                <span>↗</span>
                <span>{l.label}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Legal */}
        <div>
          {colTitle('Legal')}
          <nav style={{ display: 'grid' }}>
            {externalLinks.legal?.map((l, i) => (
              <a key={i} href={l.href} target="_blank" rel="noreferrer" style={linkStyle}>
                <span>↗</span>
                <span>{l.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '12px 16px',
          color: '#94a3b8',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            fontSize: 13,
          }}
        >
          <div>© {year} {brand.name}. Todos los derechos reservados.</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {externalLinks.legal?.map((l, i) => (
              <a key={i} href={l.href} target="_blank" rel="noreferrer" style={{ color: '#cbd5e1' }}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}