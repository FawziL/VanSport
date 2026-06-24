import { Link } from 'react-router-dom';
import { resolveImageUrl } from '@/utils/resolveUrl';

export default function CardProduct({ producto }) {
  const price = parseFloat(producto.price) || 0;
  const salePrice = parseFloat(producto.salePrice) || 0;
  const discount = salePrice > 0 && price > 0 ? Math.round(((price - salePrice) / price) * 100) : 0;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 2px 12px rgba(30,136,229,0.09)',
        overflow: 'hidden',
        width: 260,
        margin: '0 auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 380,
      }}
    >
      {discount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: '#e53935',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            borderRadius: 8,
            padding: '2px 10px',
            zIndex: 2,
          }}
        >
          {`${discount}% OFF`}
        </span>
      )}
      <Link to={`/productos/${producto.id}`}>
        <img
          src={resolveImageUrl(producto.imageUrl)}
          alt={producto.name}
          style={{
            width: '100%',
            height: 180,
            objectFit: 'cover',
            display: 'block',
          }}
        />
        <div style={{ padding: '0.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 6, marginTop: 6 }}>
            {producto.name}
          </h3>
          <div style={{ marginBottom: 8 }}>
            {salePrice > 0 ? (
              <>
                <span
                  style={{
                    textDecoration: 'line-through',
                    color: '#888',
                    marginRight: 8,
                    fontSize: 15,
                  }}
                >
                  ${price}
                </span>
                <span style={{ color: '#e53935', fontWeight: 700, fontSize: 18 }}>
                  ${salePrice}
                </span>
              </>
            ) : (
              <span style={{ color: '#1e88e5', fontWeight: 700, fontSize: 18 }}>
                ${price}
              </span>
            )}
          </div>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            {producto.categoryId || ''}
          </div>
          <div style={{ fontSize: 13, color: producto.stock > 0 ? '#43a047' : '#e53935' }}>
            {producto.stock > 0 ? 'Disponible' : 'Agotado'}
          </div>
        </div>
      </Link>
      <div style={{ flexGrow: 1 }} />
      <div style={{ padding: '0 1rem 1rem' }}>
        <Link
          to={`/productos/${producto.id}`}
          style={{
            display: 'block',
            width: '100%',
            background: producto.stock > 0 ? '#1e88e5' : '#aaa',
            color: '#fff',
            textAlign: 'center',
            borderRadius: 8,
            padding: '0.6rem 0',
            fontWeight: 700,
            textDecoration: 'none',
            pointerEvents: producto.stock > 0 ? 'auto' : 'none',
            opacity: producto.stock > 0 ? 1 : 0.7,
            marginTop: 8,
          }}
        >
          Ver detalle
        </Link>
      </div>
    </div>
  );
}
