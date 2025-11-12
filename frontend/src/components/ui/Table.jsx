export function Table({ children, minWidth = 'min-w-[950px]' }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
      <table className={`w-full border-collapse ${minWidth}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead>
      <tr className="bg-blue-100 text-black">
        {children}
      </tr>
    </thead>
  );
}

export function TableHeader({ children, align = 'left', className = '' }) {
  const alignment = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  return (
    <th className={`p-3 ${alignment} ${className}`}>
      {children}
    </th>
  );
}

export function TableBody({ 
  children, 
  loading = false, 
  empty = false, 
  colSpan = 1,
  loadingText = 'Cargando...',
  emptyText = 'No hay datos.'
}) {
  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={colSpan} className="text-center p-6">
            {loadingText}
          </td>
        </tr>
      </tbody>
    );
  }

  if (empty) {
    return (
      <tbody>
        <tr>
          <td colSpan={colSpan} className="text-center p-6 text-gray-500">
            {emptyText}
          </td>
        </tr>
      </tbody>
    );
  }

  return <tbody>{children}</tbody>;
}

export function TableRow({ children, hover = true, className = '' }) {
  return (
    <tr className={`text-gray-700 ${hover ? 'hover:bg-gray-50' : ''} ${className}`}>
      {children}
    </tr>
  );
}

export function TableCell({ children, align = 'left', className = '' }) {
  const alignment = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  return (
    <td className={`p-2 ${alignment} ${className}`}>
      {children}
    </td>
  );
}

// Componente para imágenes de producto
export function ProductImage({ src, alt, className = '' }) {
  if (!src) {
    return <span className="text-gray-500">Sin imagen</span>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`w-14 h-14 object-cover rounded border border-gray-200 ${className}`}
      loading="lazy"
    />
  );
}

// Componente para botones de acción
export function ActionButton({ 
  onClick, 
  variant, 
  children, 
  disabled = false,
  className = '' 
}) {
  const baseClasses = "px-3 py-1 rounded font-bold cursor-pointer transition-colors";
  
  const variants = {
    edit: "bg-blue-600 text-white hover:bg-blue-700",
    delete: "bg-red-600 text-white hover:bg-red-700",
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-600 text-white hover:bg-gray-700"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

// Componente para el botón de destacado
export function FavoriteButton({ isFavorite, onClick, disabled = false, className = '' }) {
  return (
    <button
      onClick={onClick}
      aria-label={isFavorite ? 'Quitar destacado' : 'Marcar como destacado'}
      disabled={disabled}
      className={`bg-transparent border-none cursor-pointer text-xl transition-opacity ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'opacity-100'
      } ${className}`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={isFavorite ? '#e53935' : 'none'}
        stroke={isFavorite ? '#e53935' : '#bbb'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}