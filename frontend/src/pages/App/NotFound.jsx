import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 680, margin: '4rem auto', marginTop: '12rem', textAlign: 'center', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Página no encontrada</h1>
      <p style={{ color: '#666', marginBottom: 20 }}>
        La ruta que intentaste abrir no existe. Verifica la URL o vuelve al inicio.
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        style={{
          padding: '0.6rem 1rem',
          borderRadius: 8,
          border: 'none',
          background: '#131313',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Ir al inicio
      </button>
    </div>
  );
}