import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminService } from '@/services/routes';
import { locPath } from '@/utils/localePath';
import { resolveImageUrl } from '@/utils/resolveUrl';

function FieldError({ error }) {
  if (!error) return null;
  const msg = Array.isArray(error) ? error.join(', ') : String(error);
  return <div style={{ color: '#d32f2f', fontSize: 13, marginTop: 6 }}>{msg}</div>;
}

export default function EditCategory() {
  const { t } = useTranslation('admin');
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    imagen: null,
    imagenPreview: '',
    imagenActual: '',
  });
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
        const data = await adminService.categories.retrieve(id);
        const name = data?.name ?? '';
        const description = data?.description ?? '';
        const imagenActual = resolveImageUrl(data?.imageUrl || '');
        if (alive) setForm({ name, description, imagen: null, imagenPreview: '', imagenActual });
      } catch (err) {
        if (!alive) return;
        const msg =
          err?.response?.data?.detail || err?.message || t('editCategory.errorCargar');
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
    if (!form.name || form.name.trim().length < 2) {
      e.name = t('editCategory.nombreRequerido');
    }
    // descripción es opcional
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

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description?.trim() || '');
      if (form.imagen) fd.append('imagen', form.imagen);
      await adminService.categories.update(id, fd);
      navigate(locPath('/admin/categorias'));
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        setErrors(data);
        const global = data.detail || data.non_field_errors || data.error || null;
        setGlobalError(global ? (Array.isArray(global) ? global.join(', ') : String(global)) : '');
      } else {
        setGlobalError(err?.message || t('editCategory.errorGuardar'));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('editCategory.cargando')}</p>
        </div>
      </div>
    );

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>{t('editCategory.titulo')}</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link
            to={locPath('/admin/categorias')}
            style={{ color: '#1e88e5', fontWeight: 700, textDecoration: 'none' }}
          >
            {t('editCategory.volver')}
          </Link>
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

      <form
        onSubmit={handleSubmit}
        style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '1rem' }}
      >
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="name" style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
            {t('editCategory.nombre')}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder={t('editCategory.nombrePlaceholder')}
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem',
              borderRadius: 8,
              border: '1px solid #ccc',
              fontSize: 15,
            }}
          />
          <FieldError error={errors.name} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label
            htmlFor="description"
            style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}
          >
            {t('editCategory.descripcion')}
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder={t('editCategory.descripcionPlaceholder')}
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
            {t('editCategory.imagen')}
          </label>
          {form.imagenPreview ? (
            <img
              src={form.imagenPreview}
              alt={t('editCategory.nombre')}
              style={{ display: 'block', maxWidth: 260, marginBottom: 8, borderRadius: 10 }}
            />
          ) : form.imagenActual ? (
            <img
              src={form.imagenActual}
              alt={t('editCategory.imagen')}
              style={{ display: 'block', maxWidth: 260, marginBottom: 8, borderRadius: 10 }}
            />
          ) : null}
          <input id="imagen" name="imagen" type="file" accept="image/*" onChange={handleChange} />
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
            {saving ? t('editCategory.guardando') : t('editCategory.guardar')}
          </button>
          <Link
            to={locPath('/admin/categorias')}
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
            {t('editCategory.cancelar')}
          </Link>
        </div>
      </form>
    </div>
  );
}
