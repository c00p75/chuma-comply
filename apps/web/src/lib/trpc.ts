import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@chumacomply/api-trpc';
import { env } from '@/lib/env';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({ url: `${env.VITE_API_BASE_URL}/trpc` }),
  ],
});


