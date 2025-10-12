import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth';
import { useNavigate } from 'react-router-dom'; // <-- Agrega este import

function Register() {
  const { login } = useAuth();
  const navigate = useNavigate(); // <-- Hook para redirección
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const payload = {
      email,
      password,
      nombre,
      apellido,
      telefono,
    };

    try {
      setSubmitting(true);
      await authService.register(payload);
      // Login automático tras registro exitoso
      const loginData = await authService.login(email, password);
      login(loginData.user, loginData.access); // Guarda usuario y token en contexto
      setSuccess(true);
      navigate('/'); // <-- Redirige a la home
    } catch (err) {
      // Mostrar errores del backend de forma legible
      const data = err?.response?.data;
      if (data) {
        if (typeof data === 'object') {
          const messages = Object.entries(data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join(' | ');
          setError(messages);
        } else {
          setError(data);
        }
      } else {
        setError(err?.message || 'Error al registrar usuario');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto' }}>
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 12 }}
        />

        <label style={{ display: 'block', marginBottom: 6 }}>Password</label>
        <input
          type="password"
          placeholder="Contraseña (mínimo 8 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          style={{ display: 'block', width: '100%', marginBottom: 12 }}
        />

        <label style={{ display: 'block', marginBottom: 6 }}>Repetir contraseña</label>
        <input
          type="password"
          placeholder="Repite la contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          style={{ display: 'block', width: '100%', marginBottom: 12 }}
        />

        <label style={{ display: 'block', marginBottom: 6 }}>Nombre</label>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 12 }}
        />

        <label style={{ display: 'block', marginBottom: 6 }}>Apellido</label>
        <input
          type="text"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 12 }}
        />

        <label style={{ display: 'block', marginBottom: 6 }}>Teléfono</label>
        <input
          type="tel"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 16 }}
        />

        <button type="submit" style={{ width: '100%' }} disabled={submitting}>
          {submitting ? 'Enviando...' : 'Registrar'}
        </button>

        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginTop: 10 }}>¡Registro exitoso!</div>}
      </form>
    </div>
  );
}

export default Register;
