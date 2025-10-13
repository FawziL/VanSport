import { useEffect, useState } from 'react';
import CardProduct from '@/components/CardProduct';
import { appService } from '@/services/auth';
import Pagination from '@/components/Pagination';
import PageSizeSelector from '@/components/PageSizeSelector';

const fetchProductos = async ({ page, search, pageSize }) => {
  const data = await appService.productos.list({ page, search });

  // Acepta ambos formatos: array plano o objeto paginado { count, results, ... }
  const items = Array.isArray(data) ? data : (data?.results ?? []);
  const filtered = items.filter(
    (p) => !search || (p?.nombre ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / (pageSize || 6)));
  const safePage = Math.min(Math.max(page, 1), pages);
  const start = (safePage - 1) * (pageSize || 6);

  return {
    productos: filtered.slice(start, start + (pageSize || 6)),
    total,
    pages,
  };
};

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(6); // nuevo estado

  useEffect(() => {
    let mounted = true;
    setError(null);
    fetchProductos({ page, search, pageSize })
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
  }, [page, search, pageSize]);

  return (
    <div style={{ maxWidth: 1200, margin: '2.5rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 18, textAlign: 'center' }}>
        Todos los productos
      </h1>

      {/* Filtros */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 24,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: 8,
            border: '1px solid #ccc',
            minWidth: 220,
            fontSize: 16,
          }}
        />
        <PageSizeSelector
          value={pageSize}
          onChange={(val) => {
            setPageSize(val);
            setPage(1); // reset a la primera página al cambiar el tamaño
          }}
          options={[6, 12, 24, 48]}
          label="Por página"
        />
      </div>

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
