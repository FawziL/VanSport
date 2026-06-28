import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/routes';
import { useNavigate, Link } from 'react-router-dom';
import PhoneInput from '@/components/PhoneInput';
import { useTranslation } from 'react-i18next';
import { locPath } from '@/utils/localePath';
import './Auth.css';

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
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>{t('register.titulo')}</h2>
          <p>{t('register.subtitulo')}</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-section">
            <h3 className="section-title">{t('register.personalInfo')}</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">{t('register.name')}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder={t('register.namePlaceholder')}
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">{t('register.lastName')}</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder={t('register.lastNamePlaceholder')}
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('register.email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder={t('register.emailPlaceholder')}
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">{t('register.phone')}</label>
              <PhoneInput ref={phoneRef} />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">{t('register.security')}</h3>
            <div className="form-group">
              <label htmlFor="password">{t('register.password')}</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder={t('register.passwordPlaceholder')}
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
              />
              <div className="password-hint">{t('register.passwordHint')}</div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">{t('register.confirmPassword')}</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder={t('register.confirmPlaceholder')}
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
                {t('register.loading')}
              </>
            ) : (
              t('register.submit')
            )}
          </button>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{t('register.success')}</div>}
        </form>

        <div className="register-footer">
          <p>
            {t('register.hasAccount')}{' '}
            <Link to={locPath('/login')} className="login-link">
              {t('register.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
