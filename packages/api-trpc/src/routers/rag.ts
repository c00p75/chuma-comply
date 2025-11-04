import { z } from 'zod';
import { publicProcedure, router } from '../trpc.js';
import { TRPCError } from '@trpc/server';

export const ragRouter = router({
  getComplianceChecklist: publicProcedure
    .input(z.object({ query: z.string().min(10) }))
    .output(
      z.object({
        content: z.string(),
        sources: z.array(z.object({ title: z.string() })),
      })
    )
    .query(async ({ input }) => {
      try {
        await new Promise((r) => setTimeout(r, 1500));
        const q = input.query.toLowerCase();
        if (q.includes('email') || q.includes('data')) {
          return {
            content:
              'To operate a digital agency in Zambia and collect user data, you must register with the DataProtection Commissioner. [Source: The Data Protection Act, Sec. 40]',
            sources: [{ title: 'The Data Protection Act, Sec. 40' }],
          };
        }
        return {
          content:
            'To start any business in Zambia, you must first register your business name with PACRA. [Source: The Companies Act, Sec. 12]',
          sources: [{ title: 'The Companies Act, Sec. 12' }],
        };
      } catch (err) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to generate checklist. Please try again.' });
      }
    }),
});


