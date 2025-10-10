import { http } from '@/config/api';

export const authService = {
  login: (email, password) => http.post('/auth/login/', { email, password }),
  register: (payload) => http.post('/auth/register/', payload),
  me: () => http.get('/auth/me/'),
  passwordReset: (email) => http.post('/auth/password-reset/', { email }),
};