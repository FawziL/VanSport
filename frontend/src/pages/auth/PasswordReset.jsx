import { useState } from 'react';
import { authService } from '@/services/auth';
import { Link } from 'react-router-dom';

export default function PasswordReset() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [okMsg, setOkMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setOkMsg('');
    setErrMsg('');
    setSubmitting(true);
    try {
      await authService.passwordReset(email);
      setOkMsg('Si el correo existe en el sistema, te enviaremos las instrucciones para restablecer tu contraseña.');
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data && typeof data === 'object'
          ? Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
              .join(' | ')
          : err?.message || 'No se pudo iniciar el proceso de recuperación';
      setErrMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', padding: '0 1rem' }}>
      <h2 style={{ marginBottom: 10 }}>Recuperar contraseña</h2>
      <p style={{ color: '#555', marginBottom: 14 }}>
        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
      </p>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8, border: '1px solid #ddd', borderRadius: 8 }}
        />
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            background: '#1e88e5',
            color: '#fff',
            border: 'none',
            fontWeight: 800,
          }}
        >
          {submitting ? 'Enviando…' : 'Enviar enlace'}
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