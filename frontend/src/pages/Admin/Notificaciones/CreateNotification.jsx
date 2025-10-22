import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';

export default function CreateNotification() {
  const [form, setForm] = useState({ titulo: '', mensaje: '', tipo: 'banner', expira: '' }); // expira opcional
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
      const payload = { ...form };
      // Solo enviar expira si hay valor
      if (payload.expira) {
        const d = new Date(payload.expira); // viene de <input type="datetime-local">
        if (!isNaN(d.getTime())) {
          payload.expira = d.toISOString(); // enviar ISO 8601
        } else {
          delete payload.expira;
        }
      }
      await adminService.notificaciones.create(payload);
      navigate('/admin/notificaciones');
    } catch (err) {
      const data = err?.response?.data;
      let msg = 'No se pudo crear la notificación';
      if (data && typeof data === 'object') {
        const parts = Object.entries(data).map(([k, v]) =>
          `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`
        );
        if (parts.length) msg = parts.join(' | ');
      }
      setError(msg);
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
                  const d = new Date(Date.now() + 2 * 60 * 60 * 1000); // +2 horas
                  // formatear a 'YYYY-MM-DDTHH:mm' para datetime-local
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
                  const d = new Date(Date.now() + 24 * 60 * 60 * 1000); // +1 día
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

        {/* Opcional: vínculo del banner */}
        {/* <label style={{ display: 'grid', gap: 6 }}>
          <span>Relación (opcional)</span>
          <small style={{ color: '#666' }}>relacion_tipo: producto|categoria|url · relacion_id: ID o URL</small>
          <div style={{ display: 'flex', gap: 8 }}>
            <input name="relacion_tipo" placeholder="producto|categoria|url" onChange={onChange} />
            <input name="relacion_id" placeholder="123 o https://..." onChange={onChange} />
          </div>
        </label> */}
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
