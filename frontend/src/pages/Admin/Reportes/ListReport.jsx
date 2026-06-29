import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/services/routes';
import { locPath } from '@/utils/localePath';
import Pagination from '@/components/Pagination';
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
import PageSizeSelector from '@/components/PageSizeSelector';

export default function ListReportes() {
  const { t } = useTranslation('admin');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');

    adminService.bugReports
      .list()
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.results || [];
        if (alive) {
          setItems(arr);
          setPages(Math.max(1, Math.ceil(arr.length / pageSize)));
        }
      })
      .catch(() => {
        if (alive) setError(t('listReports.errorCargar'));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [pageSize]);

  // Actualiza páginas si cambia el tamaño o el listado
  useEffect(() => {
    setPages(Math.max(1, Math.ceil(items.length / pageSize)));
    setPage((prev) => Math.min(prev, Math.max(1, Math.ceil(items.length / pageSize))));
  }, [items, pageSize]);

  // Paginado manual
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const itemsPage = items.slice(start, end);

  // Helper para formatear fecha
  const fmtFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES');
  };

  return (
    <div className="max-w-[1100px] mx-auto my-10 px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold">{t('listReports.titulo')}</h1>
        <div className="flex gap-2">
          <Link
            to={locPath('/admin/reportes/crear')}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white! font-bold no-underline hover:bg-blue-700 transition-colors"
          >
            {t('listReports.crear')}
          </Link>
        </div>
      </div>

      <div className="flex justify-end mb-3">
        <PageSizeSelector
          value={pageSize}
          onChange={setPageSize}
          options={[5, 10, 20, 50]}
          label={t('listReports.porPagina')}
        />
      </div>

      {error && <div className="text-red-700 font-bold mb-3">{error}</div>}

      <Table minWidth="min-w-[1000px]">
        <TableHead>
          <TableHeader>{t('listReports.colTitulo')}</TableHeader>
          <TableHeader>{t('listReports.colUsuario')}</TableHeader>
          <TableHeader>{t('listReports.colEstado')}</TableHeader>
          <TableHeader>{t('listReports.colFecha')}</TableHeader>
          <TableHeader align="center">{t('listReports.colAcciones')}</TableHeader>
        </TableHead>

        <TableBody
          loading={loading}
          empty={itemsPage.length === 0}
          colSpan={6}
          loadingText={t('listReports.cargando')}
          emptyText={t('listReports.vacio')}
        >
          {itemsPage.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.title}</TableCell>
              <TableCell>
                {report.userId}
              </TableCell>
              <TableCell>
                <StatusBadge estado={report.status} />
              </TableCell>
              <TableCell>{fmtFecha(report.createdAt)}</TableCell>
              <TableCell align="center">
                <ActionButton
                  variant="edit"
                    onClick={() => navigate(locPath(`/admin/reportes/${report.id}`))}
                >
                  {t('listReports.ver')}
                </ActionButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Si quieres agregar paginación (opcional) */}
      <Pagination page={page} pages={pages} onChange={setPage} showNumbers />
    </div>
  );
}
