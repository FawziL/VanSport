import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';
import { http } from '@/config/api';

export default function Perfil() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    usuario_id: '',
    email: '',
    nombre: '',
    apellido: '',
    telefono: '',
    is_staff: false,
  });

  // Guard simple: si no hay token, a login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  // Cargar perfil
  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const data = await authService.me();
        if (!alive) return;
        setForm({
          usuario_id: data.usuario_id ?? '',
          email: data.email ?? '',
          nombre: data.nombre ?? '',
          apellido: data.apellido ?? '',
          telefono: data.telefono ?? '',
          is_staff: !!data.is_staff,
        });
      } catch (err) {
        if (!alive) return;
        const backend = err?.response?.data;
        const msg =
          typeof backend === 'object'
            ? Object.entries(backend)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                .join(' | ')
            : backend || err.message || 'Error al cargar el perfil';
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  const initials =
    ((form.nombre || '') + ' ' + (form.apellido || ''))
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'U';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        nombre: form.nombre ?? '',
        apellido: form.apellido ?? '',
        telefono: form.telefono ?? '',
      };
      const updated = await http.patch('/auth/me/', payload);
      setForm((f) => ({
        ...f,
        nombre: updated.nombre ?? f.nombre,
        apellido: updated.apellido ?? f.apellido,
        telefono: updated.telefono ?? f.telefono,
      }));
      setSuccess('Perfil actualizado correctamente.');
    } catch (err) {
      const backend = err?.response?.data;
      const msg =
        typeof backend === 'object'
          ? Object.entries(backend)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
              .join(' | ')
          : backend || err.message || 'Error al guardar cambios';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-skeleton">
          <div className="avatar-skeleton" />
          <div className="info-skeleton">
            <div className="skeleton-line large" />
            <div className="skeleton-line medium" />
            <div className="skeleton-line medium" />
            <div className="skeleton-line small" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Encabezado */}
      <div className="profile-header">
        <div className="avatar-container">
          <div className="avatar" aria-hidden="true">
            {initials}
          </div>
        </div>
        <div className="profile-info">
          <h1 className="profile-title">
            Perfil de usuario
            {form.is_staff && <span className="admin-badge">Admin</span>}
          </h1>
          <p className="profile-subtitle">Consulta y actualiza tus datos personales</p>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="alert alert-error">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.28 10.22a.75.75 0 00-1.06 1.04l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
              clipRule="evenodd"
            />
          </svg>
          {success}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">ID de usuario</label>
            <input
              type="text"
              value={form.usuario_id || '—'}
              disabled
              className="form-input disabled"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={form.email || '—'}
              disabled
              className="form-input disabled"
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              name="nombre"
              type="text"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Apellido</label>
            <input
              name="apellido"
              type="text"
              placeholder="Tu apellido"
              value={form.apellido}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Teléfono</label>
          <input
            name="telefono"
            type="tel"
            placeholder="Tu teléfono"
            value={form.telefono}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? (
              <>
                <svg className="spinner" width="16" height="16" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="15.85 15.85"
                  />
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </button>
          <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
            Volver al inicio
          </button>
        </div>
      </form>

      <style jsx>{`
        .profile-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 0 1.5rem;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e1e5e9;
        }

        .avatar-container {
          flex-shrink: 0;
        }

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.75rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .profile-info {
          flex: 1;
        }

        .profile-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a202c;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .admin-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .profile-subtitle {
          margin: 0;
          color: #718096;
          font-size: 1rem;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .alert-error {
          background: #fed7d7;
          border: 1px solid #feb2b2;
          color: #c53030;
        }

        .alert-success {
          background: #c6f6d5;
          border: 1px solid #9ae6b4;
          color: #2d774a;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .profile-header {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #2d3748;
          font-size: 0.875rem;
        }

        .form-input {
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: #fff;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input.disabled {
          background: #f7fafc;
          border-color: #e2e8f0;
          color: #a0aec0;
          cursor: not-allowed;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #e1e5e9;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
          color: #fff;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: #fff;
          color: #4a5568;
          border: 2px solid #e2e8f0;
        }

        .btn-secondary:hover {
          background: #f7fafc;
          border-color: #cbd5e0;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Estilos para el skeleton loading */
        .profile-skeleton {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 1.5rem;
          align-items: center;
        }

        .avatar-skeleton {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        .info-skeleton {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .skeleton-line {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-line.large {
          height: 28px;
          width: 60%;
        }

        .skeleton-line.medium {
          height: 20px;
          width: 80%;
        }

        .skeleton-line.small {
          height: 16px;
          width: 40%;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
