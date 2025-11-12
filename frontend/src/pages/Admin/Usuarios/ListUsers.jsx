import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function ListUsers() {
  const [usuarios, setUsuarios] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    adminService.usuarios
      .list()
      .then((data) => {
        const items = Array.isArray(data) ? data : data.results || [];
        setUsuarios(items);
        const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
        setPages(totalPages);
        setPage((prev) => Math.min(prev, totalPages));
      })
      .catch(() => setError('No se pudieron cargar los usuarios'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(usuarios.length / pageSize));
    setPages(totalPages);
    setPage((prev) => Math.min(prev, totalPages));
    // eslint-disable-next-line
  }, [usuarios, pageSize]);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const usuariosPage = usuarios.slice(start, end);

  const toggleActivo = async (u) => {
    try {
      await adminService.usuarios.partialUpdate(u.usuario_id, { is_active: !u.is_active });
      setUsuarios((prev) =>
        prev.map((x) => (x.usuario_id === u.usuario_id ? { ...x, is_active: !u.is_active } : x))
      );
    } catch {
      setError('No se pudo actualizar el estado del usuario');
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto my-10 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold">Usuarios</h1>
        <Link
          to="/admin/usuarios/crear"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white! font-bold no-underline hover:bg-blue-700 transition-colors"
        >
          + Crear Usuario
        </Link>
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
      <Table minWidth="min-w-[900px]">
        <TableHead>
          <TableHeader>ID</TableHeader>
          <TableHeader>Nombre</TableHeader>
          <TableHeader>Email</TableHeader>
          <TableHeader>Teléfono</TableHeader>
          <TableHeader>Activo</TableHeader>
          <TableHeader>Rol</TableHeader>
          <TableHeader align="center">Acciones</TableHeader>
        </TableHead>
        
        <TableBody 
          loading={loading} 
          empty={usuariosPage.length === 0}
          colSpan={7}
          loadingText="Cargando usuarios..."
          emptyText="No hay usuarios."
        >
          {usuariosPage.map((u) => (
            <TableRow key={u.usuario_id}>
              <TableCell>{u.usuario_id}</TableCell>
              <TableCell className="font-medium">
                {`${u.nombre ?? ''} ${u.apellido ?? ''}`.trim() || '-'}
              </TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.telefono || '-'}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  u.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {u.is_active ? 'Sí' : 'No'}
                </span>
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  u.is_staff 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {u.is_staff ? 'Admin' : 'Cliente'}
                </span>
              </TableCell>
              <TableCell align="center">
                <div className="flex justify-center gap-2">
                  <ActionButton
                    variant="edit"
                    onClick={() => navigate(`/admin/usuarios/editar/${u.usuario_id}`)}
                  >
                    Editar
                  </ActionButton>
                  <button
                    onClick={() => toggleActivo(u)}
                    className={`px-3 py-1 rounded font-bold text-white transition-colors ${
                      u.is_active 
                        ? 'bg-orange-600 hover:bg-orange-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {u.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
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