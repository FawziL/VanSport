import { useEffect, useState } from 'react';
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
  const [productos, setProductos] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ q: '', categoria_id: '', min_price: '', max_price: '', oferta: '', pageSize: 6 });

  useEffect(() => {
    let mounted = true;
    setError(null);
    fetchProductos({ page, filters })
      .then((res) => {
        if (!mounted) return;
        setProductos(res.productos);
        setPages(res.pages);
        // Si la página actual supera el nuevo total de páginas, ajústala
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

  return (
    <div style={{ maxWidth: 1200, margin: '2.5rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 18, textAlign: 'center' }}>
        Todos los productos
      </h1>

      {/* Filtros avanzados */}
      <ProductFilters
        value={filters}
        onChange={(val) => {
          setFilters(val);
          setPage(1);
        }}
        pageSizeOptions={[6, 12, 24, 48]}
      />

      {/* Mensaje de error */}
      {error && (
        <div style={{ color: '#d32f2f', textAlign: 'center', marginBottom: 16 }}>{error}</div>
      )}

      {/* Grid de productos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 28,
        }}
      >
        {productos.length === 0 && !error ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', fontSize: 18 }}>
            No se encontraron productos.
          </div>
        ) : (
          productos.map((p) => (
            <CardProduct key={p.producto_id ?? p.id ?? Math.random()} producto={p} />
          ))
        )}
      </div>

      {/* Paginación */}
  <Pagination page={page} pages={pages} onChange={setPage} showNumbers />
    </div>
  );
}
