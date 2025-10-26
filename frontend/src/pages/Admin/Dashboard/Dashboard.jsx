import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { adminService } from '@/services/auth';
import { ThemeToggleButton } from '@/components/ThemeToggleButton'; // <-- import

function StatCard({ title, value, to, note }) {
  const content = (
    <div
      style={{
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: 12,
        padding: '1rem',
        boxShadow: '0 2px 12px rgba(30,136,229,0.06)',
        color: 'black',
        height: '76px',
      }}
    >
      <div style={{ color: '#666', fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
      {note ? (
        <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{note}</div>
      ) : null}
    </div>
  );
  return to ? (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
      {content}
    </Link>
  ) : (
    content
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
  { to: '/admin/reportes', label: 'Reportes', desc: 'Gestiona reportes de fallas' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [stats, setStats] = useState({
    productos: 0,
    ventasMes: 0,
    ventasDesde: '',
    usuariosTotal: 0,
    usuariosMes: 0,
  });

  // Pagos pendientes
  useEffect(() => {
    let alive = true;
    adminService.transacciones
      .list()
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.results || [];
        const cnt = arr.filter((t) => String(t.estado || '').toLowerCase() === 'pendiente').length;
        if (alive) setPendingCount(cnt);
      })
      .catch(() => {
        if (alive) setPendingCount(0);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Stats: productos, ventas del mes, usuarios (total y del mes)
  useEffect(() => {
    let alive = true;
    Promise.all([
      adminService.productos.list(),
      adminService.pedidos.list(),
      adminService.usuarios.list(),
    ])
      .then(([prodData, pedData, usrData]) => {
        if (!alive) return;

        const prods = Array.isArray(prodData) ? prodData : prodData.results || [];
        const pedidos = Array.isArray(pedData) ? pedData : pedData.results || [];
        const usuarios = Array.isArray(usrData) ? usrData : usrData.results || [];

        const prodIds = new Set(prods.map((p) => p.producto_id ?? p.id ?? JSON.stringify(p)));
        const productos = prodIds.size;

        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth(); // 0-11

        const parseDate = (s) => {
          if (!s) return null;
          const d = new Date(s);
          return isNaN(d) ? null : d;
        };

        const ventasMes = pedidos.filter((p) => {
          const d = parseDate(p.fecha_pedido);
          return d && d.getFullYear() === y && d.getMonth() === m;
        }).length;

        // earliest order date
        const fechas = pedidos
          .map((p) => parseDate(p.fecha_pedido))
          .filter(Boolean)
          .sort((a, b) => a - b);
        const ventasDesde = fechas.length ? fechas[0].toLocaleDateString('es-ES') : '';

        const usuariosTotal = usuarios.length;
        const usuariosMes = usuarios.filter((u) => {
          const d = parseDate(u.fecha_registro || u.created_at || u.fecha_creacion);
          return d && d.getFullYear() === y && d.getMonth() === m;
        }).length;

        setStats({ productos, ventasMes, ventasDesde, usuariosTotal, usuariosMes });
      })
      .catch(() => {
        if (alive) {
          setStats((s) => ({ ...s }));
        }
      });
    return () => {
      alive = false;
    };
  }, []);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggleButton /> {/* <-- botón modo oscuro */}
          <span style={{ color: '#888', fontSize: 13 }}>
            {new Date().toLocaleDateString('es-ES')}
          </span>
        </div>
      </div>

      {/* Quick stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <StatCard
          title="Pagos pendientes"
          value={pendingCount}
          to="/admin/ventas/pendientes"
        />
        <StatCard title="Productos" 
        value={stats.productos} 
        to="/admin/productos"/>
        <StatCard
          title="Ventas totales"
          value={stats.ventasMes}
          note={stats.ventasDesde ? `desde ${stats.ventasDesde}` : ''}
        />
        <StatCard
          title="Usuarios Registrados"
          value={stats.usuariosTotal}
          note={stats.usuariosMes ? `${stats.usuariosMes} desde ${stats.ventasDesde}` : ''}
        />
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
