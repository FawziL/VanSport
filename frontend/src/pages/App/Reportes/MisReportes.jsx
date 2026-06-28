import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { locPath } from '@/utils/localePath';
import { appService } from '@/services/routes';
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
import { useNavigate } from 'react-router-dom';

export default function MisReportes() {
  const { t } = useTranslation('reporte');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    appService.bugReports
      .list()
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.results || [];
        if (alive) setItems(arr);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="max-w-[1100px] mx-auto my-10 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            ⚙️ {t('misReportes.titulo')}
          </h1>
          <p className="text-gray-600 mt-1">{t('misReportes.subtitulo')}</p>
        </div>
        <Link
          to={locPath('/reportes/nuevo')}
          className="px-4 py-2 bg-green-600 text-white! font-bold rounded-lg no-underline hover:bg-green-700 transition-colors"
        >
          {t('misReportes.nuevo')}
        </Link>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableHeader width="40%">{t('misReportes.colTitulo')}</TableHeader>
          <TableHeader width="20%">{t('misReportes.colEstado')}</TableHeader>
          <TableHeader width="25%">{t('misReportes.colFecha')}</TableHeader>
          <TableHeader width="15%" align="center">
            {t('misReportes.colAcciones')}
          </TableHeader>
        </TableHead>

        <TableBody
          loading={loading}
          empty={items.length === 0}
          colSpan={4}
          loadingText={t('misReportes.cargando')}
          emptyText={t('misReportes.vacio')}
        >
          {items.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.title}</TableCell>
              <TableCell>
                <StatusBadge estado={r.status} />
              </TableCell>
              <TableCell>
                {new Date(r.createdAt).toLocaleString('es-ES', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </TableCell>
              <TableCell align="center">
                <ActionButton
                  onClick={() => navigate(locPath(`/reportes/${r.id}`))}
                  className="px-4 py-2 bg-blue-600 text-white! font-bold rounded-lg no-underline hover:bg-blue-700 transition-colors inline-block"
                >
                  {t('misReportes.verDetalles')}
                </ActionButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
