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
  ActionButton
} from '@/components/ui/Table';

export default function ListSales() {
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
    adminService.transacciones
      .list()
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.results || [];
        setItems(arr);
        const totalPages = Math.max(1, Math.ceil(arr.length / pageSize));
        setPages(totalPages);
        setPage((prev) => Math.min(prev, totalPages));
      })
      .catch(() => setError('No se pudieron cargar las ventas'))
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
    date: (s) => (s ? new Date(s).toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short'
    }) : '-'),
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

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const params = {
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
      };
      const data = await adminService.transacciones.export(params); // ArrayBuffer
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `transacciones_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error(e);
      setError('No se pudo exportar ventas');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto my-10 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold">Ventas</h1>
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

      {/* Filters and Export */}
      <div className="flex flex-col sm:flex-row gap-4 items-end mb-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
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
          className={`px-4 py-2 rounded-lg border font-bold transition-colors ${
            exporting
              ? 'bg-blue-50 border-blue-200 text-blue-400 cursor-not-allowed'
              : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 cursor-pointer'
          }`}
          title="Exportar ventas a Excel"
        >
          {exporting ? 'Exportando…' : 'Exportar Excel'}
        </button>
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
          <TableHeader width="10%" align="center">Acciones</TableHeader>
        </TableHead>
        
        <TableBody 
          loading={loading} 
          empty={pageItems.length === 0}
          colSpan={8}
          loadingText="Cargando ventas..."
          emptyText="No hay ventas."
        >
          {pageItems.map((t) => (
            <TableRow key={t.transaccion_id}>
              <TableCell className="whitespace-nowrap">{t.transaccion_id}</TableCell>
              <TableCell className="whitespace-nowrap">{t.pedido_id ?? '-'}</TableCell>
              <TableCell className="break-words">{getUserLabel(t)}</TableCell>
              <TableCell className="whitespace-nowrap font-medium">{fmt.money(t.monto)}</TableCell>
              <TableCell className="break-words">{t.metodo_pago}</TableCell>
              <TableCell className="break-words">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  t.estado === 'completado' 
                    ? 'bg-green-100 text-green-800'
                    : t.estado === 'pendiente'
                    ? 'bg-yellow-100 text-yellow-800'
                    : t.estado === 'cancelado'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {t.estado}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">{fmt.date(t.fecha_transaccion)}</TableCell>
              <TableCell align="center">
                <ActionButton
                  variant="edit"
                  onClick={() => navigate(`/admin/ventas/editar/${t.transaccion_id}`)}
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