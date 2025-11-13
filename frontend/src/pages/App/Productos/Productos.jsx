import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CardProduct from '@/components/CardProduct';
import { appService } from '@/services/auth';
import Pagination from '@/components/Pagination';
import ProductFilters from '@/components/ProductFilters';

const fetchProductos = async ({ page, filters }) => {
  const params = {
    page,
    q: filters?.q || undefined,
    categoria_id: filters?.categoria_id || undefined,
    min_price: filters?.min_price || undefined,
    max_price: filters?.max_price || undefined,
    oferta: filters?.oferta || undefined,
    page_size: filters?.pageSize || undefined,
  };
  const data = await appService.productos.list(params);

  // Acepta ambos formatos: array plano o objeto paginado { count, results, ... }
  const items = Array.isArray(data) ? data : (data?.results ?? []);
  const filtered = items.filter(
    (p) => !filters?.q || (p?.nombre ?? '').toLowerCase().includes(String(filters.q).toLowerCase())
  );

  const pageSize = filters?.pageSize || 6;
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), pages);
  const start = (safePage - 1) * pageSize;

  return {
    productos: filtered.slice(start, start + pageSize),
    total,
    pages,
    pageSize,
  };
};

export default function Productos() {
  const [searchParams, setSearchParams] = useSearchParams();

  const parseFiltersFromSearch = (sp) => {
    const get = (k) => sp.get(k) || '';
    const oferta = sp.get('oferta'); // expect '1' for true, '' otherwise
    const pageSize = Number(sp.get('page_size') || '6') || 6;
    return {
      q: get('q'),
      categoria_id: get('categoria_id'),
      min_price: get('min_price'),
      max_price: get('max_price'),
      oferta: oferta === '1' ? '1' : '',
      pageSize,
    };
  };

  const [productos, setProductos] = useState([]);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(() => parseFiltersFromSearch(searchParams));
  const [page, setPage] = useState(() => {
    const p = parseInt(searchParams.get('page') || '1', 10);
    return Number.isFinite(p) && p > 0 ? p : 1;
  });

  useEffect(() => {
    const parsed = parseFiltersFromSearch(searchParams);
    const p = parseInt(searchParams.get('page') || '1', 10);
    const nextPage = Number.isFinite(p) && p > 0 ? p : 1;
    const sameFilters = JSON.stringify(parsed) === JSON.stringify(filters);
    const samePage = nextPage === page;
    if (!sameFilters) setFilters(parsed);
    if (!samePage) setPage(nextPage);
  }, [searchParams.toString()]);

  useEffect(() => {
    let mounted = true;
    setError(null);
    fetchProductos({ page, filters })
      .then((res) => {
        if (!mounted) return;
        setProductos(res.productos);
        setPages(res.pages);
        if (page > res.pages) setPage(res.pages);
      })
      .catch((err) => {
        console.error('Error cargando productos:', err);
        setError(err?.message || 'No se pudieron cargar los productos');
        setProductos([]);
        setPages(1);
      });
    return () => {
      mounted = false;
    };
  }, [page, JSON.stringify(filters)]);

  // Keep state -> URL in sync when user changes filters or page
  useEffect(() => {
    const sp = new URLSearchParams();
    if (filters.q) sp.set('q', filters.q);
    if (filters.categoria_id) sp.set('categoria_id', String(filters.categoria_id));
    if (filters.min_price) sp.set('min_price', String(filters.min_price));
    if (filters.max_price) sp.set('max_price', String(filters.max_price));
    if (filters.oferta) sp.set('oferta', String(filters.oferta));
    if (filters.pageSize) sp.set('page_size', String(filters.pageSize));
    if (page && page !== 1) sp.set('page', String(page));
    const next = sp.toString();
    const curr = searchParams.toString();
    if (next !== curr) setSearchParams(sp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), page]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Nuestros Productos</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Descubre nuestra amplia selección de productos de calidad
        </p>
      </div>

      {/* Layout principal con sidebar */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de filtros - Ocupa 1/4 en desktop */}
        <div className="lg:w-1/4">
          <ProductFilters
            value={filters}
            onChange={(val) => {
              setFilters(val);
              setPage(1);
            }}
            pageSizeOptions={[6, 12, 24, 48]}
          />
        </div>

        {/* Contenido principal - Ocupa 3/4 en desktop */}
        <div className="lg:w-3/4">
          {/* Resultados y estadísticas */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              Mostrando <span className="font-semibold text-gray-900">{productos.length}</span>{' '}
              productos
              {filters.q && (
                <span>
                  {' '}
                  para "<span className="font-semibold text-gray-900">{filters.q}</span>"
                </span>
              )}
            </div>
            {pages > 1 && (
              <div className="text-sm text-gray-600">
                Página <span className="font-semibold text-gray-900">{page}</span> de{' '}
                <span className="font-semibold text-gray-900">{pages}</span>
              </div>
            )}
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
              <div className="flex items-center justify-center gap-2 text-red-800 font-semibold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Grid de productos */}
          {productos.length === 0 && !error ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-600 mb-6">
                  {filters.q ||
                  filters.categoria_id ||
                  filters.min_price ||
                  filters.max_price ||
                  filters.oferta
                    ? 'Intenta ajustar los filtros para ver más resultados.'
                    : 'Pronto agregaremos nuevos productos a nuestro catálogo.'}
                </p>
                {(filters.q ||
                  filters.categoria_id ||
                  filters.min_price ||
                  filters.max_price ||
                  filters.oferta) && (
                  <button
                    onClick={() => {
                      setFilters({
                        q: '',
                        categoria_id: '',
                        min_price: '',
                        max_price: '',
                        oferta: '',
                        pageSize: 6,
                      });
                      setPage(1);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ver todos los productos
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {productos.map((p) => (
                  <CardProduct key={p.producto_id ?? p.id ?? Math.random()} producto={p} />
                ))}
              </div>

              {/* Paginación */}
              {pages > 1 && (
                <div className="flex justify-center">
                  <Pagination page={page} pages={pages} onChange={setPage} showNumbers />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
