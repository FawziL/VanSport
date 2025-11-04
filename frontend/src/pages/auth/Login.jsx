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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-5 font-sans">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Bienvenido de nuevo</h2>
          <p className="opacity-90 text-sm">Ingresa a tu cuenta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="tu.correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3.5 px-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed opacity-70' 
                : 'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40'
              } disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          {error && (
            <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm border-l-4 border-red-600 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="flex-shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-50 text-green-800 p-3 rounded-lg text-sm border-l-4 border-green-500 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="flex-shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.28 10.22a.75.75 0 00-1.06 1.04l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
              ¡Inicio de sesión exitoso! Redirigiendo...
            </div>
          )}
        </form>

        <div className="px-8 py-6 text-center border-t border-gray-200">
          <div className="flex flex-col gap-3">
            <Link 
              to="/register" 
              className="text-indigo-600 font-medium text-sm transition-colors duration-200 hover:text-purple-600 hover:underline"
            >
              ¿No tienes cuenta? Regístrate
            </Link>
            <Link 
              to="/password-reset" 
              className="text-indigo-600 font-medium text-sm transition-colors duration-200 hover:text-purple-600 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;