import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '@/services/auth';
import ListCategories from '@/components/ListCategories';

export default function CreateProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria_id: '',
    activo: true,
  });
  const [imagen, setImagen] = useState(null);
  const [extras, setExtras] = useState([]); // <-- nuevo
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCategoriaChange = (val) => {
    setForm((prev) => ({ ...prev, categoria_id: val }));
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
      if (imagen) fd.append('imagen', imagen);
      // Imágenes adicionales (múltiples)
      (extras || []).forEach((file) => {
        if (file) fd.append('imagenes_adicionales', file);
      });

      await adminService.productos.create(fd);
      navigate('/admin/productos');
    } catch (err) {
      const apiMsg = err?.response?.data?.detail || err?.message || 'Error al crear producto';
      setError(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Crear producto</h1>
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
          <input
            id="imagen"
            name="imagen"
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files?.[0] || null)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label htmlFor="extras" className="block text-sm font-medium mb-1">
            Imágenes adicionales (opcional, puedes seleccionar varias)
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
          <div className="text-xs text-gray-500 mt-1">
            Se guardarán en /media/productos y se añadirán a imagenes_adicionales.
          </div>
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
            {submitting ? 'Guardando…' : 'Guardar'}
          </button>
          <Link to="/admin/productos" className="px-4 py-2 rounded border">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
