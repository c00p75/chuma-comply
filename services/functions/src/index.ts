import { onRequest } from 'firebase-functions/v2/https';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@chumacomply/api-trpc';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function corsHeaders(origin: string | null) {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'content-type, authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  } as Record<string, string>;
}

export const api = onRequest({ 
  region: 'us-central1',
  serviceAccount: 'rag-api-sa@chumacomply.iam.gserviceaccount.com'
}, async (req, res) => {
  // CORS preflight
  const origin = req.headers.origin ?? null;
  if (req.method === 'OPTIONS') {
    const headers = corsHeaders(origin);
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    res.status(204).send('');
    return;
  }

  const headers = corsHeaders(origin);

  const response = await fetchRequestHandler({
    endpoint: '/trpc',
    req: new Request(req.url, { method: req.method, headers: req.headers as any, body: req.body as any }),
    router: appRouter,
    createContext: () => ({}),
  });

  // Copy tRPC response headers/body to Firebase response with CORS
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  const text = await response.text();
  res.status(response.status);
  response.headers.forEach((v, k) => res.setHeader(k, v));
  res.send(text);
});


