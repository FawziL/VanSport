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
      <HomeBanner/>
      
      <div className="min-h-screen">
        {/* Hero Section - Con colores deportivos */}
        <section className="bg-gradient-to-br from-[#1e3a8a] via-[#dc2626] to-[#16a34a] text-white py-20 pb-16 text-center relative overflow-hidden">
          {/* Elementos deportivos decorativos */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border-4 border-white rounded-full"></div>
            <div className="absolute bottom-20 right-16 w-16 h-16 border-2 border-white rotate-45"></div>
            <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white rounded-full"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              ¡<span className="text-yellow-300">Equípate</span> para <span className="text-orange-400">ganar</span>!
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-8 font-medium">
              Todo lo que necesitas para tu deporte favorito, en un solo lugar.
            </p>
            <Link
              to="/productos"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-black py-4 px-12 rounded-full text-lg no-underline shadow-2xl shadow-orange-500/30 transition-all duration-300 inline-block hover:scale-105 hover:shadow-orange-500/50"
            >
              Explorar Productos 🏆
            </Link>
          </div>
        </section>

        {/* Separador decorativo */}
        <div className="bg-gradient-to-r from-blue-600 via-red-500 to-green-500 h-2 w-full"></div>

        {/* Categorías destacadas */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                Categorías <span className="text-blue-600">Destacadas</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Descubre nuestra amplia gama de equipamiento deportivo para cada disciplina
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-green-500 mx-auto mt-4 rounded-full"></div>
            </div>
            
            {catsError && (
              <div className="text-center text-red-600 mb-6 font-bold bg-red-50 py-3 px-6 rounded-lg max-w-md mx-auto">
                {catsError}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
              {(catsLoading ? Array.from({ length: 6 }) : cats).map((cat, idx) => (
                <Link
                  to={cat ? `/productos?categoria_id=${encodeURIComponent(cat.id)}` : '#'}
                  key={cat ? cat.id : idx}
                  className="group block bg-white rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50 no-underline text-gray-800 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 border border-gray-100"
                >
                  {catsLoading ? (
                    <div className="w-full h-40 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                  ) : (
                    <div className="relative overflow-hidden">
                      <img
                        src={cat.img}
                        alt={cat.name}
                        className="w-full h-40 object-cover block group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  )}
                  <div className="p-5 text-center">
                    {catsLoading ? (
                      <div className="h-6 bg-gray-200 rounded-lg animate-pulse" />
                    ) : (
                      <span className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 text-sm md:text-base">
                        {cat.name}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Separador con patrón deportivo */}
        <div className="bg-gray-900 py-3">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center space-x-6 text-white text-sm">
              <span className="flex items-center">⚽ Fútbol</span>
              <span className="flex items-center">🏀 Baloncesto</span>
              <span className="flex items-center">🎾 Tenis</span>
              <span className="flex items-center">🏃 Atletismo</span>
              <span className="flex items-center">🏊 Natación</span>
            </div>
          </div>
        </div>

        {/* Productos destacados */}
        <section className="bg-gradient-to-b from-white to-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                Productos <span className="text-red-600">Populares</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Los artículos más vendidos y mejor valorados por nuestra comunidad deportiva
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-orange-500 mx-auto mt-4 rounded-full"></div>
            </div>
            
            {error && (
              <div className="text-center text-red-600 mb-6 font-bold bg-red-50 py-3 px-6 rounded-lg max-w-md mx-auto">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(loading ? Array.from({ length: 3 }) : featured).map((prod, idx) => (
                <Link
                  to={prod ? `/productos/${prod.id}` : '#'}
                  key={prod ? prod.id : idx}
                  className="group block bg-white rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50 no-underline text-gray-800 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-red-500/20 border border-gray-100"
                >
                  {loading ? (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                  ) : (
                    <div className="relative overflow-hidden">
                      <img
                        src={prod.img}
                        alt={prod.name}
                        className="w-full h-48 object-cover block group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        POPULAR
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </div>
                  )}
                  <div className="p-6">
                    {loading ? (
                      <>
                        <div className="h-6 bg-gray-200 rounded-lg animate-pulse mb-3" />
                        <div className="h-7 bg-gray-200 rounded-lg animate-pulse" />
                      </>
                    ) : (
                      <>
                        <div className="font-bold text-xl mb-3 text-gray-900 group-hover:text-red-600 transition-colors duration-200 line-clamp-2">
                          {prod.name}
                        </div>
                        <div className="text-green-600 font-black text-2xl">
                          {Number(prod.price).toLocaleString('es-ES', {
                            style: 'currency',
                            currency: 'USD',
                          })}
                        </div>
                        <div className="mt-4 flex items-center text-sm text-gray-500">
                          <span className="text-yellow-400">★★★★★</span>
                          <span className="ml-2">(128 reviews)</span>
                        </div>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Botón ver más productos */}
            <div className="text-center mt-12">
              <Link
                to="/productos"
                className="bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold py-3 px-8 rounded-full text-lg no-underline shadow-lg transition-all duration-300 inline-flex items-center hover:scale-105 hover:shadow-xl"
              >
                Ver Todos los Productos
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Banner de características */}
        <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="text-xl font-black mb-2">Envío Rápido</h3>
                <p className="text-blue-100">Entrega en 24-48 horas</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-xl font-black mb-2">Calidad Garantizada</h3>
                <p className="text-blue-100">Productos de primeras marcas</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">💯</span>
                </div>
                <h3 className="text-xl font-black mb-2">Satisfacción</h3>
                <p className="text-blue-100">30 días de devolución</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white py-20 text-center relative overflow-hidden">
          {/* Elementos decorativos */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 right-1/4 w-32 h-32 border-4 border-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/3 left-1/3 w-24 h-24 border-2 border-white rotate-45"></div>
          </div>
          
          <div className="max-w-3xl mx-auto px-4 relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              ¿Listo para tu <span className="text-yellow-300">próxima meta</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Únete a miles de deportistas que ya confían en nosotros para alcanzar sus objetivos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/productos"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white font-black py-4 px-10 rounded-full text-lg no-underline shadow-2xl shadow-green-500/30 transition-all duration-300 inline-flex items-center hover:scale-105 hover:shadow-green-500/50"
              >
                Comprar Ahora 🏅
              </Link>
              <Link
                to="/categorias"
                to="/productos"
                className="border-2 border-white text-white font-bold py-4 px-10 rounded-full text-lg no-underline transition-all duration-300 inline-flex items-center hover:bg-white hover:text-gray-900"
              >
                Ver Ofertas
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}