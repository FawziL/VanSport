import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appService } from '@/services/auth';
import { useAuth } from '@/context/AuthContext';
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  ActionButton,
} from '@/components/ui/Table';
import StatusBadge from '@/components/StatusBadge';

function formatPrice(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return '-';
  return num.toLocaleString('es-ES', { style: 'currency', currency: 'USD' });
}

function formatDate(d) {
  try {
    const dt = new Date(d);
    if (isNaN(dt)) return String(d ?? '');
    return dt.toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return String(d ?? '');
  }
}

export default function MisPedidos() {
  const navigate = useNavigate();
  const { isAuthenticated, ensureUserLoaded } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
        return;
      }
      const ok = await ensureUserLoaded();
      if (!ok) {
        navigate('/login', { replace: true });
        return;
      }
      setLoading(true);
      setErrMsg('');
      try {
        const data = await appService.pedidos.list({ ordering: '-fecha_pedido' });
        const results = Array.isArray(data) ? data : data.results || [];
        if (alive) setItems(results);
      } catch (e) {
        if (alive) setErrMsg('No se pudieron cargar tus pedidos');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

  return (
    <div className="max-w-[1100px] mx-auto my-8 px-4">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">Mis Pedidos</h1>

      {errMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-4 font-bold">
          {errMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando pedidos...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-gray-600 mb-4">Aún no tienes pedidos.</p>
          <button
            onClick={() => navigate('/productos')}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Productos
          </button>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableHeader width="15%">#</TableHeader>
            <TableHeader width="25%">Fecha</TableHeader>
            <TableHeader width="20%">Estado</TableHeader>
            <TableHeader width="20%" align="right">
              Total
            </TableHeader>
            <TableHeader width="20%" align="center">
              Acciones
            </TableHeader>
          </TableHead>

          <TableBody loading={false} empty={false} colSpan={5}>
            {items.map((p) => (
              <TableRow key={p.pedido_id}>
                <TableCell className="font-semibold">#{p.pedido_id}</TableCell>
                <TableCell>{formatDate(p.fecha_pedido)}</TableCell>
                <TableCell>
                  <StatusBadge estado={p.estado} variant="order" />
                </TableCell>
                <TableCell align="right" className="font-bold text-gray-900">
                  {formatPrice(p.total)}
                </TableCell>
                <TableCell align="center">
                  <ActionButton variant="edit" onClick={() => navigate(`/pedidos/${p.pedido_id}`)}>
                    Ver Detalles
                  </ActionButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
