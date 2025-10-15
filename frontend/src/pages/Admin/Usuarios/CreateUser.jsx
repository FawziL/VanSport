import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';

export default function CreateUser() {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    direccion: '',
    is_active: true,
    is_staff: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminService.usuarios.create(form);
      navigate('/admin/usuarios');
    } catch (err) {
      setError(err?.detail || 'No se pudo crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '2.5rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>Crear usuario</h1>
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
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Contraseña</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
          />
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
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: 8,
              background: '#1e88e5',
              color: '#fff',
              fontWeight: 800,
              border: 'none',
            }}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/usuarios')}
            style={{ padding: '0.6rem 1.2rem', borderRadius: 8 }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
