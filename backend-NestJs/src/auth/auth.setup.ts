import { betterAuth } from 'better-auth';
import { openAPI } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, schema } from '../../db';

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
      lastName: {
        type: 'string',
        required: false,
      },
      address: {
        type: 'string',
        required: false,
      },
      phone: {
        type: 'string',
        required: false,
      },
      isStaff: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
      isActive: {
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
      registeredAt: {
        type: 'string',
        required: false,
      },
    },
  },
});
