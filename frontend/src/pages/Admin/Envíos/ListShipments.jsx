import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

export default function ListShipments() {
  const { t } = useTranslation('admin');
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
    adminService.shipments
      .list()
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.results || [];
        setItems(arr);
        console.log(arr);
        const totalPages = Math.max(1, Math.ceil(arr.length / pageSize));
        setPages(totalPages);
        setPage((prev) => Math.min(prev, totalPages));
      })
      .catch(() => setError(t('listShipments.errorCargar')))
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

  const getUserLabel = (e) => e.userId ?? '-';

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const params = {
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
      };
      const data = await adminService.shipments.export(params); // ArrayBuffer
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `envios_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setError(t('listShipments.errorExportar'));
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto my-10 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold">{t('listShipments.titulo')}</h1>
        <div className="flex flex-col sm:flex-row gap-4 items-end mb-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t('listShipments.desde')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t('listShipments.hasta')}</label>
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
            title={t('listShipments.exportTitle')}
          >
            {exporting ? t('listShipments.exportando') : t('listShipments.exportar')}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="text-red-700 font-bold mb-3">{error}</div>}

      {/* Page Size Selector */}
      <div className="flex justify-end mb-3">
        <PageSizeSelector
          value={pageSize}
          onChange={setPageSize}
          options={[5, 10, 20, 50]}
          label={t('listShipments.porPagina')}
        />
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableHeader width="5%">{t('listShipments.colId')}</TableHeader>
          <TableHeader width="5%">{t('listShipments.colPedido')}</TableHeader>
          <TableHeader width="30%">{t('listShipments.colUsuario')}</TableHeader>
          <TableHeader width="14%">{t('listShipments.colMetodo')}</TableHeader>
          <TableHeader width="14%">{t('listShipments.colEstado')}</TableHeader>
          <TableHeader width="10%">{t('listShipments.colCosto')}</TableHeader>
          <TableHeader width="15%">{t('listShipments.colFechaEnvio')}</TableHeader>
          <TableHeader width="10%" align="center">
            {t('listShipments.colAcciones')}
          </TableHeader>
        </TableHead>

        <TableBody
          loading={loading}
          empty={pageItems.length === 0}
          colSpan={8}
          loadingText={t('listShipments.cargando')}
          emptyText={t('listShipments.vacio')}
        >
          {pageItems.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="whitespace-nowrap">{e.id}</TableCell>
              <TableCell className="whitespace-nowrap">{e.orderId ?? '-'}</TableCell>
              <TableCell className="break-words">{getUserLabel(e)}</TableCell>
              <TableCell className="break-words">{e.shippingMethod}</TableCell>
              <TableCell className="break-words">
                <StatusBadge estado={e.status} variant="order" />
              </TableCell>
              <TableCell className="whitespace-nowrap">{fmt.money(e.cost)}</TableCell>
              <TableCell className="whitespace-nowrap">{fmt.date(e.shippedAt)}</TableCell>
              <TableCell align="center">
                <ActionButton
                  variant="edit"
                  onClick={() => navigate(`/admin/envios/editar/${e.id}`)}
                >
                  {t('listShipments.editar')}
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
