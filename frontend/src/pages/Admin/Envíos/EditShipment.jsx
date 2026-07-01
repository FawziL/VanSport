import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/services/routes';
import { locPath } from '@/utils/localePath';

export default function EditShipment() {
  const { t } = useTranslation('admin');
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminService.shipments
      .retrieve(id)
      .then((data) => {
        if (!active) return;
        setForm({
          status: data.status || '',
          shippingMethod: data.shippingMethod || '',
          trackingCode: data.trackingCode || '',
        });
      })
      .catch(() => setError(t('editShipment.errorCargar')))
      .finally(() => active && setLoading(false));
    return () => (active = false);
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await adminService.shipments.partialUpdate(id, form);
      navigate(locPath('/admin/envios'));
    } catch (err) {
      setError(err?.detail || t('editShipment.errorGuardar'));
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('editShipment.cargando')}</p>
        </div>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto my-10 px-4">
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <button
            onClick={() => navigate(locPath('/admin/envios'))}
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
          <h1 className="text-xl font-extrabold text-gray-900">{t('editShipment.titulo')}{id}</h1>
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

        <form onSubmit={onSubmit} className="grid gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('editShipment.estado')}</label>
            <select
              name="status"
              value={form.status}
              onChange={onChange}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">{t('editShipment.seleccionarEstado')}</option>
              <option value="pendiente">{t('status.pendiente')}</option>
              <option value="pagado">{t('status.pagado')}</option>
              <option value="en_transito">{t('status.enTransito')}</option>
              <option value="entregado">{t('status.entregado')}</option>
              <option value="cancelado">{t('status.cancelado')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('editShipment.metodoEnvio')}</label>
            <input
              name="shippingMethod"
              value={form.shippingMethod}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder={t('editShipment.metodoPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('editShipment.codigoSeguimiento')}</label>
            <input
              name="trackingCode"
              value={form.trackingCode}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder={t('editShipment.codigoPlaceholder')}
            />
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(locPath('/admin/envios'))}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              {t('editShipment.cancelar')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              {t('editShipment.guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
