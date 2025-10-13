import React from 'react';

export default function PageSizeSelector({
  value = 6,
  onChange,
  options = [6, 12, 24, 48],
  label = 'Por página',
}) {
  const handleChange = (e) => {
    const next = Number(e.target.value);
    if (typeof onChange === 'function') onChange(next);
  };

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: '#555', fontWeight: 700 }}>{label}:</span>
      <select
        value={value}
        onChange={handleChange}
        style={{
          padding: '0.4rem 0.6rem',
          borderRadius: 8,
          border: '1px solid #ccc',
          background: '#fff',
          fontSize: 14,
          color: '#222',
        }}
        aria-label="Seleccionar cantidad de productos por página"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
