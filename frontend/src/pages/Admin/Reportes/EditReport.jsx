import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/services/routes';
import { CATEGORIAS_FALLA } from '@/utils/categorias';
import { resolveImageUrl } from '@/utils/resolveUrl';
import StatusBadge from '@/components/StatusBadge';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function EditReporte() {
  const { t } = useTranslation('admin');
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [img, setImg] = useState(null);
  const [sending, setSending] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [reopening, setReopening] = useState(false);

  const load = async () => {
    const [report, followups] = await Promise.all([
      adminService.bugReports.retrieve(id),
      adminService.bugReports.findFollowups(id),
    ]);
    let user = null;
    try {
      user = await adminService.users.retrieve(report.userId);
    } catch {}
    setItem({ ...report, followups, user });
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateStatus = async (status) => {
    const fd = new FormData();
    fd.append('status', status);
    return adminService.bugReports.partialUpdate(id, fd);
  };

  const onFinalize = async () => {
    if (!item || item.status === 'finalizado') return;
    setFinalizing(true);
    try {
      await updateStatus('finalizado');
      await load();
      toast.success(t('editReport.successFinalizar'));
    } catch (err) {
      const msg = err?.response?.data?.detail || t('editReport.errorFinalizar');
      toast.error(msg);
    } finally {
      setFinalizing(false);
    }
  };

  const onReopen = async () => {
    if (!item || item.status !== 'finalizado') return;
    setReopening(true);
    try {
      await updateStatus('en_revision');
      await load();
      toast.success(t('editReport.successReabrir'));
    } catch (err) {
      const msg = err?.response?.data?.detail || t('editReport.errorReabrir');
      toast.error(msg);
    } finally {
      setReopening(false);
    }
  };

  const onSendFU = async () => {
    if (!nuevoMensaje && !img) return;
    setSending(true);
    try {
      const fd = new FormData();
      if (nuevoMensaje) fd.append('message', nuevoMensaje);
      if (img) fd.append('imagen', img);
      await adminService.bugReports.addFollowUp(id, fd);
      setNuevoMensaje('');
      setImg(null);
      await load();
    } finally {
      setSending(false);
    }
  };

  if (!item)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('editReport.cargando')}</p>
        </div>
      </div>
    );

  const isCompleted = item.status === 'finalizado';
  const categoriaLabel =
    CATEGORIAS_FALLA.find((c) => c.value === item.category)?.label || item.category;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('editReport.titulo')}</h1>
            <p className="text-gray-600 mt-1">{t('editReport.subtitulo')}</p>
          </div>
          <Link
            to="/admin/reportes"
            className="px-4 py-2 bg-gray-600 text-white! font-bold rounded-lg hover:bg-gray-700 transition-colors no-underline"
          >
            {t('editReport.volver')}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel izquierdo - Información del reporte */}
          <div className="space-y-6">
            {/* Tarjeta principal */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-start">
              {/* Header con título y estado */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-gray-900 break-words">{item.title}</h2>
                <div className="flex flex-wrap gap-2">
                  {!isCompleted ? (
                    <button
                      onClick={onFinalize}
                      disabled={finalizing}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {finalizing ? t('editReport.finalizando') : t('editReport.finalizar')}
                    </button>
                  ) : (
                    <button
                      onClick={onReopen}
                      disabled={reopening}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reopening ? t('editReport.reabriendo') : t('editReport.reabrir')}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <span className="font-semibold">{t('editReport.uuid')}</span>{' '}
                <code className="font-mono px-2 py-1 rounded">{item.id}</code>
              </div>

              {/* Estado actual */}
              <div className="mb-4 mt-2">
                <span className="text-sm font-semibold text-gray-700">{t('editReport.estadoActual')} </span>
                <StatusBadge estado={item.status} />
              </div>

              {/* Metadatos */}
              <div className="text-sm text-gray-600 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold">{t('editReport.fecha')}</span>{' '}
                    {new Date(item.createdAt).toLocaleString('es-ES')}
                  </div>
                  <div>
                    <span className="font-semibold">{t('editReport.usuario')}</span> {item.user?.name} {item.user?.lastName || ''}
                  </div>
                  <div>
                    <span className="font-semibold">{t('editReport.email')}</span> {item.user?.email}
                  </div>
                  <div>
                    <span className="font-semibold">{t('editReport.categoria')}</span> {categoriaLabel}
                  </div>
                  <div>
                    <span className="font-semibold">{t('editReport.seccion')}</span> {item.section}
                  </div>
                </div>
              </div>

              {/* Descripción */}
              {item.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">{t('editReport.descripcion')}</h3>
                  <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {item.description}
                  </div>
                </div>
              )}

              {/* Multimedia */}
              <div className="space-y-4">
                {item.imageUrl && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">{t('editReport.imagenAdjunta')}</h3>
                    <div className="flex justify-center">
                      <img
                        src={resolveImageUrl(item.imageUrl)}
                        alt="captura del reporte"
                        className="max-w-[100px] max-h-[100px] rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>
                )}
                {item.videoUrl && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">{t('editReport.videoAdjunto')}</h3>
                    <div className="flex justify-center">
                      <video
                        src={resolveImageUrl(item.videoUrl)}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('editReport.historial')}</h3>

              {isCompleted && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t('editReport.finalizadoMsg')}
                  </div>
                </div>
              )}

              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {(item.followups || []).map((m) => {
                  const isSupport = m.authorType === 'soporte';
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isSupport ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-4 rounded-2xl ${
                          isSupport
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-xs font-semibold mr-2 ${
                              isSupport ? 'text-blue-700' : 'text-gray-700'
                            }`}
                          >
                            {isSupport ? t('editReport.soporte') : t('editReport.usuarioLabel')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(m.createdAt).toLocaleString('es-ES', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        {m.message && (
                          <div
                            className={`text-gray-800 whitespace-pre-wrap 
                          ${isSupport ? 'text-end' : 'text-start'}`}
                          >
                            {m.message}
                          </div>
                        )}
                        {m.imageUrl && (
                          <img
                            src={resolveImageUrl(m.imageUrl)}
                            alt="adjunto del mensaje"
                            className="max-w-[200px] max-h-[200px] object-contain mt-2 rounded-lg border border-gray-200"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
                {!item.followups?.length && (
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
                    {t('editReport.sinMensajes')}
                  </div>
                )}
              </div>
            </div>

            {/* Formulario de respuesta */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('editReport.enviarRespuesta')}</h4>
              <div className={`space-y-4 ${isCompleted ? 'opacity-50' : ''}`}>
                <textarea
                  rows={4}
                  placeholder={t('editReport.respuestaPlaceholder')}
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  disabled={isCompleted}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical disabled:bg-gray-100"
                />
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('editReport.imagenAdjuntaOpcional')}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImg(e.target.files?.[0] || null)}
                    disabled={isCompleted}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:bg-gray-100"
                  />
                </div>
                <button
                  onClick={onSendFU}
                  disabled={isCompleted || sending || (!nuevoMensaje && !img)}
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
                      {t('editReport.enviando')}
                    </div>
                  ) : (
                    t('editReport.enviar')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
