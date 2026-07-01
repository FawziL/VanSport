import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const current = i18n.language?.startsWith('es') ? 'es' : 'en';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 bg-transparent text-white! cursor-pointer px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm font-semibold"
      >
        <span className="uppercase">{current}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 -translate-x-1/2 mt-2 bg-black rounded-xl min-w-16 shadow-2xl overflow-hidden border border-white/10 z-50"
        >
          {[
            { code: 'es', label: t('languageToggle.es') },
            { code: 'en', label: t('languageToggle.en') },
          ].map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="menuitem"
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full text-center px-3 py-1.5 text-sm border-none cursor-pointer transition-colors ${
                 current === lang.code
                   ? 'bg-white/20 text-white font-bold'
                   : 'bg-transparent text-white hover:bg-white/10'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
