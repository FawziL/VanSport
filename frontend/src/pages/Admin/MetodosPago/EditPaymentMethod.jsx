import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/services/routes';
import { locPath } from '@/utils/localePath';

export default function EditPaymentMethod() {
  const { t } = useTranslation('admin');
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    adminService.paymentMethodsAdmin
      .retrieve(id)
      .then((data) => {
        setForm({
          codigo: data.code || '',
          nombre: data.name || '',
          tipo: data.type || '',
          activo: !!data.isActive,
          orden: data.sortOrder ?? 0,
          descripcion: data.description || '',
          instrucciones: data.instructions || '',
          icono: data.icon || '',
          config: JSON.stringify(data.config ?? {}, null, 2),
        });
      })
      .catch(() => setError(t('editPaymentMethod.errorCargar')))
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
      setError(t('editPaymentMethod.errorConfig'));
      return;
    }

    try {
      setSaving(true);
      await adminService.paymentMethodsAdmin.partialUpdate(id, {
        code: form.codigo.trim(),
        name: form.nombre.trim(),
        type: form.tipo.trim(),
        isActive: !!form.activo,
        sortOrder: Number(form.orden) || 0,
        description: form.descripcion || '',
        instructions: form.instrucciones || '',
        icon: form.icono || '',
        config: cfg,
      });
      navigate(locPath('/admin/metodos-pago'));
    } catch (e) {
      setError(e?.response?.data?.detail || t('editPaymentMethod.errorGuardar'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[50vh] text-gray-600">{t('editPaymentMethod.cargando')}</div>;
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
            onClick={() => navigate(locPath('/admin/metodos-pago'))}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label={t('editPaymentMethod.ariaVolver')}
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
          <h1 className="text-xl font-extrabold text-gray-900">{t('editPaymentMethod.titulo')}{id}</h1>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('editPaymentMethod.codigo')}</label>
            <input
              value={form.codigo}
              onChange={(e) => onChange('codigo', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('editPaymentMethod.nombre')}</label>
            <input
              value={form.nombre}
              onChange={(e) => onChange('nombre', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('editPaymentMethod.tipo')}</label>
            <input
              value={form.tipo}
              onChange={(e) => onChange('tipo', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('editPaymentMethod.orden')}</label>
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
              {t('editPaymentMethod.activo')}
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('editPaymentMethod.descripcion')}</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => onChange('descripcion', e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              placeholder={t('editPaymentMethod.descripcionPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('editPaymentMethod.instrucciones')}</label>
            <textarea
              value={form.instrucciones}
              onChange={(e) => onChange('instrucciones', e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              placeholder={t('editPaymentMethod.instruccionesPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('editPaymentMethod.icono')}</label>
            <input
              value={form.icono}
              onChange={(e) => onChange('icono', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              placeholder={t('editPaymentMethod.iconoPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('editPaymentMethod.config')}</label>
            <textarea
              value={form.config}
              onChange={(e) => onChange('config', e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-mono"
              placeholder={t('editPaymentMethod.configPlaceholder')}
            />
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(locPath('/admin/metodos-pago'))}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              {t('editPaymentMethod.cancelar')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {saving ? t('editPaymentMethod.guardando') : t('editPaymentMethod.guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
