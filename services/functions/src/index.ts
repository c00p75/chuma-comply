import { onRequest } from 'firebase-functions/v2/https';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@chumacomply/api-trpc';
import admin from 'firebase-admin';
import type { Context } from '@chumacomply/api-trpc';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

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

  try {
    // Construct full URL from request (Request constructor requires full URL, not just path)
    const protocol = req.protocol || (req.headers['x-forwarded-proto'] as string) || 'https';
    const host = req.get('host') || req.headers.host || '';
    const fullUrl = `${protocol}://${host}${req.url}`;

    // Only include body for methods that allow it (GET/HEAD cannot have body)
    const requestInit: RequestInit = {
      method: req.method,
      headers: req.headers as any,
    };
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      requestInit.body = req.body as any;
    }

    // Extract auth token from Authorization header
    const authHeader = req.headers.authorization;
    let userId: string | undefined;
    let userTier: 'free' | 'pro' | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        userId = decodedToken.uid;
        
        // Fetch user tier from Firestore
        if (userId) {
          const userDoc = await admin.firestore().collection('users').doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            userTier = userData?.subscriptionTier || 'free';
          } else {
            userTier = 'free'; // Default to free if user doc doesn't exist
          }
        }
      } catch (error) {
        // Token verification failed, but we'll continue with undefined userId
        // The protected procedures will handle the auth check
        console.warn('Failed to verify auth token:', error);
      }
    }

    const context: Context = {
      userId,
      userTier,
    };

    const response = await fetchRequestHandler({
      endpoint: '/trpc',
      req: new Request(fullUrl, requestInit),
      router: appRouter,
      createContext: () => context,
    });

    // Copy tRPC response headers/body to Firebase response with CORS
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    const text = await response.text();
    res.status(response.status);
    response.headers.forEach((v, k) => res.setHeader(k, v));
    res.send(text);
  } catch (error: any) {
    // Log error for debugging
    console.error('Error in tRPC handler:', error);
    
    // Always set CORS headers, even on error
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    
    // Return a proper error response that tRPC client can understand
    res.status(500).json({
      error: {
        message: error?.message || 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
});


