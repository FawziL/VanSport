import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appService } from '@/services/auth';
import { resolveImageUrl } from '@/utils/resolveUrl';
import HomeBanner from '@/components/HomeBanner';

export default function Home() {
  const [cats, setCats] = useState([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [catsError, setCatsError] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        // Traer productos destacados (limit 3). Si no hay paginación server, cortamos en cliente.
        const data = await appService.productos.list({ destacado: 1, activo: 1 });
        const items = Array.isArray(data) ? data : data?.results || [];
        const top3 = items.slice(0, 3).map((p) => ({
          id: p.producto_id ?? p.id,
          name: p.nombre,
          price: p.precio,
          img: resolveImageUrl(p.imagen_url || p.imagen),
        }));
        if (alive) setFeatured(top3);
      } catch (e) {
        if (alive) setError('No se pudieron cargar los destacados');
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    async function loadCats() {
      setCatsLoading(true);
      setCatsError('');
      try {
        const data = await appService.categorias.list({ destacado: 1 });
        const items = Array.isArray(data) ? data : data?.results || [];
        const mapped = items.slice(0, 6).map((c) => ({
          id: c.categoria_id ?? c.id,
          name: c.nombre,
          img: c.imagen_url ? resolveImageUrl(c.imagen_url) : '/img/cat-placeholder.svg',
        }));
        if (alive) setCats(mapped);
      } catch (e) {
        if (alive) setCatsError('No se pudieron cargar las categorías destacadas');
      } finally {
        if (alive) setCatsLoading(false);
      }
    }
    loadCats();
    return () => {
      alive = false;
    };
  }, []);
  return (
    <>
      <HomeBanner />
      <div>
        {/* Hero */}
        <section
          style={{
            background: 'linear-gradient(90deg, #131313 60%, #1e88e5 100%)',
            color: '#fff',
            padding: '3.5rem 0 2.5rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: 38, fontWeight: 800, marginBottom: 12 }}>¡Equípate para ganar!</h1>
          <p style={{ fontSize: 20, color: '#e0e0e0', marginBottom: 28 }}>
            Todo lo que necesitas para tu deporte favorito, en un solo lugar.
          </p>
          <Link
            to="/productos"
            style={{
              background: '#fff',
              color: '#131313',
              fontWeight: 700,
              padding: '0.8rem 2.2rem',
              borderRadius: 30,
              fontSize: 18,
              textDecoration: 'none',
              boxShadow: '0 2px 12px rgba(30,136,229,0.08)',
              transition: 'background 0.2s',
            }}
          >
            Ver productos
          </Link>
        </section>
        {/* Categorías destacadas */}
        <section style={{ maxWidth: 1200, margin: '2.5rem auto', padding: '0 1rem' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 18, textAlign: 'center' }}>
            Categorías destacadas
          </h2>
          {catsError && (
            <div style={{ textAlign: 'center', color: '#c62828', marginBottom: 10, fontWeight: 700 }}>
              {catsError}
            </div>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 24,
              marginBottom: 10,
            }}
          >
            {(catsLoading ? Array.from({ length: 3 }) : cats).map((cat, idx) => (
              <Link
                to={cat ? `/productos?categoria_id=${encodeURIComponent(cat.id)}` : '#'}
                key={cat ? cat.id : idx}
                style={{
                  display: 'block',
                  background: '#fafafa',
                  borderRadius: 18,
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(30,136,229,0.07)',
                  textDecoration: 'none',
                  color: '#222',
                  transition: 'transform 0.15s',
                  cursor: 'pointer',
                }}
              >
                {catsLoading ? (
                  <div style={{ width: '100%', height: 140, background: '#eee' }} />
                ) : (
                  <img
                    src={cat.img}
                    alt={cat.name}
                    style={{
                      width: '100%',
                      height: 140,
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                )}
                <div style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>
                  {catsLoading ? (
                    <div style={{ height: 20, background: '#eee', borderRadius: 8 }} />
                  ) : (
                    cat.name
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Productos destacados */}
        <section style={{ maxWidth: 1200, margin: '2.5rem auto', padding: '0 1rem' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 18, textAlign: 'center' }}>
            Más populares
          </h2>
          {error && (
            <div style={{ textAlign: 'center', color: '#c62828', marginBottom: 10, fontWeight: 700 }}>
              {error}
            </div>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 24,
            }}
          >
            {(loading ? Array.from({ length: 3 }) : featured).map((prod, idx) => (
              <Link
                to={prod ? `/productos/${prod.id}` : '#'}
                key={prod ? prod.id : idx}
                style={{
                  display: 'block',
                  background: '#fff',
                  borderRadius: 18,
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(30,136,229,0.09)',
                  textDecoration: 'none',
                  color: '#222',
                  transition: 'transform 0.15s',
                  cursor: 'pointer',
                }}
              >
                {loading ? (
                  <div style={{ width: '100%', height: 160, background: '#eee' }} />
                ) : (
                  <img
                    src={prod.img}
                    alt={prod.name}
                    style={{
                      width: '100%',
                      height: 160,
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                )}
                <div style={{ padding: '1rem' }}>
                  {loading ? (
                    <div style={{ height: 20, background: '#eee', borderRadius: 8 }} />
                  ) : (
                    <>
                      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
                        {prod.name}
                      </div>
                      <div style={{ color: '#1e88e5', fontWeight: 700, fontSize: 17 }}>
                        {Number(prod.price).toLocaleString('es-ES', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                      </div>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section
          style={{
            background: 'linear-gradient(90deg, #1e88e5 60%, #131313 100%)',
            color: '#fff',
            padding: '2.5rem 0 2rem',
            textAlign: 'center',
            marginTop: 40,
          }}
        >
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>
            ¿Listo para tu próxima meta?
          </h2>
          <p style={{ fontSize: 18, color: '#e0e0e0', marginBottom: 22 }}>
            Descubre ofertas exclusivas y productos de calidad.
          </p>
          <Link
            to="/productos"
            style={{
              background: '#fff',
              color: '#1e88e5',
              fontWeight: 700,
              padding: '0.7rem 2rem',
              borderRadius: 30,
              fontSize: 17,
              textDecoration: 'none',
              boxShadow: '0 2px 12px rgba(30,136,229,0.08)',
              transition: 'background 0.2s',
            }}
          >
            Comprar ahora
          </Link>
        </section>
      </div>
    </>
  );
}
