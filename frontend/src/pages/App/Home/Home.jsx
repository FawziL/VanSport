import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appService } from '@/services/routes';
import { resolveImageUrl } from '@/utils/resolveUrl';
import HomeBanner from '@/components/HomeBanner';
import { StarRow } from '@/utils/reviews';
import { useTranslation } from 'react-i18next';
import { locPath } from '@/utils/localePath';

export default function Home() {
  const { t } = useTranslation('home');
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
        const data = await appService.products.list({ destacado: 1, activo: 1 });
        const items = Array.isArray(data) ? data : data?.results || [];
        const top3 = items.slice(0, 3).map((p) => ({
          id: p.productId ?? p.id,
          name: p.name,
          price: p.price,
          img: resolveImageUrl(p.imageUrl || p.imagen),
        }));

        const enriched = await Promise.all(
          top3.map(async (p) => {
            try {
              const rev = await appService.reseñas.list({ productId: p.id });
              const arr = Array.isArray(rev) ? rev : rev?.results || [];
              if (arr.length > 0) {
                const sum = arr.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
                return { ...p, avgRating: sum / arr.length, reviewsCount: arr.length };
              }
              return { ...p, avgRating: 0, reviewsCount: 0 };
            } catch {
              return { ...p, avgRating: 0, reviewsCount: 0 };
            }
          })
        );

        if (alive) setFeatured(enriched);
      } catch {
        if (alive) setError(t('error.cargarDestacados'));
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [t]);

  useEffect(() => {
    let alive = true;
    async function loadCats() {
      setCatsLoading(true);
      setCatsError('');
      try {
        const data = await appService.categories.list({ destacado: 1 });
        const items = Array.isArray(data) ? data : data?.results || [];
        const mapped = items.slice(0, 6).map((c) => ({
          id: c.categoryId ?? c.id,
          name: c.name,
          img: c.imageUrl ? resolveImageUrl(c.imageUrl) : '/img/cat-placeholder.svg',
        }));
        if (alive) setCats(mapped);
      } catch {
        if (alive) setCatsError(t('error.cargarCategorias'));
      } finally {
        if (alive) setCatsLoading(false);
      }
    }
    loadCats();
    return () => {
      alive = false;
    };
  }, [t]);

  return (
    <>
      <HomeBanner />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#d97706_0%,_transparent_60%)] opacity-15" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#d97706_0%,_transparent_50%)] opacity-10" />
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">
          <span className="inline-block text-xs font-semibold tracking-[0.3em] uppercase text-white mb-6">
            {t('hero.subtitulo')}
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            {t('hero.titulo')}
          </h1>
          <Link
            to={locPath('/productos')}
            className="inline-flex items-center gap-3 bg-amber-600 hover:bg-amber-500 !text-white font-semibold px-8 py-4 rounded-lg text-base no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-600/30"
          >
            {t('hero.explorar')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              {t('categorias.titulo')}
            </h2>
            <p className="text-slate-900/60 max-w-xl mx-auto">
              {t('categorias.subtitulo')}
            </p>
          </div>

          {catsError && (
            <div className="text-center text-red-600 mb-8 font-medium bg-red-50 py-3 px-6 rounded-lg max-w-md mx-auto">
              {catsError}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(catsLoading ? Array.from({ length: 6 }) : cats).map((cat, idx) => (
              <Link
                to={cat ? `${locPath('/productos')}?categoryId=${encodeURIComponent(cat.id)}` : '#'}
                key={cat ? cat.id : idx}
                className="group relative flex flex-col items-center bg-white rounded-xl overflow-hidden no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-600/15 border border-slate-200 hover:border-amber-500"
              >
                {catsLoading ? (
                  <div className="w-full aspect-square bg-slate-100 animate-pulse" />
                ) : (
                  <>
                    <div className="w-full aspect-square overflow-hidden bg-slate-50">
                      <img
                        src={cat.img}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="w-full px-3 py-3 text-center bg-slate-900">
                      <span className="text-sm font-semibold text-white transition-colors">
                        {cat.name}
                      </span>
                    </div>
                  </>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#d97706_0%,_transparent_70%)] opacity-5" />
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1 ring-1 ring-white/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{t('beneficios.envioTitulo')}</h3>
                <p className="text-sm text-white">{t('beneficios.envioDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1 ring-1 ring-white/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{t('beneficios.calidadTitulo')}</h3>
                <p className="text-sm text-white">{t('beneficios.calidadDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1 ring-1 ring-white/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{t('beneficios.satisfaccionTitulo')}</h3>
                <p className="text-sm text-white">{t('beneficios.satisfaccionDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              {t('populares.titulo')}
            </h2>
            <p className="text-slate-900/60 max-w-xl mx-auto">
              {t('populares.subtitulo')}
            </p>
          </div>

          {error && (
            <div className="text-center text-red-600 mb-8 font-medium bg-red-50 py-3 px-6 rounded-lg max-w-md mx-auto">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(loading ? Array.from({ length: 3 }) : featured).map((prod, idx) => (
              <Link
                to={prod ? locPath(`/productos/${prod.id}`) : '#'}
                key={prod ? prod.id : idx}
                className="group block bg-white rounded-xl overflow-hidden no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-600/15 border border-slate-200 hover:border-amber-500"
              >
                {loading ? (
                  <div className="w-full aspect-[4/3] bg-slate-100 animate-pulse" />
                ) : (
                  <div className="relative overflow-hidden">
                    <img
                      src={prod.img}
                      alt={prod.name}
                      className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 bg-amber-600 text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wider uppercase shadow-lg shadow-amber-600/20">
                      {t('populares.badge')}
                    </div>
                  </div>
                )}
                <div className="p-6 bg-slate-900">
                  {loading ? (
                    <>
                      <div className="h-5 bg-white/10 rounded animate-pulse mb-3" />
                      <div className="h-6 bg-white/10 rounded animate-pulse w-1/2" />
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold text-white text-lg mb-3 leading-snug line-clamp-2">
                        {prod.name}
                      </h3>
                      <div className="text-2xl font-bold text-white">
                        {Number(prod.price).toLocaleString('es-ES', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10">
                        {prod.reviewsCount > 0 ? (
                          <div className="flex items-center gap-2 text-sm">
                            <StarRow value={prod.avgRating || 0} size={14} />
                            <span className="text-white font-semibold">
                              {(prod.avgRating || 0).toFixed(1)}
                            </span>
                            <span className="text-white/40">·</span>
                            <span className="text-white/70">{t('populares.resenas', { count: prod.reviewsCount })}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-white/70">{t('populares.sinResenas')}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link
              to={locPath('/productos')}
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 !text-white font-semibold px-8 py-3 rounded-lg text-sm no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-600/25"
            >
              {t('populares.verTodos')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#d97706_0%,_transparent_60%)] opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('cta.titulo')}
          </h2>
          <p className="text-white text-lg mb-10 max-w-xl mx-auto">
            {t('cta.subtitulo')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={locPath('/productos')}
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 !text-white font-semibold px-8 py-4 rounded-lg text-base no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-600/30"
            >
              {t('cta.comprar')}
            </Link>
            <Link
              to={`${locPath('/productos')}?oferta=1&page_size=6`}
              className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 !text-white hover:!text-white font-semibold px-8 py-4 rounded-lg text-base no-underline transition-all duration-300 hover:-translate-y-0.5"
            >
              {t('cta.ofertas')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
