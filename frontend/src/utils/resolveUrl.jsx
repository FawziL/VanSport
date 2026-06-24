const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || '';

export const resolveImageUrl = (path) => {
  if (!path) return '';
  if (/^https?:/i.test(path)) return path;
  if (R2_PUBLIC_URL) return `${R2_PUBLIC_URL}/${path}`;
  return path;
};
