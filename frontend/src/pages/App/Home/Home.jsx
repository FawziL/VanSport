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
        <section className="bg-gradient-to-r from-[#131313] from-60% to-[#1e88e5] to-100% text-white py-14 pb-10 text-center">
          <h1 className="text-4xl font-extrabold mb-3">¡Equípate para ganar!</h1>
          <p className="text-xl text-gray-300 mb-7">
            Todo lo que necesitas para tu deporte favorito, en un solo lugar.
          </p>
          <Link
            to="/productos"
            className="bg-white text-[#131313] font-bold py-3 px-9 rounded-full text-lg no-underline shadow-lg shadow-blue-500/20 transition-colors duration-200 inline-block hover:bg-gray-100"
          >
            Ver productos
          </Link>
        </section>

        {/* Categorías destacadas */}
        <section className="max-w-7xl mx-auto my-10 px-4">
          <h2 className="text-2xl font-bold mb-5 text-center">
            Categorías destacadas
          </h2>
          {catsError && (
            <div className="text-center text-red-700 mb-3 font-bold">
              {catsError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-3">
            {(catsLoading ? Array.from({ length: 3 }) : cats).map((cat, idx) => (
              <Link
                to={cat ? `/productos?categoria_id=${encodeURIComponent(cat.id)}` : '#'}
                key={cat ? cat.id : idx}
                className="block bg-gray-50 rounded-xl overflow-hidden shadow-md shadow-blue-500/10 no-underline text-gray-800 transition-transform duration-150 cursor-pointer hover:scale-105"
              >
                {catsLoading ? (
                  <div className="w-full h-36 bg-gray-200" />
                ) : (
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-36 object-cover block"
                  />
                )}
                <div className="p-4 text-center font-semibold">
                  {catsLoading ? (
                    <div className="h-5 bg-gray-200 rounded-lg" />
                  ) : (
                    cat.name
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Productos destacados */}
        <section className="max-w-7xl mx-auto my-10 px-4">
          <h2 className="text-2xl font-bold mb-5 text-center">
            Más populares
          </h2>
          {error && (
            <div className="text-center text-red-700 mb-3 font-bold">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(loading ? Array.from({ length: 3 }) : featured).map((prod, idx) => (
              <Link
                to={prod ? `/productos/${prod.id}` : '#'}
                key={prod ? prod.id : idx}
                className="block bg-white rounded-xl overflow-hidden shadow-md shadow-blue-500/20 no-underline text-gray-800 transition-transform duration-150 cursor-pointer hover:scale-105"
              >
                {loading ? (
                  <div className="w-full h-40 bg-gray-200" />
                ) : (
                  <img
                    src={prod.img}
                    alt={prod.name}
                    className="w-full h-40 object-cover block"
                  />
                )}
                <div className="p-4">
                  {loading ? (
                    <div className="h-5 bg-gray-200 rounded-lg" />
                  ) : (
                    <>
                      <div className="font-bold text-lg mb-2">
                        {prod.name}
                      </div>
                      <div className="text-blue-600 font-bold text-lg">
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
        <section className="bg-gradient-to-r from-[#1e88e5] from-60% to-[#131313] to-100% text-white py-10 pb-8 text-center mt-10">
          <h2 className="text-3xl font-extrabold mb-3">
            ¿Listo para tu próxima meta?
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            Descubre ofertas exclusivas y productos de calidad.
          </p>
          <Link
            to="/productos"
            className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full text-lg no-underline shadow-lg shadow-blue-500/20 transition-colors duration-200 inline-block hover:bg-gray-100"
          >
            Comprar ahora
          </Link>
        </section>
      </div>
    </>
  );
}