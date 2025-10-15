export default function ConfirmModal({
  open,
  title = '¿Estás seguro?',
  message = '',
  confirmText = 'Sí, confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  danger = false,
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.25)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '2rem',
          minWidth: 320,
          boxShadow: '0 4px 24px #0002',
          textAlign: 'center',
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 18, color: '#222' }}>
          {title}
        </div>
        {message && (
          <div style={{ color: danger ? '#e53935' : '#222', marginBottom: 18 }}>{message}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: 8,
              border: '1px solid #aaa',
              background: '#fff',
              color: '#222',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: 8,
              border: 'none',
              background: danger ? '#e53935' : '#1e88e5',
              color: '#fff',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
