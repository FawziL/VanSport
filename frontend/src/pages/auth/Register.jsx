import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/routes';
import { useNavigate, Link } from 'react-router-dom';
import PhoneInput from '@/components/PhoneInput';
import { useTranslation } from 'react-i18next';
import { locPath } from '@/utils/localePath';

function Register() {
  const { t } = useTranslation('auth');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    lastName: '',
  });

  const phoneRef = useRef();

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

    const { email, password, confirmPassword, name, lastName } = form;

    if (password.length < 8) {
      setError(t('register.passwordError'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }

    const phone = phoneRef.current?.getValue() || '';
    const payload = { email, password, name, lastName, phone };

    try {
      setSubmitting(true);
      await authService.signUp(payload);
      await login(email, password);
      setSuccess(true);
      navigate(locPath('/'));
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
        setError(err?.message || t('register.error'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 p-5">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{t('register.titulo')}</h2>
          <p className="text-slate-500">{t('register.subtitulo')}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">
                {t('register.personalInfo')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    {t('register.name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder={t('register.namePlaceholder')}
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                    {t('register.lastName')}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder={t('register.lastNamePlaceholder')}
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  {t('register.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder={t('register.emailPlaceholder')}
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                  {t('register.phone')}
                </label>
                <PhoneInput ref={phoneRef} />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">
                {t('register.security')}
              </h3>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  {t('register.password')}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder={t('register.passwordPlaceholder')}
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600"
                />
                <p className="text-xs text-slate-400 mt-1">{t('register.passwordHint')}</p>
              </div>

              <div className="mt-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  {t('register.confirmPassword')}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder={t('register.confirmPlaceholder')}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 px-4 bg-amber-600 text-white rounded-lg font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2
                ${
                  submitting
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:bg-amber-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-600/25'
                } disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin inline-block"></span>
                  {t('register.loading')}
                </>
              ) : (
                t('register.submit')
              )}
            </button>

            {error && (
              <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm border-l-4 border-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 bg-green-50 text-green-800 p-3 rounded-lg text-sm border-l-4 border-green-500">
                {t('register.success')}
              </div>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              {t('register.hasAccount')}{' '}
              <Link to={locPath('/login')} className="text-amber-700 hover:text-amber-600 font-medium transition-colors">
                {t('register.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
