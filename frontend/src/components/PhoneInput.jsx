import { useState, forwardRef, useImperativeHandle } from 'react';

const OPERATORS = ['0412', '0414', '0416', '0422', '0424', '0426'];

function parsePhone(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length >= 4) {
    return { prefix: '0' + digits.slice(1, 4), number: digits.slice(-7) };
  }
  return { prefix: '0412', number: '' };
}

const PhoneInput = forwardRef(({ required, inputStyle, initialValue }, ref) => {
  const { prefix: initPrefix, number: initNumber } = parsePhone(initialValue);
  const [prefix, setPrefix] = useState(initPrefix);
  const [number, setNumber] = useState(initNumber);

  useImperativeHandle(ref, () => ({
    getValue: () => prefix + number,
    getPrefix: () => prefix,
    getNumber: () => number,
  }));

  const baseInputStyle = {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    ...inputStyle,
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <select
        value={prefix}
        onChange={(e) => setPrefix(e.target.value)}
        required={required}
        style={{
          ...baseInputStyle,
          flex: '0 0 auto',
          background: '#fff',
          cursor: 'pointer',
          minWidth: '150px',
        }}
      >
        {OPERATORS.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
      <input
        type="text"
        inputMode="numeric"
        value={number}
        onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 7))}
        placeholder="1234567"
        maxLength={7}
        required={required}
        style={{
          ...baseInputStyle,
          width: '120px',
          textAlign: 'center',
        }}
      />
    </div>
  );
});

PhoneInput.displayName = 'PhoneInput';
export default PhoneInput;
