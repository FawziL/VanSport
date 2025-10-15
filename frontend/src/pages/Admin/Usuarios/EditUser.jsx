import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/auth';

export default function EditUser() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminService.usuarios
      .retrieve(id)
      .then((data) => {
        if (!active) return;
        setForm({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          email: data.email || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          is_active: !!data.is_active,
          is_staff: !!data.is_staff,
        });
      })
      .catch(() => setError('No se pudo cargar el usuario'))
      .finally(() => active && setLoading(false));
    return () => (active = false);
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Usamos PATCH para evitar errores 400 por campos obligatorios no enviados (p. ej. password)
      await adminService.usuarios.partialUpdate(id, form);
      navigate('/admin/usuarios');
    } catch (err) {
      setError(err?.detail || 'No se pudo actualizar el usuario');
    }
  };

  if (loading || !form) return <div style={{ padding: 24 }}>Cargando...</div>;

  return (
    <div style={{ maxWidth: 700, margin: '2.5rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>Editar usuario</h1>
      {error && <div style={{ color: '#d32f2f', marginBottom: 12, fontWeight: 700 }}>{error}</div>}
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Nombre</span>
            <input name="nombre" value={form.nombre} onChange={onChange} required />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Apellido</span>
            <input name="apellido" value={form.apellido} onChange={onChange} required />
          </label>
        </div>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Email</span>
          <input type="email" name="email" value={form.email} onChange={onChange} required />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Teléfono</span>
            <input name="telefono" value={form.telefono} onChange={onChange} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Dirección</span>
            <input name="direccion" value={form.direccion} onChange={onChange} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={onChange} />
            <span>Activo</span>
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" name="is_staff" checked={form.is_staff} onChange={onChange} />
            <span>Admin</span>
          </label>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" style={{ padding: '0.6rem 1.2rem', borderRadius: 8, background: '#1e88e5', color: '#fff', fontWeight: 800, border: 'none' }}>
            Guardar
          </button>
          <button type="button" onClick={() => navigate('/admin/usuarios')} style={{ padding: '0.6rem 1.2rem', borderRadius: 8 }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
