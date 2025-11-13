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
      className="
        inline-flex items-center justify-center
        w-9 h-9 rounded-lg
        text-gray-300 bg-white/10 border border-white/20
        transition-all duration-200 ease-in-out
        hover:bg-white/20 hover:border-white/30 hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-slate-900
      "
    >
      {icon}
    </a>
  );
}

export default function Footer({
  brand = { name: 'VanSport', slogan: 'Todo lo que necesitas para tu hogar, en un solo lugar.' },
  internalLinks = {
    tienda: [
      { label: 'Inicio', to: '/' },
      { label: 'Productos', to: '/productos' },
    ],
    soporte: [{ label: 'Reporte de fallas', to: '/reportes' }],
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
    {
      type: 'instagram',
      href: 'https://www.instagram.com/distribuidoravansport/',
      label: 'Instagram',
    },
    { type: 'facebook', href: 'https://facebook.com/', label: 'Facebook' },
    { type: 'tiktok', href: 'https://tiktok.com/@', label: 'TikTok' },
    { type: 'whatsapp', href: 'https://wa.me/584122511076', label: 'WhatsApp' },
  ],
  address = {
    city: 'Ctra Panamericana km16 CC La Casona 1 Piso 1 local N1-11',
    country: 'San Antonio De Los Altos, Miranda, Venezuela 1204',
    phone: '+584122511076',
    email: 'contacto@example.com',
  },
}) {
  const year = new Date().getFullYear();

  const colTitle = (text) => (
    <div className="text-slate-100 font-bold mb-3 tracking-wide text-sm uppercase">{text}</div>
  );

  const linkStyle =
    'text-slate-300 no-underline inline-flex items-center gap-2 py-1 transition-colors duration-200 hover:text-white';

  return (
    <footer className="bg-slate-900 text-slate-200 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand + Socials */}
          <div className="lg:col-span-2">
            <div className="flex items-baseline gap-2 mb-2">
              <div className="text-2xl font-bold text-white">{brand.name}</div>
              {brand.slogan && <div className="text-slate-400 text-sm">· {brand.slogan}</div>}
            </div>
            <p className="text-slate-400 mb-4 max-w-md">
              Artículos del hogar, electrónicos y lo último en tendencias. Calidad y servicio en
              cada compra.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3 mb-6">
              {socials.map((s, i) => (
                <SocialIcon key={i} type={s.type} href={s.href} label={s.label} />
              ))}
            </div>

            {/* Contacto */}
            <div className="text-slate-300 text-sm space-y-1">
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
                  <a
                    href={`mailto:${address.email}`}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {address.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Tienda */}
          <div>
            {colTitle('Tienda')}
            <nav className="space-y-2">
              {internalLinks.tienda?.map((l, i) => (
                <Link key={i} to={l.to} className={linkStyle}>
                  <span className="text-blue-400">›</span>
                  <span>{l.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Soporte */}
          <div>
            {colTitle('Soporte')}
            <nav className="space-y-2">
              {internalLinks.soporte?.map((l, i) => (
                <Link key={i} to={l.to} className={linkStyle}>
                  <span className="text-blue-400">›</span>
                  <span>{l.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Empresa & Legal */}
          <div className="space-y-6">
            <div>
              {colTitle('Empresa')}
              <nav className="space-y-2">
                {externalLinks.empresa?.map((l, i) => (
                  <a key={i} href={l.href} target="_blank" rel="noreferrer" className={linkStyle}>
                    <span className="text-green-400">↗</span>
                    <span>{l.label}</span>
                  </a>
                ))}
              </nav>
            </div>

            <div>
              {colTitle('Legal')}
              <nav className="space-y-2">
                {externalLinks.legal?.map((l, i) => (
                  <a key={i} href={l.href} target="_blank" rel="noreferrer" className={linkStyle}>
                    <span className="text-green-400">↗</span>
                    <span>{l.label}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <div>
              © {year} {brand.name}. Todos los derechos reservados.
            </div>
            <div className="flex gap-6">
              {externalLinks.legal?.map((l, i) => (
                <a
                  key={i}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
