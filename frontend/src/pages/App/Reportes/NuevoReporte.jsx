import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appService } from '@/services/auth';
import { CATEGORIAS_FALLA } from '@/utils/categorias';

export default function NuevoReporte() {
  const [form, setForm] = useState({ categoria: 'ui', titulo: '', descripcion: '', seccion: '' });
  const [imagen, setImagen] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
      if (imagen) fd.append('imagen', imagen);
      if (video) fd.append('video', video);
      await appService.reportes.create(fd);
      navigate('/reportes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h2>Reportar una falla</h2>
      <form onSubmit={onSubmit}>
        <label>Categoría</label>
        <select
          value={form.categoria}
          onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
          required
        >
          {CATEGORIAS_FALLA.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <label>Título</label>
        <input
          type="text"
          value={form.titulo}
          onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
          required
        />

        <label>Descripción</label>
        <textarea
          value={form.descripcion}
          onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
          rows={4}
        />

        <label>Sección de la página</label>
        <input
          type="text"
          placeholder="/productos, /checkout, etc."
          value={form.seccion}
          onChange={(e) => setForm((f) => ({ ...f, seccion: e.target.value }))}
          required
        />

        <label>Imagen (opcional)</label>
        <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files?.[0] || null)} />

        <label>Video (opcional)</label>
        <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0] || null)} />

        <button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar reporte'}</button>
      </form>
    </div>
  );
}