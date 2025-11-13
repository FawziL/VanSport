import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';

export default function CreatePaymentMethod() {
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
      setError('Config debe ser JSON válido');
      return;
    }

    try {
      setSaving(true);
      await adminService.pagos.create({
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
      setError(e?.response?.data?.detail || 'No se pudo crear el método');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: '2.5rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>Crear método de pago</h1>
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
          <label>Código</label>
          <input
            value={form.codigo}
            onChange={(e) => onChange('codigo', e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label>Nombre</label>
          <input
            value={form.nombre}
            onChange={(e) => onChange('nombre', e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label>Tipo</label>
          <input
            value={form.tipo}
            onChange={(e) => onChange('tipo', e.target.value)}
            className="input"
            placeholder="paypal | pago_movil | efectivo | ..."
          />
        </div>
        <div>
          <label>Orden</label>
          <input
            type="number"
            value={form.orden}
            onChange={(e) => onChange('orden', e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label>Activo</label>
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(e) => onChange('activo', e.target.checked)}
          />
        </div>
        <div>
          <label>Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => onChange('descripcion', e.target.value)}
            rows={2}
            className="input"
          />
        </div>
        <div>
          <label>Instrucciones</label>
          <textarea
            value={form.instrucciones}
            onChange={(e) => onChange('instrucciones', e.target.value)}
            rows={4}
            className="input"
          />
        </div>
        <div>
          <label>Icono</label>
          <input
            value={form.icono}
            onChange={(e) => onChange('icono', e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label>Config (JSON)</label>
          <textarea
            value={form.config}
            onChange={(e) => onChange('config', e.target.value)}
            rows={6}
            className="input"
            placeholder='{"banco":"BANESCO","telefono":"+58-..."}'
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
            {saving ? 'Guardando…' : 'Crear'}
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
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
