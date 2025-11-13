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

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando notificación...</p>
        </div>
      </div>
    );

  return (
    <div
      style={{
        maxWidth: 800,
        margin: '2.5rem auto',
        padding: '0 1.5rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          padding: '2rem',
          border: '1px solid #eaeaea',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <button
            onClick={() => navigate('/admin/notificaciones')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginRight: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
            onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              margin: 0,
              color: '#1a1a1a',
            }}
          >
            Editar notificación
          </h1>
        </div>

        {error && (
          <div
            style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid #ffcdd2',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="#c62828"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '4px',
              }}
            >
              Título *
            </label>
            <input
              name="titulo"
              value={form.titulo}
              onChange={onChange}
              required
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '16px',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1e88e5';
                e.target.style.boxShadow = '0 0 0 2px rgba(30, 136, 229, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '4px',
              }}
            >
              Mensaje
            </label>
            <textarea
              name="mensaje"
              value={form.mensaje}
              onChange={onChange}
              rows={4}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '16px',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                outline: 'none',
                resize: 'vertical',
                minHeight: '100px',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1e88e5';
                e.target.style.boxShadow = '0 0 0 2px rgba(30, 136, 229, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '4px',
              }}
            >
              Tipo
            </label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={onChange}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '16px',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                outline: 'none',
                background: 'white',
                cursor: 'pointer',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1e88e5';
                e.target.style.boxShadow = '0 0 0 2px rgba(30, 136, 229, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="banner">Banner</option>
              <option value="info">Información</option>
              <option value="aviso">Aviso</option>
              <option value="oferta">Oferta</option>
            </select>
          </div>

          {form.tipo === 'oferta' && (
            <div
              style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #eaeaea',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '1rem',
                }}
              >
                <label
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#333',
                    marginBottom: '4px',
                  }}
                >
                  Fecha de expiración
                </label>
                <input
                  type="datetime-local"
                  name="expira"
                  value={form.expira || ''}
                  onChange={onChange}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '16px',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    outline: 'none',
                    maxWidth: '300px',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1e88e5';
                    e.target.style.boxShadow = '0 0 0 2px rgba(30, 136, 229, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ddd';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <small
                  style={{
                    color: '#666',
                    fontSize: '13px',
                    marginTop: '4px',
                  }}
                >
                  Fecha y hora límite de la oferta. Al llegar, el banner se ocultará
                  automáticamente.
                </small>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
                    const pad = (n) => n.toString().padStart(2, '0');
                    const val = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                    setForm((f) => ({ ...f, expira: val }));
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    background: '#e3f2fd',
                    color: '#1565c0',
                    border: '1px solid #bbdefb',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    fontSize: '14px',
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#bbdefb')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#e3f2fd')}
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
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    background: '#e3f2fd',
                    color: '#1565c0',
                    border: '1px solid #bbdefb',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    fontSize: '14px',
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#bbdefb')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#e3f2fd')}
                >
                  +1 día
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, expira: '' }))}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    background: '#ffebee',
                    color: '#c62828',
                    border: '1px solid #ffcdd2',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    fontSize: '14px',
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#ffcdd2')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#ffebee')}
                >
                  Limpiar fecha
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #f0f0f0',
            }}
          >
            <button
              type="button"
              onClick={() => navigate('/admin/notificaciones')}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                background: 'transparent',
                color: '#666',
                fontWeight: 600,
                border: '1px solid #ddd',
                cursor: 'pointer',
                transition: 'background-color 0.2s, border-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f5f5f5';
                e.target.style.borderColor = '#ccc';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#ddd';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                background: '#1e88e5',
                color: '#fff',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s, transform 0.1s',
                boxShadow: '0 2px 4px rgba(30, 136, 229, 0.3)',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#1976d2')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#1e88e5')}
              onMouseDown={(e) => (e.target.style.transform = 'scale(0.98)')}
              onMouseUp={(e) => (e.target.style.transform = 'scale(1)')}
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
