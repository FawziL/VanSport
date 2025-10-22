import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminService } from '@/services/auth';
import ListCategories from '@/components/ListCategories';
import { resolveImageUrl } from '@/utils/resolveUrl';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagen, setImagen] = useState(null);
  const [extras, setExtras] = useState([]);
  const [existingExtras, setExistingExtras] = useState([]);

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria_id: '',
    activo: true,
    imagen_url: '',
  });

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await adminService.productos.retrieve(id);
        if (ignore) return;
        setForm({
          nombre: data?.nombre ?? '',
          descripcion: data?.descripcion ?? '',
          precio: data?.precio != null ? String(data.precio) : '',
          stock: data?.stock != null ? String(data.stock) : '',
          categoria_id:
            data?.categoria?.categoria_id != null ? String(data.categoria.categoria_id) : '',
          activo: !!data?.activo,
          imagen_url: data?.imagen_url ?? '',
        });
        setExistingExtras(Array.isArray(data?.imagenes_adicionales) ? data.imagenes_adicionales : []);
      } catch (err) {
        setError(err?.response?.data?.detail || err?.message || 'No se pudo cargar el producto');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCategoriaChange = (val) => {
    setForm((prev) => ({ ...prev, categoria_id: val }));
  };

  const moveExtra = (idx, dir) => {
    setExistingExtras((prev) => {
      const arr = [...prev];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= arr.length) return prev;
      const [it] = arr.splice(idx, 1);
      arr.splice(newIdx, 0, it);
      return arr;
    });
  };

  const removeExtra = (idx) => {
    setExistingExtras((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('nombre', form.nombre);
      fd.append('descripcion', form.descripcion || '');
      fd.append('precio', String(form.precio));
      fd.append('stock', String(form.stock));
      fd.append('categoria_id', String(form.categoria_id));
      fd.append('activo', form.activo ? 'true' : 'false');

      if (imagen) {
        fd.append('imagen', imagen);
      } else if (form.imagen_url) {
        fd.append('imagen_url', form.imagen_url);
      }

      // Enviamos el orden final y eliminaciones
      fd.append('imagenes_adicionales_list', JSON.stringify(existingExtras));

      // Nuevos archivos a agregar (se añadirán al final)
      extras.forEach((file) => {
        if (file) fd.append('imagenes_adicionales', file);
      });

      await adminService.productos.update(id, fd);
      navigate('/admin/productos');
    } catch (err) {
      const apiMsg = err?.response?.data?.detail || err?.message || 'Error al actualizar producto';
      setError(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Editar producto</h1>
        <div>Cargando…</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Editar producto #{id}</h1>
        <Link to="/admin/productos" className="text-blue-600 hover:underline">
          Volver
        </Link>
      </div>

      {error && <div className="mb-3 p-3 rounded bg-red-50 text-red-700">{String(error)}</div>}

      <form onSubmit={handleSubmit} className="grid gap-4 bg-white p-4 rounded shadow-sm">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium mb-1">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium mb-1">
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={4}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="precio" className="block text-sm font-medium mb-1">
              Precio
            </label>
            <input
              id="precio"
              name="precio"
              type="number"
              step="0.01"
              min="0"
              value={form.precio}
              onChange={handleChange}
              required
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium mb-1">
              Stock
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              required
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>

        <div>
          <label htmlFor="categoria_id" className="block text-sm font-medium mb-1">
            Categoría
          </label>
          <ListCategories
            name="categoria_id"
            value={form.categoria_id}
            onChange={handleCategoriaChange}
            required
            placeholder="Seleccione una categoría"
            className="border rounded px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="imagen" className="block text-sm font-medium mb-1">
            Imagen principal (opcional)
          </label>
          {form.imagen_url && <div className="mb-2 text-sm text-gray-600">                
            <div className="w-28 h-20 rounded overflow-hidden border">
                  <img
                    src={resolveImageUrl(form.imagen_url)}
                    alt={form.imagen_url}
                    className="w-full h-full object-cover"
                  />
                </div></div>}
          
          <input
            id="imagen"
            name="imagen"
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files?.[0] || null)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        {existingExtras?.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-1">Imágenes adicionales actuales</div>
            <div className="flex flex-wrap gap-8">
              {existingExtras.map((p, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className="w-28 h-20 rounded overflow-hidden border">
                    <img
                      src={resolveImageUrl(p)}
                      alt={`extra-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-2 py-1 text-xs border rounded"
                      onClick={() => moveExtra(idx, -1)}
                      disabled={idx === 0}
                      title="Subir"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 text-xs border rounded"
                      onClick={() => moveExtra(idx, 1)}
                      disabled={idx === existingExtras.length - 1}
                      title="Bajar"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 text-xs border rounded text-red-600"
                      onClick={() => removeExtra(idx)}
                      title="Eliminar"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Reordena con ↑/↓ y elimina con “Eliminar”. Las nuevas imágenes que agregues se añadirán al final.
            </div>
          </div>
        )}

        <div>
          <label htmlFor="extras" className="block text-sm font-medium mb-1">
            Agregar nuevas imágenes adicionales
          </label>
          <input
            id="extras"
            name="imagenes_adicionales"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setExtras(Array.from(e.target.files || []))}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="activo"
            name="activo"
            type="checkbox"
            checked={!!form.activo}
            onChange={handleChange}
          />
          <label htmlFor="activo">Activo</label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {submitting ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <Link to="/admin/productos" className="px-4 py-2 rounded border">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
