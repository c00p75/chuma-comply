import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@chumacomply/api-trpc';
import { env } from '@/lib/env';
import { auth } from '@/lib/firebase';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${env.VITE_API_BASE_URL}/trpc`,
      headers: async () => {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          return {
            authorization: `Bearer ${token}`,
          };
        }
        return {};
      },
    }),
  ],
});


