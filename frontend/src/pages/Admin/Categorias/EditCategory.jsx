import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminService } from '@/services/auth';
import ConfirmModal from '@/components/ConfirmModal';

function FieldError({ error }) {
  if (!error) return null;
  const msg = Array.isArray(error) ? error.join(', ') : String(error);
  return <div style={{ color: '#d32f2f', fontSize: 13, marginTop: 6 }}>{msg}</div>;
}

export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nombre: '', descripcion: '', imagen: null, imagenPreview: '', imagenActual: '' });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Opcional: soporte eliminar desde la pantalla de edición
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setGlobalError('');
      setErrors({});
      try {
        const data = await adminService.categorias.retrieve(id);
  const nombre = data?.nombre ?? '';
  const descripcion = data?.descripcion ?? '';
  const imagenActual = data?.imagen_url || '';
  if (alive) setForm({ nombre, descripcion, imagen: null, imagenPreview: '', imagenActual });
      } catch (err) {
        if (!alive) return;
        const msg = err?.response?.data?.detail || err?.message || 'No se pudo cargar la categoría.';
        setGlobalError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (id) load();
    return () => {
      alive = false;
    };
  }, [id]);

  const validateLocal = () => {
    const e = {};
    if (!form.nombre || form.nombre.trim().length < 2) {
      e.nombre = 'El nombre es requerido (mínimo 2 caracteres).';
    }
    // descripción es opcional
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

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('nombre', form.nombre.trim());
      fd.append('descripcion', form.descripcion?.trim() || '');
      if (form.imagen) fd.append('imagen', form.imagen);
      await adminService.categorias.update(id, fd);
      navigate('/admin/categorias');
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        setErrors(data);
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
        setGlobalError(err?.message || 'No se pudo actualizar la categoría.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.categorias.remove(id);
      navigate('/admin/categorias');
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'No se pudo eliminar la categoría.';
      setGlobalError(msg);
    } finally {
      setModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ width: '60%', height: 20, background: '#eee', borderRadius: 8, marginBottom: 12 }} />
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '1rem' }}>
          <div style={{ width: '50%', height: 18, background: '#eee', borderRadius: 8, marginBottom: 12 }} />
          <div style={{ width: '100%', height: 44, background: '#eee', borderRadius: 10 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>Editar categoría</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/categorias" style={{ color: '#1e88e5', fontWeight: 700, textDecoration: 'none' }}>
            ← Volver
          </Link>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: 8,
              border: 'none',
              background: '#e53935',
              color: '#fff',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Eliminar
          </button>
        </div>
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
          {form.imagenPreview ? (
            <img src={form.imagenPreview} alt="Vista previa" style={{ display: 'block', maxWidth: 260, marginBottom: 8, borderRadius: 10 }} />
          ) : form.imagenActual ? (
            <img src={form.imagenActual} alt="Imagen actual" style={{ display: 'block', maxWidth: 260, marginBottom: 8, borderRadius: 10 }} />
          ) : null}
          <input
            id="imagen"
            name="imagen"
            type="file"
            accept="image/*"
            onChange={handleChange}
          />
          <FieldError error={errors.imagen} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '0.7rem 1.2rem',
              borderRadius: 10,
              border: 'none',
              background: '#1e88e5',
              color: '#fff',
              fontWeight: 800,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <Link
            to="/admin/categorias"
            style={{
              padding: '0.7rem 1.2rem',
              borderRadius: 10,
              border: '1px solid #aaa',
              background: '#fff',
              color: '#222',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            Cancelar
          </Link>
        </div>
      </form>

      <ConfirmModal
        open={modalOpen}
        title="¿Eliminar categoría?"
        message="Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        danger
        onCancel={() => setModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}