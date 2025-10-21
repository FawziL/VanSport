import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminService } from '@/services/auth';
import { CATEGORIAS_FALLA } from '@/utils/categorias';
import { resolveImageUrl } from '@/utils/resolveUrl';

export default function EditReporte() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [savingEstado, setSavingEstado] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [img, setImg] = useState(null);
  const [sending, setSending] = useState(false);
  const [finalizing, setFinalizing] = useState(false); // <-- nuevo

  const load = () => adminService.reportes.retrieve(id).then(setItem);

  useEffect(() => {
    load();
  }, [id]);

  const onSaveEstado = async () => {
    if (!item) return;
    setSavingEstado(true);
    try {
      await adminService.reportes.patch(id, { estado: item.estado });
      await load();
    } finally {
      setSavingEstado(false);
    }
  };

  const onFinalize = async () => { // <-- nuevo
    if (!item || item.estado === 'finalizado') return;
    setFinalizing(true);
    try {
      await adminService.reportes.patch(id, { estado: 'finalizado' });
      await load();
    } finally {
      setFinalizing(false);
    }
  };

  const onSendFU = async () => {
    if (!nuevoMensaje && !img) return;
    setSending(true);
    try {
      const fd = new FormData();
      if (nuevoMensaje) fd.append('mensaje', nuevoMensaje);
      if (img) fd.append('imagen', img);
      await adminService.reportes.addFollowUp(id, fd);
      setNuevoMensaje('');
      setImg(null);
      await load();
    } finally {
      setSending(false);
    }
  };

  if (!item) return <div>Cargando…</div>;
  const isFinalizado = item.estado === 'finalizado'; // <-- nuevo

  const categoriaLabel =
    CATEGORIAS_FALLA.find((c) => c.value === item.categoria)?.label || item.categoria;

  return (
    <div style={{ color: '#111'}}>
      <h2 style={{ marginBottom: 12 }}>Reporte de falla</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
          alignItems: 'start',
        }}
      >
        {/* Panel izquierda */}
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{item.titulo}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                value={item.estado}
                onChange={(e) => setItem({ ...item, estado: e.target.value })}
                style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #ddd' }}
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_revision">En revisión</option>
                <option value="finalizado">Finalizado</option>
              </select>
              <button onClick={onSaveEstado} disabled={savingEstado}>
                {savingEstado ? 'Guardando…' : 'Guardar'}
              </button>
              <button
                onClick={onFinalize}
                disabled={finalizing || isFinalizado}
                title={isFinalizado ? 'Ya está finalizado' : 'Marcar como finalizado'}
                style={{
                  background: isFinalizado ? '#ddd' : '#16a34a',
                  color: '#fff',
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 700,
                }}
              >
                {finalizing ? 'Finalizando…' : 'Finalizar'}
              </button>
            </div>
          </div>

          <div style={{ color: '#666', marginTop: 6 }}>
            <strong>UUID:</strong>{' '}
            <span style={{ fontFamily: 'monospace' }}>{item.id}</span> ·{' '}
            <strong>Fecha:</strong> {new Date(item.fecha_creacion).toLocaleString('es-ES')}
          </div>

          <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
            <div><strong>Usuario:</strong> {item.usuario_nombre} {item.usuario_apellido} ({item.usuario_email})</div>
            <div><strong>Categoría:</strong> {categoriaLabel}</div>
            <div><strong>Sección:</strong> {item.seccion}</div>
            {item.descripcion && <div><strong>Descripción:</strong> {item.descripcion}</div>}

            {item.imagen_url && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={resolveImageUrl(item.imagen_url)}
                  alt="captura"
                  style={{ maxWidth: '100%', borderRadius: 8, display: 'block' }}
                />
              </div>
            )}
            {item.video_url && (
              <div style={{ marginTop: 8 }}>
                <video src={resolveImageUrl(item.video_url)} controls style={{ maxWidth: '100%', borderRadius: 8 }} />
              </div>
            )}
          </div>
        </div>

        {/* Panel derecha: follow-up */}
        <div>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Follow-up</h3>
            {isFinalizado && (
              <div style={{ background: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa', padding: 8, borderRadius: 8, marginBottom: 8 }}>
                Este reporte está finalizado. No se pueden enviar nuevos mensajes.
              </div>
            )}
            <div style={{ display: 'grid', gap: 8 }}>
              {(item.followups || []).map((m) => {
                const isSupport = m.autor_tipo === 'soporte';
                return (
                  <div
                    key={m.followup_id}
                    style={{
                      justifySelf: isSupport ? 'start' : 'end',
                      maxWidth: '90%',
                      background: isSupport ? '#f3f4f6' : '#e0f2fe',
                      color: '#111',
                      padding: 10,
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
                      {isSupport ? 'Soporte' : 'Usuario'} · {new Date(m.fecha_creacion).toLocaleString('es-ES')}
                    </div>
                    {m.mensaje && <div style={{ whiteSpace: 'pre-wrap' }}>{m.mensaje}</div>}
                    {m.imagen_url && (
                      <img
                        src={resolveImageUrl(m.imagen_url)}
                        alt="adjunto"
                        style={{ maxWidth: 260, marginTop: 6, borderRadius: 6, display: 'block' }}
                      />
                    )}
                  </div>
                );
              })}
              {!item.followups?.length && <div style={{ color: '#666' }}>Aún no hay mensajes.</div>}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
            <h4 style={{ marginTop: 0 }}>Enviar respuesta (Soporte)</h4>
            <div style={{ display: 'grid', gap: 8, opacity: isFinalizado ? 0.6 : 1 }}>
              <textarea
                rows={3}
                placeholder="Mensaje (opcional si adjuntas imagen)"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                disabled={isFinalizado}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImg(e.target.files?.[0] || null)}
                disabled={isFinalizado}
              />
              <div>
                <button onClick={onSendFU} disabled={isFinalizado || sending || (!nuevoMensaje && !img)}>
                  {sending ? 'Enviando…' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}