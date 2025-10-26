import { useTheme } from '@/context/ThemeContext';

export function ThemeToggleButton({ className = '' }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className={`inline-flex items-center justify-center rounded-md border px-2.5 py-2 transition
        ${isDark ? 'border-slate-600 bg-slate-800 text-yellow-300 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}
        ${className}`}
    >
      {isDark ? (
        // Sol (para cambiar a claro)
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zm10.48 14.32l1.79 1.79 1.79-1.79-1.79-1.8-1.79 1.8zM12 4V1h-0v3h0zm0 19v-3h0v3h0zM4 12H1v0h3v0zm19 0h-3v0h3v0zM6.76 19.16l-1.8 1.79-1.79-1.79 1.79-1.8 1.8 1.8zM19.16 6.64l1.79-1.8-1.79-1.79-1.8 1.79 1.8 1.8zM12 7a5 5 0 100 10 5 5 0 000-10z"/>
        </svg>
      ) : (
        // Luna (para cambiar a oscuro)
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.742 13.045A8 8 0 1111 3a9 9 0 109.742 10.045z"/>
        </svg>
      )}
    </button>
  );
}