import { useEffect, useState } from 'react';
import ListCategories from '@/components/ListCategories';

export default function ProductFilters({ value, onChange, pageSizeOptions = [6, 12, 24, 48] }) {
  const [local, setLocal] = useState(() => ({
    q: value?.q ?? '',
    categoria_id: value?.categoria_id ?? '',
    min_price: value?.min_price ?? '',
    max_price: value?.max_price ?? '',
    oferta: value?.oferta ?? '',
    pageSize: value?.pageSize ?? pageSizeOptions[0],
  }));

  useEffect(() => {
    setLocal((prev) => ({ ...prev, ...value }));
  }, [JSON.stringify(value || {})]);

  const apply = () => {
    onChange?.(normalize(local));
  };
  const reset = () => {
    const cleared = {
      q: '',
      categoria_id: '',
      min_price: '',
      max_price: '',
      oferta: '',
      pageSize: pageSizeOptions[0],
    };
    setLocal(cleared);
    onChange?.(normalize(cleared));
  };

  const normalize = (s) => ({
    q: s.q?.trim() || '',
    categoria_id: s.categoria_id || '',
    min_price: s.min_price !== '' ? String(s.min_price) : '',
    max_price: s.max_price !== '' ? String(s.max_price) : '',
    oferta: s.oferta === '' ? '' : s.oferta ? '1' : '0',
    pageSize: Number(s.pageSize) || pageSizeOptions[0],
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit sticky top-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
      </div>

      {/* Filters Stack */}
      <div className="space-y-6">
        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Buscar producto</label>
          <input
            type="text"
            placeholder="Nombre del producto..."
            value={local.q}
            onChange={(e) => setLocal((p) => ({ ...p, q: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
          <ListCategories
            value={local.categoria_id}
            onChange={(val) => setLocal((p) => ({ ...p, categoria_id: val }))}
            placeholder="Todas las categorías"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Rango de Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Rango de Precio</label>
          <div className="space-y-3">
            <div className="relative flex">
              <input
                type="number"
                placeholder="Mínimo"
                value={local.min_price}
                onChange={(e) => setLocal((p) => ({ ...p, min_price: e.target.value }))}
                className="w-1/2 pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                min="0"
                step="0.01"
              />
              <input
                type="number"
                placeholder="Máximo"
                value={local.max_price}
                onChange={(e) => setLocal((p) => ({ ...p, max_price: e.target.value }))}
                className="w-1/2 pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Oferta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Oferta</label>
          <select
            value={local.oferta}
            onChange={(e) => setLocal((p) => ({ ...p, oferta: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-sm"
          >
            <option value="">Todos los productos</option>
            <option value="1">Solo en oferta</option>
          </select>
        </div>

        {/* Items por página */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Productos por página
          </label>
          <select
            value={local.pageSize}
            onChange={(e) => {
              const val = Number(e.target.value);
              setLocal((p) => ({ ...p, pageSize: val }));
              onChange?.(normalize({ ...local, pageSize: val }));
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-sm"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n} productos
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
        <button
          onClick={reset}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm active:bg-blue-800 active:scale-95 transition-all cursor-pointer"
        >
          Limpiar
        </button>
        <button
          onClick={apply}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm active:bg-gray-200 active:scale-95 transition-all cursor-pointer"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
