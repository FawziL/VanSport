import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '@/services/routes';
import { locPath } from '@/utils/localePath';

function FieldError({ error }) {
  if (!error) return null;
  const msg = Array.isArray(error) ? error.join(', ') : String(error);
  return <div style={{ color: '#d32f2f', fontSize: 13, marginTop: 6 }}>{msg}</div>;
}

export default function CreateCategory() {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    imagen: null,
    imagenPreview: '',
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateLocal = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) {
      e.name = t('createCategory.nombreRequerido');
    }
    // descripción opcional
    return e;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imagen') {
      const file = files && files[0] ? files[0] : null;
      setForm((prev) => ({
        ...prev,
        imagen: file,
        imagenPreview: file ? URL.createObjectURL(file) : '',
      }));
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
      fd.append('name', form.name.trim());
      fd.append('description', form.description?.trim() || '');
      if (form.imagen) fd.append('imagen', form.imagen);
      await adminService.categories.create(fd);
      navigate(locPath('/admin/categorias'));
    } catch (err) {
      // Mapea errores del backend (por campo o mensaje general)
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        setErrors(data);
        // Si viene un detail o non_field_errors, muéstralo arriba
        const global = data.detail || data.non_field_errors || data.error || null;
        setGlobalError(global ? (Array.isArray(global) ? global.join(', ') : String(global)) : '');
      } else {
        setGlobalError(err?.message || t('createCategory.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>{t('createCategory.titulo')}</h1>
        <Link
          to={locPath('/admin/categorias')}
          style={{ color: '#1e88e5', fontWeight: 700, textDecoration: 'none' }}
        >
          {t('createCategory.volver')}
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

      <form
        onSubmit={handleSubmit}
        style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '1rem' }}
      >
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="name" style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
            {t('createCategory.nombre')}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder={t('createCategory.nombrePlaceholder')}
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem',
              borderRadius: 8,
              border: '1px solid #ccc',
              fontSize: 15,
            }}
            autoFocus
          />
          <FieldError error={errors.name} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label
            htmlFor="description"
            style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}
          >
            {t('createCategory.descripcion')}
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder={t('createCategory.descripcionPlaceholder')}
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
          <FieldError error={errors.description} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label htmlFor="imagen" style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
            {t('createCategory.imagen')}
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
            <img
              src={form.imagenPreview}
              alt={t('createCategory.nombre')}
              style={{ marginTop: 10, maxWidth: 240, borderRadius: 10 }}
            />
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
            {loading ? t('createCategory.creando') : t('createCategory.crear')}
          </button>
        </div>
      </form>
    </div>
  );
}
