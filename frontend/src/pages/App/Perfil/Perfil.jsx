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
        const data = await authService.me(); // GET /auth/me/
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
      // PATCH /auth/me/ con los campos editables
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
      <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
          <div
            style={{
              background: '#eee',
              borderRadius: '50%',
              width: 120,
              height: 120,
              margin: '0 auto',
            }}
          />
          <div>
            <div
              style={{
                width: '60%',
                height: 24,
                background: '#eee',
                borderRadius: 8,
                marginBottom: 12,
              }}
            />
            <div
              style={{
                width: '80%',
                height: 18,
                background: '#eee',
                borderRadius: 8,
                marginBottom: 8,
              }}
            />
            <div
              style={{
                width: '80%',
                height: 18,
                background: '#eee',
                borderRadius: 8,
                marginBottom: 8,
              }}
            />
            <div style={{ width: '40%', height: 18, background: '#eee', borderRadius: 8 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div
          aria-hidden
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#131313',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 28,
          }}
        >
          {initials}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
            Perfil de usuario
            {form.is_staff && (
              <span
                style={{
                  marginLeft: 10,
                  background: '#1e88e5',
                  color: '#fff',
                  fontSize: 12,
                  padding: '4px 8px',
                  borderRadius: 999,
                  fontWeight: 700,
                }}
              >
                Admin
              </span>
            )}
          </h1>
          <div style={{ color: '#666' }}>Consulta y actualiza tus datos personales.</div>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div
          style={{
            background: '#ffecec',
            border: '1px solid #ffb4b4',
            color: '#c62828',
            borderRadius: 12,
            padding: '0.75rem',
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          style={{
            background: '#e8f5e9',
            border: '1px solid #c8e6c9',
            color: '#2e7d32',
            borderRadius: 12,
            padding: '0.75rem',
            marginBottom: 16,
          }}
        >
          {success}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#555' }}>
              ID de usuario
            </label>
            <input
              type="text"
              value={form.usuario_id || '—'}
              disabled
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 8,
                border: '1px solid #ddd',
                background: '#f9f9f9',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#555' }}>Email</label>
            <input
              type="email"
              value={form.email || '—'}
              disabled
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 8,
                border: '1px solid #ddd',
                background: '#f9f9f9',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#555' }}>Nombre</label>
            <input
              name="nombre"
              type="text"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 8,
                border: '1px solid #ccc',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#555' }}>Apellido</label>
            <input
              name="apellido"
              type="text"
              placeholder="Tu apellido"
              value={form.apellido}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 8,
                border: '1px solid #ccc',
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, color: '#555' }}>Teléfono</label>
          <input
            name="telefono"
            type="tel"
            placeholder="Tu teléfono"
            value={form.telefono}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem',
              borderRadius: 8,
              border: '1px solid #ccc',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '0.7rem 1rem',
              borderRadius: 10,
              border: 'none',
              background: '#131313',
              color: '#fff',
              fontWeight: 800,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              padding: '0.7rem 1rem',
              borderRadius: 10,
              border: '1px solid #ddd',
              background: '#fff',
              color: '#333',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Volver al inicio
          </button>
        </div>
      </form>
    </div>
  );
}
