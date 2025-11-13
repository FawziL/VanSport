import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';
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

export default function ListOrders() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    adminService.pedidos
      .list()
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.results || [];
        setItems(arr);
        const totalPages = Math.max(1, Math.ceil(arr.length / pageSize));
        setPages(totalPages);
        setPage((prev) => Math.min(prev, totalPages));
      })
      .catch(() => setError('No se pudieron cargar los pedidos'))
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

  const getUserLabel = (p) => {
    const nombre = p.usuario_nombre || '';
    const apellido = p.usuario_apellido || '';
    const email = p.usuario_email || '';
    const base = `${nombre} ${apellido}`.trim();
    const id = p.usuario != null ? p.usuario : p.usuario_id != null ? p.usuario_id : null;
    const emailPart = email ? ` - ${email}` : '';
    return base || id != null ? `${base}${emailPart}${id != null ? ` (ID ${id})` : ''}` : '-';
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const params = {
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
      };
      const data = await adminService.pedidos.export(params); // ArrayBuffer
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `pedidos_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setError('No se pudo exportar pedidos');
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto my-10 px-4">
      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-2xl font-extrabold">Pedidos</h1>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className={`px-4 py-2 rounded-lg border font-bold transition-colors whitespace-nowrap ${
              exporting
                ? 'bg-blue-50 border-blue-200 text-blue-400 cursor-not-allowed'
                : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 cursor-pointer'
            }`}
            title="Exportar pedidos a Excel"
          >
            {exporting ? 'Exportando…' : 'Exportar Excel'}
          </button>
        </div>
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
          <TableHeader width="30%">Usuario</TableHeader>
          <TableHeader width="20%">Fecha</TableHeader>
          <TableHeader width="20%">Estado</TableHeader>
          <TableHeader width="10%">Total</TableHeader>
          <TableHeader width="10%" align="center">
            Acciones
          </TableHeader>
        </TableHead>

        <TableBody
          loading={loading}
          empty={pageItems.length === 0}
          colSpan={6}
          loadingText="Cargando pedidos..."
          emptyText="No hay pedidos."
        >
          {pageItems.map((p) => (
            <TableRow key={p.pedido_id}>
              <TableCell className="whitespace-nowrap">{p.pedido_id}</TableCell>
              <TableCell className="break-words">{getUserLabel(p)}</TableCell>
              <TableCell className="whitespace-nowrap">{fmt.date(p.fecha_pedido)}</TableCell>
              <TableCell className="break-words">
                <StatusBadge estado={p.estado} variant="order" />
              </TableCell>
              <TableCell className="whitespace-nowrap">{fmt.money(p.total)}</TableCell>
              <TableCell align="center">
                <ActionButton
                  variant="edit"
                  onClick={() => navigate(`/admin/pedidos/editar/${p.pedido_id}`)}
                >
                  Editar
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
