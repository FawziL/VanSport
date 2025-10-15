import { useEffect, useMemo, useState } from 'react';
import { appService } from '@/services/auth';

/**
 * ListCategories
 * Reusable select component that fetches categories from the API and renders them as options.
 *
 * Props:
 * - value: controlled value (single id or array for multiple)
 * - onChange: function(newValue, event)
 * - name, id, className, disabled, multiple, required, autoFocus: passthrough to <select>
 * - params: optional query params for the API list endpoint (e.g., { search, page_size })
 * - getOptionLabel: function(item) -> string (defaults to item.nombre || item.name || item.titulo || item.title)
 * - getOptionValue: function(item) -> id (string) (defaults to categoria_id || id || pk)
 * - placeholder: string to show as the first option
 * - extraOptions: array of { label, value, disabled? }
 */
export default function ListCategories({
  value,
  onChange,
  name,
  id,
  className,
  disabled,
  multiple,
  required,
  autoFocus,
  params,
  getOptionLabel,
  getOptionValue,
  placeholder = 'Seleccione una categoría',
  extraOptions = [],
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await appService.categorias.list(params);
        const items = Array.isArray(res) ? res : Array.isArray(res?.results) ? res.results : [];
        if (!ignore) setData(items);
      } catch (err) {
        if (!ignore) setError(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchData();
    return () => {
      ignore = true;
    };
    // Stringify params to avoid re-fetch loops from object identity
  }, [JSON.stringify(params || {})]);

  const labelGetter = useMemo(
    () =>
      getOptionLabel ||
      ((item) => item?.nombre ?? item?.name ?? item?.titulo ?? item?.title ?? `#${item?.id}`),
    [getOptionLabel]
  );
  const valueGetter = useMemo(
    () => getOptionValue || ((item) => String(item?.categoria_id ?? item?.id ?? item?.pk ?? '')),
    [getOptionValue]
  );

  const options = useMemo(() => {
    return [
      ...extraOptions.map((o) => ({
        label: o.label,
        value: String(o.value ?? ''),
        disabled: !!o.disabled,
        __custom: true,
      })),
      ...data.map((item) => ({ label: labelGetter(item), value: valueGetter(item), item })),
    ];
  }, [data, labelGetter, valueGetter, extraOptions]);

  const handleChange = (e) => {
    if (multiple) {
      const selected = Array.from(e.target.selectedOptions).map((opt) => String(opt.value));
      onChange?.(selected, e);
    } else {
      onChange?.(e.target.value === '' ? undefined : String(e.target.value), e);
    }
  };

  const computedClass = `block w-full ${className || ''}`.trim();

  // Normalize controlled value
  const selectValue = multiple
    ? Array.isArray(value)
      ? value.map((v) => (v == null ? '' : String(v)))
      : []
    : value == null
      ? ''
      : String(value);

  return (
    <div className="flex flex-col gap-1">
      <select
        name={name}
        id={id || name}
        className={computedClass}
        disabled={disabled || loading}
        multiple={!!multiple}
        required={!!required}
        autoFocus={!!autoFocus}
        value={selectValue}
        onChange={handleChange}
      >
        {!multiple && (
          <option value="" disabled={required && selectValue !== ''}>
            {loading ? 'Cargando categorías…' : error ? 'Error al cargar' : placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={`${String(opt.value)}`} value={String(opt.value)} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-sm text-red-600">No se pudo cargar categorías.</span>}
    </div>
  );
}

// Default props (manual fallback)
ListCategories.defaultProps = {
  value: undefined,
  onChange: undefined,
  name: 'categoria',
  id: undefined,
  className: '',
  disabled: false,
  multiple: false,
  required: false,
  autoFocus: false,
  params: undefined,
  getOptionLabel: undefined,
  getOptionValue: undefined,
  placeholder: 'Seleccione una categoría',
  extraOptions: [],
};
