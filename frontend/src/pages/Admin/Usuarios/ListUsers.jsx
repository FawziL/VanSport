import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';
import Pagination from '@/components/Pagination';
import PageSizeSelector from '@/components/PageSizeSelector';
 

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
      setUsuarios((prev) => prev.map((x) => (x.usuario_id === u.usuario_id ? { ...x, is_active: !u.is_active } : x)));
    } catch {
      setError('No se pudo actualizar el estado del usuario');
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '2.5rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Usuarios</h1>
        <Link
          to="/admin/usuarios/crear"
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: 8,
            background: '#1e88e5',
            color: '#fff',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          + Crear usuario
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <PageSizeSelector value={pageSize} onChange={setPageSize} options={[5, 10, 20, 50]} label="Por página" />
      </div>

      {error && <div style={{ color: '#d32f2f', marginBottom: 12, fontWeight: 700 }}>{error}</div>}

      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px #0001' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ background: '#f3f4f6', color: '#000000ff' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px 8px', textAlign: 'left' }}>Nombre</th>
              <th style={{ padding: '12px 8px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px 8px', textAlign: 'left' }}>Teléfono</th>
              <th style={{ padding: '12px 8px', textAlign: 'left' }}>Activo</th>
              <th style={{ padding: '12px 8px', textAlign: 'left' }}>Rol</th>
              <th style={{ padding: '12px 8px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>Cargando...</td>
              </tr>
            ) : usuariosPage.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#888' }}>No hay usuarios.</td>
              </tr>
            ) : (
              usuariosPage.map((u) => (
                <tr key={u.usuario_id} style={{ color: '#444' }}>
                  <td style={{ padding: '10px 8px' }}>{u.usuario_id}</td>
                  <td style={{ padding: '10px 8px' }}>{`${u.nombre ?? ''} ${u.apellido ?? ''}`.trim() || '-'}</td>
                  <td style={{ padding: '10px 8px' }}>{u.email}</td>
                  <td style={{ padding: '10px 8px' }}>{u.telefono || '-'}</td>
                  <td style={{ padding: '10px 8px' }}>{u.is_active ? 'Sí' : 'No'}</td>
                  <td style={{ padding: '10px 8px' }}>{u.is_staff ? 'Admin' : 'Cliente'}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <button
                      onClick={() => navigate(`/admin/usuarios/editar/${u.usuario_id}`)}
                      style={{
                        marginRight: 8,
                        padding: '0.4rem 0.8rem',
                        borderRadius: 6,
                        border: 'none',
                        background: '#1e88e5',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActivo(u)}
                      style={{
                        marginRight: 8,
                        padding: '0.4rem 0.8rem',
                        borderRadius: 6,
                        border: 'none',
                        background: u.is_active ? '#f57c00' : '#2e7d32',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {u.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} showNumbers />
    </div>
  );
}
