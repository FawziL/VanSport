import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { appService } from '@/services/auth';
import { resolveImageUrl } from '@/utils/resolveUrl';

export default function VerReporte() {
  const { id } = useParams();
  const [reporte, setReporte] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [imagen, setImagen] = useState(null);
  const [sending, setSending] = useState(false);

  const isFinalizado = (reporte?.estado || '').toLowerCase() === 'finalizado';
  
  const load = () =>
    appService.reportes.retrieve(id).then(setReporte);

  useEffect(() => {
    load();
  }, [id]);

  const onSend = async (e) => {
    e.preventDefault();
    if (!mensaje && !imagen) return;
    setSending(true);
    try {
      const fd = new FormData();
      if (mensaje) fd.append('mensaje', mensaje);
      if (imagen) fd.append('imagen', imagen);
      await appService.reportes.addFollowUp(id, fd);
      setMensaje('');
      setImagen(null);
      await load();
    } finally {
      setSending(false);
    }
  };

  if (!reporte) return <div>Cargando…</div>;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', color: '#111'}}>
      <h2>{reporte.titulo}</h2>
      <div style={{ color: '#666', marginBottom: 8 }}>
        <strong>UUID:</strong> {reporte.id} · <strong>Estado:</strong> {reporte.estado} ·{' '}
        <strong>Fecha:</strong> {new Date(reporte.fecha_creacion).toLocaleString('es-ES')}
      </div>
      <div style={{ background: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <div><strong>Categoría:</strong> {reporte.categoria}</div>
        <div><strong>Sección:</strong> {reporte.seccion}</div>
        {reporte.descripcion && <div><strong>Descripción:</strong> {reporte.descripcion}</div>}
        {reporte.imagen_url && (
          <div style={{ marginTop: 8 }}>
            <img src={resolveImageUrl(reporte.imagen_url)} alt="captura" style={{ maxWidth: 300, borderRadius: 6 }} />
          </div>
        )}
        {reporte.video_url && (
          <div style={{ marginTop: 8 }}>
            <video src={resolveImageUrl(reporte.video_url)} controls style={{ maxWidth: 400 }} />
          </div>
        )}
      </div>

      <h3>Follow-up</h3>
      {isFinalizado && (
        <div style={{ background: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa', padding: 8, borderRadius: 8, marginBottom: 8 }}>
          Este reporte está finalizado. No se pueden enviar nuevos mensajes.
        </div>
      )}
      <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
        {(reporte.followups || []).map((m) => {
          const isSupport = m.autor_tipo === 'soporte';
          return (
            <div
              key={m.followup_id}
              style={{
                justifySelf: isSupport ? 'start' : 'end',
                maxWidth: '80%',
                background: isSupport ? '#f3f4f6' : '#e0f2fe',
                color: '#111',
                padding: 10,
                borderRadius: 10,
              }}
            >
              <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
                {isSupport ? 'Soporte' : 'Tú'} · {new Date(m.fecha_creacion).toLocaleString('es-ES')}
              </div>
              {m.mensaje && <div style={{ whiteSpace: 'pre-wrap' }}>{m.mensaje}</div>}
              {m.imagen_url && (
                <img
                  src={resolveImageUrl(m.imagen_url)}
                  alt="adjunto"
                  style={{ maxWidth: 240, marginTop: 6, borderRadius: 6 }}
                />
              )}
            </div>
          );
        })}
        {!reporte.followups?.length && <div style={{ color: '#666' }}>Aún no hay mensajes.</div>}
      </div>

      <form onSubmit={onSend} style={{ display: 'grid', gap: 8, opacity: isFinalizado ? 0.6 : 1 }}>
        <textarea
          rows={3}
          placeholder="Escribe un mensaje (opcional si adjuntas imagen)"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          disabled={isFinalizado}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagen(e.target.files?.[0] || null)}
          disabled={isFinalizado}
        />
        <div>
          <button disabled={isFinalizado || sending || (!mensaje && !imagen)}>
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}