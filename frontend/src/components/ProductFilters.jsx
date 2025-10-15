import { useEffect, useMemo, useState } from 'react';
import ListCategories from '@/components/ListCategories';

export default function ProductFilters({ value, onChange, pageSizeOptions = [6, 12, 24, 48] }) {
  const [local, setLocal] = useState(() => ({
    q: value?.q ?? '',
    categoria_id: value?.categoria_id ?? '',
    min_price: value?.min_price ?? '',
    max_price: value?.max_price ?? '',
    oferta: value?.oferta ?? '', // '' | '1' | '0'
    pageSize: value?.pageSize ?? pageSizeOptions[0],
  }));

  useEffect(() => {
    setLocal((prev) => ({ ...prev, ...value }));
  }, [JSON.stringify(value || {})]);

  const apply = () => {
    onChange?.(normalize(local));
  };
  const reset = () => {
    const cleared = {
      q: '',
      categoria_id: '',
      min_price: '',
      max_price: '',
      oferta: '',
      pageSize: pageSizeOptions[0],
    };
    setLocal(cleared);
    onChange?.(normalize(cleared));
  };

  const normalize = (s) => ({
    q: s.q?.trim() || '',
    categoria_id: s.categoria_id || '',
    min_price: s.min_price !== '' ? String(s.min_price) : '',
    max_price: s.max_price !== '' ? String(s.max_price) : '',
    oferta: s.oferta === '' ? '' : s.oferta ? '1' : '0',
    pageSize: Number(s.pageSize) || pageSizeOptions[0],
  });

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 24,
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ minWidth: 200 }}>
        <ListCategories
          value={local.categoria_id}
          onChange={(val) => setLocal((p) => ({ ...p, categoria_id: val }))}
          placeholder="Todas las categorías"
        />
      </div>

      <input
        type="number"
        placeholder="Precio mínimo"
        value={local.min_price}
        onChange={(e) => setLocal((p) => ({ ...p, min_price: e.target.value }))}
        style={{
          padding: '0.6rem 1rem',
          borderRadius: 8,
          border: '1px solid #ccc',
          width: 160,
          fontSize: 16,
        }}
        min="0"
        step="0.01"
      />
      <input
        type="number"
        placeholder="Precio máximo"
        value={local.max_price}
        onChange={(e) => setLocal((p) => ({ ...p, max_price: e.target.value }))}
        style={{
          padding: '0.6rem 1rem',
          borderRadius: 8,
          border: '1px solid #ccc',
          width: 160,
          fontSize: 16,
        }}
        min="0"
        step="0.01"
      />

      <select
        value={local.oferta}
        onChange={(e) => setLocal((p) => ({ ...p, oferta: e.target.value }))}
        style={{
          padding: '0.6rem 1rem',
          borderRadius: 8,
          border: '1px solid #ccc',
          width: 180,
          fontSize: 16,
        }}
      >
        <option value="">Todos</option>
        <option value="1">Solo en oferta</option>
      </select>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={apply}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: 8,
            border: 'none',
            background: '#1e88e5',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Aplicar
        </button>
        <button
          onClick={reset}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: '#fff',
            color: '#333',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Limpiar
        </button>
        <select
          value={local.pageSize}
          onChange={(e) => {
            const val = Number(e.target.value);
            setLocal((p) => ({ ...p, pageSize: val }));
            onChange?.(normalize({ ...local, pageSize: val }));
          }}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: 8,
            border: '1px solid #ccc',
            fontSize: 16,
          }}
          aria-label="Por página"
        >
          {pageSizeOptions.map((n) => (
            <option key={n} value={n}>
              {n} por página
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
