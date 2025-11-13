import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/auth';

export default function EditPaymentMethod() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    adminService.pagos
      .get(id)
      .then((data) => {
        setForm({
          codigo: data.codigo || '',
          nombre: data.nombre || '',
          tipo: data.tipo || '',
          activo: !!data.activo,
          orden: data.orden ?? 0,
          descripcion: data.descripcion || '',
          instrucciones: data.instrucciones || '',
          icono: data.icono || '',
          config: JSON.stringify(data.config ?? {}, null, 2),
        });
      })
      .catch(() => setError('No se pudo cargar el método'))
      .finally(() => setLoading(false));
  }, [id]);

  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e?.preventDefault?.();
    setError('');
    let cfg = {};
    try {
      cfg = form.config ? JSON.parse(form.config) : {};
    } catch {
      setError('Config debe ser JSON válido');
      return;
    }

    try {
      setSaving(true);
      await adminService.pagos.partialUpdate(id, {
        codigo: form.codigo.trim(),
        nombre: form.nombre.trim(),
        tipo: form.tipo.trim(),
        activo: !!form.activo,
        orden: Number(form.orden) || 0,
        descripcion: form.descripcion || '',
        instrucciones: form.instrucciones || '',
        icono: form.icono || '',
        config: cfg,
      });
      navigate('/admin/metodos-pago');
    } catch (e) {
      setError(e?.response?.data?.detail || 'No se pudo actualizar el método');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[50vh] text-gray-600">Cargando…</div>;
  }

  if (error && !form) {
    return (
      <div className="max-w-3xl mx-auto my-10 px-4">
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-bold">
          {error}
        </div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="max-w-3xl mx-auto my-10 px-4">
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <button
            onClick={() => navigate('/admin/metodos-pago')}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="Volver"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="text-xl font-extrabold text-gray-900">Editar método de pago #{id}</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
            <svg
              className="w-5 h-5 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="#b91c1c"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm">{error}</div>
          </div>
        )}

        <form onSubmit={submit} className="grid gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Código</label>
            <input
              value={form.codigo}
              onChange={(e) => onChange('codigo', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
            <input
              value={form.nombre}
              onChange={(e) => onChange('nombre', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
            <input
              value={form.tipo}
              onChange={(e) => onChange('tipo', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Orden</label>
            <input
              type="number"
              value={form.orden}
              onChange={(e) => onChange('orden', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="activo"
              type="checkbox"
              checked={form.activo}
              onChange={(e) => onChange('activo', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-300"
            />
            <label htmlFor="activo" className="text-sm font-medium text-gray-700">
              Activo
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => onChange('descripcion', e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              placeholder="Descripción (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Instrucciones</label>
            <textarea
              value={form.instrucciones}
              onChange={(e) => onChange('instrucciones', e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              placeholder="Instrucciones para el cliente (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Icono</label>
            <input
              value={form.icono}
              onChange={(e) => onChange('icono', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              placeholder="Nombre o URL del icono"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Config (JSON)</label>
            <textarea
              value={form.config}
              onChange={(e) => onChange('config', e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-mono"
              placeholder='{"clave":"valor"}'
            />
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/admin/metodos-pago')}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
