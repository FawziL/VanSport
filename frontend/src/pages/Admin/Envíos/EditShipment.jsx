import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/auth';

export default function EditShipment() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminService.envios
      .retrieve(id)
      .then((data) => {
        if (!active) return;
        setForm({
          estado: data.estado || '',
          metodo_envio: data.metodo_envio || '',
          codigo_seguimiento: data.codigo_seguimiento || '',
        });
      })
      .catch(() => setError('No se pudo cargar el envío'))
      .finally(() => active && setLoading(false));
    return () => (active = false);
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await adminService.envios.partialUpdate(id, form);
      navigate('/admin/envios');
    } catch (err) {
      setError(err?.detail || 'No se pudo actualizar el envío');
    }
  };

  if (loading || !form) return <div style={{ padding: 24 }}>Cargando...</div>;

  return (
    <div style={{ maxWidth: 700, margin: '2.5rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>Editar envío</h1>
      {error && <div style={{ color: '#d32f2f', marginBottom: 12, fontWeight: 700 }}>{error}</div>}
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Estado</span>
          <input name="estado" value={form.estado} onChange={onChange} required />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Método de envío</span>
          <input name="metodo_envio" value={form.metodo_envio} onChange={onChange} />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Código de seguimiento</span>
          <input name="codigo_seguimiento" value={form.codigo_seguimiento} onChange={onChange} />
        </label>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" style={{ padding: '0.6rem 1.2rem', borderRadius: 8, background: '#1e88e5', color: '#fff', fontWeight: 800, border: 'none' }}>
            Guardar
          </button>
          <button type="button" onClick={() => navigate('/admin/envios')} style={{ padding: '0.6rem 1.2rem', borderRadius: 8 }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
