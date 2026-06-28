import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/services/routes';

export default function CreatePaymentMethod() {
  const { t } = useTranslation('admin');
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    tipo: '',
    activo: true,
    orden: 0,
    descripcion: '',
    instrucciones: '',
    icono: '',
    config: '{}',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError('');
    let cfg = {};
    try {
      cfg = form.config ? JSON.parse(form.config) : {};
    } catch {
      setError(t('createPaymentMethod.errorConfig'));
      return;
    }

    try {
      setSaving(true);
      await adminService.paymentMethodsAdmin.create({
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
      navigate('/admin/metodos-pago');
    } catch (e) {
      setError(e?.response?.data?.detail || t('createPaymentMethod.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: '2.5rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>{t('createPaymentMethod.titulo')}</h1>
      {error && <div style={{ color: '#d32f2f', marginBottom: 12, fontWeight: 700 }}>{error}</div>}
      <div
        style={{
          display: 'grid',
          gap: 12,
          background: '#fff',
          border: '1px solid #eee',
          padding: 16,
          borderRadius: 10,
        }}
      >
        <div>
          <label>{t('createPaymentMethod.codigo')}</label>
          <input
            value={form.codigo}
            onChange={(e) => onChange('codigo', e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label>{t('createPaymentMethod.nombre')}</label>
          <input
            value={form.nombre}
            onChange={(e) => onChange('nombre', e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label>{t('createPaymentMethod.tipo')}</label>
          <input
            value={form.tipo}
            onChange={(e) => onChange('tipo', e.target.value)}
            className="input"
            placeholder={t('createPaymentMethod.tipoPlaceholder')}
          />
        </div>
        <div>
          <label>{t('createPaymentMethod.orden')}</label>
          <input
            type="number"
            value={form.orden}
            onChange={(e) => onChange('orden', e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label>{t('createPaymentMethod.activo')}</label>
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(e) => onChange('activo', e.target.checked)}
          />
        </div>
        <div>
          <label>{t('createPaymentMethod.descripcion')}</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => onChange('descripcion', e.target.value)}
            rows={2}
            className="input"
          />
        </div>
        <div>
          <label>{t('createPaymentMethod.instrucciones')}</label>
          <textarea
            value={form.instrucciones}
            onChange={(e) => onChange('instrucciones', e.target.value)}
            rows={4}
            className="input"
          />
        </div>
        <div>
          <label>{t('createPaymentMethod.icono')}</label>
          <input
            value={form.icono}
            onChange={(e) => onChange('icono', e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label>{t('createPaymentMethod.config')}</label>
          <textarea
            value={form.config}
            onChange={(e) => onChange('config', e.target.value)}
            rows={6}
            className="input"
            placeholder={t('createPaymentMethod.configPlaceholder')}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={submit}
            disabled={saving}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: 8,
              background: '#1e88e5',
              color: '#fff',
              fontWeight: 800,
              border: 'none',
            }}
          >
            {saving ? t('createPaymentMethod.guardando') : t('createPaymentMethod.crear')}
          </button>
          <button
            onClick={() => navigate('/admin/metodos-pago')}
            type="button"
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: '#fff',
              fontWeight: 800,
            }}
          >
            {t('createPaymentMethod.cancelar')}
          </button>
        </div>
      </div>
    </div>
  );
}
