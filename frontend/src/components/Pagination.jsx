import React from 'react';

export default function Pagination({ page = 1, pages = 1, onChange, showNumbers = true }) {
  const current = Math.max(1, Math.min(page || 1, pages || 1));
  const total = Math.max(1, pages || 1);

  const goPrev = () => {
    if (current > 1 && typeof onChange === 'function') onChange(current - 1);
  };

  const goNext = () => {
    if (current < total && typeof onChange === 'function') onChange(current + 1);
  };

  return (
    <div style={{ display: 'grid', gap: 10, justifyContent: 'center', margin: '2rem 0' }}>
      {/* Control principal: Anterior [cuadro página] Siguiente */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
        <button
          onClick={goPrev}
          disabled={current <= 1}
          style={{
            padding: '0.5rem 0.9rem',
            borderRadius: 8,
            border: 'none',
            background: current <= 1 ? '#eee' : '#1e88e5',
            color: current <= 1 ? '#777' : '#fff',
            fontWeight: 700,
            cursor: current <= 1 ? 'not-allowed' : 'pointer',
          }}
        >
          Anterior
        </button>

        <span
          aria-label="Página actual"
          title={`Página ${current} de ${total}`}
          style={{
            minWidth: 90,
            textAlign: 'center',
            padding: '0.5rem 0.9rem',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: '#fff',
            fontWeight: 800,
            color: '#222',
          }}
        >
          {current} / {total}
        </span>

        <button
          onClick={goNext}
          disabled={current >= total}
          style={{
            padding: '0.5rem 0.9rem',
            borderRadius: 8,
            border: 'none',
            background: current >= total ? '#eee' : '#1e88e5',
            color: current >= total ? '#777' : '#fff',
            fontWeight: 700,
            cursor: current >= total ? 'not-allowed' : 'pointer',
          }}
        >
          Siguiente
        </button>
      </div>

      {/* Opcional: botones de números */}
      {/*{showNumbers && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {Array.from({ length: total || 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => onChange?.(i + 1)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 8,
                border: 'none',
                background: current === i + 1 ? '#1e88e5' : '#eee',
                color: current === i + 1 ? '#fff' : '#222',
                fontWeight: 700,
                cursor: current === i + 1 ? 'default' : 'pointer',
                minWidth: 40,
              }}
              disabled={current === i + 1}
            >
              {i + 1}
            </button>
          ))}
        </div>
      {/*)}*/}
    </div>
  );
}
