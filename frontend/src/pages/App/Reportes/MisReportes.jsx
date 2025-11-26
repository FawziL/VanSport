import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    appService.reportes
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
            ⚙️ Mis Reportes de Fallas
          </h1>
          <p className="text-gray-600 mt-1">Seguimiento de todos tus reportes enviados</p>
        </div>
        <Link
          to="/reportes/nuevo"
          className="px-4 py-2 bg-green-600 text-white! font-bold rounded-lg no-underline hover:bg-green-700 transition-colors"
        >
          + Nuevo Reporte
        </Link>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableHeader width="40%">Título</TableHeader>
          <TableHeader width="20%">Estado</TableHeader>
          <TableHeader width="25%">Fecha</TableHeader>
          <TableHeader width="15%" align="center">
            Acciones
          </TableHeader>
        </TableHead>

        <TableBody
          loading={loading}
          empty={items.length === 0}
          colSpan={4}
          loadingText="Cargando tus reportes..."
          emptyText="✅ No tienes reportes de fallas pendientes."
        >
          {items.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.titulo}</TableCell>
              <TableCell>
                <StatusBadge estado={r.estado} />
              </TableCell>
              <TableCell>
                {new Date(r.fecha_creacion).toLocaleString('es-ES', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </TableCell>
              <TableCell align="center">
                <ActionButton
                  onClick={() => navigate(`/reportes/${r.id}`)}
                  className="px-4 py-2 bg-blue-600 text-white! font-bold rounded-lg no-underline hover:bg-blue-700 transition-colors inline-block"
                >
                  Ver Detalles
                </ActionButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
