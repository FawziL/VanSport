import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { adminService, appService } from '@/services/routes';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import StatCard from '@/components/admin/StatCard';
import sections from '@/utils/adminSections';

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

  const [bcv, setBcv] = useState(null);

  useEffect(() => {
    appService.utils
      .dolarBcvHoy()
      .then(setBcv)
      .catch(() => setBcv(null));
  }, []);

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
    <div className="space-y-6 p-6">
      {/* Header superior con "Bienvenido" */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-600">
            Bienvenido{user?.nombre ? `, ${user.nombre} ${user.apellido}` : ''}
          </h1>
          <div className="text-gray-600 mt-1">
            Gestiona tu tienda desde el panel de administración.
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggleButton />
          <span className="text-gray-500 text-sm">{new Date().toLocaleDateString('es-ES')}</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
        <StatCard
          title="Dólar (BCV hoy)"
          value={bcv ? `Bs ${Number(bcv.valor).toFixed(2)}` : '—'}
          note={bcv?.fecha}
        />
        <StatCard title="Pagos pendientes" value={pendingCount} to="/admin/ventas/pendientes" />
        <StatCard title="Productos" value={stats.productos} to="/admin/productos" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sections.map((s) => (
          <Link
            to={s.to}
            key={s.to}
            className="block bg-white border border-gray-200 rounded-xl p-6 no-underline text-gray-900 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            <div className="text-gray-800 text-lg font-extrabold mb-2">{s.label}</div>
            <div className="text-gray-600 text-sm mb-4">{s.desc}</div>
            <div>
              <span className="w-20 inline-block px-3 py-2 bg-gray-900 text-white font-bold text-sm rounded-lg">
                Ver
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
