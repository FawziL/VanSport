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
        const parts = Object.entries(data).map(
          ([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`
        );
        if (parts.length) msg = parts.join(' | ');
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
            Crear nueva notificación
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
              placeholder="Ingrese el título de la notificación"
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
              Mensaje *
            </label>
            <textarea
              name="mensaje"
              value={form.mensaje}
              onChange={onChange}
              rows={4}
              required
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
              placeholder="Ingrese el mensaje de la notificación"
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
              Tipo de notificación
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
                  Fecha de expiración (opcional)
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
                  automáticamente. Si no se especifica, la oferta permanecerá activa
                  indefinidamente.
                </small>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(Date.now() + 2 * 60 * 60 * 1000); // +2 horas
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
                    const d = new Date(Date.now() + 24 * 60 * 60 * 1000); // +1 día
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

          {/* Opcional: vínculo del banner */}
          {/* <div style={{ 
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #eaeaea'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#333',
                marginBottom: '4px'
              }}>
                Relación (opcional)
              </label>
              <small style={{ 
                color: '#666',
                fontSize: '13px',
                marginBottom: '8px'
              }}>
                relacion_tipo: producto|categoria|url · relacion_id: ID o URL
              </small>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input 
                  name="relacion_tipo" 
                  placeholder="producto|categoria|url" 
                  onChange={onChange} 
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '16px',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    outline: 'none'
                  }}
                />
                <input 
                  name="relacion_id" 
                  placeholder="123 o https://..." 
                  onChange={onChange} 
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '16px',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div> */}

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
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                background: loading ? '#90caf9' : '#1e88e5',
                color: '#fff',
                fontWeight: 600,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s, transform 0.1s',
                boxShadow: '0 2px 4px rgba(30, 136, 229, 0.3)',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#1976d2')}
              onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#1e88e5')}
              onMouseDown={(e) => !loading && (e.target.style.transform = 'scale(0.98)')}
              onMouseUp={(e) => !loading && (e.target.style.transform = 'scale(1)')}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path
                      d="M12 18V22"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4.93 4.93L7.76 7.76"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M16.24 16.24L19.07 19.07"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path
                      d="M18 12H22"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4.93 19.07L7.76 16.24"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M16.24 7.76L19.07 4.93"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Creando notificación...
                </div>
              ) : (
                'Crear notificación'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
