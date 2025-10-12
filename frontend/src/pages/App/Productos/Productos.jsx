import { useEffect, useState } from 'react';
import CardProduct from '@/components/CardProduct';

const fetchProductos = async ({ page, search }) => {
  // Aquí deberías llamar a tu backend, por ejemplo:
  // const res = await http.get(`/productos/?page=${page}&search=${search}`);
  // return res.results;
  // Simulación:
  const all = [
    {
      id: 1,
      nombre: 'Camiseta Running Pro',
      imagen: '/img/prod-camiseta.jpg',
      precio: 29.99,
      precio_oferta: 19.99,
      categoria: 'Ropa Deportiva',
      stock: 10,
    },
    {
      id: 2,
      nombre: 'Zapatillas Urban Sport',
      imagen: '/img/prod-zapatillas.jpg',
      precio: 69.99,
      precio_oferta: null,
      categoria: 'Calzado',
      stock: 5,
    },
    {
      id: 3,
      nombre: 'Gorra Transpirable',
      imagen: '/img/prod-gorra.jpg',
      precio: 14.99,
      precio_oferta: 9.99,
      categoria: 'Accesorios',
      stock: 0,
    },
    // ...más productos
  ];
  // Filtro y paginación simulados
  const filtered = all.filter(
    (p) =>
      (!search || p.nombre.toLowerCase().includes(search.toLowerCase())) // filtro por nombre
  );
  const pageSize = 6;
  const total = filtered.length;
  const pages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  return {
    productos: filtered.slice(start, start + pageSize),
    total,
    pages,
  };
};

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    fetchProductos({ page, search }).then((res) => {
      setProductos(res.productos);
      setPages(res.pages);
    });
  }, [page, search]);

  return (
    <div style={{ maxWidth: 1200, margin: '2.5rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 18, textAlign: 'center' }}>
        Todos los productos
      </h1>
      {/* Filtro */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, gap: 12 }}>
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
      </div>
      {/* Grid de productos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 28,
        }}
      >
        {productos.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', fontSize: 18 }}>
            No se encontraron productos.
          </div>
        ) : (
          productos.map((p) => <CardProduct key={p.id} producto={p} />)
        )}
      </div>
      {/* Paginación */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0', gap: 8 }}>
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: 'none',
              background: page === i + 1 ? '#1e88e5' : '#eee',
              color: page === i + 1 ? '#fff' : '#222',
              fontWeight: 700,
              cursor: 'pointer',
              minWidth: 40,
            }}
            disabled={page === i + 1}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}