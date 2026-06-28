import { useState, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/routes';
import { useTranslation } from 'react-i18next';
import { locPath } from '@/utils/localePath';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function PasswordResetConfirm() {
  const { t } = useTranslation('auth');
  const q = useQuery();
  const navigate = useNavigate();
  const token = q.get('token') || '';
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [okMsg, setOkMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const canSubmit = token && password.length >= 8 && password === password2;

  const onSubmit = async (e) => {
    e.preventDefault();
    setOkMsg('');
    setErrMsg('');
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await authService.passwordResetConfirm(token, password);
      setOkMsg(t('resetConfirm.success'));
      setTimeout(() => navigate(locPath('/login')), 1500);
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data && typeof data === 'object'
          ? Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
              .join(' | ')
          : err?.message || t('resetConfirm.error');
      setErrMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: 460, margin: '2rem auto', padding: '0 1rem' }}>
        <h2>{t('resetConfirm.titulo')}</h2>
        <div style={{ color: '#c62828', marginTop: 8, fontWeight: 700 }}>
          {t('resetConfirm.noToken')}
        </div>
        <div style={{ marginTop: 12 }}>
          <Link
            to={locPath('/password-reset')}
            style={{ color: '#1e88e5', fontWeight: 700, textDecoration: 'none' }}
          >
            {t('resetConfirm.goToReset')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 460, margin: '2rem auto', padding: '0 1rem' }}>
      <h2>{t('resetConfirm.subtitulo')}</h2>
      <form onSubmit={onSubmit} style={{ marginTop: 12 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>{t('resetConfirm.newPassword')}</label>
        <input
          type="password"
          placeholder={t('resetConfirm.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
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
        <label style={{ display: 'block', marginBottom: 6 }}>{t('resetConfirm.repeatPassword')}</label>
        <input
          type="password"
          placeholder={t('resetConfirm.repeatPlaceholder')}
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          minLength={8}
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
        {password && password2 && password !== password2 && (
          <div style={{ color: '#c62828', marginBottom: 8, fontWeight: 700 }}>
            {t('resetConfirm.mismatch')}
          </div>
        )}
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            background: canSubmit ? '#1e88e5' : '#9ec9f5',
            color: '#fff',
            border: 'none',
            fontWeight: 800,
            cursor: !canSubmit || submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? t('resetConfirm.saving') : t('resetConfirm.submit')}
        </button>
      </form>

      {okMsg && <div style={{ color: '#2e7d32', marginTop: 10, fontWeight: 700 }}>{okMsg}</div>}
      {errMsg && <div style={{ color: '#c62828', marginTop: 10, fontWeight: 700 }}>{errMsg}</div>}

      <div style={{ marginTop: 14 }}>
        <Link to={locPath('/login')} style={{ color: '#1e88e5', fontWeight: 700, textDecoration: 'none' }}>
          {t('resetConfirm.backToLogin')}
        </Link>
      </div>
    </div>
  );
}
