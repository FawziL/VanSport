import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { locPath } from '@/utils/localePath';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleLoginButton() {
  const { t } = useTranslation('auth');
  const googleLogin = useGoogleLogin({
    onSuccess: async () => {
      toast.info(t('login.googleMigrate'));
    },
    onError: () => {
      toast.error(t('login.googleError'));
    },
  });

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-200 rounded-lg text-slate-600 font-medium text-sm transition-colors duration-200 hover:bg-amber-50 hover:border-amber-200"
    >
      <svg className="w-5 h-5" viewBox="0 0 48 48" width="48px" height="48px">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        <path fill="none" d="M0 0h48v48H0z" />
      </svg>
      {t('login.google')}
    </button>
  );
}

function Login() {
  const { t } = useTranslation('auth');
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
      await login(email, password);
      setSuccess(true);
      toast.success(t('login.success'));
      setTimeout(() => navigate(locPath('/')), 1000);
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.message ||
        data?.error ||
        data?.detail ||
        (typeof data === 'object' ? Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ') : String(data || '')) ||
        err.message ||
        t('login.error');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 p-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{t('login.titulo')}</h2>
          <p className="text-slate-500">{t('login.subtitulo')}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                {t('login.email')}
              </label>
              <input
                id="email"
                type="email"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                {t('login.password')}
              </label>
              <input
                id="password"
                type="password"
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 bg-amber-600 text-white rounded-lg font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2
                ${
                  loading
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:bg-amber-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-600/25'
                } disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
                  {t('login.loading')}
                </>
              ) : (
                t('login.submit')
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
                {t('login.successRedirect')}
              </div>
            )}
          </form>

          {GOOGLE_CLIENT_ID && (
            <div className="mt-6">
              <div className="relative flex items-center mb-4">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-sm text-slate-400">{t('login.orContinue')}</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
              <GoogleLoginButton />
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link to={locPath('/register')} className="text-amber-700 hover:text-amber-600 font-medium text-sm transition-colors">
            {t('login.noAccount')}
          </Link>
          <span className="mx-3 text-slate-300">·</span>
          <Link to={locPath('/password-reset')} className="text-amber-700 hover:text-amber-600 font-medium text-sm transition-colors">
            {t('login.forgotPassword')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
