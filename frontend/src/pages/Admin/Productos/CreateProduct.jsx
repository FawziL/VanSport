import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '@/services/auth';
import ListCategories from '@/components/ListCategories';

export default function CreateProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    precio_oferta: '',
    stock: '',
    categoria_id: '',
    activo: true,
  });
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [extras, setExtras] = useState([]);
  const [extrasPreviews, setExtrasPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Estados para drag & drop
  const [isDragOverMain, setIsDragOverMain] = useState(false);
  const [isDragOverExtras, setIsDragOverExtras] = useState(false);

  // Refs para los inputs file
  const mainImageInputRef = useRef(null);
  const extrasInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCategoriaChange = (val) => {
    setForm((prev) => ({ ...prev, categoria_id: val }));
  };

  // Manejar archivos de imagen principal
  const processMainImage = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejar archivos de imágenes adicionales
  const processExtraImages = (files) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      const newExtras = [...extras, ...imageFiles];
      setExtras(newExtras);

      // Crear previews para los nuevos archivos
      const previewPromises = imageFiles.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              url: reader.result,
              name: file.name,
              size: file.size,
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(previewPromises).then((newPreviews) => {
        setExtrasPreviews((prev) => [...prev, ...newPreviews]);
      });
    }
  };

  // Handlers para imagen principal
  const handleMainImageClick = () => {
    mainImageInputRef.current?.click();
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processMainImage(file);
  };

  const handleMainDrop = (e) => {
    e.preventDefault();
    setIsDragOverMain(false);
    const file = e.dataTransfer.files[0];
    if (file) processMainImage(file);
  };

  const handleMainDragOver = (e) => {
    e.preventDefault();
    setIsDragOverMain(true);
  };

  const handleMainDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOverMain(false);
    }
  };

  // Handlers para imágenes adicionales
  const handleExtrasClick = () => {
    extrasInputRef.current?.click();
  };

  const handleExtrasChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) processExtraImages(files);
  };

  const handleExtrasDrop = (e) => {
    e.preventDefault();
    setIsDragOverExtras(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) processExtraImages(files);
  };

  const handleExtrasDragOver = (e) => {
    e.preventDefault();
    setIsDragOverExtras(true);
  };

  const handleExtrasDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOverExtras(false);
    }
  };

  // Eliminar imágenes
  const removeMainImage = () => {
    setImagen(null);
    setImagenPreview(null);
    if (mainImageInputRef.current) mainImageInputRef.current.value = '';
  };

  const removeExtraImage = (index) => {
    const newExtras = [...extras];
    const newPreviews = [...extrasPreviews];

    newExtras.splice(index, 1);
    newPreviews.splice(index, 1);

    setExtras(newExtras);
    setExtrasPreviews(newPreviews);
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
      fd.append('precio_oferta', String(form.precio_oferta));
      fd.append('stock', String(form.stock));
      fd.append('categoria_id', String(form.categoria_id));
      fd.append('activo', form.activo ? 'true' : 'false');
      if (imagen) fd.append('imagen', imagen);

      extras.forEach((file) => {
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Crear producto</h1>
        <Link to="/admin/productos" className="text-blue-600 hover:underline font-medium">
          Volver
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {String(error)}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        {/* Campos básicos */}
        <div className="grid gap-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del producto *
            </label>
            <input
              id="nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ingresa el nombre del producto"
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Describe el producto..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
                Precio *
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0.00"
              />
            </div>
            <div>
              <label
                htmlFor="precio_oferta"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Precio Oferta
              </label>
              <input
                id="precio_oferta"
                name="precio_oferta"
                type="number"
                step="0.01"
                min="0"
                value={form.precio_oferta}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                Stock *
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="categoria_id" className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <ListCategories
              name="categoria_id"
              value={form.categoria_id}
              onChange={handleCategoriaChange}
              required
              placeholder="Seleccione una categoría"
              className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Imagen principal con drag & drop */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Imagen principal</label>

          <input
            ref={mainImageInputRef}
            type="file"
            accept="image/*"
            onChange={handleMainImageChange}
            className="hidden"
          />

          {!imagenPreview ? (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragOverMain
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              onClick={handleMainImageClick}
              onDrop={handleMainDrop}
              onDragOver={handleMainDragOver}
              onDragLeave={handleMainDragLeave}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Arrastra y suelta la imagen principal
                  </p>
                  <p className="text-sm text-gray-500 mt-1">o haz clic para seleccionar</p>
                </div>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP hasta 10MB</p>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-900">
                  Imagen principal seleccionada
                </span>
                <button
                  type="button"
                  onClick={removeMainImage}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Eliminar
                </button>
              </div>
              <div className="flex items-center gap-4 w-full">
                <img
                  src={imagenPreview}
                  alt="Preview imagen principal"
                  className="w-50 h-50 rounded-lg object-cover border border-gray-200"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{imagen.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(imagen.size)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Imágenes adicionales con drag & drop */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Imágenes adicionales
          </label>

          <input
            ref={extrasInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleExtrasChange}
            className="hidden"
          />

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragOverExtras
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onClick={handleExtrasClick}
            onDrop={handleExtrasDrop}
            onDragOver={handleExtrasDragOver}
            onDragLeave={handleExtrasDragLeave}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Arrastra y suelta imágenes adicionales
                </p>
                <p className="text-sm text-gray-500 mt-1">o haz clic para seleccionar</p>
              </div>
              <p className="text-xs text-gray-400">Puedes seleccionar múltiples imágenes</p>
            </div>
          </div>

          {/* Grid de previews de imágenes adicionales */}
          {extrasPreviews.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Imágenes adicionales ({extrasPreviews.length})
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setExtras([]);
                    setExtrasPreviews([]);
                    if (extrasInputRef.current) extrasInputRef.current.value = '';
                  }}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Eliminar todas
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {extrasPreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow"
                  >
                    <button
                      type="button"
                      onClick={() => removeExtraImage(index)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                    <img
                      src={preview.url}
                      alt={`Preview adicional ${index + 1}`}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                    <div className="text-xs text-gray-600">
                      <p className="truncate font-medium">{preview.name}</p>
                      <p>{formatFileSize(preview.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Checkbox activo */}
        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <input
            id="activo"
            name="activo"
            type="checkbox"
            checked={!!form.activo}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="activo" className="text-sm font-medium text-gray-700">
            Producto activo (visible para los clientes)
          </label>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
                Guardando...
              </span>
            ) : (
              'Crear producto'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
