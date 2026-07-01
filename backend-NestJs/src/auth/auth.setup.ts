import { betterAuth } from 'better-auth';
import { openAPI } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, schema } from '../../db';
import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || '"VanSport" <noreply@vansport.com>';

const TEMPLATE_DIR = join(process.cwd(), 'src', 'auth', 'templates');
const TEMPLATE_ES = readFileSync(join(TEMPLATE_DIR, 'password-reset.html'), 'utf-8');
const TEMPLATE_EN = readFileSync(join(TEMPLATE_DIR, 'password-reset.en.html'), 'utf-8');

function detectLang(acceptLanguage?: string): 'es' | 'en' {
  if (!acceptLanguage) return 'es';
  return acceptLanguage.startsWith('es') ? 'es' : 'en';
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:5173'],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }, request) => {
      const lang = detectLang(request?.headers?.['accept-language'] as string | undefined);
      const template = lang === 'en' ? TEMPLATE_EN : TEMPLATE_ES;
      const html = template.replace(/\{\{url\}\}/g, url);
      const subject = lang === 'en' ? 'Password Reset — VanSport' : 'Recuperación de Contraseña — VanSport';
      await transporter.sendMail({ from: FROM, to: user.email, subject, html });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    openAPI(),
  ],
  user: {
    additionalFields: {
      lastName: { type: 'string', required: false },
      address: { type: 'string', required: false },
      phone: { type: 'string', required: false },
      isStaff: { type: 'boolean', required: false, defaultValue: false },
      isActive: { type: 'boolean', required: false, defaultValue: true },
      registeredAt: { type: 'string', required: false },
    },
  },
});
