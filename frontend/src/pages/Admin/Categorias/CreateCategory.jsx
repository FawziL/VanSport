import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '@/services/auth';

function FieldError({ error }) {
  if (!error) return null;
  const msg = Array.isArray(error) ? error.join(', ') : String(error);
  return <div style={{ color: '#d32f2f', fontSize: 13, marginTop: 6 }}>{msg}</div>;
}

export default function CreateCategory() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    imagen: null,
    imagenPreview: '',
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateLocal = () => {
    const e = {};
    if (!form.nombre || form.nombre.trim().length < 2) {
      e.nombre = 'El nombre es requerido (mínimo 2 caracteres).';
    }
    // descripción opcional
    return e;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imagen') {
      const file = files && files[0] ? files[0] : null;
      setForm((prev) => ({ ...prev, imagen: file, imagenPreview: file ? URL.createObjectURL(file) : '' }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setGlobalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    const localErrors = validateLocal();
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('nombre', form.nombre.trim());
      fd.append('descripcion', form.descripcion?.trim() || '');
      if (form.imagen) fd.append('imagen', form.imagen);
      await adminService.categorias.create(fd);
      navigate(`/admin/categorias`);

    } catch (err) {
      // Mapea errores del backend (por campo o mensaje general)
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        setErrors(data);
        // Si viene un detail o non_field_errors, muéstralo arriba
        const global =
          data.detail ||
          data.non_field_errors ||
          data.error ||
          null;
        setGlobalError(
          global
            ? Array.isArray(global)
              ? global.join(', ')
              : String(global)
            : ''
        );
      } else {
        setGlobalError(err?.message || 'No se pudo crear la categoría.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>Crear categoría</h1>
        <Link to="/admin/categorias" style={{ color: '#1e88e5', fontWeight: 700, textDecoration: 'none' }}>
          ← Volver a categorías
        </Link>
      </div>

      {globalError && (
        <div
          style={{
            background: '#ffecec',
            border: '1px solid #ffb4b4',
            color: '#c62828',
            borderRadius: 10,
            padding: '0.8rem 1rem',
            marginBottom: 12,
            fontWeight: 700,
          }}
        >
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '1rem' }}>
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="nombre" style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej. Camisetas"
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem',
              borderRadius: 8,
              border: '1px solid #ccc',
              fontSize: 15,
            }}
            autoFocus
          />
          <FieldError error={errors.nombre} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label htmlFor="descripcion" style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
            Descripción (opcional)
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Breve descripción de la categoría..."
            rows={4}
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem',
              borderRadius: 8,
              border: '1px solid #ccc',
              fontSize: 15,
              resize: 'vertical',
            }}
          />
          <FieldError error={errors.descripcion} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label htmlFor="imagen" style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
            Imagen (opcional)
          </label>
          <input
            id="imagen"
            name="imagen"
            type="file"
            accept="image/*"
            onChange={handleChange}
            style={{ display: 'block' }}
          />
          {form.imagenPreview && (
            <img src={form.imagenPreview} alt="Vista previa" style={{ marginTop: 10, maxWidth: 240, borderRadius: 10 }} />
          )}
          <FieldError error={errors.imagen} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.7rem 1.2rem',
              borderRadius: 10,
              border: 'none',
              background: '#1e88e5',
              color: '#fff',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creando...' : 'Crear categoría'}
          </button>
        </div>
      </form>
    </div>
  );
}