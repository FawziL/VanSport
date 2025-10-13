import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';
import Pagination from '@/components/Pagination';
import PageSizeSelector from '@/components/PageSizeSelector';
import ConfirmModal from '@/components/ConfirmModal';

export default function ListCategory() {
  const [categorias, setCategorias] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch categorías
  useEffect(() => {
    setLoading(true);
    setError('');
    adminService.categorias
      .list()
      .then((data) => {
        const items = Array.isArray(data) ? data : data.results || [];
        setCategorias(items);
        console.log(items)
        setPages(Math.max(1, Math.ceil(items.length / pageSize)));
        setPage((prev) => Math.min(prev, Math.max(1, Math.ceil(items.length / pageSize))));
      })
      .catch(() => setError('No se pudieron cargar las categorías'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [pageSize]);

  // Actualiza páginas si cambia el tamaño
  useEffect(() => {
    setPages(Math.max(1, Math.ceil(categorias.length / pageSize)));
    setPage((prev) => Math.min(prev, Math.max(1, Math.ceil(categorias.length / pageSize))));
    // eslint-disable-next-line
  }, [categorias, pageSize]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminService.categorias.remove(deleteId);
      setCategorias((prev) => prev.filter((c) => c.categoria_id !== deleteId));
      setModalOpen(false);
      setDeleteId(null);
    } catch {
      setError('No se pudo eliminar la categoría');
    }
  };

  // Paginado manual
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const categoriasPage = categorias.slice(start, end);

  return (
    <div style={{ maxWidth: 900, margin: '2.5rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Categorías</h1>
        <Link
          to="/admin/categorias/crear"
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: 8,
            background: '#1e88e5',
            color: '#fff',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          + Crear categoría
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <PageSizeSelector value={pageSize} onChange={setPageSize} options={[5, 10, 20, 50]} label="Por página" />
      </div>

      {error && (
        <div style={{ color: '#d32f2f', marginBottom: 12, fontWeight: 700 }}>{error}</div>
      )}

      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px #0001' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={{ background: '#f3f4f6', color: '#000000ff', }}>
              <th style={{ padding: '12px 8px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px 8px', textAlign: 'left' }}>Nombre</th>
              <th style={{ padding: '12px 8px', textAlign: 'left' }}>Descripción</th>
              <th style={{ padding: '12px 8px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 24 }}>Cargando...</td>
              </tr>
            ) : categoriasPage.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                  No hay categorías.
                </td>
              </tr>
            ) : (
              categoriasPage.map((cat) => (
                <tr key={cat.categoria_id} style={{ color: '#888' }}>
                  <td style={{ padding: '10px 8px' }}>{cat.categoria_id}</td>
                  <td style={{ padding: '10px 8px' }}>{cat.nombre}</td>
                  <td style={{ padding: '10px 8px' }}>{cat.descripcion}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <button
                      onClick={() => navigate(`/admin/categorias/editar/${cat.categoria_id}`)}
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
                      onClick={() => {
                        setDeleteId(cat.categoria_id);
                        setModalOpen(true);
                      }}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: 6,
                        border: 'none',
                        background: '#e53935',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} showNumbers />

      <ConfirmModal
        open={modalOpen}
        title="¿Estás seguro de eliminar esta categoría?"
        message="Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        danger
        onCancel={() => setModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}