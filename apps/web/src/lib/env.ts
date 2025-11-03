import { z } from 'zod';

const EnvSchema = z.object({
  VITE_FIREBASE_CONFIG: z.string().min(1, 'Missing VITE_FIREBASE_CONFIG. Create apps/web/.env.local with your Firebase config.'),
  VITE_API_BASE_URL: z.string().min(1, 'Missing VITE_API_BASE_URL. Set your Cloud Functions URL in apps/web/.env.local.'),
});

export const env = EnvSchema.parse(import.meta.env);


