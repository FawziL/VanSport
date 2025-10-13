import { Link } from 'react-router-dom';

const categories = [
  { name: 'Ropa Deportiva', img: '/img/cat-ropa.jpg', to: '/productos?cat=ropa' },
  { name: 'Calzado', img: '/img/cat-calzado.jpg', to: '/productos?cat=calzado' },
  { name: 'Accesorios', img: '/img/cat-accesorios.jpg', to: '/productos?cat=accesorios' },
];

const featured = [
  {
    name: 'Camiseta Running Pro',
    img: '/img/prod-camiseta.jpg',
    price: 29.99,
    to: '/productos/1',
  },
  {
    name: 'Zapatillas Urban Sport',
    img: '/img/prod-zapatillas.jpg',
    price: 69.99,
    to: '/productos/2',
  },
  {
    name: 'Gorra Transpirable',
    img: '/img/prod-gorra.jpg',
    price: 14.99,
    to: '/productos/3',
  },
];

export default function Home() {
  return (
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

      {/* Categorías */}
      <section style={{ maxWidth: 1200, margin: '2.5rem auto', padding: '0 1rem' }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 18, textAlign: 'center' }}>
          Categorías destacadas
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
            marginBottom: 10,
          }}
        >
          {categories.map((cat) => (
            <Link
              to={cat.to}
              key={cat.name}
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
              <div style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>
                {cat.name}
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
          }}
        >
          {featured.map((prod) => (
            <Link
              to={prod.to}
              key={prod.name}
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
              <div style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{prod.name}</div>
                <div style={{ color: '#1e88e5', fontWeight: 700, fontSize: 17 }}>
                  ${prod.price.toFixed(2)}
                </div>
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
  );
}
