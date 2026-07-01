import { useEffect } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SUPPORTED = ['es', 'en'];

export default function LanguageRouter() {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!SUPPORTED.includes(lang)) {
      const detected = i18n.language?.slice(0, 2) === 'en' ? 'en' : 'es';
      const path = location.pathname.replace(/^\/[^/]+/, `/${detected}`) + location.search;
      navigate(path, { replace: true });
      return;
    }
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    document.documentElement.lang = lang;
  }, [lang]);

  if (!SUPPORTED.includes(lang)) return null;

  return <Outlet />;
}
