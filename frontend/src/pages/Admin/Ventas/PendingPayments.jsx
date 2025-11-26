import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/routes';
import Pagination from '@/components/Pagination';
import PageSizeSelector from '@/components/PageSizeSelector';
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

export default function PendingPayments() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    adminService.transacciones
      .list()
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.results || [];
        const pending = arr.filter((t) => String(t.estado || '').toLowerCase() === 'pendiente');
        setItems(pending);
        const totalPages = Math.max(1, Math.ceil(pending.length / pageSize));
        setPages(totalPages);
        setPage((prev) => Math.min(prev, totalPages));
      })
      .catch(() => setError('No se pudieron cargar los pagos pendientes'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    setPages(totalPages);
    setPage((prev) => Math.min(prev, totalPages));
    // eslint-disable-next-line
  }, [items, pageSize]);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = items.slice(start, end);

  const fmt = {
    date: (s) =>
      s
        ? new Date(s).toLocaleString('es-ES', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : '-',
    money: (n) => (n != null ? `$${Number(n).toFixed(2)}` : '-'),
  };

  const getUserLabel = (t) => {
    const nombre = t.usuario_nombre || '';
    const apellido = t.usuario_apellido || '';
    const email = t.usuario_email || '';
    const base = `${nombre} ${apellido}`.trim();
    const id = t.usuario_id != null ? t.usuario_id : null;
    const emailPart = email ? ` - ${email}` : '';
    return base || id != null ? `${base}${emailPart}${id != null ? ` (ID ${id})` : ''}` : '-';
  };

  return (
    <div className="max-w-[1200px] mx-auto my-10 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold">Pagos Pendientes</h1>
      </div>

      {/* Page Size Selector */}
      <div className="flex justify-end mb-3">
        <PageSizeSelector
          value={pageSize}
          onChange={setPageSize}
          options={[5, 10, 20, 50]}
          label="Por página"
        />
      </div>

      {/* Error Message */}
      {error && <div className="text-red-700 font-bold mb-3">{error}</div>}

      {/* Table */}
      <Table>
        <TableHead>
          <TableHeader width="10%">ID</TableHeader>
          <TableHeader width="12%">Pedido</TableHeader>
          <TableHeader width="30%">Usuario</TableHeader>
          <TableHeader width="12%">Monto</TableHeader>
          <TableHeader width="14%">Método</TableHeader>
          <TableHeader width="12%">Estado</TableHeader>
          <TableHeader width="10%">Fecha</TableHeader>
          <TableHeader width="10%" align="center">
            Acciones
          </TableHeader>
        </TableHead>

        <TableBody
          loading={loading}
          empty={pageItems.length === 0}
          colSpan={8}
          loadingText="Cargando pagos pendientes..."
          emptyText="No hay pagos pendientes."
        >
          {pageItems.map((t) => (
            <TableRow key={t.transaccion_id}>
              <TableCell className="whitespace-nowrap">{t.transaccion_id}</TableCell>
              <TableCell className="whitespace-nowrap">{t.pedido ?? '-'}</TableCell>
              <TableCell className="break-words">{getUserLabel(t)}</TableCell>
              <TableCell className="whitespace-nowrap font-medium">{fmt.money(t.monto)}</TableCell>
              <TableCell className="break-words">{t.metodo_pago}</TableCell>
              <TableCell className="break-words">
                <StatusBadge estado={t.estado} />
              </TableCell>
              <TableCell className="whitespace-nowrap">{fmt.date(t.fecha_transaccion)}</TableCell>
              <TableCell align="center">
                <ActionButton
                  variant="primary"
                  onClick={() => navigate(`/admin/ventas/editar/${t.transaccion_id}`)}
                >
                  Revisar
                </ActionButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Pagination page={page} pages={pages} onChange={setPage} showNumbers />
    </div>
  );
}
