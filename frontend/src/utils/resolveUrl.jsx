import { API_URL } from '@/config/api';

export const resolveImageUrl = (path) => {
  if (!path) return '';
  if (/^https?:/i.test(path)) return path;
  const base = API_URL.replace(/\/+$/, '');
  const rel = String(path).replace(/^\/+/, '');
  return `${base}/${rel}`;
};
