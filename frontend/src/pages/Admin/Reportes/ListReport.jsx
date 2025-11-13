import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '@/services/auth';
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
import { useNavigate } from 'react-router-dom';
import PageSizeSelector from '@/components/PageSizeSelector';

export default function ListReportes() {
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

    adminService.reportes
      .list()
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.results || [];
        if (alive) {
          setItems(arr);
          setPages(Math.max(1, Math.ceil(arr.length / pageSize)));
        }
      })
      .catch(() => {
        if (alive) setError('No se pudieron cargar los reportes');
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
        <h1 className="text-2xl font-extrabold">Reportes de Fallas</h1>
        <div className="flex gap-2">
          <Link
            to="/admin/reportes/crear"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white! font-bold no-underline hover:bg-blue-700 transition-colors"
          >
            + Crear Reporte
          </Link>
        </div>
      </div>

      <div className="flex justify-end mb-3">
        <PageSizeSelector
          value={pageSize}
          onChange={setPageSize}
          options={[5, 10, 20, 50]}
          label="Por página"
        />
      </div>

      {error && <div className="text-red-700 font-bold mb-3">{error}</div>}

      <Table minWidth="min-w-[1000px]">
        <TableHead>
          <TableHeader>Título</TableHeader>
          <TableHeader>Usuario</TableHeader>
          <TableHeader>Estado</TableHeader>
          <TableHeader>Fecha</TableHeader>
          <TableHeader align="center">Acciones</TableHeader>
        </TableHead>

        <TableBody
          loading={loading}
          empty={itemsPage.length === 0}
          colSpan={6}
          loadingText="Cargando reportes..."
          emptyText="No hay reportes de fallas."
        >
          {itemsPage.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.titulo}</TableCell>
              <TableCell>
                {report.usuario_nombre} {report.usuario_apellido}
                <br />
                <span className="text-sm text-gray-500">({report.usuario_email})</span>
              </TableCell>
              <TableCell>
                <StatusBadge estado={report.estado} />
              </TableCell>
              <TableCell>{fmtFecha(report.fecha_creacion)}</TableCell>
              <TableCell align="center">
                <ActionButton
                  variant="edit"
                  onClick={() => navigate(`/admin/reportes/${report.id}`)}
                >
                  Ver
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
