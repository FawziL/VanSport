import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { http } from '@/config/api';

function formatPrice(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return '-';
  return num.toLocaleString('es-ES', { style: 'currency', currency: 'USD' });
}

export default function VerProducto() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Asunción de endpoint: ajusta según tu API real
  // Por ejemplo: /ecommerce/productos/:id/ o /productos/:id/
  const endpoint = useMemo(() => `/productos/${id}/`, [id]);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setErrMsg('');
      try {
        // Esperamos una respuesta con fields:
        // id, nombre, descripcion, precio, precio_oferta, categoria, stock,
        // imagen (string principal), imagenes (array de strings o {image_path})
        const data = await http.get(endpoint);
        // Normaliza imágenes: admite array de strings o array de objetos {image_path}
        const images =
          Array.isArray(data.imagenes)
            ? data.imagenes.map((img) => (typeof img === 'string' ? img : img.image_path))
            : [];

        const normalized = {
          id: data.id,
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio,
          precio_oferta: data.precio_oferta,
          categoria: data.categoria,
          stock: data.stock,
          imagen: data.imagen,
          imagenes: images,
        };

        if (!alive) return;
        setProducto(normalized);
        setSelectedImage(normalized.imagen || normalized.imagenes[0] || '');
      } catch (err) {
        if (!alive) return;
        const backendMsg = err?.response?.data;
        const msg =
          typeof backendMsg === 'object'
            ? Object.entries(backendMsg)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                .join(' | ')
            : backendMsg || err.message || 'Error al cargar el producto';
        setErrMsg(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (id) load();
    return () => {
      alive = false;
    };
  }, [id, endpoint]);

  const allImages = useMemo(() => {
    if (!producto) return [];
    const list = [producto.imagen, ...producto.imagenes].filter(Boolean);
    return list;
  }, [producto]);

  useEffect(() => {
    // Pre-carga de imágenes para suavidad
    allImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [allImages]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setCurrentImageIndex(Math.max(0, allImages.indexOf(selectedImage)));
  };

  const shareLink = typeof window !== 'undefined' ? window.location.href : '';

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ width: 120, height: 16, background: '#eee', borderRadius: 6, marginBottom: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div>
            <div style={{ width: '100%', height: 360, background: '#eee', borderRadius: 12, marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ width: 80, height: 60, background: '#eee', borderRadius: 8 }} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ width: '80%', height: 24, background: '#eee', borderRadius: 8, marginBottom: 12 }} />
            <div style={{ width: '60%', height: 20, background: '#eee', borderRadius: 8, marginBottom: 12 }} />
            <div style={{ width: '100%', height: 160, background: '#eee', borderRadius: 12 }} />
          </div>
        </div>
      </div>
    );
  }

  if (errMsg) {
    return (
      <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ background: '#ffecec', border: '1px solid #ffb4b4', color: '#c62828', borderRadius: 12, padding: '1rem' }}>
          {errMsg}
        </div>
        <div style={{ marginTop: 12 }}>
          <Link to="/productos" style={{ textDecoration: 'none', color: '#1e88e5', fontWeight: 700 }}>
            Volver a productos
          </Link>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem', textAlign: 'center' }}>
        No se encontró el producto.
        <div style={{ marginTop: 12 }}>
          <Link to="/productos" style={{ textDecoration: 'none', color: '#1e88e5', fontWeight: 700 }}>
            Volver a productos
          </Link>
        </div>
      </div>
    );
  }

  const discountPct =
    producto.precio_oferta && producto.precio
      ? Math.round(((producto.precio - producto.precio_oferta) / producto.precio) * 100)
      : null;

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 1rem' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Link to="/" style={{ color: '#1e88e5', textDecoration: 'none', fontWeight: 600 }}>Inicio</Link>
        <span style={{ color: '#888' }}>/</span>
        <Link to="/productos" style={{ color: '#1e88e5', textDecoration: 'none', fontWeight: 600 }}>Productos</Link>
        <span style={{ color: '#888' }}>/</span>
        <span style={{ color: '#333', fontWeight: 600 }}>{producto.nombre}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Galería */}
        <div>
          <div style={{ position: 'relative' }}>
            {discountPct !== null && (
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
                {discountPct}% OFF
              </span>
            )}
            <div
              onClick={handleOpenModal}
              style={{
                width: '100%',
                height: 420,
                background: '#fafafa',
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'zoom-in',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={producto.nombre}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ color: '#999' }}>Sin imagen</div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 6 }}>
            {allImages.map((img, index) => (
              <button
                key={index}
                onMouseEnter={() => setSelectedImage(img)}
                onClick={() => setSelectedImage(img)}
                style={{
                  width: 90,
                  height: 70,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: selectedImage === img ? '2px solid #131313' : '2px solid transparent',
                  padding: 0,
                  cursor: 'pointer',
                  background: '#fff',
                }}
                aria-label={`Imagen ${index + 1}`}
              >
                <img src={img} alt={`Miniatura ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>

          {/* Descripción y atributos */}
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Descripción</h2>
            <p style={{ color: '#444', lineHeight: 1.6 }}>{producto.descripcion || 'Sin descripción.'}</p>

            {producto.atributos && Object.keys(producto.atributos).length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Detalles</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {Object.entries(producto.atributos).map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        background: '#f7f7f7',
                        border: '1px solid #eee',
                        borderRadius: 10,
                        padding: '0.75rem',
                      }}
                    >
                      <div style={{ color: '#666', fontSize: 13 }}>{label}</div>
                      <div style={{ fontWeight: 700 }}>{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: precio, stock, acciones */}
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{producto.nombre}</h1>
          <div style={{ color: '#666', marginBottom: 8 }}>{producto.categoria || 'Categoría'}</div>

          <div
            style={{
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 12,
              padding: '1rem',
              boxShadow: '0 2px 12px rgba(30,136,229,0.06)',
              marginBottom: 16,
            }}
          >
            {producto.precio_oferta ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ textDecoration: 'line-through', color: '#888' }}>{formatPrice(producto.precio)}</span>
                  <span style={{ color: '#e53935', fontWeight: 800, fontSize: 22 }}>
                    {formatPrice(producto.precio_oferta)}
                  </span>
                </div>
                {discountPct !== null && (
                  <div style={{ color: '#e53935', fontWeight: 700, fontSize: 13, marginTop: 4 }}>
                    Ahorra {discountPct}% vs. precio original
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#1e88e5', fontWeight: 800, fontSize: 22 }}>{formatPrice(producto.precio)}</div>
            )}

            <div
              style={{
                marginTop: 10,
                color: producto.stock > 0 ? '#43a047' : '#e53935',
                fontWeight: 700,
              }}
            >
              {producto.stock > 0 ? 'En stock' : 'Agotado'}
            </div>

            <button
              type="button"
              style={{
                marginTop: 12,
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: 10,
                border: 'none',
                background: producto.stock > 0 ? '#1e88e5' : '#aaa',
                color: '#fff',
                fontWeight: 800,
                cursor: producto.stock > 0 ? 'pointer' : 'not-allowed',
              }}
              disabled={producto.stock <= 0}
              onClick={() => {
                // TODO: integrar con carrito
                alert('Añadido al carrito (demo)');
              }}
            >
              Añadir al carrito
            </button>
          </div>

          {/* Compartir */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 12,
              padding: '1rem',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Compartir</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                }}
                style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: 10,
                  border: '1px solid #ddd',
                  background: '#fafafa',
                  cursor: 'pointer',
                }}
              >
                Copiar enlace
              </button>
              <button
                type="button"
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(shareLink)}`, '_blank');
                }}
                style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: 10,
                  border: '1px solid #ddd',
                  background: '#fafafa',
                  cursor: 'pointer',
                }}
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => {
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
                    '_blank'
                  );
                }}
                style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: 10,
                  border: '1px solid #ddd',
                  background: '#fafafa',
                  cursor: 'pointer',
                }}
              >
                Facebook
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = `mailto:?subject=${encodeURIComponent(
                    `Producto: ${producto.nombre}`
                  )}&body=${encodeURIComponent(`Mira este producto: ${shareLink}`)}`;
                }}
                style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: 10,
                  border: '1px solid #ddd',
                  background: '#fafafa',
                  cursor: 'pointer',
                }}
              >
                Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de imagen ampliada */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', maxWidth: 1200, width: '100%', maxHeight: '90vh' }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                right: 0,
                top: -40,
                color: '#fff',
                fontSize: 28,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <div style={{ position: 'relative', width: '100%', height: '70vh' }}>
              <img
                src={allImages[currentImageIndex]}
                alt={producto.nombre}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* Controles */}
            <button
              type="button"
              onClick={() =>
                setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
              }
              disabled={allImages.length <= 1}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.6)',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                cursor: 'pointer',
              }}
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setCurrentImageIndex((prev) => (prev + 1) % allImages.length)}
              disabled={allImages.length <= 1}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.6)',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                cursor: 'pointer',
              }}
              aria-label="Siguiente"
            >
              ›
            </button>

            <div
              style={{
                position: 'absolute',
                bottom: 12,
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#fff',
                background: 'rgba(0,0,0,0.4)',
                padding: '4px 10px',
                borderRadius: 999,
                fontWeight: 700,
              }}
            >
              {currentImageIndex + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}