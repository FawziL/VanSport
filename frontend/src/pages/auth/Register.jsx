import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/routes';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // Archivo CSS adicional para estilos más complejos

function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    telefono: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const { email, password, confirmPassword, nombre, apellido, telefono } = form;

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const payload = { email, password, nombre, apellido, telefono };

    try {
      setSubmitting(true);
      await authService.register(payload);
      const loginData = await authService.login(email, password);
      login(loginData.user, loginData.access);
      setSuccess(true);
      navigate('/');
    } catch (err) {
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
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Crear Cuenta</h2>
          <p>Completa tus datos para comenzar</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-section">
            <h3 className="section-title">Información Personal</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  placeholder="Tu nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  placeholder="Tu apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="ejemplo@correo.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                placeholder="+34 123 456 789"
                value={form.telefono}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Seguridad</h3>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
              />
              <div className="password-hint">La contraseña debe tener al menos 8 caracteres</div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Repite tu contraseña"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`submit-btn ${submitting ? 'submitting' : ''}`}
          >
            {submitting ? (
              <>
                <span className="spinner"></span>
                Procesando...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">¡Registro exitoso! Redirigiendo...</div>}
        </form>

        <div className="register-footer">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <a href="/login" className="login-link">
              Inicia Sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
