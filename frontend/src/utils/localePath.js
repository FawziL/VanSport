import i18n from '../i18n';

export function locPath(path) {
  const lang = i18n.language?.slice(0, 2) === 'en' ? 'en' : 'es';
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/${lang}${normalized}`;
}
