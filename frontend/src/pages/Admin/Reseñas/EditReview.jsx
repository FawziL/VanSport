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

  if (loading || !form) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-gray-600">
        Cargando reseña...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-10 px-4">
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <button
            onClick={() => navigate('/admin/resenas')}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="Volver"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-xl font-extrabold text-gray-900">Editar reseña #{id}</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="text-sm">{error}</div>
          </div>
        )}

        <form onSubmit={onSubmit} className="grid gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Calificación *</label>
            <select
              name="calificacion"
              value={form.calificacion}
              onChange={onChange}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value={0}>Seleccionar calificación</option>
              <option value={1}>1 - Muy mala</option>
              <option value={2}>2 - Mala</option>
              <option value={3}>3 - Regular</option>
              <option value={4}>4 - Buena</option>
              <option value={5}>5 - Excelente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Comentario</label>
            <textarea
              name="comentario"
              value={form.comentario}
              onChange={onChange}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Escribe un comentario (opcional)"
            />
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/admin/resenas')}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
