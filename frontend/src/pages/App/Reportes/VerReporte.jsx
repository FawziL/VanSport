import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { appService } from '@/services/routes';
import { resolveImageUrl } from '@/utils/resolveUrl';
import StatusBadge from '@/components/StatusBadge';

export default function VerReporte() {
  const { id } = useParams();
  const [reporte, setReporte] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [imagen, setImagen] = useState(null);
  const [sending, setSending] = useState(false);

  const isFinalizado = (reporte?.estado || '').toLowerCase() === 'finalizado';

  const load = () => appService.reportes.retrieve(id).then(setReporte);

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

  if (!reporte)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reporte...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-start">Mi Reporte</h1>
            <p className="text-gray-600 mt-1">Seguimiento de tu reporte de falla</p>
          </div>
          <Link
            to="/reportes"
            className="px-4 py-2 bg-gray-600 text-white! font-bold rounded-lg hover:bg-gray-700 transition-colors no-underline"
          >
            Volver a Mis Reportes
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-start">
          {/* Panel izquierdo - Información del reporte */}
          <div className="space-y-6">
            {/* Tarjeta principal */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 break-words">{reporte.titulo}</h2>

              {/* Estado y metadatos */}
              <div>
                <span className="font-semibold">UUID:</span>{' '}
                <code className="font-mono px-2 py-1 rounded">{reporte.id}</code>
              </div>

              {/* Estado actual */}
              <div className="mb-4 mt-2">
                <span className="text-sm font-semibold text-gray-700">Estado actual: </span>
                <StatusBadge estado={reporte.estado} />
              </div>
              <div className="mb-6">
                <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="font-semibold">Fecha:</span>{' '}
                      {new Date(reporte.fecha_creacion).toLocaleString('es-ES', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </div>
                    <div>
                      <span className="font-semibold">Categoría:</span> {reporte.categoria}
                    </div>
                    <div>
                      <span className="font-semibold">Sección:</span> {reporte.seccion}
                    </div>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              {reporte.descripcion && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">Descripción</h3>
                  <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {reporte.descripcion}
                  </div>
                </div>
              )}

              {/* Multimedia */}
              <div className="space-y-4">
                {reporte.imagen_url && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Imagen adjunta</h3>
                    <div className="flex justify-center">
                      <img
                        src={resolveImageUrl(reporte.imagen_url)}
                        alt="captura del reporte"
                        className="max-w-[100px] max-h-[100px] rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>
                )}
                {reporte.video_url && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Video adjunto</h3>
                    <div className="flex justify-center">
                      <video
                        src={resolveImageUrl(reporte.video_url)}
                        controls
                        className="max-w-full rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Panel derecho - Follow-up */}
          <div className="space-y-6">
            {/* Historial de mensajes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Historial de Mensajes
              </h3>

              {isFinalizado && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Este reporte está finalizado. No se pueden enviar nuevos mensajes.
                  </div>
                </div>
              )}

              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {(reporte.followups || []).map((followup) => {
                  const isSupport = followup.autor_tipo === 'soporte';
                  return (
                    <div
                      key={followup.followup_id}
                      className={`flex ${isSupport ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[85%] p-4 rounded-2xl ${
                          isSupport
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-green-50 border border-green-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2 gap-x-4">
                          <span
                            className={`text-xs font-semibold ${
                              isSupport ? 'text-blue-700' : 'text-green-700'
                            }`}
                          >
                            {isSupport
                              ? 'Soporte'
                              : `${reporte.usuario_nombre} ${reporte.usuario_apellido}`}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(followup.fecha_creacion).toLocaleString('es-ES', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        {followup.mensaje && (
                          <div
                            className={`text-gray-800 whitespace-pre-wrap 
                          ${isSupport ? 'text-start' : 'text-end'}`}
                          >
                            {followup.mensaje}
                          </div>
                        )}
                        {followup.imagen_url && (
                          <img
                            src={resolveImageUrl(followup.imagen_url)}
                            alt="adjunto del mensaje"
                            className="max-w-[200px] max-h-[200px] object-contain mt-2 rounded-lg border border-gray-200"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
                {!reporte.followups?.length && (
                  <div className="text-center text-gray-500 py-8">
                    <svg
                      className="w-12 h-12 mx-auto text-gray-300 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Aún no hay mensajes en este reporte.
                  </div>
                )}
              </div>
            </div>

            {/* Formulario de respuesta */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Enviar Mensaje</h4>
              <form onSubmit={onSend} className={`space-y-4 ${isFinalizado ? 'opacity-50' : ''}`}>
                <textarea
                  rows={3}
                  placeholder="Escribe tu mensaje (opcional si adjuntas imagen)..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  disabled={isFinalizado}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical disabled:bg-gray-100"
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Imagen adjunta (opcional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImagen(e.target.files?.[0] || null)}
                    disabled={isFinalizado}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:bg-gray-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isFinalizado || sending || (!mensaje && !imagen)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Enviando...
                    </div>
                  ) : (
                    'Enviar Mensaje'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
