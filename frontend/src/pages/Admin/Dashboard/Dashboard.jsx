import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: 12,
        padding: '1rem',
        boxShadow: '0 2px 12px rgba(30,136,229,0.06)',
      }}
    >
      <div style={{ color: '#666', fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

const sections = [
  { to: '/admin/categorias', label: 'Categorias', desc: 'Gestiona las categorías del catálogo' },
  { to: '/admin/productos', label: 'Productos', desc: 'Crea, edita y publica productos' },
  { to: '/admin/pedidos', label: 'Pedidos', desc: 'Revisa y administra pedidos' },
  { to: '/admin/usuarios', label: 'Usuarios', desc: 'Gestiona cuentas y roles' },
  { to: '/admin/ventas', label: 'Ventas', desc: 'Resumen y estadísticas de ventas' },
  { to: '/admin/resenas', label: 'Reseñas', desc: 'Modera y responde reseñas' },
  { to: '/admin/envios', label: 'Envíos', desc: 'Configura y monitorea envíos' },
  { to: '/admin/notificaciones', label: 'Notificaciones', desc: 'Mensajería y avisos a clientes' },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <>
      {/* Header superior con “Bienvenido” */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
            Bienvenido{user?.nombre ? `, ${user.nombre} ${user.apellido}` : ''}
          </h1>
          <div style={{ color: '#666' }}>Gestiona tu tienda desde el panel de administración.</div>
        </div>
        <div>
          <span style={{ color: '#888', fontSize: 13 }}>
            {new Date().toLocaleDateString('es-ES')}
          </span>
        </div>
      </div>

      {/* Quick stats demo */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <StatCard title="Productos" value="—" />
        <StatCard title="Pedidos hoy" value="—" />
        <StatCard title="Ventas del mes" value="—" />
        <StatCard title="Usuarios" value="—" />
      </div>

      {/* Tarjetas de secciones */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {sections.map((s) => (
          <Link
            to={s.to}
            key={s.to}
            style={{
              display: 'block',
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 12,
              padding: '1rem',
              textDecoration: 'none',
              color: '#222',
              boxShadow: '0 2px 12px rgba(30,136,229,0.06)',
              transition: 'transform 0.15s',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{s.label}</div>
            <div style={{ color: '#666', fontSize: 14 }}>{s.desc}</div>
            <div style={{ marginTop: 12 }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.4rem 0.7rem',
                  borderRadius: 8,
                  background: '#131313',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Ver →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
