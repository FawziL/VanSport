import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';

export default function CreateNotification() {
  const [form, setForm] = useState({ titulo: '', mensaje: '', tipo: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminService.notificaciones.create(form);
      navigate('/admin/notificaciones');
    } catch (err) {
      setError(err?.detail || 'No se pudo crear la notificación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '2.5rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>Crear notificación</h1>
      {error && <div style={{ color: '#d32f2f', marginBottom: 12, fontWeight: 700 }}>{error}</div>}
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Título</span>
          <input name="titulo" value={form.titulo} onChange={onChange} required />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Mensaje</span>
          <textarea name="mensaje" value={form.mensaje} onChange={onChange} rows={3} required />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Tipo</span>
          <input name="tipo" value={form.tipo} onChange={onChange} />
        </label>
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
            {loading ? 'Creando…' : 'Crear'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/notificaciones')}
            style={{ padding: '0.6rem 1.2rem', borderRadius: 8 }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
