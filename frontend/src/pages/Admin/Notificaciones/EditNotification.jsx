import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/auth';

function toDatetimeLocalValue(isoOrNull) {
  if (!isoOrNull) return '';
  const d = new Date(isoOrNull);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditNotification() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminService.notificaciones
      .retrieve(id)
      .then((data) => {
        if (!active) return;
        setForm({
          titulo: data.titulo || '',
          mensaje: data.mensaje || '',
          tipo: data.tipo || 'banner',
          expira: toDatetimeLocalValue(data.expira || ''),
        });
      })
      .catch(() => setError('No se pudo cargar la notificación'))
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
      const payload = { titulo: form.titulo, mensaje: form.mensaje, tipo: form.tipo };
      if (form.expira) {
        const d = new Date(form.expira);
        if (!isNaN(d.getTime())) {
          payload.expira = d.toISOString();
        }
      } else {
        payload.expira = null; // permitir limpiar la expiración
      }
      await adminService.notificaciones.partialUpdate(id, payload);
      navigate('/admin/notificaciones');
    } catch (err) {
      const msg = err?.response?.data
        ? Object.entries(err.response.data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
            .join(' | ')
        : err?.message || 'No se pudo actualizar la notificación';
      setError(msg);
    }
  };

  if (loading || !form) return <div style={{ padding: 24 }}>Cargando...</div>;

  return (
    <div style={{ maxWidth: 700, margin: '2.5rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>Editar notificación</h1>
      {error && <div style={{ color: '#d32f2f', marginBottom: 12, fontWeight: 700 }}>{error}</div>}
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Título</span>
          <input name="titulo" value={form.titulo} onChange={onChange} required />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Mensaje</span>
          <textarea name="mensaje" value={form.mensaje} onChange={onChange} rows={3} />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Tipo</span>
          <select name="tipo" value={form.tipo} onChange={onChange}>
            <option value="banner">banner</option>
            <option value="info">info</option>
            <option value="aviso">aviso</option>
            <option value="oferta">oferta</option>
          </select>
        </label>

        {form.tipo === 'oferta' && (
          <div style={{ display: 'grid', gap: 6 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Expira</span>
              <input
                type="datetime-local"
                name="expira"
                value={form.expira || ''}
                onChange={onChange}
              />
              <small style={{ color: '#666' }}>
                Fecha y hora límite de la oferta. Al llegar, el banner se ocultará.
              </small>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => {
                  const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
                  const pad = (n) => n.toString().padStart(2, '0');
                  const val = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                  setForm((f) => ({ ...f, expira: val }));
                }}
                style={{ padding: '0.4rem 0.8rem', borderRadius: 6 }}
              >
                +2 horas
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
                  const pad = (n) => n.toString().padStart(2, '0');
                  const val = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                  setForm((f) => ({ ...f, expira: val }));
                }}
                style={{ padding: '0.4rem 0.8rem', borderRadius: 6 }}
              >
                +1 día
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: 8,
              background: '#1e88e5',
              color: '#fff',
              fontWeight: 800,
              border: 'none',
            }}
          >
            Guardar
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
