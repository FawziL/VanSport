import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/auth';

export default function EditReview() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminService.reseñas
      .retrieve(id)
      .then((data) => {
        if (!active) return;
        setForm({
          calificacion: data.calificacion ?? 0,
          comentario: data.comentario || '',
        });
      })
      .catch(() => setError('No se pudo cargar la reseña'))
      .finally(() => active && setLoading(false));
    return () => (active = false);
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'calificacion' ? Number(value) : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await adminService.reseñas.partialUpdate(id, form);
      navigate('/admin/resenas');
    } catch (err) {
      setError(err?.detail || 'No se pudo actualizar la reseña');
    }
  };

  if (loading || !form) return <div style={{ padding: 24 }}>Cargando...</div>;

  return (
    <div style={{ maxWidth: 700, margin: '2.5rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>Editar reseña</h1>
      {error && <div style={{ color: '#d32f2f', marginBottom: 12, fontWeight: 700 }}>{error}</div>}
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Calificación</span>
          <input
            type="number"
            min={1}
            max={5}
            step={1}
            name="calificacion"
            value={form.calificacion}
            onChange={onChange}
            required
          />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Comentario</span>
          <textarea name="comentario" value={form.comentario} onChange={onChange} rows={3} />
        </label>
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
            onClick={() => navigate('/admin/resenas')}
            style={{ padding: '0.6rem 1.2rem', borderRadius: 8 }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
