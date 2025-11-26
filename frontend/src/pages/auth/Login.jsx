import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/routes';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';

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
      await login(data.access, data.refresh);
      setSuccess(true);
      toast.success('¡Inicio de sesión exitoso!');
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
        toast.error(err.message || 'Error de autenticación. Verifica tus credenciales.');
        setError(err.message || 'Error de autenticación. Verifica tus credenciales.');
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLoginRedirect = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await authService.googleLogin(tokenResponse.access_token);
        await login(response.access, response.refresh);
        toast.success('¡Inicio de sesión con Google exitoso!');
        navigate('/');
      } catch (error) {
        const msg = error.response?.data?.error || 'Error al procesar el inicio de sesión con Google.';
        console.log(error)
        toast.error(msg);
      }
    },
    onError: () => {
      toast.error('El inicio deión con Google falló.');
    },
  });

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
              ${
                loading
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
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="flex-shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-50 text-green-800 p-3 rounded-lg text-sm border-l-4 border-green-500 flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="flex-shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.28 10.22a.75.75 0 00-1.06 1.04l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              </svg>
              ¡Inicio de sesión exitoso! Redirigiendo...
            </div>
          )}
        </form>

        <div className="px-8 pt-4 pb-2 text-center">
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-sm text-gray-500">O continúa con</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => googleLoginRedirect()}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm transition-colors duration-200 hover:bg-gray-50"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 48 48"
                width="48px"
                height="48px"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              Iniciar sesión con Google
            </button>
          </div>
        </div>

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
