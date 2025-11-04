import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    
    try {
      const data = await authService.login(email, password);
      login(data.user, data.access);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1000); 
    } catch (err) {
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
        setError(err.message || 'Error de autenticación. Verifica tus credenciales.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Bienvenido de nuevo</h2>
          <p>Ingresa a tu cuenta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="tu.correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className={`submit-btn ${loading ? 'submitting' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          {error && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.28 10.22a.75.75 0 00-1.06 1.04l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
              ¡Inicio de sesión exitoso! Redirigiendo...
            </div>
          )}
        </form>

        <div className="login-footer">
          <div className="footer-links">
            <Link to="/register" className="login-link">
              ¿No tienes cuenta? Regístrate
            </Link>
            <Link to="/password-reset" className="login-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .login-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 450px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .login-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .login-header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 2rem;
          text-align: center;
        }

        .login-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .login-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.95rem;
        }

        .login-form {
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
          font-size: 0.9rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .form-group input:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .submit-btn {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(79, 70, 229, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .submit-btn.submitting {
          background: #9ca3af;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          background-color: #fee2e2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 8px;
          margin-top: 1rem;
          font-size: 0.9rem;
          border-left: 4px solid #dc2626;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .success-message {
          background-color: #d1fae5;
          color: #065f46;
          padding: 0.75rem;
          border-radius: 8px;
          margin-top: 1rem;
          font-size: 0.9rem;
          border-left: 4px solid #10b981;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .login-footer {
          padding: 1.5rem 2rem;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .login-link {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }

        .login-link:hover {
          color: #7c3aed;
          text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .login-container {
            padding: 10px;
          }
          
          .login-form {
            padding: 1.5rem;
          }
          
          .login-header {
            padding: 1.5rem;
          }
          
          .login-header h2 {
            font-size: 1.5rem;
          }
          
          .footer-links {
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          .login-footer {
            padding: 1rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;