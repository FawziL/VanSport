import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth';
import { useNavigate } from 'react-router-dom'; // <-- añadido

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate(); // <-- añadido
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const data = await authService.login(email, password);
      login(data.user, data.access);
      setSuccess(true);
      navigate('/'); // <-- redirección a home
    } catch (err) {
      // Mantén el mensaje genérico o muestra detalles si tu cliente expone err.response.data
      const data = err?.response?.data;
      if (data) {
        const msg =
          typeof data === 'object'
            ? Object.entries(data)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                .join(' | ')
            : String(data);
        setError(msg);
      } else {
        setError(err.message || 'Error de autenticación');
      }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 10 }}
        />
        <button type="submit" style={{ width: '100%' }}>
          Entrar
        </button>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginTop: 10 }}>¡Login exitoso!</div>}
      </form>
    </div>
  );
}

export default Login;
