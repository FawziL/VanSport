export function StarRow({ value, size = 20 }) {
  const stars = [1, 2, 3, 4, 5].map((i) => {
    const remaining = Math.max(0, Math.min(1, value - (i - 1)));
    const pct = remaining >= 1 ? 100 : remaining <= 0 ? 0 : remaining * 100;
    return <Star key={i} size={size} fillPercent={pct} />;
  });
  return <div style={{ display: 'inline-flex', gap: 2, verticalAlign: 'middle' }}>{stars}</div>;
}

export function Star({ size = 20, fillPercent = 0 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <StarSvg size={size} color="#e2e8f0" />
      <div style={{ position: 'absolute', inset: 0, width: `${fillPercent}%`, overflow: 'hidden' }}>
        <StarSvg size={size} color="#f59e0b" />
      </div>
    </div>
  );
}

export function StarSvg({ size, color }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.869 1.402-8.168L.132 9.21l8.2-1.192L12 .587z" />
    </svg>
  );
}

export function StarInput({ value, onChange, onHover, onLeave, size = 28 }) {
  const handleClick = (idx, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = x <= rect.width / 2 ? 0.5 : 1;
    const newVal = Math.min(5, Math.max(0.5, idx - 1 + half));
    onChange(newVal);
  };

  const handleMove = (idx, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = x <= rect.width / 2 ? 0.5 : 1;
    const newVal = Math.min(5, Math.max(0.5, idx - 1 + half));
    onHover && onHover(newVal);
  };

  return (
    <div onMouseLeave={onLeave} style={{ display: 'inline-flex', gap: 4, cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map((idx) => {
        const remaining = Math.max(0, Math.min(1, value - (idx - 1)));
        const pct = remaining >= 1 ? 100 : remaining <= 0 ? 0 : remaining * 100;
        return (
          <div
            key={idx}
            onClick={(e) => handleClick(idx, e)}
            onMouseMove={(e) => handleMove(idx, e)}
            style={{ width: size, height: size, position: 'relative' }}
            aria-label={`Star ${idx}`}
            role="button"
          >
            <Star size={size} fillPercent={pct} />
          </div>
        );
      })}
    </div>
  );
}