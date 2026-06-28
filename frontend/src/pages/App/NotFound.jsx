import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { locPath } from '@/utils/localePath';

export default function NotFound() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  return (
    <div
      style={{
        maxWidth: 680,
        margin: '4rem auto',
        marginTop: '12rem',
        textAlign: 'center',
        padding: '0 1rem',
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>{t('notFound.titulo')}</h1>
      <p style={{ color: '#666', marginBottom: 20 }}>
        {t('notFound.mensaje')}
      </p>
      <button
        type="button"
        onClick={() => navigate(locPath('/'))}
        style={{
          padding: '0.6rem 1rem',
          borderRadius: 8,
          border: 'none',
          background: '#131313',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        {t('notFound.irInicio')}
      </button>
    </div>
  );
}
