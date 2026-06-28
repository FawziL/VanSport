import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { toast } from 'react-toastify';

export default function ListUsers() {
  const { t } = useTranslation('admin');
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
    adminService.users
      .list()
      .then((data) => {
        const items = Array.isArray(data) ? data : data.results || [];
        setUsuarios(items);
        const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
        setPages(totalPages);
        setPage((prev) => Math.min(prev, totalPages));
      })
      .catch(() => setError(t('listUsers.errorCargar')))
      .finally(() => setLoading(false));
  }, [pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(usuarios.length / pageSize));
    setPages(totalPages);
    setPage((prev) => Math.min(prev, totalPages));
  }, [usuarios, pageSize]);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const usuariosPage = usuarios.slice(start, end);

  const toggleActivo = async (u) => {
    try {
      setUsuarios((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, isActive: !x.isActive } : x))
      );

      await adminService.users.partialUpdate(u.id, { isActive: !u.isActive });

      toast.success(`${u.name ?? u.email} ${u.isActive ? t('listUsers.desactivado') : t('listUsers.activado')}`);
    } catch (err) {
      setUsuarios((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, isActive: u.isActive } : x))
      );
      const msg = err?.response?.data?.detail || t('listUsers.errorEstado');
      toast.error(msg);
      setError(msg);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto my-10 px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold">{t('listUsers.titulo')}</h1>
        <Link
          to="/admin/usuarios/crear"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white! font-bold no-underline hover:bg-blue-700 transition-colors"
        >
          {t('listUsers.crear')}
        </Link>
      </div>

      <div className="flex justify-end mb-3">
        <PageSizeSelector
          value={pageSize}
          onChange={setPageSize}
          options={[5, 10, 20, 50]}
          label={t('listUsers.porPagina')}
        />
      </div>

      {error && <div className="text-red-700 font-bold mb-3">{error}</div>}

      <Table minWidth="min-w-[900px]">
        <TableHead>
          <TableHeader>{t('listUsers.colId')}</TableHeader>
          <TableHeader>{t('listUsers.colNombre')}</TableHeader>
          <TableHeader>{t('listUsers.colEmail')}</TableHeader>
          <TableHeader>{t('listUsers.colTelefono')}</TableHeader>
          <TableHeader>{t('listUsers.colActivo')}</TableHeader>
          <TableHeader>{t('listUsers.colRol')}</TableHeader>
          <TableHeader align="center">{t('listUsers.colAcciones')}</TableHeader>
        </TableHead>

        <TableBody
          loading={loading}
          empty={usuariosPage.length === 0}
          colSpan={7}
          loadingText={t('listUsers.cargando')}
          emptyText={t('listUsers.vacio')}
        >
          {usuariosPage.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell className="font-medium">
                {`${u.name ?? ''} ${u.lastName ?? ''}`.trim() || '-'}
              </TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.phone || '-'}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                    u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {u.isActive ? t('listUsers.si') : t('listUsers.no')}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                    u.isStaff ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {u.isStaff ? t('listUsers.admin') : t('listUsers.cliente')}
                </span>
              </TableCell>
              <TableCell align="center">
                <div className="flex justify-center gap-2">
                  <ActionButton
                    variant="edit"
                    onClick={() => navigate(`/admin/usuarios/editar/${u.id}`)}
                  >
                    {t('listUsers.editar')}
                  </ActionButton>
                  <button
                    onClick={() => toggleActivo(u)}
                    className={`px-3 py-1 rounded font-bold text-white transition-colors ${
                      u.isActive
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {u.isActive ? t('listUsers.desactivar') : t('listUsers.activar')}
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination page={page} pages={pages} onChange={setPage} showNumbers />
    </div>
  );
}
