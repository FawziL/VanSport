import { useState, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function PasswordResetConfirm() {
  const q = useQuery();
  const navigate = useNavigate();
  const token = q.get('token') || '';
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [okMsg, setOkMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const canSubmit = token && password.length >= 8 && password === password2;

  const onSubmit = async (e) => {
    e.preventDefault();
    setOkMsg('');
    setErrMsg('');
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await authService.passwordResetConfirm(token, password);
      setOkMsg('Tu contraseña se actualizó correctamente. Ahora puedes iniciar sesión.');
      // Opcional: redirigir automático al login
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data && typeof data === 'object'
          ? Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
              .join(' | ')
          : err?.message || 'No se pudo restablecer la contraseña';
      setErrMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: 460, margin: '2rem auto', padding: '0 1rem' }}>
        <h2>Restablecer contraseña</h2>
        <div style={{ color: '#c62828', marginTop: 8, fontWeight: 700 }}>
          Falta el token de recuperación. Vuelve a solicitar el enlace.
        </div>
        <div style={{ marginTop: 12 }}>
          <Link to="/password-reset" style={{ color: '#1e88e5', fontWeight: 700, textDecoration: 'none' }}>
            Ir a recuperar contraseña
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 460, margin: '2rem auto', padding: '0 1rem' }}>
      <h2>Define tu nueva contraseña</h2>
      <form onSubmit={onSubmit} style={{ marginTop: 12 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>Nueva contraseña</label>
        <input
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
          style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8, border: '1px solid #ddd', borderRadius: 8 }}
        />
        <label style={{ display: 'block', marginBottom: 6 }}>Repetir contraseña</label>
        <input
          type="password"
          placeholder="Repítela"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          minLength={8}
          required
          style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8, border: '1px solid #ddd', borderRadius: 8 }}
        />
        {password && password2 && password !== password2 && (
          <div style={{ color: '#c62828', marginBottom: 8, fontWeight: 700 }}>
            Las contraseñas no coinciden.
          </div>
        )}
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            background: canSubmit ? '#1e88e5' : '#9ec9f5',
            color: '#fff',
            border: 'none',
            fontWeight: 800,
            cursor: !canSubmit || submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Guardando…' : 'Guardar nueva contraseña'}
        </button>
      </form>

      {okMsg && <div style={{ color: '#2e7d32', marginTop: 10, fontWeight: 700 }}>{okMsg}</div>}
      {errMsg && <div style={{ color: '#c62828', marginTop: 10, fontWeight: 700 }}>{errMsg}</div>}

      <div style={{ marginTop: 14 }}>
        <Link to="/login" style={{ color: '#1e88e5', fontWeight: 700, textDecoration: 'none' }}>
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}