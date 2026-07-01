import { useState } from 'react';
import { authService } from '@/services/routes';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { locPath } from '@/utils/localePath';

export default function PasswordReset() {
  const { t } = useTranslation('auth');
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
      setOkMsg(t('reset.success'));
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data && typeof data === 'object'
          ? Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
              .join(' | ')
          : err?.message || t('reset.error');
      setErrMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', padding: '0 1rem' }}>
      <h2 style={{ marginBottom: 10 }}>{t('reset.titulo')}</h2>
      <p style={{ color: '#555', marginBottom: 14 }}>
        {t('reset.subtitulo')}
      </p>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder={t('reset.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            display: 'block',
            width: '100%',
            marginBottom: 12,
            padding: 8,
            border: '1px solid #ddd',
            borderRadius: 8,
          }}
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
          {submitting ? t('reset.sending') : t('reset.submit')}
        </button>
      </form>

      {okMsg && <div style={{ color: '#2e7d32', marginTop: 10, fontWeight: 700 }}>{okMsg}</div>}
      {errMsg && <div style={{ color: '#c62828', marginTop: 10, fontWeight: 700 }}>{errMsg}</div>}

      <div style={{ marginTop: 14 }}>
        <Link to={locPath('/login')} style={{ color: '#1e88e5', fontWeight: 700, textDecoration: 'none' }}>
          {t('reset.backToLogin')}
        </Link>
      </div>
    </div>
  );
}
